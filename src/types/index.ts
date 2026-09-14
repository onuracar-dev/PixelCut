export type UserRole = 'student' | 'teacher' | 'dev';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  studentNo?: string;
  role: UserRole;
  avatarUrl: string;
  classCode: string;
  createdAt?: string;
}

export type ChallengeCategory = 'card' | 'navbar' | 'hero' | 'table' | 'form' | 'pricing' | 'footer';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  difficulty: 'Kolay' | 'Orta' | 'İleri' | 'Uzman';
  targetImageUrl: string;
  targetWidth: number;
  targetHeight: number;
  starterHtml: string;
  starterCss: string;
  hints: string[];
  maxLinesGoal?: number;
  externalLibraries?: string[];
  status?: 'active' | 'draft' | 'archived';
  authorName?: string;
  targetSliceNote?: string;
  createdAt: string;
  roomType?: 'live_lab' | 'homework' | 'practice';
  deadline?: string;
  deadlineTimestamp?: number;
  xpReward?: number;
  isCompleted?: boolean;
  activeStudentsCount?: number;
}

export interface StudentLiveState {
  studentId: string;
  studentName: string;
  studentNo: string;
  avatarUrl: string;
  html: string;
  css: string;
  visualMatch: number;      // e.g. 94.2 (%)
  cleanScore?: number;       // e.g. 98.0 (%)
  linesCount: number;       // e.g. 48 lines
  unusedCssPercent?: number; // e.g. 3.5 (%)
  lastActive: number;       // timestamp
  status: 'coding' | 'idle' | 'scanning' | 'submitted' | 'approved' | 'needs_help';
  helpTopic?: string;
  helpRequestedAt?: number;
  teacherFeedback?: string;
  grade?: number;
}

export interface LiveAssistanceSession {
  studentId: string;
  studentName: string;
  studentNo: string;
  avatarUrl: string;
  mode: 'observe' | 'assist';
  helpTopic?: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  studentNo: string;
  avatarUrl: string;
  totalScore: number;
  visualScore: number;
  cleanScore: number;
  speedMinutes: number;
  linesCount?: number;
  streakDays?: number;
  trend?: "up" | "down" | "same";
  trendDelta?: number;
  recentChallenge?: string;
  badges: Array<{
    id: string;
    label: string;
    icon: string;
    description: string;
  }>;
}
