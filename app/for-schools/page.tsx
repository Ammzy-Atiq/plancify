"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

export default function ForSchoolsPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audience: "school",
          contactName: String(form.get("contactName") ?? ""),
          schoolName: String(form.get("schoolName") ?? ""),
          email: String(form.get("email") ?? ""),
          studentRange: String(form.get("studentRange") ?? ""),
          website: String(form.get("website") ?? ""),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "The enquiry could not be saved.");
      setSent(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The enquiry could not be saved.");
    } finally {
      setSubmitting(false);
    }
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
        <div><p className="eyebrow lime">Pilot conversation</p><h2>Bring Plancify to your students.</h2><p>Tell us about your school. The enquiry is stored securely for an approved Plancify administrator to review.</p></div>
        {sent ? <div className="school-form-success" role="status"><span>✓</span><h3>Enquiry received.</h3><p>The Plancify school team can now review your pilot request.</p><button className="button button-ghost" type="button" onClick={() => setSent(false)}>Send another enquiry</button></div> : (
          <form onSubmit={submit}>
            <label>Your name<input name="contactName" required placeholder="School leader or counsellor" /></label>
            <label>School name<input name="schoolName" required placeholder="Your school" /></label>
            <label>Email<input name="email" required type="email" placeholder="you@school.edu" /></label>
            <label>Students<select name="studentRange" defaultValue="150-300"><option>Under 150</option><option>150-300</option><option>300-600</option><option>600+</option></select></label>
            <label className="form-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="button button-lime wide-button" type="submit" disabled={submitting}>{submitting ? "Saving enquiry..." : "Request a pilot"}</button>
          </form>
        )}
      </section>
    </main>
  );
}
