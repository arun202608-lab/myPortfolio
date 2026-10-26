
import { useState } from "react";
import "./Projects.css";

const projects = [
  {
    id: 1,
    title: "Food Delivery System",
    category: "Full Stack Development",
    description:
      "A food delivery application with user authentication, cart management, order placement and an admin panel.",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
    tech: ["React", "Node.js", "MongoDB"],
    demo: "",
  },
  {
    id: 2,
    title: "Employee Portal",
    category: "Web Application",
    description:
      "An employee portal with role-based access management and organized employee information.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    tech: ["React", "Express.js", "MongoDB"],
    demo: "",
  },
  {
    id: 3,
    title: "Vessel Rental Website",
    category: "Frontend Development",
    description:
      "A responsive vessel rental website with rental information, service details and an interactive map.",
    image:
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=900&q=80",
    tech: ["React", "CSS", "Leaflet"],
    demo: "",
  },
  {
    id: 4,
    title: "Helppme NGO Website",
    category: "NGO Website",
    description:
      "An NGO website showcasing community initiatives, social activities and healthcare camps.",
    image:
      "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=80",
    tech: ["React", "Node.js", "MongoDB"],
    demo: "https://helppme.in",
  },
  {
    id: 5,
    title: "Developer Portfolio",
    category: "Frontend Development",
    description:
      "A personal portfolio website presenting technical skills, projects and contact information.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80",
    tech: ["React", "JavaScript", "CSS"],
    demo: "",
  },
];

function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);

  const previousSlide = () => {
    setActiveIndex((current) =>
      current === 0 ? projects.length - 1 : current - 1
    );
  };

  const nextSlide = () => {
    setActiveIndex((current) =>
      current === projects.length - 1 ? 0 : current + 1
    );
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  const getPosition = (index) => {
    let position = index - activeIndex;
    const total = projects.length;

    if (position > total / 2) {
      position -= total;
    }

    if (position < -total / 2) {
      position += total;
    }

    return position;
  };

  return (
    <section className="coverflow-section" id="projects">
      <div className="coverflow-background"></div>

      <div className="coverflow-container">
       
          <header className="coverflow-heading">
            <span className="coverflow-eyebrow">
              WHAT I HAVE BUILT
            </span>

            <h2>
              My <span>Projects</span>
            </h2>

            <p>
              Explore my latest projects, development skills, and creative work.
            </p>
          </header>



        <div className="coverflow-stage">
          {/* Previous arrow */}
          <button
            type="button"
            className="coverflow-arrow coverflow-arrow-left"
            onClick={previousSlide}
            aria-label="Previous project"
          >
            &#8249;
          </button>

          {/* 3D project cards */}
          <div className="coverflow-cards">
            {projects.map((project, index) => {
              const position = getPosition(index);

              return (
                <article
                  key={project.id}
                  className={`coverflow-card ${
                    position === 0 ? "is-active" : ""
                  }`}
                  style={{
                    "--position": position,
                    "--distance": Math.abs(position),
                    zIndex: projects.length - Math.abs(position),
                  }}
                  onClick={() => {
                    if (position !== 0) {
                      goToSlide(index);
                    }
                  }}
                  aria-hidden={Math.abs(position) > 1}
                >
                  <div className="coverflow-image">
                    <img
                      src={project.image}
                      alt={project.title}
                    />

                    <div className="coverflow-image-overlay">
                      <span>{project.category}</span>
                    </div>
                  </div>

                  <div className="coverflow-content">
                    <span className="coverflow-category">
                      {project.category}
                    </span>

                    <h3>{project.title}</h3>

                    <p>{project.description}</p>

                    <div className="coverflow-tech">
                      {project.tech.map((technology) => (
                        <span key={technology}>
                          {technology}
                        </span>
                      ))}
                    </div>

                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="coverflow-link"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Learn more <span>↗</span>
                      </a>
                    )}

                    {!project.demo && (
                      <span className="coverflow-link disabled-link">
                        Project Preview <span>→</span>
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Next arrow */}
          <button
            type="button"
            className="coverflow-arrow coverflow-arrow-right"
            onClick={nextSlide}
            aria-label="Next project"
          >
            &#8250;
          </button>
        </div>

        {/* Bottom navigation */}
        <div className="coverflow-pagination">
          {projects.map((project, index) => (
            <button
              type="button"
              key={project.id}
              className={`coverflow-dot ${
                activeIndex === index ? "active" : ""
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Show ${project.title}`}
              aria-current={activeIndex === index ? "true" : undefined}
            />
          ))}
        </div>

        <div className="coverflow-footer">
          <p>Interested in working together?</p>

          <a href="#contact" className="coverflow-contact">
            Let's Connect <span>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Projects;
