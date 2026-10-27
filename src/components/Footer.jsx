
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <footer className="portfolio-footer" id="footer">
      <div className="footer-glow"></div>

      <div className="footer-container">
        {/* Main Footer */}
        <div className="footer-main">

          {/* Brand Section */}
          <div className="footer-brand">
            <a href="#home" className="footer-logo">
              Arun<span>.</span>
            </a>

            <h3>
              Building Digital
              <br />
              <span>Experiences.</span>
            </h3>

            <p>
              I'm a software developer passionate about
              building responsive websites and creating
              meaningful digital experiences.
            </p>

            <a href="#contact" className="footer-cta">
              Let's Work Together <span>↗</span>
            </a>
          </div>

          {/* Quick Links */}
          <div className="footer-links">
            <h4>Quick Links</h4>

            <ul>
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href}>
                    <span className="footer-link-arrow">↗</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-contact">
            <h4>Get In Touch</h4>

            <p>
              Have a project idea or a job opportunity?
              Feel free to connect with me.
            </p>

            <a
              href="mailto:arun202608@gmail.com"
              className="footer-contact-link"
            >
              <span className="footer-icon">✉</span>
              <span>arun202608@gmail.com</span>
            </a>

            <a
              href="https://www.linkedin.com/in/arun-s-2026bc/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-link"
            >
              <span className="footer-icon">in</span>
              <span>LinkedIn Profile</span>
            </a>

            <a
              href="https://github.com/arun202608-lab"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-contact-link"
            >
              <span className="footer-icon">⌘</span>
              <span>GitHub Profile</span>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom Footer */}
        <div className="footer-bottom">

          <p className="footer-copyright">
            © {currentYear} <span>Arun</span>.
            All rights reserved.
          </p>

          <p className="footer-made">
            Designed & Built with <span>♥</span> using React
          </p>

          {/* Admin and Back to Top Buttons */}
          <div className="footer-bottom-actions">
            <Link to="/admin" className="footer-admin-btn">
              <span className="admin-icon">⚙</span>
              Admin Login
            </Link>

            <a href="#home" className="footer-back-top">
              Back to Top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

