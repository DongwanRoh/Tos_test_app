import type { Sentence, SentenceRecord, User, UserProgress } from '../types';

const API_BASE = '/api';
const TOKEN_KEY = 'speaktos_token';
const GUEST_PROGRESS_KEY = 'speaktos_guest_progress';

export const api = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async fetchSentences(): Promise<Sentence[]> {
    try {
      const res = await fetch(`${API_BASE}/sentences`);
      if (!res.ok) throw new Error('Failed to fetch sentences');
      const data = await res.json();
      return data.sentences;
    } catch (e) {
      console.warn('API offline, falling back to local sentences', e);
      return [];
    }
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '로그인 실패');
    this.setToken(data.token);
    return data;
  },

  async register(email: string, password: string, username?: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '회원가입 실패');
    this.setToken(data.token);
    return data;
  },

  async getMe(): Promise<{ user: User; progress: UserProgress } | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) {
        this.clearToken();
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  // Save Record
  async recordResult(sentenceId: number, isCorrect: boolean): Promise<SentenceRecord> {
    const token = this.getToken();
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/user/record`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ sentenceId, isCorrect }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.record;
        }
      } catch (err) {
        console.error('Record API error:', err);
      }
    }

    // Guest Mode fallback (localStorage)
    const guestProgress = this.getGuestProgress();
    const records = guestProgress.records || {};
    const prev = records[sentenceId] || {
      sentenceId,
      attempts: 0,
      correct: 0,
      incorrect: 0,
      consecutiveCorrect: 0,
      isBookmarked: false,
      lastReviewedAt: null,
      status: 'learning',
    };

    prev.attempts += 1;
    prev.lastReviewedAt = new Date().toISOString();
    if (isCorrect) {
      prev.correct += 1;
      prev.consecutiveCorrect += 1;
      if (prev.consecutiveCorrect >= 2) prev.status = 'mastered';
    } else {
      prev.incorrect += 1;
      prev.consecutiveCorrect = 0;
      prev.status = 'review';
    }

    records[sentenceId] = prev;
    guestProgress.records = records;
    this.saveGuestProgress(guestProgress);
    return prev;
  },

  async toggleBookmark(sentenceId: number): Promise<SentenceRecord> {
    const token = this.getToken();
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/user/bookmark`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ sentenceId }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.record;
        }
      } catch (err) {
        console.error('Bookmark API error:', err);
      }
    }

    // Guest Mode fallback
    const guestProgress = this.getGuestProgress();
    const records = guestProgress.records || {};
    const prev = records[sentenceId] || {
      sentenceId,
      attempts: 0,
      correct: 0,
      incorrect: 0,
      consecutiveCorrect: 0,
      isBookmarked: false,
      lastReviewedAt: null,
      status: 'learning',
    };
    prev.isBookmarked = !prev.isBookmarked;
    records[sentenceId] = prev;
    guestProgress.records = records;
    this.saveGuestProgress(guestProgress);
    return prev;
  },

  getGuestProgress(): UserProgress {
    try {
      const data = localStorage.getItem(GUEST_PROGRESS_KEY);
      return data ? JSON.parse(data) : { records: {}, streak: 1, lastStudyDate: null };
    } catch {
      return { records: {}, streak: 1, lastStudyDate: null };
    }
  },

  saveGuestProgress(progress: UserProgress) {
    try {
      localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error(e);
    }
  },
};
