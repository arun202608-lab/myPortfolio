
import { useEffect, useRef, useState } from "react";
import "./Skills.css";

const skillGroups = [
  {
    title: "Frontend Development",
    subtitle: "Building user interfaces",
    icon: "◈",
    color: "purple",
    skills: [
      { name: "HTML5", icon: "5", level: 85, color: "html" },
      { name: "CSS3", icon: "3", level: 80, color: "css" },
      { name: "JavaScript", icon: "JS", level: 65, color: "javascript" },
      { name: "React.js", icon: "⚛", level: 60, color: "react" },
    ],
  },
  {
    title: "Backend Development",
    subtitle: "Building application logic",
    icon: "⌘",
    color: "cyan",
    skills: [
      { name: "Node.js", icon: "N", level: 55, color: "node" },
      { name: "Express.js", icon: "Ex", level: 50, color: "express" },
      { name: "REST APIs", icon: "↔", level: 60, color: "api" },
    ],
  },
  {
    title: "Database",
    subtitle: "Working with application data",
    icon: "▤",
    color: "pink",
    skills: [
      { name: "MongoDB", icon: "M", level: 55, color: "mongodb" },
      { name: "SQL", icon: "DB", level: 60, color: "sql" },
    ],
  },
  {
    title: "Tools & Technologies",
    subtitle: "Development workflow",
    icon: "⚙",
    color: "blue",
    skills: [
      { name: "Git", icon: "G", level: 65, color: "git" },
      { name: "GitHub", icon: "GH", level: 70, color: "github" },
      { name: "VS Code", icon: "VS", level: 80, color: "vscode" },
      { name: "Postman", icon: "P", level: 55, color: "postman" },
    ],
  },
];

function Skills() {
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
      { threshold: 0.12 }
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className={`skills-section ${visible ? "skills-visible" : ""}`}
      id="skills"
      ref={sectionRef}
    >
      <div className="skills-container">
        {/* Section Heading */}
        <div className="skills-heading">
          <span className="skills-eyebrow">
            <span></span>
            MY TECHNICAL EXPERTISE
            <span></span>
          </span>

          <h2>
            Skills & <span>Technologies</span>
          </h2>

          <p>
            The technologies and tools I use to build web applications,
            solve problems, and turn ideas into reality.
          </p>
        </div>

        {/* Skill Summary */}
        <div className="skills-summary">
          <div className="skills-summary-item">
            <span className="summary-icon">⌘</span>
            <div>
              <strong>Frontend</strong>
              <small>UI Development</small>
            </div>
          </div>

          <div className="skills-summary-item">
            <span className="summary-icon">◈</span>
            <div>
              <strong>Backend</strong>
              <small>Server & APIs</small>
            </div>
          </div>

          <div className="skills-summary-item">
            <span className="summary-icon">▤</span>
            <div>
              <strong>Database</strong>
              <small>Data Management</small>
            </div>
          </div>

          <div className="skills-summary-item">
            <span className="summary-icon">⚙</span>
            <div>
              <strong>Tools</strong>
              <small>Dev Workflow</small>
            </div>
          </div>
        </div>

        {/* Skill Categories */}
        <div className="skills-grid">
          {skillGroups.map((group, groupIndex) => (
            <article
              className={`skill-category-card ${group.color}`}
              key={group.title}
              style={{ "--skill-delay": `${groupIndex * 120}ms` }}
            >
              <div className="skill-category-header">
                <div className="skill-category-icon">{group.icon}</div>

                <div>
                  <h3>{group.title}</h3>
                  <p>{group.subtitle}</p>
                </div>

                <span className="category-arrow">↗</span>
              </div>

              <div className="skill-list">
                {group.skills.map((skill) => (
                  <div className="skill-item" key={skill.name}>
                    <div className="skill-item-top">
                      <div className="skill-name-group">
                        <span
                          className={`skill-tech-icon ${skill.color}`}
                          aria-hidden="true"
                        >
                          {skill.icon}
                        </span>

                        <span className="skill-name">{skill.name}</span>
                      </div>

                      <span className="skill-level">
                        {skill.level}%
                      </span>
                    </div>

                    <div
                      className="skill-progress-track"
                      role="progressbar"
                      aria-label={`${skill.name} self-assessed proficiency`}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      aria-valuenow={skill.level}
                    >
                      <div
                        className={`skill-progress-fill ${skill.color}`}
                        style={{
                          "--skill-level": `${skill.level}%`,
                          "--bar-delay": `${groupIndex * 120 + 200}ms`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="skill-card-footer">
                <span className="skill-footer-dot"></span>
                Keep learning, keep building
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Message */}
        <div className="skills-bottom">
          <div className="skills-bottom-icon">✦</div>

          <div className="skills-bottom-text">
            <h3>Always learning. Always improving.</h3>
            <p>
              I believe consistent practice and real-world projects are
              the best ways to strengthen technical skills.
            </p>
          </div>

          <a href="#projects" className="skills-project-link">
            View Projects <span>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Skills;

