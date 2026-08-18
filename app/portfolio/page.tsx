"use client";

import { useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { useDemo } from "@/app/components/demo-provider";
import { PageIntro } from "@/app/components/app-ui";

export default function PortfolioPage() {
  const { portfolioItems, addPortfolioItem } = useDemo();
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");

  function addMockItem() {
    addPortfolioItem({
      id: `study-timer-${Date.now()}`,
      type: "Project",
      title: "Python Study Sprint Timer",
      subtitle: "Functions and loops practice",
      date: "18 Aug 2026",
      icon: "TM",
      color: "coral",
    });
    setAdding(false);
    setNotice("Project added - your proof wall just grew!");
    window.setTimeout(() => setNotice(""), 2400);
  }

  return (
    <AppShell>
      <PageIntro
        eyebrow="Portfolio builder"
        title="Proof beats promises. Keep everything you build."
        description="Projects, results, and certificates become a clear story of how your skills grew."
        action={<button className="button button-lime" type="button" onClick={() => setAdding(true)}>Add to portfolio</button>}
      />
      {notice ? <div className="celebration-toast" role="status"><span>✓</span>{notice}</div> : null}

      <section className="portfolio-summary">
        <div><strong>{portfolioItems.length}</strong><span>proof items</span></div>
        <div><strong>2</strong><span>skills demonstrated</span></div>
        <div><strong>1</strong><span>competition result</span></div>
        <div className="portfolio-share"><span>Shareable profile</span><button type="button">Copy demo link</button></div>
      </section>

      {adding ? (
        <section className="add-portfolio-panel" aria-label="Add a demo portfolio item">
          <div><span className="feature-icon coral">NEW</span><div><p className="eyebrow purple">Demo upload</p><h2>Add your Study Sprint Timer</h2><p>This mock action shows how completed work becomes evidence. No file is uploaded.</p></div></div>
          <div className="add-panel-actions"><button className="button button-ghost" type="button" onClick={() => setAdding(false)}>Cancel</button><button className="button button-dark" type="button" onClick={addMockItem}>Add demo project</button></div>
        </section>
      ) : null}

      <section className="portfolio-grid">
        {portfolioItems.map((item, index) => (
          <article className={`portfolio-card ${item.color}`} key={item.id}>
            <div className="portfolio-art">
              <span>{item.icon}</span>
              <i /><i /><i />
              {index === 0 ? <b>FEATURED</b> : null}
            </div>
            <div className="portfolio-card-body">
              <span>{item.type} · {item.date}</span>
              <h2>{item.title}</h2>
              <p>{item.subtitle}</p>
              <div><span>Verified demo proof</span><button type="button" aria-label={`Open ${item.title}`}>VIEW</button></div>
            </div>
          </article>
        ))}
      </section>

      <section className="portfolio-next-proof">
        <span className="feature-icon lime">+1</span>
        <div><p className="eyebrow purple">Next proof opportunity</p><h2>Complete this week’s CodeSprint round.</h2><p>A result - even participation - can show initiative and problem-solving.</p></div>
        <a className="button button-dark" href="/competitions">Explore competitions</a>
      </section>
    </AppShell>
  );
}
