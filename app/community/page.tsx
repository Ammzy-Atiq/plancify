"use client";

import { useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { PageIntro } from "@/app/components/app-ui";
import { communities } from "@/app/lib/demo-data";

export default function CommunityPage() {
  const [activeId, setActiveId] = useState(communities[0].id);
  const active = communities.find((group) => group.id === activeId) ?? communities[0];
  return (
    <AppShell>
      <PageIntro
        eyebrow="Goal-based community"
        title="You’re not the only one figuring this out."
        description="Join focused spaces where students share attempts, questions, and useful opportunities."
        action={<span className="page-status-pill"><i /> Safe demo community</span>}
      />

      <section className="community-layout">
        <div className="community-groups">
          {communities.map((group) => (
            <button className={activeId === group.id ? `active ${group.color}` : group.color} type="button" key={group.id} onClick={() => setActiveId(group.id)}>
              <span className="community-group-icon">{group.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span>
              <span><strong>{group.name}</strong><small>{group.members} members</small><p>{group.description}</p></span>
            </button>
          ))}
        </div>

        <section className="community-feed">
          <header><div><p className="eyebrow purple">Active group</p><h2>{active.name}</h2><span>{active.members} students learning together</span></div><button className="button button-dark" type="button">Joined</button></header>
          <div className="new-post-mock"><span className="student-avatar">A</span><button type="button">Share a win, question, or useful resource...</button></div>
          {active.posts.map((post, index) => (
            <article key={post}>
              <div className={`post-avatar ${active.color}`}>{["RI", "MA", "KS"][index]}</div>
              <div><span><strong>{["Riya", "Manav", "Kavya"][index]}</strong> · {index + 1}h</span><p>{post}</p><footer><button type="button">Useful · {8 + index * 4}</button><button type="button">Reply</button></footer></div>
            </article>
          ))}
        </section>
      </section>
    </AppShell>
  );
}
