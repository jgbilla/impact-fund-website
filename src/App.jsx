import React, { useEffect, useRef, useState } from "react";
import ImpactMap from "./ImpactMap.jsx";
import {
  capitalPlan,
  contactEmail,
  financeEngines,
  metrics,
  navLinks,
  phases,
  pillars,
  projectCohorts,
  roadmapStats,
  selectedProjects,
  timeline
} from "./content.js";

function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -36px 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function AnimatedMetric({ prefix = "", value, suffix = "", label, delay = 0 }) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const node = ref.current;
    let frameId;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        const start = performance.now();
        const duration = 1500;

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * value));

          if (progress < 1) {
            frameId = requestAnimationFrame(tick);
          }
        };

        frameId = requestAnimationFrame(tick);
        observer.unobserve(node);
      },
      { threshold: 0.55 }
    );

    observer.observe(node);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [value]);

  return (
    <div className="metric reveal" style={{ transitionDelay: `${delay}ms` }} ref={ref}>
      <strong>
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </strong>
      <span>{label}</span>
    </div>
  );
}

function SectionIntro({ eyebrow, title, children, centered = false }) {
  return (
    <div className={`section-intro ${centered ? "section-intro-centered" : ""}`}>
      <p className="eyebrow reveal">{eyebrow}</p>
      <h2 className="section-title reveal">{title}</h2>
      {children ? <p className="section-copy reveal">{children}</p> : null}
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Bridge Impact Fund home">
        <span>Bridge</span> Impact Fund
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <a className="nav-action" href="/#contact">
        Get Involved
      </a>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <a className="brand" href="/">
        <span>Bridge</span> Impact Fund
      </a>
      <nav aria-label="Footer navigation">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <p>Building on the MIT ASA Impact Fund, 2027-2032</p>
    </footer>
  );
}

