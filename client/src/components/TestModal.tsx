import React, { useState, useMemo } from 'react';
import type { Sentence, SentenceRecord, TestOptions } from '../types';
import { X, Play, BrainCircuit, Sparkles, Layers, Sliders, CheckCircle2, Bookmark, Flame } from 'lucide-react';

interface TestModalProps {
  isOpen: boolean;
  sentences: Sentence[];
  records: Record<number, SentenceRecord>;
  onClose: () => void;
  onStartTest: (selectedSentences: Sentence[], options: TestOptions) => void;
}

export const TestModal: React.FC<TestModalProps> = ({
  isOpen,
  sentences,
  records,
  onClose,
  onStartTest,
}) => {
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [partFilter, setPartFilter] = useState<number | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TestOptions['statusFilter']>('smart');

  // Compute matching sentence count
  const matchingCount = useMemo(() => {
    return sentences.filter((s) => {
      if (partFilter !== 'all' && (!s.parts || !s.parts.includes(partFilter as number))) {
        return false;
      }
      if (categoryFilter !== 'all' && s.category !== categoryFilter) {
        return false;
      }
      if (difficultyFilter !== 'all' && s.difficulty !== difficultyFilter) {
        return false;
      }
      const rec = records[s.id];
      if (statusFilter === 'unlearned') {
        return !rec || rec.attempts === 0;
      }
      if (statusFilter === 'wrong') {
        return rec && (rec.incorrect > 0 || rec.status === 'review');
      }
      if (statusFilter === 'bookmarked') {
        return rec && rec.isBookmarked;
      }
      return true;
    }).length;
  }, [sentences, records, partFilter, categoryFilter, difficultyFilter, statusFilter]);

  if (!isOpen) return null;

  const handleStart = () => {
    const options: TestOptions = {
      questionCount,
      partFilter,
      categoryFilter,
      difficultyFilter,
      statusFilter,
    };
    onStartTest(sentences, options);
  };

  const parts = [
    { id: 'all', label: '전체 파트' },
    { id: 2, label: 'Part 2 (사진 묘사)' },
    { id: 3, label: 'Part 3 (질문 응답)' },
    { id: 4, label: 'Part 4 (정보 전달)' },
    { id: 5, label: 'Part 5 (의견 제시)' },
  ];

  const categories = [
    { id: 'all', label: '전체 카테고리' },
    { id: 'core_verb', label: '기본동사' },
    { id: 'topic', label: '빈출주제' },
    { id: 'pattern', label: '핵심구문' },
    { id: 'modifier', label: '형용사/부사' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="glass-panel"
        style={{
          width: '94%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          position: 'relative',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="icon-btn"
          style={{ position: 'absolute', right: 18, top: 18 }}
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px 0' }}>
            스피킹 실전 테스트
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
            원하는 조건과 문항 수를 선택하여 테스트를 시작하세요
          </p>
        </div>

        {/* Section: Output Count */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Sliders size={15} color="#818cf8" /> 출제 문항 수
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {[10, 20, 30, 50].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => setQuestionCount(cnt)}
                style={{
                  padding: '9px 0',
                  borderRadius: 12,
                  border: questionCount === cnt ? '1.5px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                  background: questionCount === cnt ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)',
                  color: questionCount === cnt ? '#fff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cnt}문항 {cnt === 20 && <span style={{ fontSize: '0.68rem', color: '#a5b4fc', display: 'block' }}>추천</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Section: TOEIC Speaking Part Selection */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Layers size={15} color="#a855f7" /> 토익스피킹 파트 분류
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {parts.map((p) => {
              const isActive = partFilter === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPartFilter(p.id as any)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 10,
                    border: isActive ? '1.5px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                    background: isActive ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: isActive ? '#f5d0fe' : '#94a3b8',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Category Selection */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Sparkles size={15} color="#38bdf8" /> 카테고리 분류
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {categories.map((c) => {
              const isActive = categoryFilter === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryFilter(c.id)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 10,
                    border: isActive ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    background: isActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                    color: isActive ? '#bae6fd' : '#94a3b8',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section: Smart Algorithm & Status Filter */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <BrainCircuit size={15} color="#34d399" /> 출제 알고리즘 / 학습 필터
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              {
                id: 'smart',
                title: '스마트 취약점 가중치 출제 (추천)',
                desc: '오답 문장 40% 우선 배정 + 오래 안 본 문장 복습 + 북마크 가중',
                icon: <BrainCircuit size={16} color="#34d399" />,
              },
              {
                id: 'wrong',
                title: '오답 및 복습 대상 문장만',
                desc: '이전에 틀렸거나 복습이 필요한 문장만 집중 출제',
                icon: <Flame size={16} color="#f43f5e" />,
              },
              {
                id: 'unlearned',
                title: '아직 학습하지 않은 문장만',
                desc: '한 번도 풀지 않은 새로운 문장 위주로 출제',
                icon: <CheckCircle2 size={16} color="#38bdf8" />,
              },
              {
                id: 'bookmarked',
                title: '북마크한 문장만',
                desc: '내가 별표(⭐) 표시해 둔 문장들로만 테스트 구성',
                icon: <Bookmark size={16} color="#f59e0b" />,
              },
              {
                id: 'all',
                title: '완전 무작위 랜덤 셔플',
                desc: '모든 문장을 동일한 확률로 무작위 추출',
                icon: <Sparkles size={16} color="#a5b4fc" />,
              },
            ].map((st) => {
              const isActive = statusFilter === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setStatusFilter(st.id as any)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: isActive ? '1.5px solid #34d399' : '1px solid rgba(255,255,255,0.06)',
                    background: isActive ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ flexShrink: 0 }}>{st.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? '#f0fdf4' : '#e2e8f0' }}>
                      {st.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{st.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Difficulty Filter */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: 8, display: 'block' }}>
            난이도 선택
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { id: 1, label: '기본' },
              { id: 2, label: '심화' },
              { id: 'all', label: '기본+심화' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDifficultyFilter(d.id as any)}
                style={{
                  padding: '8px 0',
                  borderRadius: 10,
                  border: difficultyFilter === d.id ? '1.5px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                  background: difficultyFilter === d.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.03)',
                  color: difficultyFilter === d.id ? '#fff' : '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Info & Start Button */}
        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: '12px 16px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            조건에 맞는 문장: <strong style={{ color: '#38bdf8' }}>{matchingCount}개</strong>
          </span>
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
            실제 출제: <strong style={{ color: '#34d399' }}>{Math.min(questionCount, matchingCount)}개</strong>
          </span>
        </div>

        <button
          id="btn-confirm-start-test"
          className="reveal-btn"
          disabled={matchingCount === 0}
          onClick={handleStart}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1rem',
            fontWeight: 800,
            background: matchingCount > 0 ? 'linear-gradient(135deg, #4f46e5, #9333ea)' : '#334155',
            opacity: matchingCount === 0 ? 0.5 : 1,
            cursor: matchingCount === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Play size={18} fill="#fff" />
          {matchingCount > 0 ? `${Math.min(questionCount, matchingCount)}문항 실전 테스트 시작하기` : '출제 가능한 문장이 없습니다'}
        </button>
      </div>
    </div>
  );
};
