"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { usePlanifyAuth } from "@/app/components/auth-provider";
import { careers, type DiscoveryAnswers } from "@/app/lib/demo-data";
import {
  createDefaultWorkspaceState,
  parseWorkspaceState,
  type PortfolioItem,
  type StudentWorkspaceState,
} from "@/app/lib/mvp-state";

export type WorkspaceSyncStatus =
  | "loading"
  | "local"
  | "saving"
  | "saved"
  | "error";

type DemoContextValue = {
  answers: DiscoveryAnswers;
  updateAnswers: (patch: Partial<DiscoveryAnswers>) => void;
  selectedCareerId: string;
  selectedCareer: (typeof careers)[number];
  chooseCareer: (careerId: string) => void;
  completedTaskIds: string[];
  toggleTask: (taskId: string) => boolean;
  portfolioItems: PortfolioItem[];
  addPortfolioItem: (item: PortfolioItem) => void;
  connectedMentorIds: string[];
  connectMentor: (mentorId: string) => void;
  studentName: string;
  setStudentName: (name: string) => void;
  resetDemo: () => void;
  syncNow: () => Promise<void>;
  syncStatus: WorkspaceSyncStatus;
  syncMessage: string;
  cloudBacked: boolean;
};

const LOCAL_STORAGE_KEY = "plancify-workspace-v1";
const defaultCareer = careers[0];
const DemoContext = createContext<DemoContextValue | null>(null);