function ProjectsPage() {
  const cohorts = [
    { year: "2024", label: "Selected Projects - Cohort 1", projects: selectedProjects },
    ...projectCohorts
  ];

  return (
    <main id="top" className="projects-page">
      <section className="projects-hero">
        <p className="eyebrow reveal">Project Archive</p>
        <h1 className="reveal">All funded projects</h1>
        <p className="projects-hero-copy reveal">
          A record of the student-led ventures selected by the MIT ASA Impact Fund,
          from the 2024 inaugural cohort through the 2025 winning projects.
        </p>
        <a className="button button-secondary reveal" href="/#origin">
          Back to Fund Overview
        </a>
      </section>

      <section className="projects-archive-page surface-section">
        {cohorts.map((cohort) => (
          <div className="project-year-block" key={cohort.year}>
            <div className="project-year-heading reveal">
              <span>{cohort.year}</span>
              <h2>{cohort.label}</h2>
            </div>
            <div className="project-page-grid">
              {cohort.projects.map((project, index) => (
                <article
                  className={`project-card project-page-card reveal ${
                    project.status ? "project-card-selected" : "project-card-compact"
                  }`}
                  style={{ transitionDelay: `${Math.min(index, 3) * 70}ms` }}
                  key={`${cohort.year}-${project.title}`}
                >
                  {project.status ? (
                    <div className="project-card-meta">
                      <span>{project.status}</span>
                      <span>{project.cohort}</span>
                    </div>
                  ) : null}
                  <p className="card-kicker">
                    {project.region} / {project.sector}
                  </p>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

function HomePage() {
  const founderHref = `mailto:${contactEmail}?subject=Bridge%20Impact%20Fund%20Founder%20Application`;
  const partnerHref = `mailto:${contactEmail}?subject=Bridge%20Impact%20Fund%20Partnership`;
  const mentorHref = `mailto:${contactEmail}?subject=Bridge%20Impact%20Fund%20Mentor%20Interest`;

  return (
    <main id="top">
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">Cohort 2027</p>
            <h1>Bridge Impact Fund</h1>
            <p className="hero-lede">
              Turning global ambition into local impact for Africa-focused student founders.
            </p>
            <p className="hero-copy">
              The fund backs students and recent graduates from MIT, Harvard, and leading
              universities worldwide with catalytic capital, mentorship, and implementation
              support for ventures that create jobs and opportunity across Africa.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href={founderHref}>
                Apply to the Fund
              </a>
              <a className="button button-secondary" href="#vision">
                Explore the Vision
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <ImpactMap />
          </div>
        </section>

        <section className="metrics-strip" aria-label="Five year fund targets">
          {metrics.map((metric, index) => (
            <AnimatedMetric key={metric.label} {...metric} delay={index * 80} />
          ))}
        </section>

        <section id="origin" className="split-section surface-section">
          <div>
            <SectionIntro
              eyebrow="The Spark"
              title="From a student pilot to a continent-scale platform"
            >
              In 2023, a group of MIT students moved from conversation to execution.
              The MIT African Students' Association Impact Fund deployed roughly $15,000
              into three student-built ventures serving home communities across the continent.
            </SectionIntro>
            <blockquote className="quote reveal">
              Small grants became real infrastructure, new income streams, and working
              proof that globally trained founders can build durable companies for local markets.
            </blockquote>
          </div>

          <div className="project-list">
            <div className="project-list-header reveal">
              <p className="eyebrow">Selected Projects - Cohort 1 (2024)</p>
              <a
                className="text-button"
                href="/projects"
              >
                See More
              </a>
            </div>
            {selectedProjects.map((project, index) => (
              <article
                className="project-card project-card-selected reveal"
                style={{ transitionDelay: `${index * 90}ms` }}
                key={project.title}
              >
                <div className="project-card-meta">
                  <span>{project.status}</span>
                  <span>{project.cohort}</span>
                </div>
                <p className="card-kicker">
                  {project.region} / {project.sector}
                </p>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="vision" className="vision-section">
          <SectionIntro
            eyebrow="Our Vision"
            title="The accelerator for Africa-focused student founders"
            centered
          >
            Bridge Impact Fund turns the ambition of globally educated Africans into
            scalable ventures by combining risk-tolerant capital, deep mentorship, and
            execution support in the markets founders know best.
          </SectionIntro>

          <div className="pillar-grid">
            {pillars.map((pillar, index) => (
              <article
                className="pillar-card reveal"
                style={{ transitionDelay: `${index * 90}ms` }}
                key={pillar.title}
              >
                <p className="card-kicker">
                  {pillar.number} / {pillar.label}
                </p>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="model" className="model-section surface-section">
          <div className="model-layout">
            <div>
              <SectionIntro
                eyebrow="The Program"
                title="A three-phase model built for execution"
              >
                Modeled after Y Combinator and MIT Sandbox, the program supports founders
                from early idea to validated, funded startup over a single academic year.
              </SectionIntro>

              <div className="phase-list">
                {phases.map((phase, index) => (
                  <article
                    className="phase-item reveal"
                    style={{ transitionDelay: `${index * 90}ms` }}
                    key={phase.title}
                  >
                    <p className="phase-number">{phase.phase}</p>
                    <div>
                      <h3>{phase.title}</h3>
                      <p>{phase.description}</p>
                      <span>{phase.duration}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="finance-column">
              <SectionIntro eyebrow="Blended Finance" title="A dual-engine funding model">
                BIF combines philanthropic flexibility with disciplined, returnable capital
                so early pilots can be funded and proven ventures can keep scaling.
              </SectionIntro>

              <div className="finance-grid">
                {financeEngines.map((engine, index) => (
                  <article
                    className="finance-card reveal"
                    style={{ transitionDelay: `${index * 90}ms` }}
                    key={engine.title}
                  >
                    <p className="card-kicker">{engine.tag}</p>
                    <h3>{engine.title}</h3>
                    <p>{engine.description}</p>
                  </article>
                ))}
              </div>

              <div className="capital-plan reveal">
                <p className="card-kicker">Capital Plan - 2027 to 2032</p>
                {capitalPlan.map((item) => (
                  <div className="capital-row" key={item.period}>
                    <div>
                      <span>{item.period}</span>
                      <strong>{item.value}</strong>
                    </div>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="roadmap" className="roadmap-section">
          <div className="roadmap-layout">
            <div>
              <SectionIntro
                eyebrow="2027-2032"
                title="A five-year path to continental scale"
              >
                From a proven MIT and Harvard pilot to a 20-university Global Impact
                Alliance, the plan is structured, measurable, and accountable at every step.
              </SectionIntro>

              <div className="roadmap-stat-grid">
                {roadmapStats.map((stat, index) => (
                  <article
                    className="roadmap-stat reveal"
                    style={{ transitionDelay: `${index * 80}ms` }}
                    key={stat.label}
                  >
                    <p className="card-kicker">{stat.label}</p>
                    <strong>{stat.value}</strong>
                    <p>{stat.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="timeline">
              {timeline.map((item, index) => (
                <article
                  className="timeline-item reveal"
                  style={{ transitionDelay: `${index * 90}ms` }}
                  key={item.year}
                >
                  <time>{item.year}</time>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span>{item.target}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section surface-section">
          <div className="contact-inner">
            <p className="eyebrow reveal">Get Involved</p>
            <h2 className="reveal">The bridge between talent and opportunity starts here.</h2>
            <p className="reveal">
              Founders, alumni mentors, universities, and funders can help build the platform
              for the next generation of Africa-focused companies.
            </p>
            <div className="contact-actions reveal">
              <a className="button button-primary" href={founderHref}>
                Apply as a Founder
              </a>
              <a className="button button-secondary" href={partnerHref}>
                Partner with Us
              </a>
              <a className="button button-secondary" href={mentorHref}>
                Become a Mentor
              </a>
            </div>
            <small>Applications open for the 2027 cohort. MIT and Harvard students receive priority review.</small>
          </div>
        </section>
    </main>
  );
}

function App() {
  useReveal();
  const normalizedPath = window.location.pathname.replace(/\/$/, "");
  const isProjectsPage = normalizedPath === "/projects";

  return (
    <>
      <Header />
      {isProjectsPage ? <ProjectsPage /> : <HomePage />}
      <Footer />
    </>
  );
}

export default App;
