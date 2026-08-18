"use client";

import { SignInButton } from "@clerk/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthControl } from "@/app/components/auth-control";
import { usePlanifyAuth } from "@/app/components/auth-provider";
import { careers } from "@/app/lib/demo-data";
import styles from "./admin.module.css";

type SignupRecord = {
  id: string;
  email: string;
  audience: "family" | "school";
  schoolName: string | null;
  contactName: string | null;
  studentRange: string | null;
  source: string;
  hasAccount: boolean;
  createdAt: string;
};

type WorkspaceRecord = {
  clerkUserId: string;
  email: string | null;
  studentName: string;
  classLevel: number;
  selectedCareerId: string;
  completion: {
    taskProgress: number;
    discoveryProgress: number;
    portfolioCount: number;
  };
  createdAt: string;
  updatedAt: string;
};

type LoadState =
  | "idle"
  | "loading"
  | "ready"
  | "forbidden"
  | "unconfigured"
  | "setup"
  | "error";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <span />
      <span />
    </span>
  );
}

export default function AdminPage() {
  const { configured, getToken, isLoaded, isSignedIn } = usePlanifyAuth();
  const [records, setRecords] = useState<SignupRecord[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [audience, setAudience] = useState<"all" | "family" | "school">("all");

  const loadRecords = useCallback(async () => {
    setLoadState("loading");
    setMessage("");

    try {
      const token = await getToken();
      if (!token) {
        setLoadState("error");
        setMessage("Your account session is not available. Sign in again.");
        return;
      }

      const [enquiryResponse, workspaceResponse] = await Promise.all([
        fetch("/api/admin/early-access", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
        fetch("/api/admin/workspaces", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
      ]);
      const enquiryPayload = (await enquiryResponse.json().catch(() => ({}))) as {
        records?: SignupRecord[];
        error?: string;
        code?: string;
      };
      const workspacePayload = (await workspaceResponse.json().catch(() => ({}))) as {
        records?: WorkspaceRecord[];
        error?: string;
        code?: string;
      };

      const failedResponse = !enquiryResponse.ok ? enquiryResponse : !workspaceResponse.ok ? workspaceResponse : null;
      const failedPayload = !enquiryResponse.ok ? enquiryPayload : !workspaceResponse.ok ? workspacePayload : null;
      if (failedResponse && failedPayload) {
        if (failedResponse.status === 403) setLoadState("forbidden");
        else if (failedPayload.code === "admin_not_configured") setLoadState("unconfigured");
        else if (
          failedPayload.code === "database_setup_required" ||
          failedPayload.code === "database_not_configured"
        ) setLoadState("setup");
        else setLoadState("error");
        setMessage(failedPayload.error ?? "The admin panel could not load.");
        return;
      }

      setRecords(enquiryPayload.records ?? []);
      setWorkspaces(workspacePayload.records ?? []);
      setLoadState("ready");
    } catch {
      setLoadState("error");
      setMessage("The admin panel could not connect. Please try again.");
    }
  }, [getToken]);

  useEffect(() => {
    if (!configured || !isLoaded || !isSignedIn) return;
    const frame = window.requestAnimationFrame(() => void loadRecords());
    return () => window.cancelAnimationFrame(frame);
  }, [configured, isLoaded, isSignedIn, loadRecords]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesAudience = audience === "all" || record.audience === audience;
      const matchesSearch =
        !query ||
        record.email.toLowerCase().includes(query) ||
        record.schoolName?.toLowerCase().includes(query);
      return matchesAudience && Boolean(matchesSearch);
    });
  }, [audience, records, search]);

  const filteredWorkspaces = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workspaces.filter((record) => {
      const career = careers.find((item) => item.id === record.selectedCareerId)?.title ?? record.selectedCareerId;
      return !query || [record.studentName, record.email ?? "", career]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [search, workspaces]);

  const schoolCount = records.filter((record) => record.audience === "school").length;

  const accessContent = () => {
    if (!configured) {
      return (
        <div className={styles.gateCard} role="status">
          <span className={styles.gateLabel}>Authentication unavailable</span>
          <h1>Administrator sign-in needs configuration.</h1>
          <p>Add the Clerk configuration before using this private page.</p>
        </div>
      );
    }

    if (!isLoaded) {
      return (
        <div className={styles.gateCard} role="status">
          <span className={styles.loadingDot} aria-hidden="true" />
          <h1>Checking your account.</h1>
          <p>This should only take a moment.</p>
        </div>
      );
    }

    if (!isSignedIn) {
      return (
        <div className={styles.gateCard}>
          <span className={styles.gateLabel}>Private workspace</span>
          <h1>Sign in to open the admin panel.</h1>
          <p>Only approved Planify administrators can view student and school enquiries.</p>
          <SignInButton mode="modal">
            <button className={styles.primaryButton} type="button">Sign in securely</button>
          </SignInButton>
        </div>
      );
    }

    if (loadState === "loading" || loadState === "idle") {
      return (
        <div className={styles.gateCard} role="status" aria-live="polite">
          <span className={styles.loadingDot} aria-hidden="true" />
          <h1>Loading enquiries.</h1>
          <p>Planify is checking your access and contacting the data store.</p>
        </div>
      );
    }

    if (loadState !== "ready") {
      const title =
        loadState === "forbidden"
          ? "This account is not an administrator."
          : loadState === "unconfigured"
            ? "Assign the first administrator."
            : loadState === "setup"
              ? "Complete the Supabase setup."
              : "The admin panel could not load.";
      const detail =
        loadState === "unconfigured"
          ? "Add the approved Clerk User ID or account email to the server administrator allowlist."
          : loadState === "setup"
            ? "Run the included plancify_mvp_schema.sql file in the Supabase SQL Editor, then refresh this page."
            : message;

      return (
        <div className={styles.gateCard} role="alert">
          <span className={styles.gateLabel}>Access notice</span>
          <h1>{title}</h1>
          <p>{detail}</p>
          {loadState !== "forbidden" ? (
            <button className={styles.secondaryButton} type="button" onClick={loadRecords}>
              Try again
            </button>
          ) : null}
        </div>
      );
    }

    return (
      <main className={styles.main}>
        <section className={styles.intro}>
          <div>
            <span className={styles.eyebrow}>MVP administration</span>
            <h1>Students and enquiries, in one clear view.</h1>
            <p>Review authenticated student workspaces and school interest without exposing private data publicly.</p>
          </div>
          <button className={styles.refreshButton} type="button" onClick={loadRecords}>
            Refresh data
          </button>
        </section>

        <section className={styles.stats} aria-label="Submission summary">
          <article>
            <span>Total enquiries</span>
            <strong>{records.length}</strong>
            <small>All saved contacts</small>
          </article>
          <article>
            <span>Student workspaces</span>
            <strong>{workspaces.length}</strong>
            <small>Authenticated student accounts</small>
          </article>
          <article>
            <span>Weekly actions</span>
            <strong>{workspaces.length ? Math.round(workspaces.reduce((total, item) => total + item.completion.taskProgress, 0) / workspaces.length) : 0}%</strong>
            <small>Average completion</small>
          </article>
          <article>
            <span>Schools</span>
            <strong>{schoolCount}</strong>
            <small>Pilot requests</small>
          </article>
        </section>

        <section className={styles.panel} aria-labelledby="students-title">
          <div className={styles.panelHeader}>
            <div><span className={styles.panelLabel}>Product activity</span><h2 id="students-title">Student workspaces</h2></div>
            <span className={styles.resultCount}>{filteredWorkspaces.length} shown</span>
          </div>
          {filteredWorkspaces.length === 0 ? (
            <div className={styles.emptyState}><span aria-hidden="true" /><h3>No student workspaces yet.</h3><p>A workspace appears after a signed-in student opens the product.</p></div>
          ) : (
            <div className={styles.tableWrap}>
              <table>
                <thead><tr><th scope="col">Student</th><th scope="col">Class</th><th scope="col">Goal</th><th scope="col">Weekly plan</th><th scope="col">Portfolio</th><th scope="col">Last active</th></tr></thead>
                <tbody>
                  {filteredWorkspaces.map((record) => (
                    <tr key={record.clerkUserId}>
                      <td><strong>{record.studentName}</strong><br /><span className={styles.muted}>{record.email ?? "Email unavailable"}</span></td>
                      <td>Class {record.classLevel}</td>
                      <td>{careers.find((career) => career.id === record.selectedCareerId)?.title ?? record.selectedCareerId}</td>
                      <td>{record.completion.taskProgress}%</td>
                      <td>{record.completion.portfolioCount} items</td>
                      <td><time dateTime={record.updatedAt}>{dateFormatter.format(new Date(record.updatedAt))}</time></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="enquiries-title">
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelLabel}>Contact list</span>
              <h2 id="enquiries-title">Enquiries</h2>
            </div>
            <span className={styles.resultCount} aria-live="polite">
              {filteredRecords.length} shown
            </span>
          </div>

          <div className={styles.toolbar}>
            <label className={styles.searchField}>
              <span className={styles.srOnly}>Search enquiries</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search email or school"
              />
            </label>
            <label className={styles.filterField}>
              <span>Audience</span>
              <select
                value={audience}
                onChange={(event) => setAudience(event.target.value as typeof audience)}
              >
                <option value="all">All enquiries</option>
                <option value="family">Parents and guardians</option>
                <option value="school">Schools</option>
              </select>
            </label>
          </div>

          {filteredRecords.length === 0 ? (
            <div className={styles.emptyState}>
              <span aria-hidden="true" />
              <h3>{records.length === 0 ? "No enquiries yet." : "No matching enquiries."}</h3>
              <p>{records.length === 0 ? "New early-access requests will appear here." : "Try a different search or audience filter."}</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Contact</th>
                    <th scope="col">Audience</th>
                    <th scope="col">School</th>
                    <th scope="col">Account</th>
                    <th scope="col">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td><a href={`mailto:${record.email}`}>{record.email}</a>{record.contactName ? <><br /><span className={styles.muted}>{record.contactName}</span></> : null}</td>
                      <td>
                        <span className={`${styles.audienceBadge} ${record.audience === "school" ? styles.schoolBadge : styles.familyBadge}`}>
                          {record.audience === "school" ? "School" : "Parent or guardian"}
                        </span>
                      </td>
                      <td>{record.schoolName || <span className={styles.muted}>Not provided</span>}{record.studentRange ? <><br /><span className={styles.muted}>{record.studentRange} students</span></> : null}</td>
                      <td>
                        <span className={styles.accountState}>
                          <i className={record.hasAccount ? styles.connected : ""} aria-hidden="true" />
                          {record.hasAccount ? "Connected" : "Guest"}
                        </span>
                      </td>
                      <td>
                        <time dateTime={record.createdAt}>
                          {dateFormatter.format(new Date(record.createdAt))}
                        </time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="Return to Planify home">
          <BrandMark />
          <span>Plancify</span>
          <small>Admin</small>
        </Link>
        <div className={styles.headerActions}>
          <Link className={styles.siteLink} href="/">Public website</Link>
          <AuthControl />
        </div>
      </header>
      {accessContent()}
    </div>
  );
}
