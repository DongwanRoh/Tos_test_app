export interface Sentence {
  id: number;
  category: 'core_verb' | 'topic' | 'pattern' | 'modifier';
  categoryName: string;
  subcategory: string;
  pattern: string;
  korean: string;
  english: string;
  keyExpression: string;
  difficulty: number;
  parts?: number[];
}

export interface TestOptions {
  questionCount: number; // default 20
  partFilter: number | 'all'; // 'all', 2, 3, 4, 5
  categoryFilter: string; // 'all', 'core_verb', 'topic', 'pattern', 'modifier'
  difficultyFilter: number | 'all'; // 'all', 1, 2
  statusFilter: 'smart' | 'all' | 'unlearned' | 'wrong' | 'bookmarked';
}

export interface SentenceRecord {
  sentenceId: number;
  attempts: number;
  correct: number;
  incorrect: number;
  consecutiveCorrect: number;
  isBookmarked: boolean;
  lastReviewedAt: string | null;
  status: 'learning' | 'mastered' | 'review';
}

export interface UserProgress {
  records: Record<number, SentenceRecord>;
  streak: number;
  lastStudyDate: string | null;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export type TabType = 'study' | 'test' | 'notebook' | 'all' | 'stats';

export interface AppSettings {
  autoPlayTts: boolean;
  speechRate: number;
  timerDuration: number; // 0 for off, or 5/10 seconds
}
