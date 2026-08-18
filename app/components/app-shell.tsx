"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { AuthControl } from "@/app/components/auth-control";
import { usePlanifyAuth } from "@/app/components/auth-provider";
import { useDemo } from "@/app/components/demo-provider";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: "DB" },
  { href: "/roadmap", label: "Roadmap", icon: "RM" },
  { href: "/skills", label: "Skills", icon: "SK" },
  { href: "/weekly-plan", label: "Weekly Plan", icon: "WK" },
  { href: "/portfolio", label: "Portfolio", icon: "PF" },
  { href: "/competitions", label: "Competitions", icon: "CP" },
  { href: "/resources", label: "Resources", icon: "RS" },
  { href: "/community", label: "Community", icon: "CM" },
  { href: "/mentors", label: "Mentors", icon: "MT" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { answers, studentName, selectedCareer, syncMessage, syncStatus } = useDemo();

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <Link className="brand app-brand" href="/" aria-label="Plancify home">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span>Plancify</span>
        </Link>

        <div className="student-mini-card">
          <span className="student-avatar" aria-hidden="true">
            {studentName.slice(0, 1).toUpperCase()}
          </span>
          <span>
            <strong>{studentName}</strong>
            <small>Class {answers.classLevel} · {selectedCareer.cluster}</small>
          </span>
        </div>

        <nav className="app-navigation" aria-label="Student workspace">
          {navigation.map((item) => (
            <Link
              className={pathname === item.href ? "active" : ""}
              href={item.href}
              key={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-streak">
          <span className="streak-flame" aria-hidden="true">5</span>
          <span><strong>5-day streak</strong><small>Keep the momentum going!</small></span>
        </div>
      </aside>

      <section className="app-workspace">
        <header className="app-topbar">
          <div>
            <span className="app-topbar-kicker">Your active direction</span>
            <strong>{selectedCareer.title}</strong>
          </div>
          <div className="topbar-actions">
            <button className={`workspace-sync ${syncStatus}`} type="button" title={syncMessage}>
              <i aria-hidden="true" />
              <span>{syncMessage}</span>
            </button>
            <AuthControl />
          </div>
        </header>

        <nav className="mobile-app-navigation" aria-label="Student workspace mobile navigation">
          {navigation.map((item) => (
            <Link
              className={pathname === item.href ? "active" : ""}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="app-content">{children}</main>
      </section>

      <ChatGuide />
    </div>
  );
}

type ChatMessage = { from: "guide" | "student"; text: string };

function ChatGuide() {
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: "guide",
      text: "Hi! I’m your Plancify guide. Ask me what to do next, how you’re progressing, or for a project idea.",
    },
  ]);
  const { selectedCareer, completedTaskIds } = useDemo();
  const { configured, getToken, isSignedIn } = usePlanifyAuth();

  const prompts = ["What should I do next?", "How am I doing?", "Suggest a project"];

  function localReply(prompt: string) {
    const normalized = prompt.toLowerCase();
    let reply = `Your ${selectedCareer.title} roadmap is ready. Start with one small action and use what you learn to adjust the plan.`;
    if (normalized.includes("next")) {
      reply = "Finish the calculator app this week. Keep it simple: two inputs, four operations, and a short note explaining one bug you fixed.";
    } else if (normalized.includes("doing")) {
      reply = `You have completed ${completedTaskIds.length} of this week’s 3 actions and your strongest tracked skill is Problem Solving at Level 3. You’re moving steadily.`;
    } else if (normalized.includes("project")) {
      reply = `Try a “Study Sprint Timer” in Python. It fits your ${selectedCareer.title} goal and practises functions, loops, and clear user instructions.`;
    }
    return reply;
  }

  async function answerPrompt(prompt: string) {
    if (thinking) return;
    setMessages((current) => [
      ...current,
      { from: "student", text: prompt },
    ]);
    setThinking(true);

    let reply = localReply(prompt);
    if (configured && isSignedIn) {
      try {
        const token = await getToken();
        if (token) {
          const response = await fetch("/api/ai/guide", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          });
          const payload = (await response.json().catch(() => ({}))) as { reply?: string };
          if (response.ok && payload.reply) reply = payload.reply;
        }
      } catch {
        // The local, goal-aware response keeps the guide reliable if AI is unavailable.
      }
    }

    setMessages((current) => [...current, { from: "guide", text: reply }]);
    setThinking(false);
  }

  return (
    <div className={`chat-guide ${open ? "open" : ""}`}>
      {open ? (
        <section className="chat-panel" role="dialog" aria-label="Plancify AI Chat Guide">
          <header>
            <span className="chat-orb" aria-hidden="true">AI</span>
            <span><strong>Plancify Guide</strong><small>{configured && isSignedIn ? "AI with local fallback" : "Goal-aware local guide"}</small></span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat guide">×</button>
          </header>
          <div className="chat-messages" aria-live="polite">
            {messages.map((message, index) => (
              <p className={message.from} key={`${message.from}-${index}`}>{message.text}</p>
            ))}
            {thinking ? <p className="guide chat-thinking">Thinking...</p> : null}
          </div>
          <div className="chat-prompts">
            {prompts.map((prompt) => (
              <button type="button" key={prompt} disabled={thinking} onClick={() => void answerPrompt(prompt)}>{prompt}</button>
            ))}
          </div>
        </section>
      ) : null}
      <button
        className="chat-launcher"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={open ? "Close AI Chat Guide" : "Open AI Chat Guide"}
      >
        <span aria-hidden="true">AI</span>
        <b>Ask your guide</b>
      </button>
    </div>
  );
}
