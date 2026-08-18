"use client";

import { Show, SignInButton, SignUpButton } from "@clerk/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { usePlanifyAuth } from "@/app/components/auth-provider";
import { useDemo } from "@/app/components/demo-provider";

export default function LoginPage() {
  const router = useRouter();
  const { configured, isSignedIn } = usePlanifyAuth();
  const { resetDemo, setStudentName, updateAnswers } = useDemo();
  const [error, setError] = useState("");

  function continueAsDemo() {
    if (!isSignedIn) resetDemo();
    router.push("/dashboard");
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const classLevel = String(data.get("classLevel") ?? "8");
    if (!name) {
      setError("Enter your name so we know where to begin.");
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
          <p>Explore locally as a guest, or sign in to keep your progress safely synced across devices.</p>
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

          {configured ? (
            <div className="real-account-actions">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button className="button button-dark" type="button">Create a real account</button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="button button-ghost" type="button">Sign in</button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <Link className="button button-dark wide-button" href="/dashboard">Open my saved workspace</Link>
              </Show>
              <small>Signed-in progress syncs securely across devices.</small>
            </div>
          ) : null}

          <div className="or-divider"><span>or continue without an account</span></div>

          <form onSubmit={submitForm}>
            <label>
              Your name
              <input name="name" placeholder="e.g. Aarav Sharma" autoComplete="name" />
            </label>
            <label>
              Class
              <select name="classLevel" defaultValue="8">
                {Array.from({ length: 7 }, (_, index) => String(index + 6)).map((item) => (
                  <option key={item} value={item}>Class {item}</option>
                ))}
              </select>
            </label>
            <label className="trust-check">
              <input type="checkbox" defaultChecked />
              <span>A parent or guardian will need to confirm a real account.</span>
            </label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="button button-dark wide-button" type="submit">Create guest profile</button>
          </form>
          <small className="demo-note">Guest profiles stay on this device. Use Clerk sign-in above for a real synced account.</small>
        </div>
      </section>
    </main>
  );
}
