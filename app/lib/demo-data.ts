export type DiscoveryAnswers = {
  fun: string[];
  enjoyedSubjects: string[];
  leastSubjects: string[];
  careerThought: string;
  learningStyle: string;
  classLevel: string;
};

export type Career = {
  id: string;
  title: string;
  cluster: string;
  icon: string;
  color: "purple" | "lime" | "coral" | "blue";
  summary: string;
  detail: string;
  keywords: string[];
  subjects: string[];
  activities: string[];
};

export const funOptions = [
  "Building things",
  "Solving puzzles",
  "Telling stories",
  "Helping people",
  "Designing things",
  "Leading a team",
  "Working with numbers",
  "Figuring out how things work",
];

export const subjectOptions = [
  "Math",
  "Science",
  "Computer Science",
  "English",
  "Art",
  "Social Studies",
  "Economics",
  "Biology",
  "Physics",
  "Chemistry",
];

export const learningOptions = [
  "Watching videos",
  "Reading",
  "Hands-on projects",
  "Talking it through with someone",
];

export const demoAnswers: DiscoveryAnswers = {
  fun: ["Building things", "Solving puzzles", "Figuring out how things work"],
  enjoyedSubjects: ["Math", "Computer Science", "Science"],
  leastSubjects: ["Biology"],
  careerThought: "Maybe software or robotics",
  learningStyle: "Hands-on projects",
  classLevel: "8",
};

export const careers: Career[] = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    cluster: "Technology",
    icon: "</>",
    color: "purple",
    summary: "Build apps, systems, and tools by turning hard problems into clear steps.",
    detail:
      "Software engineers mix logic with creativity. They understand a problem, design a solution, write code, test it, and keep improving it with a team.",
    keywords: ["software", "coding", "computer", "app", "technology"],
    subjects: ["Math", "Computer Science", "Physics"],
    activities: ["Building things", "Solving puzzles", "Figuring out how things work"],
  },
  {
    id: "ux-designer",
    title: "UX / Product Designer",
    cluster: "Design",
    icon: "UX",
    color: "coral",
    summary: "Make digital products simpler, more useful, and more enjoyable for people.",
    detail:
      "Product designers observe people, sketch ideas, build prototypes, and test whether their solution actually makes an experience better.",
    keywords: ["design", "creative", "product", "drawing"],
    subjects: ["Art", "English", "Computer Science"],
    activities: ["Designing things", "Helping people", "Figuring out how things work"],
  },
  {
    id: "robotics-engineer",
    title: "Robotics Engineer",
    cluster: "Engineering",
    icon: "RB",
    color: "lime",
    summary: "Combine mechanics, electronics, and code to create machines that can act.",
    detail:
      "Robotics engineers prototype moving systems, program sensors, solve hardware problems, and work across mechanical and software teams.",
    keywords: ["robot", "machine", "engineering", "electronics"],
    subjects: ["Math", "Physics", "Computer Science", "Science"],
    activities: ["Building things", "Solving puzzles", "Figuring out how things work"],
  },
  {
    id: "doctor",
    title: "Doctor / Medical Specialist",
    cluster: "Medicine",
    icon: "+",
    color: "blue",
    summary: "Use science, careful reasoning, and empathy to improve people’s health.",
    detail:
      "Doctors listen, investigate symptoms, interpret evidence, make decisions under pressure, and support patients through treatment and recovery.",
    keywords: ["doctor", "medicine", "health", "hospital"],
    subjects: ["Biology", "Chemistry", "Science"],
    activities: ["Helping people", "Solving puzzles", "Figuring out how things work"],
  },
  {
    id: "biomedical-researcher",
    title: "Biomedical Researcher",
    cluster: "Science",
    icon: "DNA",
    color: "lime",
    summary: "Investigate diseases and design better ways to prevent or treat them.",
    detail:
      "Biomedical researchers plan experiments, analyse evidence, work in laboratories, and turn scientific questions into discoveries that can improve care.",
    keywords: ["research", "biology", "science", "medicine"],
    subjects: ["Biology", "Chemistry", "Math"],
    activities: ["Solving puzzles", "Helping people", "Figuring out how things work"],
  },
  {
    id: "entrepreneur",
    title: "Entrepreneur / Business Builder",
    cluster: "Business",
    icon: "UP",
    color: "purple",
    summary: "Spot useful opportunities, bring people together, and turn ideas into ventures.",
    detail:
      "Entrepreneurs research needs, test ideas, communicate clearly, manage money, and lead teams through uncertainty.",
    keywords: ["business", "startup", "founder", "lead"],
    subjects: ["Economics", "Math", "English"],
    activities: ["Leading a team", "Working with numbers", "Helping people"],
  },
  {
    id: "journalist",
    title: "Journalist / Storyteller",
    cluster: "Media",
    icon: "ST",
    color: "blue",
    summary: "Find important stories, ask strong questions, and explain what matters clearly.",
    detail:
      "Journalists research, interview, verify information, and shape stories for print, video, audio, or digital platforms.",
    keywords: ["write", "story", "journal", "media", "news"],
    subjects: ["English", "Social Studies", "Economics"],
    activities: ["Telling stories", "Helping people", "Figuring out how things work"],
  },
  {
    id: "animator",
    title: "Animator / Visual Creator",
    cluster: "Arts",
    icon: "FX",
    color: "coral",
    summary: "Bring stories and ideas to life through movement, illustration, and visual worlds.",
    detail:
      "Animators combine drawing, storytelling, timing, software, and collaboration to create films, games, explainers, and interactive experiences.",
    keywords: ["animation", "art", "film", "visual", "creative"],
    subjects: ["Art", "English", "Computer Science"],
    activities: ["Telling stories", "Designing things", "Building things"],
  },
  {
    id: "environmental-scientist",
    title: "Environmental Scientist",
    cluster: "Science",
    icon: "ECO",
    color: "lime",
    summary: "Study natural systems and design practical responses to environmental problems.",
    detail:
      "Environmental scientists collect field data, analyse patterns, communicate risks, and help communities or governments make evidence-based choices.",
    keywords: ["environment", "nature", "climate", "science"],
    subjects: ["Science", "Biology", "Geography", "Chemistry"],
    activities: ["Helping people", "Solving puzzles", "Figuring out how things work"],
  },
];

