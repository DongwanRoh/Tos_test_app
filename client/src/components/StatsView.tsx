import React from 'react';
import type { Sentence, SentenceRecord, User } from '../types';
import { Flame, Target, BarChart3, RotateCcw } from 'lucide-react';

interface StatsViewProps {
  sentences: Sentence[];
  records: Record<number, SentenceRecord>;
  streak: number;
  user: User | null;
  onReset: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  sentences,
  records,
  streak,
  user,
  onReset,
}) => {
  const totalSentences = sentences.length;
  const attemptedCount = Object.keys(records).length;

  const totalAttempts = Object.values(records).reduce((sum, r) => sum + r.attempts, 0);
  const totalCorrect = Object.values(records).reduce((sum, r) => sum + r.correct, 0);
  const masteredCount = Object.values(records).filter((r) => r.status === 'mastered').length;

  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const progressPercent = totalSentences > 0 ? Math.round((attemptedCount / totalSentences) * 100) : 0;

  // Category Breakdown
  const categories = [
    { id: 'core_verb', name: '기본동사' },
    { id: 'topic', name: '빈출주제' },
    { id: 'pattern', name: '핵심구문' },
    { id: 'modifier', name: '형용사/부사' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* User Greeting */}
      <div className="glass-panel" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>스피킹 학습 현황</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: 2 }}>
              {user ? `${user.username} 님의 리포트` : '게스트 모드 학습 리포트'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 12px', borderRadius: 20 }}>
            <Flame size={18} color="#f87171" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fca5a5' }}>
              {streak}일 연속 🔥
            </span>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="stats-banner">
        <div className="stat-box">
          <div className="stat-value" style={{ color: '#38bdf8' }}>{masteredCount}</div>
          <div className="stat-label">마스터한 문장</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: '#10b981' }}>{overallAccuracy}%</div>
          <div className="stat-label">스피킹 정답률</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ color: '#818cf8' }}>{totalAttempts}회</div>
          <div className="stat-label">총 발화 훈련</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="glass-panel" style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
          <span style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Target size={16} color="#818cf8" /> 전체 진도율
          </span>
          <span style={{ fontWeight: 700, color: '#818cf8' }}>
            {attemptedCount} / {totalSentences} ({progressPercent}%)
          </span>
        </div>
        <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
              borderRadius: 4,
            }}
          />
        </div>
      </div>

      {/* Category Progress */}
      <div className="glass-panel" style={{ padding: 18 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart3 size={16} color="#06b6d4" /> 카테고리별 마스터 현황
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {categories.map((cat) => {
            const catSentences = sentences.filter((s) => s.category === cat.id);
            const catMastered = catSentences.filter((s) => records[s.id]?.status === 'mastered').length;
            const percent = catSentences.length > 0 ? Math.round((catMastered / catSentences.length) * 100) : 0;

            return (
              <div key={cat.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                  <span style={{ color: '#cbd5e1' }}>{cat.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {catMastered} / {catSentences.length} ({percent}%)
                  </span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${percent}%`,
                      background: '#10b981',
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset Records Button */}
      <div style={{ marginTop: 10 }}>
        <button
          onClick={() => {
            if (confirm('모든 학습 기록과 오답노트를 초기화하시겠습니까?')) {
              onReset();
            }
          }}
          style={{
            width: '100%',
            padding: 12,
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            color: '#f87171',
            borderRadius: 12,
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <RotateCcw size={14} /> 학습 기록 전체 초기화
        </button>
      </div>
    </div>
  );
};
