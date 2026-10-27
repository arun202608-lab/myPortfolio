import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginAdmin, saveAuthData, isAuthenticated } from "../services/api";
import "./AdminLogin.css";

const CURRENT_YEAR = new Date().getFullYear();

function AdminLogin() {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 3D Tilt calculation
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Max tilt: 8 degrees
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    card.style.setProperty("--mouse-x", `${((x / rect.width) * 100).toFixed(1)}%`);
    card.style.setProperty("--mouse-y", `${((y / rect.height) * 100).toFixed(1)}%`);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
    card.style.setProperty("--mouse-x", "50%");
    card.style.setProperty("--mouse-y", "50%");
  };

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError("Please provide both email/username and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginAdmin({
        email: trimmedUsername,
        password: password,
      });

      if (data && data.token) {
        saveAuthData(data.token, data.admin, rememberMe);
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(data?.message || "Authentication failed. Please verify credentials.");
      }
    } catch (err) {
      const serverMessage =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Cannot reach backend server. Please verify the Express API is running on port 5000."
          : "Invalid email/username or password.");
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-wrapper">
      {/* Background Matrix Grid */}
      <div className="login-bg-grid" aria-hidden="true" />

      {/* Ambient Glowing Orbs */}
      <div className="login-ambient-orb cyan" aria-hidden="true" />
      <div className="login-ambient-orb violet" aria-hidden="true" />

      {/* Floating 3D Geometric Scene */}
      <div className="login-3d-scene" aria-hidden="true">
        {/* 3D Wireframe/Translucent Cube */}
        <div className="geo-cube-wrap">
          <div className="geo-cube">
            <div className="cube-face cube-front" />
            <div className="cube-face cube-back" />
            <div className="cube-face cube-right" />
            <div className="cube-face cube-left" />
            <div className="cube-face cube-top" />
            <div className="cube-face cube-bottom" />
          </div>
        </div>

        {/* Cyber Neon Ring */}
        <div className="geo-ring" />

        {/* Floating Neon Diamond */}
        <div className="geo-diamond" />

        {/* Ambient Orbiting Star Dots */}
        <div className="geo-dot d1" />
        <div className="geo-dot d2" />
        <div className="geo-dot d3" />
      </div>

      {/* Interactive 3D Perspective Card Container */}
      <main className="login-card-perspective">
        <div
          ref={cardRef}
          className="admin-glass-card"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Dynamic Glare Overlay */}
          <div className="card-glare" aria-hidden="true" />

          {/* Animated Gradient Top Border */}
          <div className="card-neon-border" aria-hidden="true" />

          {/* Card Header */}
          <header className="card-header">
            <div className="badge-icon-box" aria-hidden="true">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h1 className="card-title">Welcome Back, Admin</h1>
            <p className="card-subtitle">Manage your portfolio from one place.</p>
          </header>

          {/* Error Notification Alert */}
          {error && (
            <div className="auth-error-alert" role="alert" aria-live="polite">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="login-form" onSubmit={handleLogin} noValidate>
            {/* Email / Username Field */}
            <div className="form-group">
              <label htmlFor="admin-email" className="form-label">
                Email or Username
              </label>
              <div className="input-container">
                <span className="input-icon-left" aria-hidden="true">
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
                <input
                  id="admin-email"
                  type="text"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="admin@example.com"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="admin-password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <span className="input-icon-left" aria-hidden="true">
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
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="remember-row">
              <label className="custom-checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-native"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-custom" aria-hidden="true">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
              id="admin-login-submit"
            >
              {loading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Card Footer Nav & Copyright */}
          <footer className="card-footer-nav">
            <Link to="/" className="back-portfolio-link">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Portfolio</span>
            </Link>

            <p className="copyright-text">
              © {CURRENT_YEAR} Arun. All rights reserved. • Secure Admin Portal
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default AdminLogin;
