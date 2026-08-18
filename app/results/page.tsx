"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useDemo } from "@/app/components/demo-provider";
import { scoreCareers } from "@/app/lib/demo-data";

export default function ResultsPage() {
  const router = useRouter();
  const { answers, chooseCareer } = useDemo();
  const [expanded, setExpanded] = useState<string | null>(null);
  const shortlist = useMemo(() => scoreCareers(answers), [answers]);

  function choose(id: string) {
    chooseCareer(id);
    router.push("/goal");
  }

  return (
    <main className="results-page">
      <header className="journey-header results-header">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>Plancify</span></Link>
        <span className="results-ready"><i /> Shortlist ready</span>
        <Link className="text-link" href="/onboarding">Adjust answers</Link>
      </header>

      <section className="results-intro">
        <p className="eyebrow lime">Three directions worth testing</p>
        <h1>This isn’t a verdict. <span>It’s your starting map.</span></h1>
        <p>We matched patterns across what you enjoy, how you learn, and where you are now. Explore the reasoning, then choose one goal to build a demo plan around.</p>
      </section>

      <section className="career-shortlist">
        {shortlist.map((career, index) => (
          <article className={`career-result-card ${career.color}`} key={career.id}>
            <div className="career-rank">0{index + 1}</div>
            <div className="career-icon">{career.icon}</div>
            <div className="career-card-head">
              <span>{career.cluster}</span>
              <b>{career.match}% pattern match</b>
            </div>
            <h2>{career.title}</h2>
            <p className="career-why">{career.why}</p>
            {expanded === career.id ? <p className="career-detail">{career.detail}</p> : null}
            <div className="career-card-actions">
              <button className="button button-dark" type="button" onClick={() => choose(career.id)}>Choose this goal</button>
              <button className="text-button" type="button" onClick={() => setExpanded(expanded === career.id ? null : career.id)} aria-expanded={expanded === career.id}>
                {expanded === career.id ? "Show less" : "Learn more"}
              </button>
            </div>
          </article>
        ))}
      </section>

      <aside className="results-note">
        <span aria-hidden="true">!</span>
        <p><strong>You can change your goal later.</strong> A useful plan should move when your evidence changes.</p>
      </aside>
    </main>
  );
}
