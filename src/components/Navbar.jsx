
import { useState } from "react";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Skills", href: "#skills" },
    { name: "Projects", href: "#projects" },
    { name: "Contact", href: "#contact" },
  ];

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <nav className="navbar-container">
        {/* Logo */}
        <a href="#home" className="navbar-logo" onClick={closeMenu}>
          <span className="logo-bracket">&lt;</span>
          <span className="logo-name">Arun</span>
          <span className="logo-bracket"> /&gt;</span>
          <span className="logo-dot">.</span>
        </a>

        {/* Desktop Navigation */}
        <div className={`navbar-links ${menuOpen ? "active" : ""}`}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="navbar-link"
              onClick={closeMenu}
            >
              {link.name}
            </a>
          ))}

          <a
            href="#contact"
            className="navbar-cta mobile-cta"
            onClick={closeMenu}
          >
            Let's Talk <span>↗</span>
          </a>
        </div>

        {/* Right Side Button */}
        <a href="#contact" className="navbar-cta desktop-cta">
          Let's Talk <span>↗</span>
        </a>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </header>
  );
}

export default Navbar;

