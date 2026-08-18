"use client";

import { useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { LevelBar, PageIntro } from "@/app/components/app-ui";
import { skills } from "@/app/lib/demo-data";

export default function SkillsPage() {
  const [activeSkillId, setActiveSkillId] = useState(skills[0].id);
  const activeSkill = skills.find((skill) => skill.id === activeSkillId) ?? skills[0];

  return (
    <AppShell>
      <PageIntro
        eyebrow="Skill tracker"
        title="Know what you can do - and what unlocks next."
        description="Your goal becomes manageable when every skill has a visible next level."
        action={<div className="skill-score"><strong>8</strong><span>total<br />levels</span></div>}
      />

      <section className="skills-summary-grid">
        <article className="skill-radar-card">
          <div className="radar-visual" aria-label="Skill balance illustration">
            <i /><i /><i /><i /><i />
            <span className="radar-shape" />
            <b>8</b><small>LEVELS</small>
          </div>
          <p>Your strongest area is <strong>Problem Solving</strong>. Web Development is the quickest next win.</p>
        </article>
        <article className="next-skill-card">
          <p className="eyebrow lime">Fastest level-up</p>
          <span className="feature-icon purple">WEB</span>
          <h2>Web Development</h2>
          <p>Publish one responsive page and explain three layout choices.</p>
          <button className="button button-lime" type="button" onClick={() => setActiveSkillId("web-development")}>See requirement</button>
        </article>
      </section>

      <section className="skill-tracker-grid">
        <div className="skill-list-card">
          <div className="app-card-heading"><div><span>YOUR FIVE CORE SKILLS</span><h2>Software engineering foundation</h2></div></div>
          {skills.map((skill) => (
            <button className={activeSkillId === skill.id ? "active" : ""} type="button" key={skill.id} onClick={() => setActiveSkillId(skill.id)}>
              <span className={`skill-initial ${skill.color}`}>{skill.name.slice(0, 2).toUpperCase()}</span>
              <span><strong>{skill.name}</strong><small>Level {skill.level} of 5</small></span>
              <LevelBar level={skill.level} color={skill.color} />
            </button>
          ))}
        </div>

        <aside className="skill-detail-card">
          <span className={`large-skill-icon ${activeSkill.color}`}>{activeSkill.name.slice(0, 2).toUpperCase()}</span>
          <p className="eyebrow purple">Selected skill</p>
          <h2>{activeSkill.name}</h2>
          <LevelBar level={activeSkill.level} color={activeSkill.color} />
          <div className="level-copy"><span>Current</span><strong>Level {activeSkill.level}</strong><small>of 5</small></div>
          <div className="next-requirement"><span>NEXT LEVEL REQUIRES</span><p>{activeSkill.next}</p></div>
          <button className="button button-dark wide-button" type="button">Add to weekly plan</button>
        </aside>
      </section>
    </AppShell>
  );
}
