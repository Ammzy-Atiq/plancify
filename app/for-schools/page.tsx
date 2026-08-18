"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

export default function ForSchoolsPage() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }
  return (
    <main className="schools-page">
      <header className="marketing-header schools-header">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>Plancify</span></Link>
        <nav><Link href="/#how-it-works">How it works</Link><Link href="/#features">Features</Link><Link href="/for-schools">For schools</Link></nav>
        <Link className="button button-dark button-small" href="/login">Open demo</Link>
      </header>

      <section className="schools-hero">
        <div><p className="eyebrow lime">For school leaders</p><h1>Make future-readiness something students <span>actually practise.</span></h1><p>Give Classes 6-12 a structured journey from self-discovery to weekly action, while counsellors and families get a clearer way to support progress.</p><a className="button button-lime" href="#school-contact">Plan a pilot</a></div>
        <div className="school-program-card">
          <div><span>PLANCIFY SCHOOL PILOT</span><b>6 weeks</b></div>
          <h2>A complete programme, not another one-off workshop.</h2>
          {[
            "Guardian orientation and consent support",
            "Student discovery and goal setting",
            "Personalised roadmap and skill tracker",
            "Weekly action plan and portfolio proof",
            "Counsellor tools and progress view",
            "Aggregate outcome report",
          ].map((item, index) => <span key={item}><b>0{index + 1}</b>{item}</span>)}
        </div>
      </section>

      <section className="school-benefits section-pad">
        <div className="section-heading centered"><p className="eyebrow purple">Built to strengthen counsellors</p><h2>One programme. <span>Three useful views.</span></h2></div>
        <div>
          <article><span>ST</span><h3>Students</h3><p>Clear next actions, visible skill growth, and a portfolio of genuine effort.</p></article>
          <article><span>PA</span><h3>Parents</h3><p>Shared evidence for calmer conversations without monitoring every click.</p></article>
          <article><span>SC</span><h3>Schools</h3><p>Structured cohort support and aggregate outcomes without exposing private reflections.</p></article>
        </div>
      </section>

      <section className="school-contact" id="school-contact">
        <div><p className="eyebrow lime">Pilot conversation</p><h2>Bring Plancify to your students.</h2><p>This form is a local mock for the competition demo. It shows the school-enquiry experience without sending any data.</p></div>
        {sent ? <div className="school-form-success" role="status"><span>✓</span><h3>Demo enquiry complete.</h3><p>In a live product, the Plancify school team would follow up here.</p><button className="button button-ghost" type="button" onClick={() => setSent(false)}>Reset demo form</button></div> : (
          <form onSubmit={submit}>
            <label>Your name<input required placeholder="School leader or counsellor" /></label>
            <label>School name<input required placeholder="Your school" /></label>
            <label>Email<input required type="email" placeholder="you@school.edu" /></label>
            <label>Students<select defaultValue="150-300"><option>Under 150</option><option>150-300</option><option>300-600</option><option>600+</option></select></label>
            <button className="button button-lime wide-button" type="submit">Complete demo enquiry</button>
          </form>
        )}
      </section>
    </main>
  );
}
