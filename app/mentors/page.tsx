"use client";

import { useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { useDemo } from "@/app/components/demo-provider";
import { PageIntro } from "@/app/components/app-ui";
import { mentors } from "@/app/lib/demo-data";

export default function MentorsPage() {
  const { connectedMentorIds, connectMentor } = useDemo();
  const [field, setField] = useState("All fields");
  const [toast, setToast] = useState("");
  const filtered = field === "All fields" ? mentors : mentors.filter((mentor) => mentor.field === field);

  function connect(id: string, name: string) {
    connectMentor(id);
    setToast(`${name} added to your demo mentor list.`);
    window.setTimeout(() => setToast(""), 2300);
  }

  return (
    <AppShell>
      <PageIntro
        eyebrow="Mentor connect"
        title="Ask someone who is a few steps ahead."
        description="Explore mock profiles of students and professionals who can make a career path feel more real."
        action={<label className="mentor-filter">Field<select value={field} onChange={(event) => setField(event.target.value)}><option>All fields</option>{[...new Set(mentors.map((mentor) => mentor.field))].map((item) => <option key={item}>{item}</option>)}</select></label>}
      />
      {toast ? <div className="celebration-toast" role="status"><span>✓</span>{toast}</div> : null}

      <section className="mentor-grid">
        {filtered.map((mentor) => {
          const connected = connectedMentorIds.includes(mentor.id);
          return (
            <article className={`mentor-card ${mentor.color}`} key={mentor.id}>
              <div className="mentor-avatar"><span>{mentor.initials}</span><i /></div>
              <span className="mentor-field">{mentor.field}</span>
              <h2>{mentor.name}</h2>
              <p>{mentor.background}</p>
              <div className="mentor-focus"><small>GOOD PERSON TO ASK ABOUT</small><strong>{mentor.focus}</strong></div>
              <button className={connected ? "button button-ghost connected" : "button button-dark"} type="button" onClick={() => connect(mentor.id, mentor.name)} disabled={connected}>{connected ? "Connected" : "Connect"}</button>
            </article>
          );
        })}
      </section>

      <aside className="mentor-safety"><span>SAFE</span><p><strong>Designed with student safety in mind.</strong> A real version would use verified identities, guardian visibility, and moderated communication. This demo sends no messages.</p></aside>
    </AppShell>
  );
}
