"use client";

import { useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { PageIntro } from "@/app/components/app-ui";
import { resourceCollections } from "@/app/lib/demo-data";

type ResourcePath = keyof typeof resourceCollections;
const paths = Object.keys(resourceCollections) as ResourcePath[];

export default function ResourcesPage() {
  const [activePath, setActivePath] = useState<ResourcePath>("Software Engineering");
  return (
    <AppShell>
      <PageIntro
        eyebrow="Resource library"
        title="Learn from strong sources, in the right order."
        description="A curated starting shelf organised by career direction - not an endless search feed."
        action={<span className="curated-badge">Human-curated demo list</span>}
      />

      <section className="resource-path-tabs" aria-label="Choose a resource career path">
        {paths.map((path) => <button className={activePath === path ? "active" : ""} type="button" key={path} onClick={() => setActivePath(path)}>{path}</button>)}
      </section>

      <section className="resource-featured">
        <div className="resource-featured-art"><span>{activePath === "Software Engineering" ? "</>" : activePath === "Product Design" ? "UX" : "+"}</span><i /><i /></div>
        <div><p className="eyebrow lime">Start here this month</p><h2>{resourceCollections[activePath][0].name}</h2><p>{resourceCollections[activePath][0].note}</p><div><span>{resourceCollections[activePath][0].provider}</span><span>{resourceCollections[activePath][0].price}</span><span>{resourceCollections[activePath][0].level}</span></div></div>
        <button className="button button-lime" type="button">Add to plan</button>
      </section>

      <section className="resource-list">
        {resourceCollections[activePath].map((resource, index) => (
          <article key={resource.name}>
            <span className="resource-index">0{index + 1}</span>
            <div><span>{resource.provider}</span><h2>{resource.name}</h2><p>{resource.note}</p></div>
            <div className="resource-meta"><span>{resource.level}</span><b>{resource.price}</b></div>
            <button type="button" aria-label={`Save ${resource.name}`}>Save</button>
          </article>
        ))}
      </section>

      <aside className="resource-trust-note"><span>!</span><p><strong>Recommendations and revenue stay separate.</strong> A paid relationship can never change the career or skill path Plancify suggests.</p></aside>
    </AppShell>
  );
}
