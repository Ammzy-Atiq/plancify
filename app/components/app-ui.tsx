import type { ReactNode } from "react";

export function PageIntro({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="app-page-intro">
      <div>
        <p className="eyebrow purple">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action ? <div className="app-page-action">{action}</div> : null}
    </header>
  );
}

export function LevelBar({ level, color = "purple" }: { level: number; color?: string }) {
  return (
    <div className={`level-bar ${color}`} aria-label={`Level ${level} of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <i className={index < level ? "filled" : ""} key={index} />
      ))}
    </div>
  );
}

export function EmptyFriendly({ children }: { children: ReactNode }) {
  return <div className="empty-friendly">{children}</div>;
}
