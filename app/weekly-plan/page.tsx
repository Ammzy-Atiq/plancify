"use client";

import { useState } from "react";
import { AppShell } from "@/app/components/app-shell";
import { useDemo } from "@/app/components/demo-provider";
import { PageIntro } from "@/app/components/app-ui";
import { weeklyTasks } from "@/app/lib/demo-data";

export default function WeeklyPlanPage() {
  const { completedTaskIds, toggleTask } = useDemo();
  const [celebration, setCelebration] = useState("");
  const percent = Math.round((completedTaskIds.length / weeklyTasks.length) * 100);

  function toggle(id: string, title: string) {
    const completed = toggleTask(id);
    if (completed) {
      setCelebration(`Done! “${title}” just moved your plan forward.`);
      window.setTimeout(() => setCelebration(""), 2500);
    }
  }

  return (
    <AppShell>
      <PageIntro
        eyebrow="Weekly action plan"
        title="Three useful things. That’s enough for this week."
        description="Small, specific actions beat a giant report you never open again."
        action={<div className="weekly-score-ring" style={{ "--progress": `${percent * 3.6}deg` } as React.CSSProperties}><strong>{percent}%</strong><span>complete</span></div>}
      />
      {celebration ? <div className="celebration-toast big" role="status"><span>✓</span>{celebration}<i /><i /><i /></div> : null}

      <section className="week-strip">
        {['M','T','W','T','F','S','S'].map((day, index) => <span className={index < 3 ? "done" : index === 3 ? "today" : ""} key={`${day}-${index}`}><small>{day}</small><b>{18 + index}</b></span>)}
        <div><strong>5-day streak</strong><small>One action today keeps it alive.</small></div>
      </section>

      <section className="weekly-task-cards">
        {weeklyTasks.map((task, index) => {
          const done = completedTaskIds.includes(task.id);
          return (
            <article className={`${task.color} ${done ? "done" : ""}`} key={task.id}>
              <div className="weekly-card-number">0{index + 1}</div>
              <div className={`task-symbol ${task.color}`}>{task.type.slice(0, 1)}</div>
              <div className="weekly-card-copy">
                <span>{task.type} · {task.time}</span>
                <h2>{task.title}</h2>
                <p>{index === 0 ? "Learn when and why to group instructions into reusable functions." : index === 1 ? "Test your problem-solving in a friendly regional beginner round." : "See the meetings, trade-offs, and teamwork behind the job title."}</p>
              </div>
              <label className="complete-control">
                <input type="checkbox" checked={done} onChange={() => toggle(task.id, task.title)} />
                <span>{done ? "Completed" : "Mark complete"}</span>
              </label>
            </article>
          );
        })}
      </section>

      <aside className="week-reflection">
        <div><span aria-hidden="true">?</span><p><strong>End-of-week reflection</strong>What felt easier than expected? What do you want to try differently next week?</p></div>
        <button className="button button-ghost" type="button">Add a note</button>
      </aside>
    </AppShell>
  );
}
