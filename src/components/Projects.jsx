
import { useState, useEffect } from "react";
import "./Projects.css";
import { projectsData } from "../data/projectsData";
import { getProjects } from "../services/api";

function Projects() {
  const [projects, setProjects] = useState(projectsData);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      try {
        const res = await getProjects();
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];
        if (isMounted && list.length > 0) {
          const normalized = list.map((item) => ({
            id: item._id || item.id,
            title: item.title,
            category: item.category,
            description: item.description,
            image: item.image || "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80",
            tech: Array.isArray(item.tech) ? item.tech : [item.tech].filter(Boolean),
            demo: item.demo || "",
          }));
          setProjects(normalized);
        }
      } catch (err) {
        // Fallback silently to static projectsData
        console.warn("Could not load dynamic projects, using static fallback:", err?.message);
      }
    }
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const previousSlide = () => {
    if (projects.length === 0) return;
    setActiveIndex((current) =>
      current === 0 ? projects.length - 1 : current - 1
    );
  };

  const nextSlide = () => {
    if (projects.length === 0) return;
    setActiveIndex((current) =>
      current === projects.length - 1 ? 0 : current + 1
    );
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  const getPosition = (index) => {
    let position = index - activeIndex;
    const total = projects.length || 1;

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
