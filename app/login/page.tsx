"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { useDemo } from "@/app/components/demo-provider";

export default function LoginPage() {
  const router = useRouter();
  const { resetDemo, setStudentName, updateAnswers } = useDemo();
  const [error, setError] = useState("");

  function continueAsDemo() {
    resetDemo();
    router.push("/dashboard");
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "").trim();
    const classLevel = String(data.get("classLevel") ?? "8");
    if (!name || !email || !password) {
      setError("Fill in the three fields so we know where to begin.");
      return;
    }
    setStudentName(name.split(" ")[0]);
    updateAnswers({ classLevel });
    router.push("/onboarding");
  }

  return (
    <main className="auth-page">
      <section className="auth-story-panel">
        <Link className="brand brand-light" href="/">
          <span className="brand-mark" aria-hidden="true">P</span><span>Plancify</span>
        </Link>
        <div>
          <p className="eyebrow lime">Your future workspace</p>
          <h1>Start with curiosity. <span>Leave with a next step.</span></h1>
          <p>Everything in this competition demo runs locally with pre-filled data, so you can explore without waiting.</p>
        </div>
        <div className="auth-story-steps">
          <span><b>01</b> Discover what fits</span>
          <span><b>02</b> Choose a direction</span>
          <span><b>03</b> Build skill and proof</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-card">
          <p className="eyebrow purple">Fastest demo path</p>
          <h2>Meet Aarav’s future plan.</h2>
          <p>Jump into a complete Class 8 software-engineering profile with progress already in motion.</p>
          <button className="button button-lime wide-button" type="button" onClick={continueAsDemo}>
            Continue as Demo Student <span aria-hidden="true">GO</span>
          </button>

          <div className="or-divider"><span>or make your own demo profile</span></div>

          <form onSubmit={submitForm}>
            <label>
              Your name
              <input name="name" placeholder="e.g. Aarav Sharma" autoComplete="name" />
            </label>
            <label>
              Email
              <input name="email" type="email" placeholder="you@example.com" autoComplete="email" />
            </label>
            <div className="form-two-col">
              <label>
                Class
                <select name="classLevel" defaultValue="8">
                  {Array.from({ length: 7 }, (_, index) => String(index + 6)).map((item) => (
                    <option key={item} value={item}>Class {item}</option>
                  ))}
                </select>
              </label>
              <label>
                Password
                <input name="password" type="password" placeholder="Demo only" autoComplete="new-password" />
              </label>
            </div>
            <label className="trust-check">
              <input type="checkbox" defaultChecked />
              <span>A parent or guardian will need to confirm a real account.</span>
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="button button-dark wide-button" type="submit">Create demo profile</button>
          </form>
          <small className="demo-note">Prototype only. No account is created and nothing is uploaded.</small>
        </div>
      </section>
    </main>
  );
}