function readLocalWorkspace() {
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? parseWorkspaceState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { configured, getToken, isLoaded, isSignedIn, userId } = usePlanifyAuth();
  const cloudPersistenceEnabled = !pathname.startsWith("/admin");
  const [workspace, setWorkspace] = useState<StudentWorkspaceState>(
    createDefaultWorkspaceState,
  );
  const [readyToPersist, setReadyToPersist] = useState(false);
  const [syncStatus, setSyncStatus] = useState<WorkspaceSyncStatus>("loading");
  const [syncMessage, setSyncMessage] = useState("Preparing your workspace...");
  const workspaceRef = useRef(workspace);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    workspaceRef.current = workspace;
  }, [workspace]);

  const saveCloudWorkspace = useCallback(async (state: StudentWorkspaceState) => {
    const token = await getToken();
    if (!token) throw new Error("Your account session is not available.");
    const response = await fetch("/api/mvp/state", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) throw new Error(payload.error ?? "Your progress could not be saved.");
  }, [getToken]);

  const queueCloudSave = useCallback((state: StudentWorkspaceState) => {
    const pendingSave = saveQueueRef.current
      .catch(() => undefined)
      .then(() => saveCloudWorkspace(state));
    saveQueueRef.current = pendingSave.catch(() => undefined);
    return pendingSave;
  }, [saveCloudWorkspace]);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    async function hydrateWorkspace() {
      setReadyToPersist(false);
      const localState = readLocalWorkspace() ?? workspaceRef.current;
      if (!cloudPersistenceEnabled || !configured || !isSignedIn) {
        if (!cancelled) {
          setWorkspace(localState);
          setSyncStatus("local");
          setSyncMessage("Guest mode · saved on this device");
          setReadyToPersist(true);
        }
        return;
      }

      setSyncStatus("loading");
      setSyncMessage("Loading your cloud workspace...");
      try {
        const token = await getToken();
        if (!token) throw new Error("Your account session is not available.");
        const response = await fetch("/api/mvp/state", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({}))) as {
          state?: unknown;
          error?: string;
          code?: string;
        };

        if (response.ok) {
          const savedState = parseWorkspaceState(payload.state);
          if (!savedState) throw new Error("The saved workspace could not be read.");
          if (!cancelled) setWorkspace(savedState);
        } else if (response.status === 404 && payload.code === "workspace_not_found") {
          await queueCloudSave(localState);
          if (!cancelled) setWorkspace(localState);
        } else {
          throw new Error(payload.error ?? "Cloud sync is unavailable.");
        }

        if (!cancelled) {
          setSyncStatus("saved");
          setSyncMessage("Synced to your account");
        }
      } catch (error) {
        if (!cancelled) {
          setWorkspace(localState);
          setSyncStatus("error");
          setSyncMessage(error instanceof Error ? error.message : "Cloud sync is unavailable.");
        }
      } finally {
        if (!cancelled) setReadyToPersist(true);
      }
    }

    void hydrateWorkspace();
    return () => {
      cancelled = true;
    };
  }, [cloudPersistenceEnabled, configured, getToken, isLoaded, isSignedIn, queueCloudSave, userId]);

  useEffect(() => {
    if (!readyToPersist) return;
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // The app remains usable when device storage is unavailable.
    }

    if (!cloudPersistenceEnabled || !configured || !isSignedIn) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSyncStatus("saving");
      setSyncMessage("Saving changes...");
      void queueCloudSave(workspace)
        .then(() => {
          if (!cancelled) {
            setSyncStatus("saved");
            setSyncMessage("Synced to your account");
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setSyncStatus("error");
            setSyncMessage(error instanceof Error ? error.message : "Cloud save failed.");
          }
        });
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [cloudPersistenceEnabled, configured, isSignedIn, queueCloudSave, readyToPersist, workspace]);

  const selectedCareer =
    careers.find((career) => career.id === workspace.selectedCareerId) ?? defaultCareer;

  const syncNow = useCallback(async () => {
    if (!cloudPersistenceEnabled || !configured || !isSignedIn) {
      setSyncStatus("local");
      setSyncMessage("Guest mode · saved on this device");
      return;
    }
    setSyncStatus("saving");
    setSyncMessage("Saving changes...");
    try {
      await queueCloudSave(workspaceRef.current);
      setSyncStatus("saved");
      setSyncMessage("Synced to your account");
    } catch (error) {
      setSyncStatus("error");
      setSyncMessage(error instanceof Error ? error.message : "Cloud save failed.");
    }
  }, [cloudPersistenceEnabled, configured, isSignedIn, queueCloudSave]);

  const value = useMemo<DemoContextValue>(() => ({
    answers: workspace.answers,
    updateAnswers: (patch) => setWorkspace((current) => ({
      ...current,
      answers: { ...current.answers, ...patch },
    })),
    selectedCareerId: workspace.selectedCareerId,
    selectedCareer,
    chooseCareer: (careerId) => setWorkspace((current) => ({
      ...current,
      selectedCareerId: careerId,
    })),
    completedTaskIds: workspace.completedTaskIds,
    toggleTask: (taskId) => {
      const willComplete = !workspace.completedTaskIds.includes(taskId);
      setWorkspace((current) => ({
        ...current,
        completedTaskIds: current.completedTaskIds.includes(taskId)
          ? current.completedTaskIds.filter((id) => id !== taskId)
          : [...current.completedTaskIds, taskId],
      }));
      return willComplete;
    },
    portfolioItems: workspace.portfolioItems,
    addPortfolioItem: (item) => setWorkspace((current) => ({
      ...current,
      portfolioItems: [item, ...current.portfolioItems.filter((currentItem) => currentItem.id !== item.id)],
    })),
    connectedMentorIds: workspace.connectedMentorIds,
    connectMentor: (mentorId) => setWorkspace((current) => ({
      ...current,
      connectedMentorIds: current.connectedMentorIds.includes(mentorId)
        ? current.connectedMentorIds
        : [...current.connectedMentorIds, mentorId],
    })),
    studentName: workspace.studentName,
    setStudentName: (studentName) => setWorkspace((current) => ({ ...current, studentName })),
    resetDemo: () => setWorkspace(createDefaultWorkspaceState()),
    syncNow,
    syncStatus,
    syncMessage,
    cloudBacked: cloudPersistenceEnabled && configured && isSignedIn,
  }), [
    cloudPersistenceEnabled,
    configured,
    isSignedIn,
    selectedCareer,
    syncMessage,
    syncNow,
    syncStatus,
    workspace,
  ]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used within DemoProvider");
  return context;
}
