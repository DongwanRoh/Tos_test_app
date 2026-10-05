import React, { useState } from 'react';
import type { Sentence, SentenceRecord } from '../types';
import { speakEnglish } from '../utils/speech';
import { Volume2, Bookmark, XCircle, Flame, ArrowRight } from 'lucide-react';

interface NotebookViewProps {
  sentences: Sentence[];
  records: Record<number, SentenceRecord>;
  onBookmark: (sentenceId: number) => void;
  onStartCustomStudy: (selectedSentences: Sentence[]) => void;
}

export const NotebookView: React.FC<NotebookViewProps> = ({
  sentences,
  records,
  onBookmark,
  onStartCustomStudy,
}) => {
  const [tab, setTab] = useState<'wrong' | 'bookmarked'>('wrong');

  const sentenceMap = new Map(sentences.map((s) => [s.id, s]));

  // Wrong sentences (incorrect > 0 or status == 'review')
  const wrongList = Object.values(records)
    .filter((r) => r.incorrect > 0)
    .sort((a, b) => b.incorrect - a.incorrect)
    .map((r) => ({ record: r, sentence: sentenceMap.get(r.sentenceId) }))
    .filter((item): item is { record: SentenceRecord; sentence: Sentence } => Boolean(item.sentence));

  // Bookmarked sentences
  const bookmarkedList = Object.values(records)
    .filter((r) => r.isBookmarked)
    .map((r) => ({ record: r, sentence: sentenceMap.get(r.sentenceId) }))
    .filter((item): item is { record: SentenceRecord; sentence: Sentence } => Boolean(item.sentence));

  const displayList = tab === 'wrong' ? wrongList : bookmarkedList;

  const handleStartReview = () => {
    const listToStudy = displayList.map((item) => item.sentence);
    if (listToStudy.length === 0) return;
    onStartCustomStudy(listToStudy);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Sub Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 4 }}>
        <button
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: 10,
            fontSize: '0.85rem',
            fontWeight: 700,
            color: tab === 'wrong' ? '#fff' : '#94a3b8',
            background: tab === 'wrong' ? 'rgba(244, 63, 94, 0.25)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onClick={() => setTab('wrong')}
        >
          <XCircle size={16} color={tab === 'wrong' ? '#fda4af' : '#94a3b8'} />
          오답노트 ({wrongList.length})
        </button>

        <button
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: 10,
            fontSize: '0.85rem',
            fontWeight: 700,
            color: tab === 'bookmarked' ? '#fff' : '#94a3b8',
            background: tab === 'bookmarked' ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onClick={() => setTab('bookmarked')}
        >
          <Bookmark size={16} color={tab === 'bookmarked' ? '#fcd34d' : '#94a3b8'} />
          북마크 ({bookmarkedList.length})
        </button>
      </div>

      {/* Focus Training Button */}
      {displayList.length > 0 && (
        <button
          onClick={handleStartReview}
          className="reveal-btn"
          style={{
            background: tab === 'wrong' ? 'linear-gradient(135deg, #e11d48, #f43f5e)' : 'linear-gradient(135deg, #d97706, #f59e0b)',
            padding: 12,
            fontSize: '0.92rem',
          }}
        >
          <Flame size={18} />
          {tab === 'wrong' ? '오답 문장만 집중 스피킹 훈련하기' : '북마크 문장 집중 훈련하기'}
          <ArrowRight size={16} />
        </button>
      )}

      {/* List */}
      {displayList.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {tab === 'wrong' ? '아직 오답 기록이 없습니다! 계속 스피킹에 도전해보세요 👏' : '북마크한 문장이 없습니다. 마음에 드는 문장을 별표로 저장해보세요 ⭐'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayList.map(({ record, sentence }) => (
            <div
              key={sentence.id}
              className="glass-panel"
              style={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                borderLeft: tab === 'wrong' ? '3px solid #f43f5e' : '3px solid #f59e0b',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 600 }}>
                  {sentence.categoryName} • {sentence.pattern}
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {tab === 'wrong' && (
                    <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700 }}>
                      오답 {record.incorrect}회
                    </span>
                  )}
                  <button
                    className="icon-btn"
                    style={{ width: 28, height: 28 }}
                    onClick={() => speakEnglish(sentence.english)}
                    title="발음 듣기"
                  >
                    <Volume2 size={14} color="#818cf8" />
                  </button>
                  <button
                    className="icon-btn"
                    style={{ width: 28, height: 28 }}
                    onClick={() => onBookmark(sentence.id)}
                    title="북마크 토글"
                  >
                    <Bookmark size={14} color={record.isBookmarked ? '#f59e0b' : '#94a3b8'} fill={record.isBookmarked ? '#f59e0b' : 'none'} />
                  </button>
                </div>
              </div>

              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#fff' }}>
                {sentence.korean}
              </div>
              <div style={{ fontSize: '0.92rem', color: '#38bdf8', fontWeight: 600 }}>
                {sentence.english}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
