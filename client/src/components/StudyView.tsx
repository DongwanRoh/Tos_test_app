import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Sentence, SentenceRecord, AppSettings } from '../types';
import { speakEnglish, SpeechRecognizer } from '../utils/speech';
import confetti from 'canvas-confetti';
import { Volume2, Bookmark, Check, X, Mic, MicOff, Clock, Sparkles } from 'lucide-react';

interface StudyViewProps {
  sentences: Sentence[];
  records: Record<number, SentenceRecord>;
  settings: AppSettings;
  onRecord: (sentenceId: number, isCorrect: boolean) => void;
  onBookmark: (sentenceId: number) => void;
  onOpenTestModal: () => void;
}

export const StudyView: React.FC<StudyViewProps> = ({
  sentences,
  records,
  settings,
  onRecord,
  onBookmark,
  onOpenTestModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPart, setSelectedPart] = useState<number | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [spokenText, setSpokenText] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(settings.timerDuration);

  // Filter sentences by category & part
  const filteredSentences = useMemo(() => {
    return sentences.filter((s) => {
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      const matchPart =
        selectedPart === 'all' || (s.parts && s.parts.includes(selectedPart as number));
      return matchCat && matchPart;
    });
  }, [sentences, selectedCategory, selectedPart]);

  const currentSentence = filteredSentences[currentIndex];
  const currentRecord = currentSentence ? records[currentSentence.id] : null;

  // Reset card state when changing sentence or category
  const resetCard = useCallback(() => {
    setIsRevealed(false);
    setSpokenText('');
    setTimeLeft(settings.timerDuration);
  }, [settings.timerDuration]);

  useEffect(() => {
    setCurrentIndex(0);
    resetCard();
  }, [selectedCategory, selectedPart, resetCard]);

  // Timer Countdown Effect
  useEffect(() => {
    if (isRevealed || settings.timerDuration <= 0) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isRevealed) {
      // Auto reveal when timer hits 0
      setIsRevealed(true);
      if (currentSentence && settings.autoPlayTts) {
        speakEnglish(currentSentence.english, settings.speechRate);
      }
    }
  }, [timeLeft, isRevealed, settings, currentSentence]);

  // STT Recognizer
  const recognizer = useMemo(() => new SpeechRecognizer(), []);

  const toggleMic = () => {
    if (!recognizer.isSupported) {
      alert('현재 브라우저에서는 음성 인식(STT)이 지원되지 않습니다. Chrome 브라우저 사용을 권장합니다.');
      return;
    }

    if (isListening) {
      recognizer.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      setSpokenText('');
      recognizer.start(
        (transcript: string) => {
          setSpokenText(transcript);
          setIsListening(false);
        },
        () => setIsListening(false)
      );
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
    if (currentSentence && settings.autoPlayTts) {
      speakEnglish(currentSentence.english, settings.speechRate);
    }
  };

  const handlePlayTts = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSentence) {
      speakEnglish(currentSentence.english, settings.speechRate);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentSentence) return;

    onRecord(currentSentence.id, isCorrect);

    if (isCorrect && (currentRecord?.consecutiveCorrect || 0) + 1 >= 3) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }

    // Move to next sentence
    if (currentIndex + 1 < filteredSentences.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back
    }
    resetCard();
  };

  if (!currentSentence) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>학습할 문장이 없습니다.</p>
      </div>
    );
  }

  const isBookmarked = Boolean(currentRecord?.isBookmarked);

  return (
    <div className="card-container">
      {/* Test Quick-Start Hero Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>
              스마트 20문항 실전 테스트
            </div>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
              맞춘 문장은 적게, 취약 문장 위주 스마트 랜덤 출제
            </div>
          </div>
        </div>

        <button
          id="btn-start-test-modal"
          onClick={onOpenTestModal}
          className="reveal-btn"
          style={{
            padding: '8px 14px',
            fontSize: '0.82rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          }}
        >
          테스트 시작 🚀
        </button>
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
            id={`filter-part-${p.id}`}
            className={`cat-pill ${selectedPart === p.id ? 'active' : ''}`}
            style={{
              background: selectedPart === p.id ? 'rgba(168, 85, 247, 0.25)' : undefined,
              borderColor: selectedPart === p.id ? '#a855f7' : undefined,
              color: selectedPart === p.id ? '#f5d0fe' : undefined,
            }}
            onClick={() => setSelectedPart(p.id as any)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Category Filter Pills */}
      <div className="category-scroller">
        {[
          { id: 'all', label: '전체 문장' },
          { id: 'core_verb', label: '기본동사' },
          { id: 'topic', label: '빈출주제' },
          { id: 'pattern', label: '핵심구문' },
          { id: 'modifier', label: '형용사/부사' },
        ].map((cat) => (
          <button
            key={cat.id}
            id={`filter-${cat.id}`}
            className={`cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Timer Bar */}
      {settings.timerDuration > 0 && (
        <div className="timer-container" title="발화 제한 시간">
          <div
            className="timer-fill"
            style={{
              width: `${(timeLeft / settings.timerDuration) * 100}%`,
              transition: timeLeft === settings.timerDuration ? 'none' : 'width 1s linear',
            }}
          />
        </div>
      )}

      {/* Speaking Flashcard */}
      <div className="flashcard" onClick={() => !isRevealed && handleReveal()}>
        <div className="flashcard-top">
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {currentSentence.parts && currentSentence.parts.length > 0 && (
              <span
                style={{
                  background: 'rgba(168, 85, 247, 0.25)',
                  color: '#e9d5ff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                }}
              >
                Part {currentSentence.parts.join(', ')}
              </span>
            )}
            <span className="category-tag">
              <Sparkles size={12} />
              {currentSentence.categoryName} • {currentSentence.subcategory}
            </span>
            <span className="pattern-badge">{currentSentence.pattern}</span>
          </div>

          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {settings.timerDuration > 0 && !isRevealed && (
              <span style={{ fontSize: '0.78rem', color: timeLeft <= 2 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={13} /> {timeLeft}s
              </span>
            )}
            <button
              id="bookmark-card-btn"
              className="icon-btn"
              style={{ width: 32, height: 32 }}
              onClick={(e) => {
                e.stopPropagation();
                onBookmark(currentSentence.id);
              }}
              title="북마크"
            >
              <Bookmark size={15} color={isBookmarked ? '#f59e0b' : '#94a3b8'} fill={isBookmarked ? '#f59e0b' : 'none'} />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="flashcard-body">
          <div className="speaking-hint">
            <span>🗣️ 한국어 뜻을 보고 영어로 소리 내어 말해보세요</span>
          </div>

          <h2 className="korean-prompt">{currentSentence.korean}</h2>

          {/* STT speech recognition result display */}
          {spokenText && (
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 14px', fontSize: '0.9rem', color: '#e2e8f0' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'block' }}>내가 말한 문장:</span>
              "{spokenText}"
            </div>
          )}

          {isRevealed && (
            <>
              <div className="answer-divider" />
              <div className="english-answer">{currentSentence.english}</div>
              <div className="key-expression-box">
                핵심 표현: <strong>{currentSentence.keyExpression}</strong>
              </div>
            </>
          )}
        </div>

        {/* Card Footer */}
        <div className="flashcard-footer">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {currentIndex + 1} / {filteredSentences.length}
            {currentRecord && currentRecord.attempts > 0 && (
              <span style={{ marginLeft: 8, color: '#64748b' }}>
                (성공률 {Math.round((currentRecord.correct / currentRecord.attempts) * 100)}%)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {/* STT Mic Button */}
            <button
              id="speech-mic-btn"
              className={`icon-btn ${isListening ? 'active' : ''}`}
              style={{ width: 34, height: 34 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleMic();
              }}
              title="마이크로 발화 인식해보기"
            >
              {isListening ? <Mic color="#ef4444" size={16} /> : <MicOff size={16} />}
            </button>

            {/* TTS Audio Button */}
            <button
              id="tts-play-btn"
              className="icon-btn"
              style={{ width: 34, height: 34 }}
              onClick={handlePlayTts}
              title="원어민 발음 듣기"
            >
              <Volume2 size={16} color="#818cf8" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="action-panel">
        {!isRevealed ? (
          <button id="check-answer-btn" className="reveal-btn" onClick={handleReveal}>
            정답 확인 (영어 보기)
          </button>
        ) : (
          <div className="judgment-grid">
            <button id="answer-wrong-btn" className="btn-incorrect" onClick={() => handleAnswer(false)}>
              <X size={20} />
              틀렸어요 (X)
            </button>
            <button id="answer-correct-btn" className="btn-correct" onClick={() => handleAnswer(true)}>
              <Check size={20} />
              맞췄어요 (O)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
