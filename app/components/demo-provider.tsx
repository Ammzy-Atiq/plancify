"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  careers,
  type DiscoveryAnswers,
  demoAnswers,
  initialPortfolio,
} from "@/app/lib/demo-data";

type PortfolioItem = (typeof initialPortfolio)[number];

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
};

const defaultCareer = careers[0];

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<DiscoveryAnswers>(demoAnswers);
  const [selectedCareerId, setSelectedCareerId] = useState(defaultCareer.id);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([
    "python-functions",
  ]);
  const [portfolioItems, setPortfolioItems] =
    useState<PortfolioItem[]>(initialPortfolio);
  const [connectedMentorIds, setConnectedMentorIds] = useState<string[]>([]);
  const [studentName, setStudentName] = useState("Aarav");

  const selectedCareer =
    careers.find((career) => career.id === selectedCareerId) ?? defaultCareer;

  const value = useMemo<DemoContextValue>(
    () => ({
      answers,
      updateAnswers: (patch) =>
        setAnswers((current) => ({ ...current, ...patch })),
      selectedCareerId,
      selectedCareer,
      chooseCareer: setSelectedCareerId,
      completedTaskIds,
      toggleTask: (taskId) => {
        const willComplete = !completedTaskIds.includes(taskId);
        setCompletedTaskIds((current) =>
          current.includes(taskId)
            ? current.filter((id) => id !== taskId)
            : [...current, taskId],
        );
        return willComplete;
      },
      portfolioItems,
      addPortfolioItem: (item) =>
        setPortfolioItems((current) => [item, ...current]),
      connectedMentorIds,
      connectMentor: (mentorId) =>
        setConnectedMentorIds((current) =>
          current.includes(mentorId) ? current : [...current, mentorId],
        ),
      studentName,
      setStudentName,
      resetDemo: () => {
        setAnswers(demoAnswers);
        setSelectedCareerId(defaultCareer.id);
        setCompletedTaskIds(["python-functions"]);
        setPortfolioItems(initialPortfolio);
        setConnectedMentorIds([]);
        setStudentName("Aarav");
      },
    }),
    [
      answers,
      completedTaskIds,
      connectedMentorIds,
      portfolioItems,
      selectedCareer,
      selectedCareerId,
      studentName,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within DemoProvider");
  }
  return context;
}
