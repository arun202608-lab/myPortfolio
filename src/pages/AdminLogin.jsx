
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    const adminUsername = import.meta.env.VITE_ADMIN_USERNAME;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      setError("Admin credentials are not configured.");
      return;
    }

    if (
      username === adminUsername &&
      password === adminPassword
    ) {
      sessionStorage.setItem("arun_admin_logged_in", "true");
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError("Invalid username or password.");
    }
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleLogin}>
        <h1>Admin Login</h1>

        <p>Sign in to manage your portfolio messages.</p>

        <label htmlFor="username">Username</label>

        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" className="primary-button">
          Login
        </button>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default AdminLogin;
 
