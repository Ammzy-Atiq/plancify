import {
  careers,
  demoAnswers,
  funOptions,
  initialPortfolio,
  learningOptions,
  mentors,
  subjectOptions,
  weeklyTasks,
  type DiscoveryAnswers,
} from "@/app/lib/demo-data";

export type PortfolioItem = {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  date: string;
  icon: string;
  color: "purple" | "lime" | "coral" | "blue";
};

export type StudentWorkspaceState = {
  answers: DiscoveryAnswers;
  selectedCareerId: string;
  completedTaskIds: string[];
  portfolioItems: PortfolioItem[];
  connectedMentorIds: string[];
  studentName: string;
};

const allowedCareerIds = new Set(careers.map((career) => career.id));
const allowedTaskIds = new Set(weeklyTasks.map((task) => task.id));
const allowedMentorIds = new Set(mentors.map((mentor) => mentor.id));
const allowedFun = new Set(funOptions);
const allowedSubjects = new Set(subjectOptions);
const allowedLearningStyles = new Set(learningOptions);
const allowedColors = new Set(["purple", "lime", "coral", "blue"]);

export function createDefaultWorkspaceState(): StudentWorkspaceState {
  return {
    answers: {
      ...demoAnswers,
      fun: [...demoAnswers.fun],
      enjoyedSubjects: [...demoAnswers.enjoyedSubjects],
      leastSubjects: [...demoAnswers.leastSubjects],
    },
    selectedCareerId: careers[0].id,
    completedTaskIds: ["python-functions"],
    portfolioItems: initialPortfolio.map((item) => ({
      ...item,
      color: item.color as PortfolioItem["color"],
    })),
    connectedMentorIds: [],
    studentName: "Aarav",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function cleanStringList(
  value: unknown,
  allowed: Set<string>,
  maximum: number,
) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string =>
    typeof item === "string" && allowed.has(item),
  ))].slice(0, maximum);
}

export function parseWorkspaceState(value: unknown): StudentWorkspaceState | null {
  if (!isRecord(value) || !isRecord(value.answers)) return null;

  const studentName = cleanText(value.studentName, 60);
  const careerId = cleanText(value.selectedCareerId, 80);
  const classLevel = cleanText(value.answers.classLevel, 2);
  const careerThought = cleanText(value.answers.careerThought, 300);
  const learningStyle = cleanText(value.answers.learningStyle, 80);

  if (
    studentName.length < 1 ||
    !allowedCareerIds.has(careerId) ||
    !/^(?:[6-9]|1[0-2])$/.test(classLevel) ||
    !allowedLearningStyles.has(learningStyle)
  ) {
    return null;
  }

  const portfolioItems = Array.isArray(value.portfolioItems)
    ? value.portfolioItems.slice(0, 50).flatMap((item) => {
        if (!isRecord(item)) return [];
        const id = cleanText(item.id, 100);
        const type = cleanText(item.type, 60);
        const title = cleanText(item.title, 160);
        const subtitle = cleanText(item.subtitle, 200);
        const date = cleanText(item.date, 40);
        const icon = cleanText(item.icon, 12);
        const color = cleanText(item.color, 12);
        if (!id || !type || !title || !allowedColors.has(color)) return [];
        return [{
          id,
          type,
          title,
          subtitle,
          date,
          icon,
          color: color as PortfolioItem["color"],
        }];
      })
    : [];

  return {
    studentName,
    selectedCareerId: careerId,
    answers: {
      fun: cleanStringList(value.answers.fun, allowedFun, 8),
      enjoyedSubjects: cleanStringList(value.answers.enjoyedSubjects, allowedSubjects, 10),
      leastSubjects: cleanStringList(value.answers.leastSubjects, allowedSubjects, 10),
      careerThought,
      learningStyle,
      classLevel,
    },
    completedTaskIds: cleanStringList(value.completedTaskIds, allowedTaskIds, 10),
    portfolioItems,
    connectedMentorIds: cleanStringList(value.connectedMentorIds, allowedMentorIds, 20),
  };
}

export function workspaceCompletion(state: StudentWorkspaceState) {
  const taskProgress = Math.round((state.completedTaskIds.length / weeklyTasks.length) * 100);
  const discoveryComplete = [
    state.answers.fun.length > 0,
    state.answers.enjoyedSubjects.length > 0,
    state.answers.leastSubjects.length > 0,
    Boolean(state.answers.careerThought),
    Boolean(state.answers.learningStyle),
    Boolean(state.answers.classLevel),
  ].filter(Boolean).length;
  return {
    taskProgress,
    discoveryProgress: Math.round((discoveryComplete / 6) * 100),
    portfolioCount: state.portfolioItems.length,
  };
}