export function scoreCareers(answers: DiscoveryAnswers) {
  const thought = answers.careerThought.toLowerCase();
  return careers
    .map((career, index) => {
      const activityScore = career.activities.filter((item) =>
        answers.fun.includes(item),
      ).length * 4;
      const subjectScore = career.subjects.filter((item) =>
        answers.enjoyedSubjects.includes(item),
      ).length * 3;
      const dislikePenalty = career.subjects.filter((item) =>
        answers.leastSubjects.includes(item),
      ).length * 2;
      const thoughtScore = career.keywords.some((keyword) =>
        thought.includes(keyword),
      )
        ? 5
        : 0;
      return {
        career,
        score: activityScore + subjectScore + thoughtScore - dislikePenalty - index / 100,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item, index) => ({
      ...item.career,
      match: Math.max(76, 94 - index * 7),
      why: buildCareerReason(item.career, answers),
    }));
}

function buildCareerReason(career: Career, answers: DiscoveryAnswers) {
  const matchingActivities = career.activities.filter((item) => answers.fun.includes(item));
  const matchingSubjects = career.subjects.filter((item) => answers.enjoyedSubjects.includes(item));
  const activityText = matchingActivities.slice(0, 2).join(" and ").toLowerCase();
  const subjectText = matchingSubjects.slice(0, 2).join(" and ");

  if (activityText && subjectText) {
    return `You chose ${activityText}, and ${subjectText} are subjects you enjoy. That combination shows up often in the way ${career.title.toLowerCase()}s think and work.`;
  }
  if (activityText) {
    return `You said you enjoy ${activityText}. This path gives you a practical way to use that energy on real problems.`;
  }
  if (subjectText) {
    return `${subjectText} stood out in your answers. This direction turns those subjects into work you can test through small projects.`;
  }
  return `Your answers suggest you like learning through ${answers.learningStyle.toLowerCase() || "real experiences"}. This is a useful direction to explore before making a bigger commitment.`;
}

export const roadmapStages = [
  {
    number: "01",
    label: "Now - Class 8",
    status: "In progress",
    progress: 58,
    title: "Build the foundations",
    description: "Learn how code works and finish one project you can proudly explain.",
    tasks: [
      { label: "Learn Python basics", done: true },
      { label: "Join a coding club or community", done: true },
      { label: "Build a simple calculator app", done: false },
    ],
  },
  {
    number: "02",
    label: "Class 9-10",
    status: "Upcoming",
    progress: 0,
    title: "Practise on real challenges",
    description: "Strengthen problem-solving and turn practice into visible proof.",
    tasks: [
      { label: "Learn data structures and problem-solving", done: false },
      { label: "Enter a regional coding competition", done: false },
      { label: "Build two portfolio projects", done: false },
    ],
  },
  {
    number: "03",
    label: "Class 11-12",
    status: "Upcoming",
    progress: 0,
    title: "Prepare for the next leap",
    description: "Deepen your fundamentals and get experience outside the classroom.",
    tasks: [
      { label: "Deepen core CS fundamentals", done: false },
      { label: "Prepare for entrance exams", done: false },
      { label: "Try an internship or open-source contribution", done: false },
    ],
  },
];

export const skills = [
  { id: "python", name: "Python", level: 2, color: "purple", next: "Complete 2 more Python projects to reach Level 3." },
  { id: "problem-solving", name: "Problem Solving", level: 3, color: "lime", next: "Solve 8 medium-difficulty challenges to reach Level 4." },
  { id: "data-structures", name: "Data Structures", level: 1, color: "blue", next: "Finish the arrays and lists practice set to reach Level 2." },
  { id: "web-development", name: "Web Development", level: 1, color: "coral", next: "Build and publish one responsive webpage to reach Level 2." },
  { id: "git", name: "Git / Version Control", level: 1, color: "purple", next: "Make 10 meaningful commits in your next project to reach Level 2." },
];

export const weeklyTasks = [
  { id: "python-functions", type: "Watch", title: "Intro to Python Functions", time: "20 min", color: "purple" },
  { id: "codesprint", type: "Enter", title: "Junior CodeSprint - Regional Round", time: "Closes in 5 days", color: "lime" },
  { id: "engineer-life", type: "Read", title: "A day in the life of a software engineer", time: "5 min read", color: "blue" },
];

export const initialPortfolio = [
  { id: "calculator", type: "Project", title: "My First Python Project", subtitle: "Calculator App", date: "12 Aug 2026", icon: "PY", color: "purple" },
  { id: "codesprint-finalist", type: "Achievement", title: "Junior CodeSprint 2026", subtitle: "Regional Finalist", date: "02 Aug 2026", icon: "01", color: "lime" },
  { id: "python-certificate", type: "Certificate", title: "Intro to Python", subtitle: "Certificate of Completion", date: "24 Jul 2026", icon: "OK", color: "blue" },
];

export const competitions = [
  { id: 1, field: "Coding", name: "Junior CodeSprint", date: "23 Aug", eligibility: "Classes 7-10", location: "Online", difficulty: "Beginner", description: "A two-hour problem-solving sprint for first-time competitive coders." },
  { id: 2, field: "Robotics", name: "RoboQuest India", date: "05 Sep", eligibility: "Classes 6-10", location: "Delhi", difficulty: "Intermediate", description: "Build and program a robot to complete an arena challenge." },
  { id: 3, field: "Design", name: "Young UX Challenge", date: "12 Sep", eligibility: "Classes 8-12", location: "Online", difficulty: "Beginner", description: "Redesign a school experience and present a clickable prototype." },
  { id: 4, field: "Business", name: "Teen Venture Pitch", date: "18 Sep", eligibility: "Classes 9-12", location: "Mumbai", difficulty: "Intermediate", description: "Pitch a useful, sustainable idea to founders and student judges." },
  { id: 5, field: "Medicine", name: "BioSolve Olympiad", date: "27 Sep", eligibility: "Classes 9-12", location: "Online", difficulty: "Advanced", description: "Apply biology and health science to real public-health scenarios." },
  { id: 6, field: "Coding", name: "Hack the School Day", date: "04 Oct", eligibility: "Classes 6-12", location: "Bengaluru", difficulty: "Beginner", description: "Create a small digital solution for a problem students face every day." },
  { id: 7, field: "Robotics", name: "National Bot League", date: "18 Oct", eligibility: "Classes 8-12", location: "Pune", difficulty: "Advanced", description: "Team robotics league covering mechanics, sensors, and autonomous code." },
  { id: 8, field: "Design", name: "Design for Everyone", date: "02 Nov", eligibility: "Classes 6-10", location: "Online", difficulty: "Intermediate", description: "Design an inclusive product for a person whose needs are often missed." },
  { id: 9, field: "Business", name: "Social Impact Founders", date: "14 Nov", eligibility: "Classes 8-12", location: "Hyderabad", difficulty: "Beginner", description: "Turn a local problem into a basic business model and three-minute pitch." },
  { id: 10, field: "Medicine", name: "Future Health Innovators", date: "29 Nov", eligibility: "Classes 10-12", location: "Delhi", difficulty: "Intermediate", description: "Explore diagnostics, prevention, and patient experience through a team case." },
];

export const resourceCollections = {
  "Software Engineering": [
    { name: "CS50x", provider: "Harvard", level: "Beginner", price: "Free", note: "A broad, rigorous introduction to computer science." },
    { name: "Responsive Web Design", provider: "freeCodeCamp", level: "Beginner", price: "Free", note: "Build practical web pages through hands-on exercises." },
    { name: "Computer Programming", provider: "Khan Academy", level: "Starter", price: "Free", note: "Friendly visual lessons for a first experience with code." },
    { name: "Python for Everybody", provider: "University of Michigan", level: "Beginner", price: "Audit free", note: "A structured path through Python and data basics." },
  ],
  "Product Design": [
    { name: "Google UX Design", provider: "Google", level: "Beginner", price: "Paid", note: "A project-led introduction to user experience design." },
    { name: "Design Thinking", provider: "IDEO U", level: "Starter", price: "Free resources", note: "Activities for understanding people and testing ideas." },
    { name: "Figma Learn", provider: "Figma", level: "Starter", price: "Free", note: "Official lessons for layouts, components, and prototypes." },
  ],
  Medicine: [
    { name: "Health and Medicine", provider: "Khan Academy", level: "Beginner", price: "Free", note: "Clear foundations across human biology and medicine." },
    { name: "OpenLearn Health", provider: "The Open University", level: "Starter", price: "Free", note: "Short courses introducing health and care topics." },
    { name: "Anatomy & Physiology", provider: "Crash Course", level: "Beginner", price: "Free", note: "Fast, visual introductions to body systems." },
  ],
};

export const communities = [
  { id: "software", name: "Future Software Engineers", members: "2.4k", color: "purple", description: "Projects, coding questions, and weekly build prompts.", posts: ["I finished my first Python game!", "Which competition is good for a beginner?", "Our weekend study room starts at 5 PM."] },
  { id: "medicine", name: "Aspiring Doctors", members: "1.8k", color: "blue", description: "Biology, health careers, and practical exploration ideas.", posts: ["Sharing my notes on the circulatory system.", "What does a radiologist actually do?", "Free anatomy workshop this Sunday."] },
  { id: "design", name: "Young Designers", members: "1.3k", color: "coral", description: "Feedback, visual challenges, and product teardowns.", posts: ["Can you review my school timetable redesign?", "Today’s challenge: improve a water bottle.", "Three accessibility tips I learned this week."] },
  { id: "business", name: "Business Builders", members: "980", color: "lime", description: "Ideas, pitch practice, and student founder stories.", posts: ["My first customer interview was surprising.", "How do you price a student service?", "Pitch practice room is open tonight."] },
];

export const mentors = [
  { id: "ananya", name: "Ananya Mehta", initials: "AM", background: "3rd-year CS student, IIT Delhi", field: "Technology", focus: "First coding projects", color: "purple" },
  { id: "kabir", name: "Kabir Nair", initials: "KN", background: "Robotics lead, student innovation lab", field: "Robotics", focus: "Hardware and competitions", color: "lime" },
  { id: "meera", name: "Meera Rao", initials: "MR", background: "Product designer at an education startup", field: "Design", focus: "UX portfolios", color: "coral" },
  { id: "ishaan", name: "Ishaan Kapoor", initials: "IK", background: "Medical student, AIIMS New Delhi", field: "Medicine", focus: "Exploring medical careers", color: "blue" },
  { id: "zoya", name: "Zoya Khan", initials: "ZK", background: "Founder of a youth climate venture", field: "Business", focus: "Ideas and pitching", color: "lime" },
  { id: "arjun", name: "Arjun Sen", initials: "AS", background: "Open-source contributor and developer", field: "Technology", focus: "Git and collaboration", color: "purple" },
  { id: "tara", name: "Tara Joseph", initials: "TJ", background: "Visual storyteller and animator", field: "Arts", focus: "Creative portfolios", color: "coral" },
  { id: "dev", name: "Dev Malhotra", initials: "DM", background: "Data science student, BITS Pilani", field: "Technology", focus: "Math and data", color: "blue" },
];

export const featureCards = [
  { icon: "SK", title: "Skill Tracker", text: "See what you can do now and exactly what unlocks the next level.", color: "purple" },
  { icon: "WK", title: "Weekly Action Plan", text: "Turn a big career goal into three realistic things to do this week.", color: "lime" },
  { icon: "PF", title: "Portfolio Builder", text: "Collect projects, certificates, and competition proof as you grow.", color: "coral" },
  { icon: "CP", title: "Competition Calendar", text: "Find age-appropriate chances to test your skills in the real world.", color: "blue" },
  { icon: "CM", title: "Community", text: "Learn alongside students who are aiming at similar futures.", color: "purple" },
  { icon: "MT", title: "Mentor Connect", text: "Ask people a few steps ahead what the path actually feels like.", color: "lime" },
  { icon: "AI", title: "AI Chat Guide", text: "Get goal-aware answers without waiting for the next counselling session.", color: "blue" },
  { icon: "RS", title: "Resource Library", text: "Choose useful learning resources organised around your current goal.", color: "coral" },
];
