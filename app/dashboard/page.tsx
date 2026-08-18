"use client";

import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { useDemo } from "@/app/components/demo-provider";
import { LevelBar, PageIntro } from "@/app/components/app-ui";
import { skills, weeklyTasks } from "@/app/lib/demo-data";

export default function DashboardPage() {
  const {
    completedTaskIds,
    portfolioItems,
    selectedCareer,
    studentName,
    toggleTask,
  } = useDemo();
  const [celebration, setCelebration] = useState("");

  function handleTask(id: string) {
    const completed = toggleTask(id);
    setCelebration(completed ? "Nice! Your weekly momentum just moved forward." : "Task moved back to your plan.");
    window.setTimeout(() => setCelebration(""), 2200);
  }

  return (
    <AppShell>
      <PageIntro
        eyebrow="Your home base"
        title={`Good afternoon, ${studentName}!`}
        description="Your plan is moving. Here’s the one screen to check before deciding what to do next."
        action={<Link className="button button-dark" href="/weekly-plan">Open this week</Link>}
      />
      {celebration ? <div className="celebration-toast" role="status"><span>✓</span>{celebration}</div> : null}

      <section className="dashboard-hero-grid">
        <article className="current-goal-card">
          <div className="card-topline"><span>Current goal</span><Link href="/results">Change</Link></div>
          <div className={`large-goal-icon ${selectedCareer.color}`}>{selectedCareer.icon}</div>
          <div>
            <p>{selectedCareer.cluster} direction</p>
            <h2>{selectedCareer.title}</h2>
            <p>Stage 1 · Build the foundations</p>
          </div>
          <div className="goal-progress-row">
            <div><span>Roadmap progress</span><strong>58%</strong></div>
            <div className="progress-track light"><i style={{ width: "58%" }} /></div>
          </div>
          <Link className="card-link" href="/roadmap">See the full roadmap <span>VIEW</span></Link>
        </article>

        <div className="dashboard-stat-stack">
          <article className="streak-card">
            <span className="streak-big">5</span>
            <div><small>DAY STREAK</small><strong>Your personal best</strong><p>Do one useful thing tomorrow to keep it alive.</p></div>
          </article>
          <article className="milestone-card">
            <span className="milestone-badge">02</span>
            <div><small>NEXT BADGE</small><strong>Project starter</strong><p>Complete one more project task.</p></div>
            <div className="mini-progress"><i style={{ width: "72%" }} /></div>
          </article>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="app-card weekly-preview-card">
          <div className="app-card-heading"><div><span>THIS WEEK</span><h2>Three actions. One clear direction.</h2></div><Link href="/weekly-plan">Full plan</Link></div>
          <div className="dashboard-task-list">
            {weeklyTasks.map((task) => {
              const done = completedTaskIds.includes(task.id);
              return (
                <label className={done ? "done" : ""} key={task.id}>
                  <input type="checkbox" checked={done} onChange={() => handleTask(task.id)} />
                  <span className={`task-type ${task.color}`}>{task.type.slice(0, 1)}</span>
                  <span><strong>{task.title}</strong><small>{task.time}</small></span>
                </label>
              );
            })}
          </div>
          <div className="weekly-completion"><span>{completedTaskIds.length} of 3 complete</span><div><i style={{ width: `${(completedTaskIds.length / 3) * 100}%` }} /></div></div>
        </article>

        <article className="app-card skill-preview-card">
          <div className="app-card-heading"><div><span>SKILL SNAPSHOT</span><h2>What you’re building</h2></div><Link href="/skills">All skills</Link></div>
          <div className="skill-preview-list">
            {skills.slice(0, 4).map((skill) => (
              <div key={skill.id}>
                <span><strong>{skill.name}</strong><small>Level {skill.level}</small></span>
                <LevelBar level={skill.level} color={skill.color} />
              </div>
            ))}
          </div>
        </article>

        <article className="app-card portfolio-preview-card">
          <div className="app-card-heading"><div><span>RECENT PROOF</span><h2>Your portfolio is taking shape</h2></div><Link href="/portfolio">Open portfolio</Link></div>
          <div className="portfolio-preview-list">
            {portfolioItems.slice(0, 2).map((item) => (
              <div key={item.id}>
                <span className={`portfolio-mini-icon ${item.color}`}>{item.icon}</span>
                <span><small>{item.type}</small><strong>{item.title}</strong><p>{item.subtitle}</p></span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
