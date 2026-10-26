
import { useEffect, useRef, useState } from "react";
import "./About.css";
import arunImage from "../assets/arun.png";
function About() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  const highlights = [
    {
      icon: "</>",
      title: "Web Development",
      description:
        "Creating responsive and user-friendly websites with modern web technologies.",
      color: "purple",
    },
    {
      icon: "✦",
      title: "Creative Thinking",
      description:
        "Enjoy solving problems and turning ideas into practical digital experiences.",
      color: "cyan",
    },
    {
      icon: "↗",
      title: "Continuous Learning",
      description:
        "Always interested in learning new technologies and improving my technical skills.",
      color: "pink",
    },
  ];

  return (
    <section
      className={`about-section ${visible ? "about-visible" : ""}`}
      id="about"
      ref={sectionRef}
    >
      <div className="about-container">
        {/* Section Heading */}
        <div className="about-heading">
          <span className="about-eyebrow">
            <span className="about-eyebrow-line"></span>
            GET TO KNOW ME
            <span className="about-eyebrow-line"></span>
          </span>

          <h2>
            About <span>Me</span>
          </h2>

          <p>
            A little about my journey, my interests, and what drives me
            to build meaningful digital experiences.
          </p>
        </div>

        {/* Main About Content */}
        <div className="about-main">
          {/* Profile Visual */}
          <div className="about-visual">
            <div className="about-visual-glow"></div>

            <div className="about-orbit about-orbit-one"></div>
            <div className="about-orbit about-orbit-two"></div>

            <div className="about-profile-card">
              <div className="about-profile-top">
                <span className="profile-dot"></span>
                <span className="profile-dot"></span>
                <span className="profile-dot"></span>
                <span className="profile-label">MY PROFILE</span>
              </div>

              <div className="about-avatar">
                 
                    <img
                      src={arunImage}
                      alt="Arun - Software Developer"
                      className="about-profile-image"
                    />
                    <div className="avatar-ring"></div>
               
                 
              </div>

              <h3>Arun</h3>
              <p className="about-profile-role">Aspiring Software Developer</p>

              <div className="about-profile-divider"></div>

              <div className="about-profile-status">
                <span className="about-status-dot"></span>
                Passionate about technology
              </div>

              <div className="about-profile-code">
                <span>const</span> developer ={" "}
                <span className="code-value">"Arun"</span>;
              </div>
            </div>

            <div className="about-floating-tag about-tag-one">
              <span>✧</span> Creative
            </div>

            <div className="about-floating-tag about-tag-two">
              <span>⌘</span> Developer
            </div>
          </div>

          {/* About Text */}
          <div className="about-content">
            <span className="about-small-label">WHO I AM</span>

            <h3>
              Turning ideas into{" "}
              <span>digital experiences.</span>
            </h3>

            <p>
              Hi, I'm Arun, an Engineering graduate in Computer Science.
              I'm passionate about web development and building clean,
              responsive, and user-friendly websites.
            </p>

            <p>
              I enjoy working with HTML, CSS, JavaScript, and React to
              create modern web interfaces. I also enjoy exploring new
              technologies, learning from challenges, and improving my
              problem-solving skills.
            </p>

            <p>
              My goal is to start my career as a software developer,
              contribute to real-world projects, and grow as a technology
              professional.
            </p>

            {/* Personal Details */}
            <div className="about-details">
              <div className="about-detail-item">
                <span className="detail-icon">⌘</span>
                <div>
                  <small>Education</small>
                  <strong>BE - Computer Science</strong>
                </div>
              </div>

              <div className="about-detail-item">
                <span className="detail-icon">◈</span>
                <div>
                  <small>Focus Area</small>
                  <strong>Web Development</strong>
                </div>
              </div>

              <div className="about-detail-item">
                <span className="detail-icon">✧</span>
                <div>
                  <small>My Mindset</small>
                  <strong>Learn & Improve</strong>
                </div>
              </div>

              <div className="about-detail-item">
                <span className="detail-icon">↗</span>
                <div>
                  <small>Career Goal</small>
                  <strong>Software Developer</strong>
                </div>
              </div>
            </div>

            <a
              href="#projects"
              className="about-project-button"
            >
              Explore My Projects <span>↗</span>
            </a>
          </div>
        </div>

        {/* Highlights */}
        <div className="about-highlights">
          {highlights.map((item, index) => (
            <article
              className={`about-highlight-card ${item.color}`}
              key={item.title}
              style={{ "--card-index": index }}
            >
              <div className="highlight-icon">{item.icon}</div>

              <h4>{item.title}</h4>

              <p>{item.description}</p>

              <span className="highlight-arrow">↗</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default About;

