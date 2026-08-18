"use client";

import Link from "next/link";
import { AppShell } from "@/app/components/app-shell";
import { PageIntro } from "@/app/components/app-ui";
import { useDemo } from "@/app/components/demo-provider";
import { roadmapStages } from "@/app/lib/demo-data";

export default function RoadmapPage() {
  const { selectedCareer } = useDemo();
  return (
    <AppShell>
      <PageIntro
        eyebrow="Your personalised roadmap"
        title={`From Class 8 to ${selectedCareer.title}`}
        description="A stage-by-stage plan that changes as your skills, evidence, and interests change."
        action={<span className="page-status-pill"><i /> Stage 1 in progress</span>}
      />

      <section className="roadmap-overview-strip">
        <div><small>TIME HORIZON</small><strong>4 school years</strong></div>
        <div><small>CURRENT STAGE</small><strong>Build the foundations</strong></div>
        <div><small>NEXT MILESTONE</small><strong>First complete project</strong></div>
        <div><small>PLAN HEALTH</small><strong className="lime-text">On track</strong></div>
      </section>

      <section className="app-roadmap">
        {roadmapStages.map((stage, index) => (
          <article className={index === 0 ? "active" : ""} key={stage.number}>
            <div className="roadmap-spine"><span>{stage.number}</span><i /></div>
            <div className="roadmap-stage-card">
              <div className="roadmap-stage-head">
                <div><span>{stage.label}</span><h2>{stage.title}</h2></div>
                <b>{stage.status}</b>
              </div>
              <p>{stage.description}</p>
              {stage.progress ? <div className="stage-progress"><span><small>Stage completion</small><strong>{stage.progress}%</strong></span><div><i style={{ width: `${stage.progress}%` }} /></div></div> : null}
              <div className="stage-task-grid">
                {stage.tasks.map((task) => (
                  <div className={task.done ? "done" : ""} key={task.label}>
                    <span aria-hidden="true">{task.done ? "✓" : ""}</span>
                    <strong>{task.label}</strong>
                  </div>
                ))}
              </div>
              {index === 0 ? <Link className="button button-dark" href="/weekly-plan">Work on Stage 1</Link> : null}
            </div>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
