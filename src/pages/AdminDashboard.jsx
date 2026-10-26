 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMessages,
  toggleMessageRead,
  deleteMessage,
} from "../utils/storage";

function AdminDashboard() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (
      sessionStorage.getItem("arun_admin_logged_in") !== "true"
    ) {
      navigate("/admin", { replace: true });
      return;
    }

    setMessages(getMessages());
  }, [navigate]);

  function handleToggleRead(id) {
    const success = toggleMessageRead(id);

    if (success) {
      setMessages(getMessages());
    }
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) return;

    const success = deleteMessage(id);

    if (success) {
      setMessages(getMessages());
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("arun_admin_logged_in");
    navigate("/admin", { replace: true });
  }

  const unreadCount = messages.filter(
    (message) => !message.isRead
  ).length;

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Manage your portfolio messages</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <p>Total Messages</p>
          <h2>{messages.length}</h2>
        </div>

        <div className="dashboard-stat">
          <p>Unread Messages</p>
          <h2>{unreadCount}</h2>
        </div>
      </div>

      <section className="messages-section">
        <h2>Contact Messages</h2>

        {messages.length === 0 ? (
          <p className="empty-messages">
            No messages found.
          </p>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <article
                className={`message-card ${
                  message.isRead ? "message-read" : "message-unread"
                }`}
                key={message.id}
              >
                <div className="message-top">
                  <div>
                    <h3>{message.subject}</h3>

                    <p className="message-sender">
                      From: {message.name} ({message.email})
                    </p>
                  </div>

                  <span className="message-status">
                    {message.isRead ? "Read" : "Unread"}
                  </span>
                </div>

                <p className="message-body">
                  {message.message}
                </p>

                <p className="message-date">
                  {new Date(message.createdAt).toLocaleString()}
                </p>

                <div className="message-actions">
                  <button
                    type="button"
                    onClick={() => handleToggleRead(message.id)}
                  >
                    Mark as {message.isRead ? "Unread" : "Read"}
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => handleDelete(message.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
 
