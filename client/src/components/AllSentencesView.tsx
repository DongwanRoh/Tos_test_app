import React, { useState, useMemo } from 'react';
import type { Sentence, SentenceRecord } from '../types';
import { speakEnglish } from '../utils/speech';
import { Search, Volume2, Bookmark, CheckCircle2 } from 'lucide-react';

interface AllSentencesViewProps {
  sentences: Sentence[];
  records: Record<number, SentenceRecord>;
  onBookmark: (sentenceId: number) => void;
}

export const AllSentencesView: React.FC<AllSentencesViewProps> = ({
  sentences,
  records,
  onBookmark,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activePart, setActivePart] = useState<number | 'all'>('all');

  const filtered = useMemo(() => {
    return sentences.filter((s) => {
      const matchCat = activeCategory === 'all' || s.category === activeCategory;
      const matchPart =
        activePart === 'all' || (s.parts && s.parts.includes(activePart as number));
      const term = searchTerm.toLowerCase().trim();
      const matchText =
        !term ||
        s.korean.toLowerCase().includes(term) ||
        s.english.toLowerCase().includes(term) ||
        s.pattern.toLowerCase().includes(term) ||
        s.subcategory.toLowerCase().includes(term);
      return matchCat && matchPart && matchText;
    });
  }, [sentences, activeCategory, activePart, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="문장 검색 (예: 지하철, discount, can)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{ paddingLeft: 38 }}
        />
        <Search
          size={16}
          color="#94a3b8"
          style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>

      {/* Part Filter Pills */}
      <div className="category-scroller">
        {[
          { id: 'all', label: '전체 파트' },
          { id: 2, label: 'Part 2 (사진)' },
          { id: 3, label: 'Part 3 (질답)' },
          { id: 4, label: 'Part 4 (정보)' },
          { id: 5, label: 'Part 5 (의견)' },
        ].map((p) => (
          <button
            key={p.id}
            className={`cat-pill ${activePart === p.id ? 'active' : ''}`}
            style={{
              background: activePart === p.id ? 'rgba(168, 85, 247, 0.25)' : undefined,
              borderColor: activePart === p.id ? '#a855f7' : undefined,
              color: activePart === p.id ? '#f5d0fe' : undefined,
            }}
            onClick={() => setActivePart(p.id as any)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="category-scroller">
        {[
          { id: 'all', label: '전체' },
          { id: 'core_verb', label: '기본동사' },
          { id: 'topic', label: '빈출주제' },
          { id: 'pattern', label: '핵심구문' },
          { id: 'modifier', label: '형용사/부사' },
        ].map((c) => (
          <button
            key={c.id}
            className={`cat-pill ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>검색 결과: 총 {filtered.length}개 문장</span>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((s) => {
          const rec = records[s.id];
          const isMastered = rec?.status === 'mastered';
          const isBookmarked = Boolean(rec?.isBookmarked);

          return (
            <div key={s.id} className="glass-panel" style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {s.parts && s.parts.length > 0 && (
                    <span
                      style={{
                        background: 'rgba(168, 85, 247, 0.25)',
                        color: '#e9d5ff',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: 5,
                        border: '1px solid rgba(168, 85, 247, 0.35)',
                      }}
                    >
                      P{s.parts.join(',')}
                    </span>
                  )}
                  <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 600 }}>
                    #{s.id} {s.categoryName} • {s.pattern}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {isMastered && (
                    <span style={{ fontSize: '0.7rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 700 }}>
                      <CheckCircle2 size={12} /> 마스터
                    </span>
                  )}
                  <button
                    className="icon-btn"
                    style={{ width: 28, height: 28 }}
                    onClick={() => speakEnglish(s.english)}
                    title="발음 듣기"
                  >
                    <Volume2 size={13} color="#818cf8" />
                  </button>
                  <button
                    className="icon-btn"
                    style={{ width: 28, height: 28 }}
                    onClick={() => onBookmark(s.id)}
                    title="북마크 토글"
                  >
                    <Bookmark size={13} color={isBookmarked ? '#f59e0b' : '#94a3b8'} fill={isBookmarked ? '#f59e0b' : 'none'} />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>
                {s.korean}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#38bdf8' }}>
                {s.english}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
