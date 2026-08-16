"use client";

import { type FormEvent, type MouseEvent, useEffect, useState } from "react";
import { AuthControl } from "@/app/components/auth-control";
import { usePlanifyAuth } from "@/app/components/auth-provider";

const loopSteps = [
  {
    number: "01",
    title: "Discover",
    text: "Notice the activities, values, and environments that naturally draw you in.",
    accent: "violet",
  },
  {
    number: "02",
    title: "Explore",
    text: "Compare several career clusters—including directions you may never have considered.",
    accent: "blue",
  },
  {
    number: "03",
    title: "Experiment",
    text: "Try a short project, observation, interview, or challenge before making a big choice.",
    accent: "lime",
  },
  {
    number: "04",
    title: "Reflect",
    text: "Record what energised you, surprised you, or changed your mind.",
    accent: "coral",
  },
  {
    number: "05",
    title: "Plan",
    text: "Turn what you learned into a practical 90-day roadmap—and revise it as you grow.",
    accent: "ink",
  },
];

const roadmapWeeks = [
  { week: "Week 1", title: "Meet yourself", text: "Baseline and discovery activities" },
  { week: "Week 2", title: "Broaden the map", text: "Explore five career clusters" },
  { week: "Week 3", title: "Try possibility one", text: "Complete a practical experiment" },
  { week: "Week 4", title: "Try possibility two", text: "Test a contrasting direction" },
  { week: "Week 5", title: "Check reality", text: "Research, observe, or interview" },
  { week: "Week 6", title: "Choose the next step", text: "Build a personal 90-day plan" },
];

const audienceData = {
  students: {
    label: "Students",
    eyebrow: "For students",
    title: "More agency. Less anxiety.",
    body: "Explore several directions, understand what the work actually feels like, and change your mind for a reason—not because a trend changed.",
    points: [
      "See why every direction appeared",
      "Compare pathways and trade-offs",
      "Turn curiosity into small next steps",
    ],
    stat: "Several possibilities",
    statLabel: "Never one fixed answer",
    accent: "violet",
  },
  parents: {
    label: "Parents",
    eyebrow: "For parents",
    title: "See the child, not just the marks.",
    body: "Understand the evidence and open questions behind your child’s shortlist, with prompts for a calmer and more useful conversation.",
    points: [
      "View shared progress and completed activities",
      "Discuss opportunities and constraints together",
      "Agree on the next low-risk experiment",
    ],
    stat: "Supportive summary",
    statLabel: "Not a control panel for every answer",
    accent: "lime",
  },
  schools: {
    label: "Schools",
    eyebrow: "For schools",
    title: "Guidance that continues after the workshop.",
    body: "Run a structured programme across Classes 8–10 with facilitator tools, cohort progress, counsellor triage, and an aggregate outcome report.",
    points: [
      "Simple cohort and consent management",
      "A clear weekly implementation plan",
      "Evidence to support meaningful follow-up",
    ],
    stat: "Six-week programme",
    statLabel: "Designed to strengthen counsellors",
    accent: "blue",
  },
} as const;

type AudienceKey = keyof typeof audienceData;
type Theme = "light" | "dark";
type SubmissionStatus = "idle" | "submitting" | "success" | "error";

const trustPrinciples = [
  {
    number: "01",
    title: "No fixed labels",
    text: "Interests and circumstances change. Planify expects the plan to change too.",
  },
  {
    number: "02",
    title: "No hidden answers",
    text: "Students can inspect, question, hide, or disagree with every suggestion.",
  },
  {
    number: "03",
    title: "No paid influence",
    text: "A provider can never pay to improve its place in an organic recommendation.",
  },
  {
    number: "04",
    title: "No profile advertising",
    text: "Student assessment data is not an advertising asset and is never sold to course companies.",
  },
];

