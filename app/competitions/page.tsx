"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { PageIntro } from "@/app/components/app-ui";
import { competitions } from "@/app/lib/demo-data";

const fields = ["All", "Robotics", "Coding", "Design", "Business", "Medicine"];

export default function CompetitionsPage() {
  const [field, setField] = useState("All");
  const [location, setLocation] = useState("All locations");
  const [difficulty, setDifficulty] = useState("All levels");

  const filtered = useMemo(
    () => competitions.filter((competition) =>
      (field === "All" || competition.field === field) &&
      (location === "All locations" || competition.location === location) &&
      (difficulty === "All levels" || competition.difficulty === difficulty),
    ),
    [difficulty, field, location],
  );

  return (
    <AppShell>
      <PageIntro
        eyebrow="Competition calendar"
        title="Find a real place to test what you’re learning."
        description="Age-appropriate competitions, filtered by field, place, and challenge level."
        action={<span className="page-status-pill lime"><i /> {filtered.length} matches</span>}
      />

      <section className="competition-filters">
        <div className="filter-chips" aria-label="Filter competitions by field">
          {fields.map((item) => <button className={field === item ? "active" : ""} type="button" key={item} onClick={() => setField(item)}>{item}</button>)}
        </div>
        <div className="secondary-filters">
          <label>Age group<select defaultValue="Classes 6-12"><option>Classes 6-12</option><option>Classes 6-8</option><option>Classes 9-12</option></select></label>
          <label>Location<select value={location} onChange={(event) => setLocation(event.target.value)}><option>All locations</option>{[...new Set(competitions.map((item) => item.location))].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Difficulty<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
        </div>
      </section>

      <section className="competition-grid">
        {filtered.map((competition) => (
          <article className={`competition-card field-${competition.field.toLowerCase()}`} key={competition.id}>
            <div className="competition-date"><strong>{competition.date.split(" ")[0]}</strong><span>{competition.date.split(" ")[1]}</span></div>
            <div className="competition-card-copy">
              <div><span>{competition.field}</span><b>{competition.difficulty}</b></div>
              <h2>{competition.name}</h2>
              <p>{competition.description}</p>
              <footer><span>{competition.eligibility}</span><span>{competition.location}</span><button type="button">Save</button></footer>
            </div>
          </article>
        ))}
      </section>
      {filtered.length === 0 ? <div className="empty-friendly"><strong>No exact matches yet.</strong><p>Try “All locations” or another difficulty to widen the map.</p><button type="button" onClick={() => { setLocation("All locations"); setDifficulty("All levels"); }}>Clear filters</button></div> : null}
    </AppShell>
  );
}
