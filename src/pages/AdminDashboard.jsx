import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getMessages,
  toggleMessageRead,
  deleteMessage,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  checkHealth,
  clearAuthData,
  isAuthenticated,
  getAuthUser,
} from "../services/api";
import { projectsData } from "../data/projectsData";
import "./AdminDashboard.css";

const TODAY_FORMATTED = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
}).format(new Date());

function formatExternalUrl(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (!trimmed || trimmed === "#") return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const adminUser = getAuthUser();

  // Navigation State
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'messages', 'projects', 'system'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data State - Messages
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [healthInfo, setHealthInfo] = useState(null);

  // Data State - Projects
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsRefreshing, setProjectsRefreshing] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectSubmitting, setProjectSubmitting] = useState(false);
  const [deleteTargetProject, setDeleteTargetProject] = useState(null);
  const [projectActionInProgress, setProjectActionInProgress] = useState(null);
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [projectCategoryFilter, setProjectCategoryFilter] = useState("all");
  const [projectSuccessMsg, setProjectSuccessMsg] = useState("");
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    category: "Full Stack Development",
    description: "",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
    tech: "React, Node.js, MongoDB",
    demo: "",
    github: "",
    order: 1,
  });
  const [projectFormErrors, setProjectFormErrors] = useState({});

  // Filter & Search State - Messages
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'unread', 'read'
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest', 'oldest'

  // Modals & Action State - Messages
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteTargetMessage, setDeleteTargetMessage] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(null);

  // Fetch System Health
  const fetchSystemHealth = useCallback(async () => {
    try {
      const data = await checkHealth();
      setHealthInfo(data);
    } catch {
      setHealthInfo({ status: "offline", database: "disconnected" });
    }
  }, []);

  // Fetch Contact Messages
  const fetchAllMessages = useCallback(async (isRefresh = false) => {
    if (!isAuthenticated()) {
      clearAuthData();
      navigate("/admin", { replace: true });
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const data = await getMessages();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setMessages(list);
    } catch (err) {
      if (err.response?.status === 401) {
        clearAuthData();
        navigate("/admin", { replace: true });
        return;
      }
      const msg =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Cannot connect to backend server. Please verify the Express API is running."
          : "Failed to load messages from database.");
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  // Fetch Portfolio Projects
  const fetchAllProjects = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setProjectsRefreshing(true);
    } else {
      setProjectsLoading(true);
    }

    try {
      const data = await getProjects();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setProjects(list.length > 0 ? list : projectsData);
    } catch (err) {
      console.warn("Could not load backend projects, using projectsData fallback:", err?.message);
      setProjects(projectsData);
    } finally {
      setProjectsLoading(false);
      setProjectsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllMessages();
    fetchAllProjects();
    fetchSystemHealth();
  }, [fetchAllMessages, fetchAllProjects, fetchSystemHealth]);

  // Keyboard navigation for modal escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedMessage(null);
        setDeleteTargetMessage(null);
        setProjectModalOpen(false);
        setDeleteTargetProject(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Message Actions
  const handleToggleReadStatus = async (id, currentStatus) => {
    setActionInProgress(id);
    try {
      const res = await toggleMessageRead(id);
      const updated = res?.data || res;
      const nextReadState = updated?.isRead !== undefined ? updated.isRead : !currentStatus;

      setMessages((prev) =>
        prev.map((msg) =>
          (msg._id === id || msg.id === id)
            ? { ...msg, isRead: nextReadState }
            : msg
        )
      );

      // If the selected modal message is the same, update it too
      if (selectedMessage && (selectedMessage._id === id || selectedMessage.id === id)) {
        setSelectedMessage((prev) => ({ ...prev, isRead: nextReadState }));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update read status.");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleOpenMessage = (message) => {
    setSelectedMessage(message);
    const msgId = message._id || message.id;
    // If opening an unread message, automatically mark as read
    if (!message.isRead) {
      handleToggleReadStatus(msgId, false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetMessage) return;
    const msgId = deleteTargetMessage._id || deleteTargetMessage.id;

    setActionInProgress(msgId);
    try {
      await deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => (m._id !== msgId && m.id !== msgId)));
      if (selectedMessage && (selectedMessage._id === msgId || selectedMessage.id === msgId)) {
        setSelectedMessage(null);
      }
      setDeleteTargetMessage(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete message.");
    } finally {
      setActionInProgress(null);
    }
  };

  // ========================================================
  // PROJECT ACTIONS: ADD, EDIT, DELETE
  // ========================================================
  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjectFormData({
      title: "",
      category: "Full Stack Development",
      description: "",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
      tech: "React, Node.js, MongoDB",
      demo: "",
      github: "",
      order: projects.length + 1,
    });
    setProjectFormErrors({});
    setProjectModalOpen(true);
  };

  const handleOpenEditProject = (project) => {
    setEditingProject(project);
    setProjectFormData({
      title: project.title || "",
      category: project.category || "Full Stack Development",
      description: project.description || "",
      image: project.image || "",
      tech: Array.isArray(project.tech) ? project.tech.join(", ") : (project.tech || ""),
      demo: project.demo || "",
      github: project.github || "",
      order: typeof project.order === "number" ? project.order : 0,
    });
    setProjectFormErrors({});
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!projectFormData.title.trim()) errors.title = "Project title is required.";
    if (!projectFormData.category.trim()) errors.category = "Category is required.";
    if (!projectFormData.description.trim()) errors.description = "Description is required.";

    if (Object.keys(errors).length > 0) {
      setProjectFormErrors(errors);
      return;
    }

    setProjectSubmitting(true);
    setProjectFormErrors({});

    const techArray = projectFormData.tech
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: projectFormData.title.trim(),
      category: projectFormData.category.trim(),
      description: projectFormData.description.trim(),
      image: projectFormData.image.trim() || undefined,
      tech: techArray.length > 0 ? techArray : ["React"],
      demo: formatExternalUrl(projectFormData.demo),
      github: formatExternalUrl(projectFormData.github),
      order: Number(projectFormData.order) || 0,
    };

    try {
      if (editingProject) {
        const projId = editingProject._id || editingProject.id;
        const res = await updateProject(projId, payload);
        const updated = res?.data || res;
        setProjects((prev) =>
          prev.map((p) => ((p._id === projId || p.id === projId) ? { ...p, ...updated } : p))
        );
        setProjectSuccessMsg(`Project "${payload.title}" updated successfully!`);
      } else {
        const res = await createProject(payload);
        const created = res?.data || res;
        setProjects((prev) => [created, ...prev]);
        setProjectSuccessMsg(`Project "${payload.title}" created successfully!`);
      }
      setProjectModalOpen(false);
      setEditingProject(null);
      setTimeout(() => setProjectSuccessMsg(""), 4500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to save project. Ensure backend server is running and admin session is valid.";
      setProjectFormErrors({ submit: errorMsg });
    } finally {
      setProjectSubmitting(false);
    }
  };

  const handleConfirmDeleteProject = async () => {
    if (!deleteTargetProject) return;
    const projId = deleteTargetProject._id || deleteTargetProject.id;
    setProjectActionInProgress(projId);
    try {
      await deleteProject(projId);
      setProjects((prev) => prev.filter((p) => p._id !== projId && p.id !== projId));
      const deletedTitle = deleteTargetProject.title;
      setDeleteTargetProject(null);
      setProjectSuccessMsg(`Project "${deletedTitle}" deleted successfully.`);
      setTimeout(() => setProjectSuccessMsg(""), 4500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project.");
    } finally {
      setProjectActionInProgress(null);
    }
  };

  const handleLogout = () => {
    clearAuthData();
    navigate("/admin", { replace: true });
  };

  // Derived statistics
  const unreadCount = useMemo(() => messages.filter((m) => !m.isRead).length, [messages]);
  const readCount = useMemo(() => messages.length - unreadCount, [messages, unreadCount]);
  const totalProjectsCount = projects.length;

  // Project categories for filter dropdown
  const projectCategories = useMemo(() => {
    const set = new Set();
    projects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["all", ...Array.from(set)];
  }, [projects]);

  // Filtered & sorted projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesCategory =
        projectCategoryFilter === "all" ||
        p.category?.toLowerCase() === projectCategoryFilter.toLowerCase();
      const q = projectSearchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        (Array.isArray(p.tech) && p.tech.some((t) => t.toLowerCase().includes(q)));
      return matchesCategory && matchesSearch;
    });
  }, [projects, projectCategoryFilter, projectSearchTerm]);


  // Filtered & sorted messages
  const filteredMessages = useMemo(() => {
    let result = [...messages];

    // Status filter
    if (filterStatus === "unread") {
      result = result.filter((m) => !m.isRead);
    } else if (filterStatus === "read") {
      result = result.filter((m) => m.isRead);
    }

    // Search term filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (m) =>
          (m.name && m.name.toLowerCase().includes(q)) ||
          (m.email && m.email.toLowerCase().includes(q)) ||
          (m.subject && m.subject.toLowerCase().includes(q)) ||
          (m.message && m.message.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [messages, filterStatus, searchTerm, sortOrder]);

  const formattedDate = TODAY_FORMATTED;

  return (
    <div className="admin-saas-layout">
      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ========================================================
          SIDEBAR
          ======================================================== */}
      <aside
        className={`admin-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${
          mobileMenuOpen ? "mobile-open" : ""
        }`}
      >
        <div>
          {/* Brand Logo & Collapse Toggle */}
          <div className="sidebar-header">
            <Link to="/" className="brand-link" title="Portfolio Home">
              <div className="brand-icon-gem">A</div>
              {!sidebarCollapsed && (
                <div className="brand-text-block">
                  <span className="brand-name">
                    Arun<span>.</span>
                  </span>
                  <span className="brand-badge">ADMIN PANEL</span>
                </div>
              )}
            </Link>

            <button
              type="button"
              className="sidebar-collapse-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transform: sidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.25s ease",
                }}
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="sidebar-nav">
            {!sidebarCollapsed && (
              <span className="nav-section-label">Main Navigation</span>
            )}

            {/* Overview Tab */}
            <button
              type="button"
              className={`sidebar-nav-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("overview");
                setMobileMenuOpen(false);
              }}
              title="Overview"
            >
              <span className="nav-btn-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </span>
              {!sidebarCollapsed && <span className="nav-btn-text">Overview</span>}
            </button>

            {/* Messages Tab */}
            <button
              type="button"
              className={`sidebar-nav-btn ${activeTab === "messages" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("messages");
                setMobileMenuOpen(false);
              }}
              title="Contact Messages"
            >
              <span className="nav-btn-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              {!sidebarCollapsed && <span className="nav-btn-text">Messages</span>}
              {unreadCount > 0 && (
                <span className="nav-badge-pill">{unreadCount}</span>
              )}
            </button>

            {/* Projects Tab */}
            <button
              type="button"
              className={`sidebar-nav-btn ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("projects");
                setMobileMenuOpen(false);
              }}
              title="Portfolio Projects"
            >
              <span className="nav-btn-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </span>
              {!sidebarCollapsed && <span className="nav-btn-text">Projects</span>}
              {!sidebarCollapsed && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "11px",
                    color: "var(--admin-text-dim)",
                  }}
                >
                  {totalProjectsCount}
                </span>
              )}
            </button>

            {/* System / Health Tab */}
            <button
              type="button"
              className={`sidebar-nav-btn ${activeTab === "system" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("system");
                setMobileMenuOpen(false);
              }}
              title="System & Health"
            >
              <span className="nav-btn-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </span>
              {!sidebarCollapsed && <span className="nav-btn-text">System & Health</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer with Profile & Logout */}
        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="sidebar-user-card">
              <div className="user-avatar">
                {adminUser?.email ? adminUser.email[0].toUpperCase() : "A"}
              </div>
              <div className="user-info">
                <span className="user-name">
                  {adminUser?.name || "Administrator"}
                </span>
                <span className="user-role-badge">Online</span>
              </div>
            </div>
          )}

          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Log Out"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!sidebarCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ========================================================
          MAIN VIEWPORT
          ======================================================== */}
      <div className="admin-main-viewport">
        {/* Top Navbar */}
        <header className="admin-navbar">
          <div className="navbar-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* Breadcrumb Trail */}
            <div className="breadcrumb-trail">
              <span>Admin</span>
              <span>/</span>
              <span className="active">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "messages" && "Contact Messages"}
                {activeTab === "projects" && "Portfolio Projects"}
                {activeTab === "system" && "System & API Health"}
              </span>
            </div>
          </div>

          <div className="navbar-right">
            {/* Live API Health Pill */}
            <div
              className={`health-status-pill ${
                healthInfo?.status === "ok" ? "" : "offline"
              }`}
              title={`API: ${healthInfo?.status || "Checking..."} • DB: ${
                healthInfo?.database || "Checking..."
              }`}
            >
              <span className="health-pulse-dot" />
              <span>
                {healthInfo?.status === "ok" ? "API Online" : "Connecting..."}
              </span>
            </div>

            {/* Current Date Badge */}
            <div className="current-date-badge">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{formattedDate}</span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="nav-notify-btn"
              onClick={() => {
                setActiveTab("messages");
                setFilterStatus("unread");
              }}
              title={`${unreadCount} unread messages`}
              aria-label={`${unreadCount} unread messages`}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="notify-badge-count">{unreadCount}</span>
              )}
            </button>

            {/* Live Portfolio Link */}
            <Link to="/" className="nav-portfolio-cta" target="_blank">
              <span>View Portfolio</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="dashboard-scroll-content">
          {/* Global Error Banner */}
          {error && (
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "14px",
                background: "rgba(239, 68, 68, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#fca5a5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
              role="alert"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchAllMessages(true)}
                className="action-btn-secondary"
                style={{ borderColor: "rgba(239, 68, 68, 0.4)", color: "#fca5a5" }}
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* ========================================================
              TAB 1: DASHBOARD OVERVIEW
              ======================================================== */}
          {activeTab === "overview" && (
            <>
              {/* Welcome Banner */}
              <section className="overview-welcome-banner">
                <div className="welcome-title-group">
                  <h2>
                    Welcome Back, <span>{adminUser?.name || "Admin"}</span>
                  </h2>
                  <p>
                    Here is an overview of your portfolio activity, inquiries, and system status.
                  </p>
                </div>

                <div className="banner-action-buttons">
                  <button
                    type="button"
                    className={`refresh-action-btn ${refreshing ? "spinning" : ""}`}
                    onClick={() => {
                      fetchAllMessages(true);
                      fetchSystemHealth();
                    }}
                    disabled={refreshing}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="23 4 23 10 17 10" />
                      <polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
                  </button>

                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={() => {
                      setActiveTab("messages");
                      setFilterStatus("unread");
                    }}
                  >
                    <span>View Unread ({unreadCount})</span>
                  </button>
                </div>
              </section>

              {/* 3D Metrics Grid */}
              <section className="metrics-grid">
                {/* Metric 1: Total Messages */}
                <div
                  className="metric-card-3d"
                  onClick={() => {
                    setActiveTab("messages");
                    setFilterStatus("all");
                  }}
                  title="Click to view all messages"
                >
                  <div className="metric-card-top">
                    <span className="metric-label">Total Messages</span>
                    <div className="metric-icon-box cyan">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="metric-counter">{messages.length}</div>
                  <div className="metric-hint">
                    <span>From contact form inquiries</span>
                  </div>
                </div>

                {/* Metric 2: Unread Messages */}
                <div
                  className="metric-card-3d"
                  onClick={() => {
                    setActiveTab("messages");
                    setFilterStatus("unread");
                  }}
                  title="Click to view unread messages"
                >
                  <div className="metric-card-top">
                    <span className="metric-label">Unread Messages</span>
                    <div className="metric-icon-box violet">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                  </div>
                  <div className="metric-counter" style={{ color: "var(--admin-cyan)" }}>
                    {unreadCount}
                  </div>
                  <div className="metric-hint">
                    <span style={{ color: unreadCount > 0 ? "var(--admin-cyan)" : undefined }}>
                      {unreadCount > 0 ? "Requires review" : "Inbox is up to date"}
                    </span>
                  </div>
                </div>

                {/* Metric 3: Read Messages */}
                <div
                  className="metric-card-3d"
                  onClick={() => {
                    setActiveTab("messages");
                    setFilterStatus("read");
                  }}
                  title="Click to view read messages"
                >
                  <div className="metric-card-top">
                    <span className="metric-label">Read & Processed</span>
                    <div className="metric-icon-box emerald">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="metric-counter">{readCount}</div>
                  <div className="metric-hint">
                    <span>Archived inquiries</span>
                  </div>
                </div>

                {/* Metric 4: Portfolio Projects */}
                <div
                  className="metric-card-3d"
                  onClick={() => setActiveTab("projects")}
                  title="Click to view portfolio projects"
                >
                  <div className="metric-card-top">
                    <span className="metric-label">Portfolio Projects</span>
                    <div className="metric-icon-box amber">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="metric-counter">{totalProjectsCount}</div>
                  <div className="metric-hint">
                    <span>Active featured projects</span>
                  </div>
                </div>
              </section>

              {/* Recent Messages Activity Preview */}
              <section className="messages-master-card">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "18px", color: "#ffffff" }}>
                      Recent Inquiries
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--admin-text-muted)" }}>
                      Latest contact submissions from your portfolio visitors
                    </p>
                  </div>
                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={() => setActiveTab("messages")}
                  >
                    <span>View All Messages ({messages.length}) →</span>
                  </button>
                </div>

                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div className="skeleton-card" />
                    <div className="skeleton-card" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="empty-state-card">
                    <div className="empty-state-icon">✉</div>
                    <h3>No contact messages yet</h3>
                    <p>
                      Messages sent through your portfolio's Contact section will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  <div className="messages-feed-stack">
                    {messages.slice(0, 4).map((msg) => {
                      const msgId = msg._id || msg.id;
                      return (
                        <div
                          key={msgId}
                          className={`message-entryCard message-entry-card ${
                            msg.isRead ? "read" : "unread"
                          }`}
                          onClick={() => handleOpenMessage(msg)}
                        >
                          <div className="msg-header-row">
                            <div className="msg-sender-meta">
                              <div className="sender-initials-badge">
                                {msg.name ? msg.name[0].toUpperCase() : "U"}
                              </div>
                              <div className="sender-details">
                                <span className="sender-name">{msg.name}</span>
                                <span className="sender-email-link">{msg.email}</span>
                              </div>
                            </div>
                            <div className="msg-date-status-wrap">
                              <span className="msg-timestamp">
                                {new Date(msg.createdAt).toLocaleDateString()}
                              </span>
                              <span
                                className={`status-badge-pill ${
                                  msg.isRead ? "read" : "unread"
                                }`}
                              >
                                {msg.isRead ? "Read" : "Unread"}
                              </span>
                            </div>
                          </div>

                          <div className="msg-subject-line">
                            {msg.subject || "No Subject"}
                          </div>
                          <div className="msg-preview-text">{msg.message}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {/* ========================================================
              TAB 2: CONTACT MESSAGES MANAGEMENT
              ======================================================== */}
          {activeTab === "messages" && (
            <section className="messages-master-card">
              {/* Controls: Search, Tabs, Sort */}
              <div className="messages-controls-bar">
                {/* Search Input */}
                <div className="search-input-wrapper">
                  <span className="search-icon-left" aria-hidden="true">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="message-search-input"
                    placeholder="Search by name, email, subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setSearchTerm("")}
                      aria-label="Clear search"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs-cluster">
                  <button
                    type="button"
                    className={`filter-tab-btn ${filterStatus === "all" ? "active" : ""}`}
                    onClick={() => setFilterStatus("all")}
                  >
                    All ({messages.length})
                  </button>
                  <button
                    type="button"
                    className={`filter-tab-btn ${
                      filterStatus === "unread" ? "active" : ""
                    }`}
                    onClick={() => setFilterStatus("unread")}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    type="button"
                    className={`filter-tab-btn ${filterStatus === "read" ? "active" : ""}`}
                    onClick={() => setFilterStatus("read")}
                  >
                    Read ({readCount})
                  </button>
                </div>

                {/* Sort Order Toggle */}
                <button
                  type="button"
                  className="action-btn-secondary"
                  onClick={() =>
                    setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
                  }
                  title="Toggle chronological sorting"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                  </svg>
                  <span>{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
                </button>
              </div>

              {/* Message Feed / Loading / Empty */}
              {loading ? (
                <div className="messages-feed-stack">
                  <div className="skeleton-card" />
                  <div className="skeleton-card" />
                  <div className="skeleton-card" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="empty-state-card">
                  <div className="empty-state-icon">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9" />
                      <polyline points="22,6 12,13 2,6" />
                      <circle cx="18" cy="18" r="3" />
                      <line x1="20.2" y1="20.2" x2="22" y2="22" />
                    </svg>
                  </div>
                  <h3>No messages found</h3>
                  <p>
                    {searchTerm
                      ? `No inquiries matching "${searchTerm}". Try a different search term or clear the filter.`
                      : filterStatus !== "all"
                      ? `There are currently no ${filterStatus} inquiries.`
                      : "No contact submissions received yet."}
                  </p>
                  {(searchTerm || filterStatus !== "all") && (
                    <button
                      type="button"
                      className="action-btn-secondary"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                      }}
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="messages-feed-stack">
                  {filteredMessages.map((msg) => {
                    const msgId = msg._id || msg.id;
                    const isWorking = actionInProgress === msgId;

                    return (
                      <article
                        key={msgId}
                        className={`message-entry-card ${msg.isRead ? "read" : "unread"}`}
                        onClick={() => handleOpenMessage(msg)}
                      >
                        {/* Header Row */}
                        <div className="msg-header-row">
                          <div className="msg-sender-meta">
                            <div className="sender-initials-badge">
                              {msg.name ? msg.name[0].toUpperCase() : "U"}
                            </div>
                            <div className="sender-details">
                              <span className="sender-name">{msg.name}</span>
                              <a
                                href={`mailto:${msg.email}`}
                                className="sender-email-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {msg.email}
                              </a>
                            </div>
                          </div>

                          <div className="msg-date-status-wrap">
                            <span className="msg-timestamp">
                              {new Date(msg.createdAt).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span
                              className={`status-badge-pill ${
                                msg.isRead ? "read" : "unread"
                              }`}
                            >
                              {msg.isRead ? "Read" : "Unread"}
                            </span>
                          </div>
                        </div>

                        {/* Subject & Preview */}
                        <h4 className="msg-subject-line">
                          {msg.subject || "No Subject"}
                        </h4>
                        <p className="msg-preview-text">{msg.message}</p>

                        {/* Action Buttons Row */}
                        <div
                          className="msg-actions-row"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="msg-left-actions">
                            {/* Toggle Read/Unread */}
                            <button
                              type="button"
                              className="action-btn-secondary"
                              disabled={isWorking}
                              onClick={() => handleToggleReadStatus(msgId, msg.isRead)}
                              title={msg.isRead ? "Mark as unread" : "Mark as read"}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span>
                                {isWorking
                                  ? "Updating..."
                                  : msg.isRead
                                  ? "Mark as Unread"
                                  : "Mark as Read"}
                              </span>
                            </button>

                            {/* View Details Button */}
                            <button
                              type="button"
                              className="action-btn-secondary"
                              onClick={() => handleOpenMessage(msg)}
                              title="Read full message"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <span>View Details</span>
                            </button>

                            {/* Reply via Email */}
                            <a
                              href={`mailto:${msg.email}?subject=${encodeURIComponent(
                                "Re: " + (msg.subject || "Portfolio Inquiry")
                              )}`}
                              className="action-btn-secondary"
                              title="Open email composer"
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                              <span>Reply</span>
                            </a>
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            className="action-btn-danger"
                            disabled={isWorking}
                            onClick={() => setDeleteTargetMessage(msg)}
                            title="Delete this message"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ========================================================
              TAB 3: PORTFOLIO PROJECTS SHOWCASE
              ======================================================== */}
          {/* ========================================================
              TAB 3: PORTFOLIO PROJECTS SHOWCASE & MANAGEMENT
              ======================================================== */}
          {activeTab === "projects" && (
            <section className="messages-master-card">
              {/* Top Banner/Header */}
              <div className="tab-projects-header">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h3 style={{ fontSize: "20px", color: "#ffffff", margin: 0 }}>
                      Portfolio Projects
                    </h3>
                    <span className="nav-badge-pill" style={{ fontSize: "12px" }}>
                      {projects.length} Total
                    </span>
                  </div>
                  <p style={{ fontSize: "13.5px", color: "var(--admin-text-muted)", marginTop: "4px" }}>
                    Add, edit, or delete projects dynamically stored in MongoDB Atlas and rendered on your portfolio.
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="action-btn-secondary"
                    onClick={() => fetchAllProjects(true)}
                    disabled={projectsRefreshing}
                    title="Refresh projects from database"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        animation: projectsRefreshing ? "spin 0.8s linear infinite" : "none",
                      }}
                    >
                      <polyline points="23 4 23 10 17 10" />
                      <polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    <span>{projectsRefreshing ? "Refreshing..." : "Refresh"}</span>
                  </button>

                  <a
                    href="/#projects"
                    target="_blank"
                    rel="noreferrer"
                    className="action-btn-secondary"
                    title="View live portfolio coverflow"
                  >
                    <span>Live Coverflow ↗</span>
                  </a>

                  <button
                    type="button"
                    className="btn-create-project-glow"
                    onClick={handleOpenCreateProject}
                    title="Create and publish a new project"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Add New Project</span>
                  </button>
                </div>
              </div>

              {/* Success Notification Banner */}
              {projectSuccessMsg && (
                <div className="admin-success-banner" role="status">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>{projectSuccessMsg}</span>
                  <button
                    type="button"
                    onClick={() => setProjectSuccessMsg("")}
                    className="banner-close-btn"
                    aria-label="Close notification"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Filter & Search Bar */}
              <div className="projects-filter-bar">
                <div className="search-input-wrapper" style={{ flex: 1, minWidth: "240px" }}>
                  <svg
                    className="search-input-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="message-search-input"
                    placeholder="Search projects by title, category, technology..."
                    value={projectSearchTerm}
                    onChange={(e) => setProjectSearchTerm(e.target.value)}
                  />
                  {projectSearchTerm && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setProjectSearchTerm("")}
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label htmlFor="categoryFilter" style={{ fontSize: "12px", color: "var(--admin-text-muted)" }}>
                    Category:
                  </label>
                  <select
                    id="categoryFilter"
                    className="admin-select-input"
                    value={projectCategoryFilter}
                    onChange={(e) => setProjectCategoryFilter(e.target.value)}
                  >
                    {projectCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Projects Grid or Loading / Empty state */}
              {projectsLoading ? (
                <div className="loading-state-box">
                  <div className="cyber-spinner" />
                  <p>Loading projects from MongoDB database...</p>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="empty-state-box">
                  <div className="empty-state-icon">
                    <svg
                      width="36"
                      height="36"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 2 7 12 12 22 7 12 2" />
                      <polyline points="2 17 12 22 22 17" />
                      <polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                  <h4>No Projects Found</h4>
                  <p>
                    {projectSearchTerm || projectCategoryFilter !== "all"
                      ? "No projects match your current filters. Try resetting search."
                      : "No projects in the database. Add your first project now!"}
                  </p>
                  {(projectSearchTerm || projectCategoryFilter !== "all") ? (
                    <button
                      type="button"
                      className="action-btn-secondary"
                      onClick={() => {
                        setProjectSearchTerm("");
                        setProjectCategoryFilter("all");
                      }}
                      style={{ marginTop: "12px" }}
                    >
                      Reset Filters
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-create-project-glow"
                      onClick={handleOpenCreateProject}
                      style={{ marginTop: "12px" }}
                    >
                      + Add First Project
                    </button>
                  )}
                </div>
              ) : (
                <div className="projects-admin-grid">
                  {filteredProjects.map((project) => {
                    const projId = project._id || project.id;
                    const isDeletingThis = projectActionInProgress === projId;

                    return (
                      <div key={projId} className="project-admin-card">
                        <div className="project-thumb-box">
                          <img
                            src={
                              project.image ||
                              "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80"
                            }
                            alt={project.title}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80";
                            }}
                          />
                          <span className="project-category-tag">
                            {project.category}
                          </span>
                          {project.order !== undefined && (
                            <span className="project-order-tag">
                              #{project.order}
                            </span>
                          )}
                        </div>

                        <div className="project-card-body">
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                            <h3>{project.title}</h3>
                          </div>

                          <p>{project.description}</p>

                          <div className="project-tech-tags">
                            {Array.isArray(project.tech)
                              ? project.tech.map((t, idx) => (
                                  <span key={`${t}-${idx}`} className="tech-tag">
                                    {t}
                                  </span>
                                ))
                              : <span className="tech-tag">{String(project.tech)}</span>}
                          </div>

                          <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {project.demo && (
                              <a
                                href={formatExternalUrl(project.demo)}
                                target="_blank"
                                rel="noreferrer"
                                className="action-btn-secondary"
                                style={{ fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                title="Open Live Demo in new tab"
                              >
                                Live Demo ↗
                              </a>
                            )}
                            {project.github && (
                              <a
                                href={formatExternalUrl(project.github)}
                                target="_blank"
                                rel="noreferrer"
                                className="action-btn-secondary"
                                style={{ fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                title="Open GitHub Repository in new tab"
                              >
                                GitHub ⌘
                              </a>
                            )}
                          </div>

                          {/* Card Action Buttons Toolbar */}
                          <div className="project-card-actions">
                            <button
                              type="button"
                              className="action-btn-edit"
                              onClick={() => handleOpenEditProject(project)}
                              title="Edit project details"
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              className="action-btn-danger"
                              onClick={() => setDeleteTargetProject(project)}
                              disabled={isDeletingThis}
                              title="Delete project"
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ========================================================
              TAB 4: SYSTEM & HEALTH
              ======================================================== */}
          {activeTab === "system" && (
            <section className="messages-master-card">
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "20px", color: "#ffffff" }}>
                  System Architecture & API Diagnostics
                </h3>
                <p style={{ fontSize: "13.5px", color: "var(--admin-text-muted)" }}>
                  Live operational telemetry fetched from your Express backend server.
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "16px",
                  marginBottom: "28px",
                }}
              >
                {/* Node Service */}
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    background: "rgba(10, 15, 33, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--admin-text-dim)" }}>
                    REST API Service
                  </span>
                  <h4 style={{ fontSize: "18px", color: "#ffffff", marginTop: "4px" }}>
                    {healthInfo?.service || "portfolio-backend-api"}
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color:
                        healthInfo?.status === "ok" ? "var(--admin-cyan)" : "#ef4444",
                      marginTop: "6px",
                    }}
                  >
                    ● Status: {healthInfo?.status || "Unknown"}
                  </p>
                </div>

                {/* Database State */}
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    background: "rgba(10, 15, 33, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--admin-text-dim)" }}>
                    MongoDB Connection
                  </span>
                  <h4 style={{ fontSize: "18px", color: "#ffffff", marginTop: "4px" }}>
                    {healthInfo?.database === "connected"
                      ? "MongoDB Atlas"
                      : "Connecting..."}
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color:
                        healthInfo?.database === "connected"
                          ? "#10b981"
                          : "#f59e0b",
                      marginTop: "6px",
                    }}
                  >
                    ● State: {healthInfo?.database || "Offline"}
                  </p>
                </div>

                {/* Uptime */}
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    background: "rgba(10, 15, 33, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--admin-text-dim)" }}>
                    Process Uptime
                  </span>
                  <h4 style={{ fontSize: "18px", color: "#ffffff", marginTop: "4px" }}>
                    {healthInfo?.uptime || "Active"}
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--admin-text-muted)",
                      marginTop: "6px",
                    }}
                  >
                    Environment: {healthInfo?.environment || "development"}
                  </p>
                </div>

                {/* Admin Auth Status */}
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    background: "rgba(10, 15, 33, 0.7)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "var(--admin-text-dim)" }}>
                    Authentication Token
                  </span>
                  <h4 style={{ fontSize: "18px", color: "#ffffff", marginTop: "4px" }}>
                    JWT (Signed)
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#10b981",
                      marginTop: "6px",
                    }}
                  >
                    ● Session active for {adminUser?.email || "Admin"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="refresh-action-btn"
                  onClick={fetchSystemHealth}
                >
                  <span>Re-check Health Diagnostics</span>
                </button>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ========================================================
          MODAL 1: MESSAGE DETAIL MODAL
          ======================================================== */}
      {selectedMessage && (
        <div
          className="modal-backdrop-overlay"
          onClick={() => setSelectedMessage(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-subject"
        >
          <div
            className="modal-glass-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedMessage(null)}
              aria-label="Close dialog"
            >
              ✕
            </button>

            {/* Sender Details Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div className="sender-initials-badge" style={{ width: "48px", height: "48px", fontSize: "18px" }}>
                {selectedMessage.name ? selectedMessage.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <h3 style={{ fontSize: "18px", color: "#ffffff", margin: 0 }}>
                  {selectedMessage.name}
                </h3>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  style={{ color: "var(--admin-cyan)", fontSize: "13px" }}
                >
                  {selectedMessage.email}
                </a>
              </div>
            </div>

            {/* Subject & Timestamp Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                paddingBottom: "14px",
              }}
            >
              <h2 id="modal-subject" style={{ fontSize: "18px", color: "#f8fafc", margin: 0 }}>
                {selectedMessage.subject || "No Subject"}
              </h2>
              <span style={{ fontSize: "12px", color: "var(--admin-text-dim)" }}>
                {new Date(selectedMessage.createdAt).toLocaleString(undefined, {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </span>
            </div>

            {/* Message Body Content */}
            <div className="modal-message-body-box">
              {selectedMessage.message}
            </div>

            {/* Action Footer */}
            <div className="modal-footer-actions">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <a
                  href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent(
                    "Re: " + (selectedMessage.subject || "Portfolio Inquiry")
                  )}`}
                  className="action-btn-secondary"
                  style={{
                    background: "rgba(0, 240, 255, 0.15)",
                    borderColor: "var(--admin-cyan)",
                    color: "var(--admin-cyan)",
                  }}
                >
                  <span>Reply via Email ↗</span>
                </a>

                <button
                  type="button"
                  className="action-btn-secondary"
                  onClick={() =>
                    handleToggleReadStatus(
                      selectedMessage._id || selectedMessage.id,
                      selectedMessage.isRead
                    )
                  }
                >
                  <span>
                    Mark as {selectedMessage.isRead ? "Unread" : "Read"}
                  </span>
                </button>
              </div>

              <button
                type="button"
                className="action-btn-danger"
                onClick={() => {
                  setDeleteTargetMessage(selectedMessage);
                }}
              >
                <span>Delete Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: DELETE CONFIRMATION DIALOG
          ======================================================== */}
      {deleteTargetMessage && (
        <div
          className="modal-backdrop-overlay"
          onClick={() => setDeleteTargetMessage(null)}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div
            className="modal-glass-container delete-dialog-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-dialog-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3 id="delete-dialog-title" style={{ fontSize: "19px", color: "#ffffff", margin: 0 }}>
              Delete Contact Message?
            </h3>

            <p style={{ fontSize: "13.5px", color: "var(--admin-text-muted)", marginTop: "8px" }}>
              Are you sure you want to permanently delete the inquiry from{" "}
              <strong style={{ color: "#ffffff" }}>{deleteTargetMessage.name}</strong>?
              This action cannot be undone.
            </p>

            <div className="delete-dialog-actions">
              <button
                type="button"
                className="btn-cancel-modal"
                onClick={() => setDeleteTargetMessage(null)}
                disabled={actionInProgress}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={handleConfirmDelete}
                disabled={actionInProgress}
              >
                {actionInProgress ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: ADD / EDIT PROJECT MODAL
          ======================================================== */}
      {projectModalOpen && (
        <div
          className="modal-backdrop-overlay"
          onClick={() => {
            if (!projectSubmitting) {
              setProjectModalOpen(false);
              setEditingProject(null);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
        >
          <div
            className="modal-glass-container project-modal-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => {
                if (!projectSubmitting) {
                  setProjectModalOpen(false);
                  setEditingProject(null);
                }
              }}
              title="Close modal"
              aria-label="Close modal"
              disabled={projectSubmitting}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="modal-header-block">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(0, 240, 255, 0.15)",
                    border: "1px solid rgba(0, 240, 255, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--admin-cyan)",
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div>
                  <h3 id="project-modal-title" style={{ fontSize: "18px", color: "#ffffff", margin: 0 }}>
                    {editingProject ? "Edit Project" : "Add New Project"}
                  </h3>
                  <span style={{ fontSize: "12.5px", color: "var(--admin-text-muted)" }}>
                    {editingProject
                      ? `Updating details for "${editingProject.title}"`
                      : "Create a new project entry to display in your portfolio"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form submission error */}
            {projectFormErrors.submit && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#fca5a5",
                  fontSize: "13px",
                }}
              >
                {projectFormErrors.submit}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveProject} className="project-editor-form">
              <div className="form-grid-two-cols">
                {/* Title */}
                <div className="admin-form-group">
                  <label htmlFor="p-title" className="admin-form-label">
                    Project Title <span style={{ color: "var(--admin-cyan)" }}>*</span>
                  </label>
                  <input
                    id="p-title"
                    type="text"
                    className={`admin-form-input ${projectFormErrors.title ? "has-error" : ""}`}
                    placeholder="e.g. AI-Powered SaaS Platform"
                    value={projectFormData.title}
                    onChange={(e) =>
                      setProjectFormData({ ...projectFormData, title: e.target.value })
                    }
                    disabled={projectSubmitting}
                  />
                  {projectFormErrors.title && (
                    <span className="admin-form-error">{projectFormErrors.title}</span>
                  )}
                </div>

                {/* Category */}
                <div className="admin-form-group">
                  <label htmlFor="p-category" className="admin-form-label">
                    Category <span style={{ color: "var(--admin-cyan)" }}>*</span>
                  </label>
                  <input
                    id="p-category"
                    type="text"
                    list="category-suggestions"
                    className={`admin-form-input ${projectFormErrors.category ? "has-error" : ""}`}
                    placeholder="e.g. Full Stack Development"
                    value={projectFormData.category}
                    onChange={(e) =>
                      setProjectFormData({ ...projectFormData, category: e.target.value })
                    }
                    disabled={projectSubmitting}
                  />
                  <datalist id="category-suggestions">
                    <option value="Full Stack Development" />
                    <option value="Frontend Development" />
                    <option value="Web Application" />
                    <option value="Mobile App" />
                    <option value="NGO Website" />
                    <option value="AI / Machine Learning" />
                  </datalist>
                  {projectFormErrors.category && (
                    <span className="admin-form-error">{projectFormErrors.category}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="admin-form-group">
                <label htmlFor="p-desc" className="admin-form-label">
                  Project Description <span style={{ color: "var(--admin-cyan)" }}>*</span>
                </label>
                <textarea
                  id="p-desc"
                  rows={3}
                  className={`admin-form-textarea ${projectFormErrors.description ? "has-error" : ""}`}
                  placeholder="Summarize the core features, architectural highlights, and impact of this project..."
                  value={projectFormData.description}
                  onChange={(e) =>
                    setProjectFormData({ ...projectFormData, description: e.target.value })
                  }
                  disabled={projectSubmitting}
                />
                {projectFormErrors.description && (
                  <span className="admin-form-error">{projectFormErrors.description}</span>
                )}
              </div>

              <div className="form-grid-two-cols">
                {/* Tech Stack */}
                <div className="admin-form-group">
                  <label htmlFor="p-tech" className="admin-form-label">
                    Tech Stack (comma-separated)
                  </label>
                  <input
                    id="p-tech"
                    type="text"
                    className="admin-form-input"
                    placeholder="React, Node.js, Express, MongoDB"
                    value={projectFormData.tech}
                    onChange={(e) =>
                      setProjectFormData({ ...projectFormData, tech: e.target.value })
                    }
                    disabled={projectSubmitting}
                  />
                  <span className="admin-form-hint">Separate technologies with commas</span>
                </div>

                {/* Demo URL */}
                <div className="admin-form-group">
                  <label htmlFor="p-demo" className="admin-form-label">
                    Live Demo URL (optional)
                  </label>
                  <input
                    id="p-demo"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. https://myproject.vercel.app"
                    value={projectFormData.demo}
                    onChange={(e) =>
                      setProjectFormData({ ...projectFormData, demo: e.target.value })
                    }
                    disabled={projectSubmitting}
                  />
                  {projectFormData.demo && (
                    <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="admin-form-hint">Link: {formatExternalUrl(projectFormData.demo)}</span>
                      <a
                        href={formatExternalUrl(projectFormData.demo)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--admin-cyan)", fontSize: "11px", textDecoration: "underline" }}
                      >
                        Test Link ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-grid-two-cols">
                {/* GitHub Repository URL */}
                <div className="admin-form-group">
                  <label htmlFor="p-github" className="admin-form-label">
                    GitHub Repository Link (optional)
                  </label>
                  <input
                    id="p-github"
                    type="text"
                    className="admin-form-input"
                    placeholder="e.g. https://github.com/arun202608-lab/..."
                    value={projectFormData.github || ""}
                    onChange={(e) =>
                      setProjectFormData({ ...projectFormData, github: e.target.value })
                    }
                    disabled={projectSubmitting}
                  />
                  {projectFormData.github && (
                    <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="admin-form-hint">Repo: {formatExternalUrl(projectFormData.github)}</span>
                      <a
                        href={formatExternalUrl(projectFormData.github)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--admin-cyan)", fontSize: "11px", textDecoration: "underline" }}
                      >
                        Test Repo ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* Display Order */}
                <div className="admin-form-group">
                  <label htmlFor="p-order" className="admin-form-label">
                    Display Order (1 = First in Coverflow)
                  </label>
                  <input
                    id="p-order"
                    type="number"
                    min="0"
                    max="999"
                    className="admin-form-input"
                    value={projectFormData.order}
                    onChange={(e) =>
                      setProjectFormData({ ...projectFormData, order: e.target.value })
                    }
                    disabled={projectSubmitting}
                  />
                </div>
              </div>

              {/* Image URL */}
              <div className="admin-form-group">
                <label htmlFor="p-image" className="admin-form-label">
                  Image / Screenshot URL
                </label>
                <input
                  id="p-image"
                  type="url"
                  className="admin-form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={projectFormData.image}
                  onChange={(e) =>
                    setProjectFormData({ ...projectFormData, image: e.target.value })
                  }
                  disabled={projectSubmitting}
                />
                <span className="admin-form-hint">Direct link to hosted screenshot or Unsplash URL</span>
              </div>

              {/* Live Preview Box */}
              {projectFormData.image && (
                <div className="image-preview-wrapper">
                  <span className="preview-label">Cover Image Live Preview:</span>
                  <div className="image-preview-thumbnail">
                    <img
                      src={projectFormData.image}
                      alt="Preview"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Buttons */}
              <div className="modal-footer-actions" style={{ marginTop: "16px" }}>
                <button
                  type="button"
                  className="btn-cancel-modal"
                  onClick={() => {
                    setProjectModalOpen(false);
                    setEditingProject(null);
                  }}
                  disabled={projectSubmitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-save-project-submit"
                  disabled={projectSubmitting}
                >
                  {projectSubmitting ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className="btn-spinner" />
                      Saving Project...
                    </span>
                  ) : editingProject ? (
                    "Update Project"
                  ) : (
                    "Create Project"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 4: DELETE PROJECT CONFIRMATION DIALOG
          ======================================================== */}
      {deleteTargetProject && (
        <div
          className="modal-backdrop-overlay"
          onClick={() => {
            if (!projectActionInProgress) setDeleteTargetProject(null);
          }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-project-title"
        >
          <div
            className="modal-glass-container delete-dialog-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-dialog-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3 id="delete-project-title" style={{ fontSize: "19px", color: "#ffffff", margin: 0 }}>
              Delete Portfolio Project?
            </h3>

            <p style={{ fontSize: "13.5px", color: "var(--admin-text-muted)", marginTop: "8px" }}>
              Are you sure you want to permanently delete{" "}
              <strong style={{ color: "#ffffff" }}>"{deleteTargetProject.title}"</strong> from your portfolio?
              This will remove it from MongoDB Atlas and your live website.
            </p>

            <div className="delete-dialog-actions">
              <button
                type="button"
                className="btn-cancel-modal"
                onClick={() => setDeleteTargetProject(null)}
                disabled={projectActionInProgress}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={handleConfirmDeleteProject}
                disabled={projectActionInProgress}
              >
                {projectActionInProgress ? "Deleting Project..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