const faqs = [
  {
    question: "Does Planify choose a career for a student?",
    answer:
      "No. Planify presents several plausible directions and helps the student test them. The student remains the decision-maker, supported by family, school, and qualified professionals where needed.",
  },
  {
    question: "Is Planify an aptitude test?",
    answer:
      "Planify is a guided exploration experience. It uses activity-based prompts, expert-curated career information, and practical experiments. It does not diagnose intelligence or predict future success.",
  },
  {
    question: "Who is Planify designed for?",
    answer:
      "The first programme is designed for students in Classes 8–10, when there is still time to explore before important stream and subject decisions.",
  },
  {
    question: "Can a student’s suggestions change?",
    answer:
      "Yes—and they should when new evidence appears. Planify keeps the roadmap flexible and shows what changed over time.",
  },
  {
    question: "What can parents see?",
    answer:
      "Parents see shared themes, shortlisted possibilities, completed evidence, trade-offs, and agreed next steps. They do not automatically receive every raw answer or private reflection.",
  },
  {
    question: "Does Planify replace a school counsellor?",
    answer:
      "No. It gives counsellors and teachers a structured workflow for larger cohorts and helps identify students who may benefit from personal attention.",
  },
  {
    question: "Can course companies influence recommendations?",
    answer:
      "No. Organic guidance remains separate from commercial opportunities. Providers cannot pay to change a student’s fit or ranking, and student profiles are not used for targeted advertising.",
  },
];

function Brand() {
  return (
    <span className="brand-lockup">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span>Planify</span>
    </span>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`section-intro section-intro-${align}`} data-reveal>
      <p className="section-eyebrow">
        <span aria-hidden="true" />
        {eyebrow}
      </p>
      <h2>{title}</h2>
      {body ? <p className="section-body">{body}</p> : null}
    </div>
  );
}

