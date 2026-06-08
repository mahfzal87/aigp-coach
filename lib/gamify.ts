// Gamification math: XP, levels, streaks, daily goals, achievements.

export const XP_PER_CORRECT = 10;
export const XP_PER_ATTEMPT = 2;
export const XP_LESSON_BONUS = 20;
export const XP_TEST_BONUS = 50;
export const DAILY_GOAL_XP = 40;
export const LESSON_PASS = 0.8; // 80% to "complete" a lesson

export function todayStr(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

function dayDiff(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

// Level curve: XP required to REACH level L = 50·(L-1)·L. So L1=0, L2=100, L3=300, L4=600…
export function levelFromXp(xp: number): { level: number; into: number; need: number; pct: number } {
  let level = 1;
  while (50 * level * (level + 1) <= xp) level++;
  const base = 50 * (level - 1) * level;
  const next = 50 * level * (level + 1);
  const into = Math.max(0, xp - base);
  const need = next - base;
  return { level, into, need, pct: need ? (into / need) * 100 : 0 };
}

export function updateStreak(
  prev: { streakCount: number; longestStreak: number; lastActiveDate: string | null },
  today: string
): { streakCount: number; longestStreak: number; lastActiveDate: string } {
  if (prev.lastActiveDate === today) return { ...prev, lastActiveDate: today };
  let count = 1;
  if (prev.lastActiveDate && dayDiff(prev.lastActiveDate, today) === 1) count = prev.streakCount + 1;
  return { streakCount: count, longestStreak: Math.max(prev.longestStreak, count), lastActiveDate: today };
}

// Streak is "alive" today only if last activity was today or yesterday.
export function streakAlive(lastActiveDate: string | null, today = todayStr()): boolean {
  if (!lastActiveDate) return false;
  return dayDiff(lastActiveDate, today) <= 1;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string; // lucide icon name
  test: (s: AchievementInput) => boolean;
}

export interface AchievementInput {
  xp: number;
  level: number;
  streakCount: number;
  attempts: number;
  correct: number;
  lessonsCompleted: number;
  mocksPassed: number;
  perfectLessons: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-step", name: "First Step", desc: "Answer your first question", icon: "Footprints", test: (s) => s.attempts >= 1 },
  { id: "ten-q", name: "Warming Up", desc: "Answer 10 questions", icon: "Flame", test: (s) => s.attempts >= 10 },
  { id: "hundred-q", name: "Centurion", desc: "Answer 100 questions", icon: "Swords", test: (s) => s.attempts >= 100 },
  { id: "streak-3", name: "On a Roll", desc: "3-day streak", icon: "Zap", test: (s) => s.streakCount >= 3 },
  { id: "streak-7", name: "Unstoppable", desc: "7-day streak", icon: "Rocket", test: (s) => s.streakCount >= 7 },
  { id: "first-lesson", name: "Lesson One", desc: "Complete a lesson", icon: "BookCheck", test: (s) => s.lessonsCompleted >= 1 },
  { id: "domain-done", name: "Domain Crusher", desc: "Complete 3 lessons", icon: "Trophy", test: (s) => s.lessonsCompleted >= 3 },
  { id: "perfect", name: "Flawless", desc: "Ace a lesson 100%", icon: "Star", test: (s) => s.perfectLessons >= 1 },
  { id: "level-5", name: "Rising Star", desc: "Reach level 5", icon: "TrendingUp", test: (s) => s.level >= 5 },
  { id: "mock-pass", name: "Exam Ready", desc: "Pass a mock exam", icon: "GraduationCap", test: (s) => s.mocksPassed >= 1 },
];
