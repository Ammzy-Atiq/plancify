"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDemo } from "@/app/components/demo-provider";
import {
  funOptions,
  learningOptions,
  subjectOptions,
} from "@/app/lib/demo-data";

const questions = [
  { title: "Which of these sound most fun to you?", hint: "Pick 2 or 3. Don’t overthink it." },
  { title: "Which subjects do you enjoy most?", hint: "Choose the ones you would happily spend more time on." },
  { title: "Which subjects do you enjoy least?", hint: "This is useful evidence too - there are no bad answers." },
  { title: "Have you already been thinking about a career?", hint: "Write a rough idea, or tell us you’re not sure yet." },
  { title: "How do you like to learn?", hint: "Choose the style that keeps you interested longest." },
  { title: "What class are you in?", hint: "Your roadmap changes based on how much time you have to explore." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { answers, updateAnswers } = useDemo();
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);

  function toggleList(field: "fun" | "enjoyedSubjects" | "leastSubjects", value: string) {
    const current = answers[field];
    updateAnswers({
      [field]: current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    });
  }

  function finishDiscovery() {
    setProcessing(true);
    window.setTimeout(() => router.push("/results"), 1700);
  }

  const canContinue =
    step === 0 ? answers.fun.length > 0 :
    step === 1 ? answers.enjoyedSubjects.length > 0 :
    step === 2 ? answers.leastSubjects.length > 0 :
    step === 3 ? Boolean(answers.careerThought.trim()) :
    step === 4 ? Boolean(answers.learningStyle) :
    Boolean(answers.classLevel);

  if (processing) {
    return (
      <main className="processing-page" aria-live="polite">
        <div className="processing-orbit" aria-hidden="true"><i /><i /><i /></div>
        <p className="eyebrow lime">Discovery complete</p>
        <h1>Finding what fits you...</h1>
        <p>Connecting your interests, subjects, learning style, and stage.</p>
        <div className="processing-bars" aria-hidden="true"><span /><span /><span /></div>
      </main>
    );
  }

  return (
    <main className="journey-page">
      <header className="journey-header">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>Plancify</span></Link>
        <div className="journey-progress-copy">
          <strong>Discovery</strong><span>Step {step + 1} of {questions.length}</span>
        </div>
        <Link className="text-link" href="/results">Preview demo results</Link>
      </header>
      <div className="journey-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / questions.length) * 100}%` }} /></div>

      <section className="question-shell">
        <div className="question-number">0{step + 1}</div>
        <div className="question-copy">
          <p className="eyebrow purple">A little about you</p>
          <h1>{questions[step].title}</h1>
          <p>{questions[step].hint}</p>
        </div>

        {step === 0 ? (
          <TileGrid options={funOptions} selected={answers.fun} onClick={(value) => toggleList("fun", value)} />
        ) : null}
        {step === 1 ? (
          <TileGrid options={subjectOptions} selected={answers.enjoyedSubjects} onClick={(value) => toggleList("enjoyedSubjects", value)} compact />
        ) : null}
        {step === 2 ? (
          <TileGrid options={subjectOptions} selected={answers.leastSubjects} onClick={(value) => toggleList("leastSubjects", value)} compact tone="soft" />
        ) : null}
        {step === 3 ? (
          <div className="career-thought-box">
            <textarea
              value={answers.careerThought}
              onChange={(event) => updateAnswers({ careerThought: event.target.value })}
              placeholder="Maybe something with technology, design, medicine..."
              rows={4}
            />
            <button type="button" onClick={() => updateAnswers({ careerThought: "Not sure yet - that’s okay!" })}>
              Not sure yet, that’s okay!
            </button>
          </div>
        ) : null}
        {step === 4 ? (
          <TileGrid options={learningOptions} selected={[answers.learningStyle]} onClick={(value) => updateAnswers({ learningStyle: value })} />
        ) : null}
        {step === 5 ? (
          <div className="class-picker">
            {Array.from({ length: 7 }, (_, index) => String(index + 6)).map((item) => (
              <button className={answers.classLevel === item ? "selected" : ""} type="button" key={item} onClick={() => updateAnswers({ classLevel: item })}>
                <small>CLASS</small><strong>{item}</strong>
              </button>
            ))}
          </div>
        ) : null}

        <footer className="question-actions">
          <button className="button button-ghost" type="button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>Back</button>
          <span>{step === 0 ? `${answers.fun.length} selected` : "Your answers stay in this demo only"}</span>
          <button
            className="button button-dark"
            type="button"
            disabled={!canContinue}
            onClick={() => step === questions.length - 1 ? finishDiscovery() : setStep((current) => current + 1)}
          >
            {step === questions.length - 1 ? "Find my directions" : "Continue"}
          </button>
        </footer>
      </section>
    </main>
  );
}

function TileGrid({
  options,
  selected,
  onClick,
  compact = false,
  tone = "default",
}: {
  options: string[];
  selected: string[];
  onClick: (value: string) => void;
  compact?: boolean;
  tone?: "default" | "soft";
}) {
  return (
    <div className={`answer-grid ${compact ? "compact" : ""} ${tone}`}>
      {options.map((option, index) => (
        <button
          className={selected.includes(option) ? "selected" : ""}
          type="button"
          key={option}
          onClick={() => onClick(option)}
          aria-pressed={selected.includes(option)}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{option}</strong>
          <i aria-hidden="true">✓</i>
        </button>
      ))}
    </div>
  );
}