export default function Home() {
  const { getToken, isSignedIn } = usePlanifyAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeAudience, setActiveAudience] = useState<AudienceKey>("students");
  const [formAudience, setFormAudience] = useState<"family" | "school">("family");
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>("idle");
  const [submissionError, setSubmissionError] = useState("");
  const [email, setEmail] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      let savedTheme: string | null = null;
      try {
        savedTheme = window.localStorage.getItem("planify-theme");
      } catch {
        // The theme still works for this visit when storage is unavailable.
      }
      const initialTheme: Theme = savedTheme === "dark" ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.dataset.theme = initialTheme;
      document.documentElement.style.colorScheme = initialTheme;
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const revealAll = () => {
      nodes.forEach((node) => node.classList.add("is-visible"));
    };

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      revealAll();
      root.classList.remove("motion-ready");
      return () => root.classList.remove("motion-ready");
    }

    nodes.forEach((node) => {
      const bounds = node.getBoundingClientRect();
      if (bounds.top < window.innerHeight * 0.94 && bounds.bottom > 0) {
        node.classList.add("is-visible");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const node = entry.target as HTMLElement;
          node.classList.add("is-visible");
          observer.unobserve(node);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" },
    );

    nodes.forEach((node) => {
      if (!node.classList.contains("is-visible")) observer.observe(node);
    });
    root.classList.add("motion-ready");

    const revealForReducedMotion = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      observer.disconnect();
      revealAll();
      root.classList.remove("motion-ready");
    };
    reducedMotion.addEventListener("change", revealForReducedMotion);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", revealForReducedMotion);
      root.classList.remove("motion-ready");
    };
  }, []);

  const currentAudience = audienceData[activeAudience];

  const moveToEarlyAccess = (audience: "family" | "school") => {
    setFormAudience(audience);
    setSubmissionStatus("idle");
    setSubmissionError("");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    document.getElementById("early-access")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  const handleEarlyAccessLink = (
    event: MouseEvent<HTMLAnchorElement>,
    audience: "family" | "school",
  ) => {
    event.preventDefault();
    moveToEarlyAccess(audience);
  };

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const formIsReady =
    emailIsValid && (formAudience === "family" || schoolName.trim().length > 1);

  const submitEarlyAccess = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formIsReady || submissionStatus === "submitting") return;

    setSubmissionStatus("submitting");
    setSubmissionError("");

    try {
      const accessToken = isSignedIn ? await getToken() : null;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch("/api/early-access", {
        method: "POST",
        headers,
        body: JSON.stringify({
          audience: formAudience,
          email,
          schoolName: formAudience === "school" ? schoolName : undefined,
          website: "",
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "We could not save your request. Please try again.");
      }

      setSubmissionStatus("success");
    } catch (error) {
      setSubmissionStatus("error");
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "We could not save your request. Please try again.",
      );
    }
  };

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme: Theme = currentTheme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.style.colorScheme = nextTheme;
      try {
        window.localStorage.setItem("planify-theme", nextTheme);
      } catch {
        // Keep the in-memory theme even if storage is blocked.
      }
      return nextTheme;
    });
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>

      <header className={`site-header ${scrolled ? "site-header-scrolled" : ""}`}>
        <div className="header-inner">
          <a className="brand" href="#top" aria-label="Planify home" onClick={() => setMenuOpen(false)}>
            <Brand />
          </a>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#method">Our method</a>
            <a href="#for-everyone">Students &amp; parents</a>
            <a href="#for-schools">Schools</a>
            <a href="#principles">Principles</a>
          </nav>

          <div className="header-actions">
            <AuthControl />
            <button
              className="theme-toggle"
              type="button"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
              aria-pressed={theme === "dark"}
              onClick={toggleTheme}
            >
              <span className="theme-toggle-track" aria-hidden="true">
                <span className="theme-toggle-thumb" />
              </span>
              <span className="theme-toggle-label">{theme === "light" ? "Light" : "Dark"}</span>
            </button>
            <a className="nav-cta" href="#early-access" onClick={(event) => handleEarlyAccessLink(event, "family")}>
              Join early access
              <span className="direction-icon direction-up-right" aria-hidden="true" />
            </a>
            <button
              className="menu-toggle"
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>

        <nav
          className={`mobile-nav ${menuOpen ? "mobile-nav-open" : ""}`}
          id="mobile-navigation"
          aria-label="Mobile navigation"
        >
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#method" onClick={() => setMenuOpen(false)}>Our method</a>
          <a href="#for-everyone" onClick={() => setMenuOpen(false)}>Students &amp; parents</a>
          <a href="#for-schools" onClick={() => setMenuOpen(false)}>Schools</a>
          <a href="#principles" onClick={() => setMenuOpen(false)}>Principles</a>
        </nav>
      </header>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              <span aria-hidden="true" />
              Career exploration for Classes 8–10
            </p>
            <h1>
              Your future isn’t a test result.
              <span> It’s something you can explore.</span>
            </h1>
            <p className="hero-description">
              Discover promising directions, try real career activities, and
              build a living roadmap—before committing years to the wrong path.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#how-it-works">
                See how it works
                <span className="button-icon direction-icon direction-down" aria-hidden="true" />
              </a>
              <a className="button button-secondary" href="#early-access" onClick={(event) => handleEarlyAccessLink(event, "school")}>
                Bring Planify to school
              </a>
            </div>
            <p className="hero-note">
              Exploration, not prescription. No “perfect career” verdicts.
            </p>
          </div>

          <div className="hero-product">
            <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
            <div className="ambient-orb ambient-orb-two" aria-hidden="true" />
            <div className="possibility-thread" aria-hidden="true">
              <span className="thread-node thread-node-one" />
              <span className="thread-node thread-node-two" />
              <span className="thread-node thread-node-three" />
            </div>

            <article className="product-window" aria-label="Preview of a Planify student roadmap" data-motion-card data-sky-card>
              <div className="window-bar">
                <div className="window-brand">
                  <span className="mini-mark" aria-hidden="true" />
                  <span>My direction</span>
                </div>
                <span className="student-avatar" aria-hidden="true">A</span>
              </div>

              <div className="window-content">
                <div className="progress-heading">
                  <div>
                    <p className="overline">Your exploration</p>
                    <h2>A clearer picture is taking shape.</h2>
                  </div>
                  <div
                    className="progress-ring"
                    role="progressbar"
                    aria-label="Exploration progress"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={64}
                  >
                    <span>64%</span>
                  </div>
                </div>

                <div className="signal-grid">
                  <div className="signal-card signal-card-featured" data-motion-card>
                    <div className="signal-icon signal-icon-violet" aria-hidden="true">01</div>
                    <p>Strong signal</p>
                    <h3>Design &amp; Systems</h3>
                    <span>Creative problem-solving</span>
                  </div>
                  <div className="signal-card" data-motion-card>
                    <div className="signal-icon signal-icon-blue" aria-hidden="true">02</div>
                    <p>Worth exploring</p>
                    <h3>Science &amp; Discovery</h3>
                    <span>Evidence and curiosity</span>
                  </div>
                </div>

                <a className="next-step-card" href="#roadmap" data-motion-card>
                  <span className="step-number">03</span>
                  <span>
                    <span className="overline">Your next experiment</span>
                    <strong>Redesign one frustrating everyday experience.</strong>
                    <small>30 minutes · No special tools needed</small>
                  </span>
                  <span className="next-step-arrow direction-icon" aria-hidden="true" />
                </a>
              </div>
            </article>

            <div className="floating-proof floating-proof-top" aria-hidden="true">
              <span>2</span>
              career experiments completed
            </div>
            <div className="floating-proof floating-proof-bottom" aria-hidden="true">
              <span className="proof-dot" />
              Plan updated from real evidence
            </div>
          </div>

          <div className="hero-scroll-cue" aria-hidden="true">
            <span />
            Scroll to explore
          </div>
        </section>

        <section className="problem-section section-pad">
          <div className="section-wrap">
            <p className="problem-eyebrow" data-reveal>Before the big choices</p>
            <h2 className="problem-title" data-reveal>
              Good marks show what happened.
              <span> Not what comes next.</span>
            </h2>
            <p className="problem-body" data-reveal>
              Students are asked to choose a stream or career before they have
              had the chance to understand the work—or themselves. Planify
              creates that chance.
            </p>

            <div className="truth-grid" data-reveal data-group-reveal>
              <article className="truth-card" data-motion-card>
                <span className="truth-signal"><i aria-hidden="true" />Outside pressure</span>
                <div className="truth-copy">
                  <h3>The obvious path isn’t always the right one.</h3>
                  <p>Parents, peers, and popular streams can make a choice feel settled before it has actually been explored.</p>
                </div>
                <div className="truth-response">
                  <span>Planify adds</span>
                  <strong>Wider possibilities</strong>
                </div>
              </article>
              <article className="truth-card" data-motion-card>
                <span className="truth-signal"><i aria-hidden="true" />Real exposure</span>
                <div className="truth-copy">
                  <h3>A title can’t show you the work.</h3>
                  <p>Small, hands-on experiments reveal what a field really asks—and whether a student wants more of it.</p>
                </div>
                <div className="truth-response">
                  <span>Planify adds</span>
                  <strong>Experience before commitment</strong>
                </div>
              </article>
              <article className="truth-card" data-motion-card>
                <span className="truth-signal"><i aria-hidden="true" />Room to change</span>
                <div className="truth-copy">
                  <h3>A student is bigger than a score.</h3>
                  <p>Interests deepen. Context shifts. A useful plan is designed to move with the student.</p>
                </div>
                <div className="truth-response">
                  <span>Planify adds</span>
                  <strong>A living roadmap</strong>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="loop-section section-pad" id="how-it-works">
          <div className="section-wrap">
            <SectionIntro
              eyebrow="The Planify loop"
              title="Clarity is built, not delivered."
              body="One quiz cannot decide a life. Planify creates a repeatable way to learn about yourself and the world of work."
              align="center"
            />

            <div className="loop-path" aria-hidden="true">
              <span />
            </div>
            <div className="loop-grid" data-reveal data-group-reveal>
              {loopSteps.map((step) => (
                <article className={`loop-card loop-card-${step.accent}`} key={step.number} data-motion-card>
                  <div className="loop-number">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  <span className="loop-node" aria-hidden="true" />
                </article>
              ))}
            </div>
            <p className="loop-mantra" data-reveal>
              Discover <span className="loop-divider" aria-hidden="true" /> Explore <span className="loop-divider" aria-hidden="true" /> Experiment <span className="loop-divider" aria-hidden="true" /> Reflect <span className="loop-divider" aria-hidden="true" /> Plan <span className="loop-divider" aria-hidden="true" /> Repeat
            </p>
          </div>
        </section>

        <section className="method-section section-pad" id="method">
          <div className="section-wrap method-layout">
            <div className="method-copy">
              <SectionIntro
                eyebrow="Nothing hidden"
                title="Every suggestion shows its working."
                body="Planify does not hand you a mysterious score. Each direction includes the reasons it appeared, what may not fit, and a simple way to test it."
              />
              <ul className="method-checks" data-reveal>
                <li><span aria-hidden="true">✓</span> Several plausible directions</li>
                <li><span aria-hidden="true">✓</span> Reasons and uncertainties in plain language</li>
                <li><span aria-hidden="true">✓</span> A real activity that can challenge the result</li>
              </ul>
              <a className="text-link" href="#roadmap" data-reveal>
                See the six-week journey
                <span className="direction-icon direction-down-right" aria-hidden="true" />
              </a>
            </div>

            <div className="recommendation-stage">
              <div className="constellation" aria-hidden="true">
                <span className="constellation-center">You</span>
                <span className="orbit orbit-one" />
                <span className="orbit orbit-two" />
                <span className="career-node career-node-one">Design</span>
                <span className="career-node career-node-two">Research</span>
                <span className="career-node career-node-three">Systems</span>
              </div>
              <article className="recommendation-card" data-reveal data-motion-card data-sky-card>
                <div className="recommendation-topline">
                  <span className="recommendation-chip">Promising direction</span>
                  <span className="save-demo" aria-hidden="true">+</span>
                </div>
                <h3>Design &amp; Human Experience</h3>
                <p className="recommendation-subtitle">A direction worth testing—not a verdict.</p>

                <div className="reason-grid">
                  <div className="reason-panel">
                    <span className="reason-label"><i className="reason-dot reason-dot-green" /> Why it appeared</span>
                    <p>You enjoy understanding people, noticing friction, and improving how everyday things work.</p>
                  </div>
                  <div className="reason-panel">
                    <span className="reason-label"><i className="reason-dot reason-dot-coral" /> What may not fit</span>
                    <p>This work often involves ambiguity, repeated feedback, and changing an idea several times.</p>
                  </div>
                </div>

                <div className="try-panel">
                  <span className="try-icon" aria-hidden="true">30</span>
                  <div>
                    <span>Try this next · 30 min</span>
                    <strong>Redesign one confusing process at school.</strong>
                  </div>
                  <a href="#roadmap" aria-label="View this experiment">
                    <span className="direction-icon" aria-hidden="true" />
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="roadmap-section section-pad" id="roadmap">
          <div className="section-wrap">
            <SectionIntro
              eyebrow="A practical journey"
              title="From “I don’t know” to “Here’s what I’ll try next.”"
              body="The goal is not complete certainty. It is a clearer, evidence-backed next step."
              align="center"
            />

            <div className="roadmap-track" data-reveal data-group-reveal>
              <div className="roadmap-line" aria-hidden="true"><span /></div>
              {roadmapWeeks.map((item, index) => (
                <article className={`roadmap-card ${index === 2 ? "roadmap-card-active" : ""}`} key={item.week} data-motion-card>
                  <span className="roadmap-dot" aria-hidden="true" />
                  <p>{item.week}</p>
                  <h3>{item.title}</h3>
                  <span>{item.text}</span>
                </article>
              ))}
            </div>

            <div className="roadmap-outcome" data-reveal data-motion-card data-sky-card>
              <div className="outcome-icon" aria-hidden="true">90</div>
              <div>
                <p>What the student leaves with</p>
                <h3>A living 90-day roadmap grounded in things they actually tried.</h3>
              </div>
              <span className="outcome-label">Evidence, not pressure</span>
            </div>
          </div>
        </section>

        <section className="audience-section section-pad" id="for-everyone">
          <div className="section-wrap">
            <SectionIntro
              eyebrow="One journey, three useful views"
              title="Built around the student. Useful to everyone supporting them."
              align="center"
            />

            <div className="audience-tabs" role="group" aria-label="Choose an audience" data-reveal>
              {(Object.keys(audienceData) as AudienceKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={activeAudience === key}
                  onClick={() => setActiveAudience(key)}
                >
                  {audienceData[key].label}
                </button>
              ))}
            </div>

            <div
              className={`audience-panel audience-panel-${currentAudience.accent}`}
              aria-live="polite"
              data-motion-card
            >
              <div className="audience-copy" key={`${activeAudience}-copy`}>
                <p className="section-eyebrow"><span aria-hidden="true" />{currentAudience.eyebrow}</p>
                <h3>{currentAudience.title}</h3>
                <p>{currentAudience.body}</p>
                <ul>
                  {currentAudience.points.map((point) => (
                    <li key={point}><span aria-hidden="true">✓</span>{point}</li>
                  ))}
                </ul>
              </div>
              <div className="audience-visual" key={`${activeAudience}-visual`}>
                <div className="audience-visual-top">
                  <span>{currentAudience.stat}</span>
                  <small>{currentAudience.statLabel}</small>
                </div>
                <div className="mini-path">
                  <span className="mini-path-line" aria-hidden="true" />
                  <div><i>01</i><b>Notice</b><small>What draws you in</small></div>
                  <div><i>02</i><b>Try</b><small>A real activity</small></div>
                  <div><i>03</i><b>Revise</b><small>Update the plan</small></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="principles-section section-pad" id="principles">
          <div className="principles-glow" aria-hidden="true" />
          <div className="section-wrap">
            <div className="principles-heading" data-reveal>
              <p className="section-eyebrow section-eyebrow-light"><span aria-hidden="true" />Built around the student</p>
              <h2>Made for young people.<br /><span>Built with restraint.</span></h2>
              <p>
                Trust is not a footer policy. It changes what the product is
                allowed to recommend, reveal, and earn money from.
              </p>
            </div>

            <div className="principles-grid">
              {trustPrinciples.map((principle) => (
                <article key={principle.number} data-reveal data-motion-card>
                  <span>{principle.number}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </article>
              ))}
            </div>

            <div className="trust-line" data-reveal>
              <span className="trust-status"><i /> Student-first by design</span>
              <p>Transparent suggestions · Reversible choices · Human judgment remains</p>
            </div>
          </div>
        </section>

        <section className="schools-section section-pad" id="for-schools">
          <div className="section-wrap schools-layout">
            <div className="schools-copy">
              <SectionIntro
                eyebrow="For school leaders"
                title="Make future-readiness something students actually practise."
                body="Planify gives Classes 8–10 a guided sequence of discovery, real experiments, reflection, and planning—while giving staff a manageable way to support the whole cohort."
              />
              <a className="button button-primary" href="#early-access" onClick={(event) => handleEarlyAccessLink(event, "school")} data-reveal>
                Plan a school pilot
                <span className="button-icon direction-icon direction-up-right" aria-hidden="true" />
              </a>
              <p className="schools-micro" data-reveal>Six to eight weeks · Designed for 150–300 students</p>
            </div>

            <div className="pilot-card" data-reveal data-motion-card data-sky-card>
              <div className="pilot-card-header">
                <span>Planify school pilot</span>
                <span className="pilot-badge">6 weeks</span>
              </div>
              <h3>A complete programme, not another one-off workshop.</h3>
              <ul>
                <li><span>01</span> Guardian orientation and consent support</li>
                <li><span>02</span> Student discovery and career exploration</li>
                <li><span>03</span> Two practical career experiments</li>
                <li><span>04</span> Facilitator and counsellor tools</li>
                <li><span>05</span> Parent–student review guide</li>
                <li><span>06</span> Aggregate programme outcome report</li>
              </ul>
              <div className="pilot-card-footer">
                <span>Designed to strengthen counsellors</span>
                <a href="#early-access" onClick={(event) => handleEarlyAccessLink(event, "school")} aria-label="Request a school pilot">
                  <span className="direction-icon" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section section-pad" id="faq">
          <div className="section-wrap faq-layout">
            <div className="faq-heading">
              <SectionIntro
                eyebrow="Questions, answered plainly"
                title="A thoughtful plan begins with honest limits."
              />
              <p data-reveal>
                Still deciding whether Planify fits your family or school?
                Start with the principle: explore first, prescribe never.
              </p>
            </div>

            <div className="faq-list" data-reveal>
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>
                    <span>{faq.question}</span>
                    <i aria-hidden="true">+</i>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section" id="early-access">
          <div className="cta-orb cta-orb-one" aria-hidden="true" />
          <div className="cta-orb cta-orb-two" aria-hidden="true" />
          <div className="cta-inner">
            <p className="section-eyebrow section-eyebrow-light" data-reveal><span aria-hidden="true" />Early access</p>
            <h2 data-reveal>A good future plan starts with one honest experiment.</h2>
            <p className="cta-body" data-reveal>
              Join Planify early access, or bring the six-week exploration
              programme to your school.
            </p>

            {submissionStatus === "success" ? (
              <div className="form-success" role="status">
                <span aria-hidden="true">✓</span>
                <div>
                  <strong>{formAudience === "school" ? "Your pilot request is in." : "You’re on the early-access list."}</strong>
                  <p>We saved your request securely and will use this email only to follow up about Planify.</p>
                </div>
                <button type="button" onClick={() => {
                  setSubmissionStatus("idle");
                  setSubmissionError("");
                  setEmail("");
                  setSchoolName("");
                }}>Add another</button>
              </div>
            ) : (
              <form
                className="interest-form"
                onSubmit={submitEarlyAccess}
                aria-busy={submissionStatus === "submitting"}
                data-reveal
                data-motion-card
                data-sky-card
              >
                <fieldset>
                  <legend>I’m interested as a</legend>
                  <div className="form-segments">
                    <button
                      type="button"
                      className={formAudience === "family" ? "is-active" : ""}
                      aria-pressed={formAudience === "family"}
                      onClick={() => {
                        setFormAudience("family");
                        setSubmissionError("");
                      }}
                    >
                      Parent or guardian
                    </button>
                    <button
                      type="button"
                      className={formAudience === "school" ? "is-active" : ""}
                      aria-pressed={formAudience === "school"}
                      onClick={() => {
                        setFormAudience("school");
                        setSubmissionError("");
                      }}
                    >
                      School
                    </button>
                  </div>
                </fieldset>
                <div className="form-fields">
                  <label>
                    <span>Email address</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setSubmissionError("");
                      }}
                      required
                    />
                  </label>
                  {formAudience === "school" ? (
                    <label className="school-field">
                      <span>School name</span>
                      <input
                        type="text"
                        name="school"
                        placeholder="Your school"
                        autoComplete="organization"
                        value={schoolName}
                        onChange={(event) => {
                          setSchoolName(event.target.value);
                          setSubmissionError("");
                        }}
                        required
                      />
                    </label>
                  ) : null}
                  <button className="form-submit" type="submit" disabled={!formIsReady || submissionStatus === "submitting"}>
                    {submissionStatus === "submitting"
                      ? "Saving securely…"
                      : formAudience === "school"
                        ? "Request a school pilot"
                        : "Join early access"}
                    <span className="direction-icon" aria-hidden="true" />
                  </button>
                </div>
                {submissionError ? (
                  <p className="form-error" role="alert">{submissionError}</p>
                ) : null}
                <p className="form-note">Your details are sent securely to Planify and are never used for profile advertising.</p>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
            <a href="#top" aria-label="Planify home"><Brand /></a>
            <p>Better decisions start with better exploration.</p>
          </div>

          <div className="footer-links">
            <div>
              <h2>Product</h2>
              <a href="#how-it-works">How it works</a>
              <a href="#method">Our method</a>
              <a href="#roadmap">Six-week journey</a>
              <a href="#for-everyone">Students &amp; parents</a>
            </div>
            <div>
              <h2>Schools</h2>
              <a href="#for-schools">School programme</a>
              <a href="#early-access" onClick={(event) => handleEarlyAccessLink(event, "school")}>Request a pilot</a>
              <a href="#faq">Common questions</a>
            </div>
            <div>
              <h2>Trust</h2>
              <a href="#principles">Our principles</a>
              <a href="#method">Transparent guidance</a>
              <a href="#principles">Student privacy</a>
              <a href="#principles">Safeguarding</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Planify. All rights reserved.</p>
          <p>
            Planify provides educational and career-exploration guidance. It is
            not a clinical diagnosis or a guarantee of admission, employment,
            income, or career success.
          </p>
        </div>
      </footer>
    </div>
  );
}
