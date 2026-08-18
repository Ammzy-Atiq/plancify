"use client";

import Link from "next/link";
import { useDemo } from "@/app/components/demo-provider";

export default function GoalPage() {
  const { selectedCareer } = useDemo();

  return (
    <main className="goal-page">
      <div className="confetti" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => <i key={index} />)}
      </div>
      <Link className="brand brand-light goal-brand" href="/"><span className="brand-mark">P</span><span>Plancify</span></Link>
      <section className="goal-card">
        <span className={`goal-career-icon ${selectedCareer.color}`}>{selectedCareer.icon}</span>
        <p className="eyebrow lime">Goal confirmed</p>
        <h1>Great choice. <span>Now let’s turn it into action.</span></h1>
        <p>You’re building a path towards <strong>{selectedCareer.title}</strong>. Your Class 8 roadmap starts small, shows what to practise, and leaves room to change your mind.</p>
        <div className="goal-preview-steps">
          <span><b>Now</b> Python basics</span>
          <span><b>Next</b> One real project</span>
          <span><b>Then</b> Competition proof</span>
        </div>
        <Link className="button button-lime wide-button" href="/dashboard">Open my dashboard</Link>
        <Link className="goal-back-link" href="/results">Choose a different direction</Link>
      </section>
    </main>
  );
}
