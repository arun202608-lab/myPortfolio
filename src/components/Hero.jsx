import { useState } from "react";
import "./Hero.css";
import arunImage from "../assets/arun.png";

function Hero() {
  const chainLinks = Array.from({ length: 32 }, (_, index) => {
    const angle = (index / 32) * Math.PI * 2;
    const angleDegrees = (index / 32) * 360;

    return {
      angle: angleDegrees,
      x: 50 + Math.cos(angle) * 46,
      y: 50 + Math.sin(angle) * 46,
    };
  });

  const [rotation, setRotation] = useState({
    x: 0,
    y: 0,
  });

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    setRotation({
      x: y * -12,
      y: x * 12,
    });
  }

  function handleMouseLeave() {
    setRotation({ x: 0, y: 0 });
  }

  return (
    <section className="hero" id="home">
      {/* Looping cinematic backdrop */}
      <div className="hero-background-effects">
        <div className="hero-video-scene" aria-hidden="true">
          <div className="scene-ambient"></div>
          <div className="scene-horizon"></div>
          <div className="scene-floor"></div>
          <div className="scene-scanline"></div>
        </div>
      </div>

      {/* Left content */}
      <div className="hero-content">
        <p className="hero-label">
          <span className="status-dot"></span>
          WELCOME TO MY PORTFOLIO
        </p>

        <h1 className="hero-title">
          <span className="hero-title-intro">Hi, I'm </span>
          <span className="animated-name">Arun</span>
        </h1>

        <h2 className="hero-subtitle">
          <span>Frontend </span>
          <span className="animated-role">Developer</span>
        </h2>

        <p className="hero-description">
          I build responsive and user-friendly web applications. I enjoy
          learning new technologies and creating modern digital experiences.
        </p>

        <div className="hero-buttons">
          <a href="#projects" className="primary-button">
            Explore My Work <span>↗</span>
          </a>

          <a href="#contact" className="secondary-button">
            Contact Me
          </a>
        </div>

        <div className="hero-socials">
          <a
            href="https://github.com/arun202608-lab"
            target="_blank"
            rel="noreferrer"
            className="social-link github-link"
            aria-label="Visit my GitHub profile"
          >
            <span className="social-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.13c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.11-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.03.75 2.08v3.1c0 .3.2.65.76.54A11.1 11.1 0 0 0 12 .9Z" />
              </svg>
            </span>

            <span className="social-text">
              <strong>GitHub</strong>
              <small>Explore my code</small>
            </span>

            <span className="social-arrow">↗</span>
          </a>

          <a
            href="https://www.linkedin.com/in/arun-s-2026bc/"
            target="_blank"
            rel="noreferrer"
            className="social-link linkedin-link"
            aria-label="Visit my LinkedIn profile"
          >
            <span className="social-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
                <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.7H4.95V9.06h2.98v9.64ZM6.44 7.75a1.73 1.73 0 1 1 .02-3.46 1.73 1.73 0 0 1-.02 3.46Zm12.26 10.95h-2.97v-4.69c0-1.12-.02-2.56-1.56-2.56-1.56 0-1.8 1.22-1.8 2.48v4.77H9.4V9.06h2.85v1.32h.04c.4-.76 1.37-1.56 2.82-1.56 3.02 0 3.59 1.99 3.59 4.58v5.3Z" />
              </svg>
            </span>

            <span className="social-text">
              <strong>LinkedIn</strong>
              <small>Let's connect</small>
            </span>

            <span className="social-arrow">↗</span>
          </a>
        </div>
      </div>

      {/* Right visual section */}
      <div
        className="hero-visual"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Animated orbit rings */}
        <div className="hero-orbit hero-orbit-one"></div>
        <div className="hero-orbit hero-orbit-two"></div>

        {/* Platform glow */}
        <div className="hero-platform"></div>

        {/* Circular grayscale portrait */}
        <div
          className="hero-portrait-wrapper"
          style={{
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
        >
          <div className="hero-portrait-glow"></div>

          <div className="portrait-chain" aria-hidden="true">
            {chainLinks.map((link, index) => (
              <span
                className="portrait-chain-link"
                key={index}
                style={{
                  left: `${link.x}%`,
                  top: `${link.y}%`,
                  "--chain-angle": `${link.angle + 90}deg`,
                }}
              ></span>
            ))}
          </div>

          <div className="portrait-border">
            <div className="portrait-inner">
              <img
                src={arunImage}
                alt="Arun - Frontend Developer"
                className="hero-portrait"
              />
            </div>
          </div>
        </div>

        {/* Technology icons orbit slowly around the portrait */}
        <div className="tech-orbit">
          <div className="floating-tech tech-react">
            <span>⚛</span>
            <small>React</small>
          </div>

          <div className="floating-tech tech-js">
            <span>JS</span>
            <small>JavaScript</small>
          </div>

          <div className="floating-tech tech-html">
            <span>5</span>
            <small>HTML</small>
          </div>

          <div className="floating-tech tech-css">
            <span>3</span>
            <small>CSS</small>
          </div>

          <div className="floating-tech tech-code">
            <span>&lt;/&gt;</span>
            <small>Clean Code</small>
          </div>
        </div>

        {/* Creative UI badge */}
        <div className="floating-badge badge-one">
          <span>Creative UI</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
