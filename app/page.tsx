import Link from "next/link";
import { featureCards } from "@/app/lib/demo-data";

const problems = [
  {
    number: "01",
    title: "Career thinking starts too late.",
    text: "Most students wait until Class 11 or 12, when every choice already feels urgent.",
  },
  {
    number: "02",
    title: "Pressure fills the empty space.",
    text: "When you don’t know what fits, trends and other people end up choosing for you.",
  },
  {
    number: "03",
    title: "A report is not a plan.",
    text: "A shortlist helps for a day. Students still need to know what to try on Tuesday afternoon.",
  },
  {
    number: "04",
    title: "Proof gets built too late.",
    text: "The years when curiosity could become real skill and a portfolio are often missed.",
  },
];

const steps = [
  { number: "01", title: "Discover", text: "Notice what genuinely pulls you in." },
  { number: "02", title: "Set a goal", text: "Choose a direction worth testing." },
  { number: "03", title: "Get a plan", text: "See what matters at your class and stage." },
  { number: "04", title: "Build skills", text: "Take three useful actions every week." },
  { number: "05", title: "Build proof", text: "Collect projects, results, and growth." },
];

export default function HomePage() {
  return (
    <div className="marketing-page">
      <header className="marketing-header">
        <Link className="brand" href="/" aria-label="Plancify home">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span>Plancify</span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <Link href="/for-schools">For schools</Link>
        </nav>
        <div className="marketing-actions">
          <Link className="text-link" href="/login">Login</Link>
          <Link className="button button-lime button-small" href="/onboarding">Get started</Link>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-orb hero-orb-purple" aria-hidden="true" />
          <div className="hero-orb hero-orb-lime" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow lime">Career planning for Classes 6-12</p>
            <h1>
              Figure out what you actually want to be.
              <span> Starting now, not in Class 12.</span>
            </h1>
            <p className="hero-intro">
              Discover what fits, choose a goal, and turn it into skills, weekly action,
              and real proof - all in one place.
            </p>
            <div className="hero-actions">
              <Link className="button button-lime" href="/onboarding">Start exploring <span aria-hidden="true">GO</span></Link>
              <Link className="button button-ghost-dark" href="/dashboard">See a demo profile</Link>
            </div>
            <div className="hero-trust-row">
              <span><b>6-12</b> classes supported</span>
              <span><b>3</b> actions each week</span>
              <span><b>0</b> career verdicts</span>
            </div>
          </div>

          <div className="hero-product" aria-label="Preview of the Plancify student dashboard">
            <div className="hero-product-top">
              <span className="mini-dots" aria-hidden="true"><i /><i /><i /></span>
              <span>My Plancify</span>
              <span className="online-pill">LIVE DEMO</span>
            </div>
            <div className="hero-greeting">
              <span className="hero-avatar">A</span>
              <span><small>Good afternoon, Aarav</small><strong>Your future plan is moving.</strong></span>
            </div>
            <article className="hero-goal-card">
              <span className="product-label">Current goal</span>
              <strong>Software Engineer</strong>
              <span className="goal-status">Stage 1 · In progress</span>
              <div className="progress-track"><i style={{ width: "58%" }} /></div>
            </article>
            <div className="hero-product-grid">
              <article>
                <span className="product-number purple">03</span>
                <small>Weekly actions</small>
                <strong>1 completed</strong>
              </article>
              <article>
                <span className="product-number lime">05</span>
                <small>Day streak</small>
                <strong>Personal best</strong>
              </article>
            </div>
            <article className="hero-next-card">
              <span className="product-label">Try this next · 20 min</span>
              <strong>Build one useful Python function.</strong>
              <span className="tiny-button">START</span>
            </article>
            <span className="floating-badge badge-one">Level up!</span>
            <span className="floating-badge badge-two">+1 portfolio proof</span>
          </div>
        </section>

        <section className="problem-section section-pad">
          <div className="section-heading centered">
            <p className="eyebrow purple">The gap nobody plans for</p>
            <h2>Marks tell you how school is going. <span>Not where you should go.</span></h2>
            <p>You deserve time to explore before a stream, entrance exam, or trend decides everything.</p>
          </div>
          <div className="problem-grid">
            {problems.map((problem) => (
              <article key={problem.number}>
                <span>{problem.number}</span>
                <h3>{problem.title}</h3>
                <p>{problem.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="steps-section section-pad" id="how-it-works">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow lime">How Plancify works</p>
              <h2>One connected journey. <span>Not another one-time test.</span></h2>
            </div>
            <p>Explore first. Commit when the evidence feels real. Then build momentum through small, consistent action.</p>
          </div>
          <div className="steps-flow">
            {steps.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
          <div className="steps-demo-strip">
            <span className="pulse-dot" aria-hidden="true" />
            <strong>Built for a 90-second live demo.</strong>
            <span>Every core screen uses instant, reliable demo data.</span>
            <Link href="/login">Open the fast path</Link>
          </div>
        </section>

        <section className="features-section section-pad" id="features">
          <div className="section-heading centered">
            <p className="eyebrow purple">Everything after the shortlist</p>
            <h2>A career goal only matters when <span>you can act on it.</span></h2>
          </div>
          <div className="feature-grid">
            {featureCards.map((feature) => (
              <article className={`feature-card ${feature.color}`} key={feature.title}>
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="philosophy-section">
          <div className="quote-mark" aria-hidden="true">“</div>
          <p className="eyebrow lime">The philosophy</p>
          <blockquote>
            Exploration before commitment - and commitment followed by consistent action.
          </blockquote>
          <p>Better decisions start with better exploration.</p>
        </section>

        <section className="final-cta">
          <span className="final-cta-number">01</span>
          <div>
            <p className="eyebrow purple">Your first useful step</p>
            <h2>Ready to figure out what’s actually yours?</h2>
          </div>
          <div className="final-cta-actions">
            <Link className="button button-dark" href="/onboarding">Start exploring</Link>
            <Link className="text-link" href="/login">Continue as demo student</Link>
          </div>
        </section>
      </main>

      <footer className="marketing-footer">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">P</span><span>Plancify</span>
        </Link>
        <p>Better decisions start with better exploration.</p>
        <div>
          <Link href="/for-schools">For schools</Link>
          <Link href="/login">Login</Link>
          <Link href="/dashboard">Demo profile</Link>
        </div>
        <small>Interactive competition prototype · No student data is collected in the demo.</small>
      </footer>
    </div>
  );
}
