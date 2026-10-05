import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Sentence, SentenceRecord, AppSettings, TestOptions } from '../types';
import { speakEnglish, SpeechRecognizer } from '../utils/speech';
import confetti from 'canvas-confetti';
import {
  Volume2,
  Bookmark,
  Check,
  X,
  Mic,
  MicOff,
  Clock,
  Sparkles,
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Award,
} from 'lucide-react';

interface TestSessionViewProps {
  testSentences: Sentence[];
  records: Record<number, SentenceRecord>;
  settings: AppSettings;
  testOptions: TestOptions;
  onRecord: (sentenceId: number, isCorrect: boolean) => void;
  onBookmark: (sentenceId: number) => void;
  onRestartTest: () => void;
  onOpenTestModal: () => void;
  onExitTest: () => void;
}

export const TestSessionView: React.FC<TestSessionViewProps> = ({
  testSentences,
  records,
  settings,
  onRecord,
  onBookmark,
  onRestartTest,
  onOpenTestModal,
  onExitTest,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [spokenText, setSpokenText] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(settings.timerDuration);

  // Test Results Tracking
  const [results, setResults] = useState<{ sentence: Sentence; isCorrect: boolean }[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [resultTab, setResultTab] = useState<'all' | 'wrong' | 'correct'>('all');

  const currentSentence = testSentences[currentIndex];
  const currentRecord = currentSentence ? records[currentSentence.id] : null;

  const resetCard = useCallback(() => {
    setIsRevealed(false);
    setSpokenText('');
    setTimeLeft(settings.timerDuration);
  }, [settings.timerDuration]);

  useEffect(() => {
    resetCard();
  }, [currentIndex, resetCard]);

  // Timer countdown
  useEffect(() => {
    if (isCompleted || isRevealed || settings.timerDuration <= 0) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isRevealed) {
      setIsRevealed(true);
      if (currentSentence && settings.autoPlayTts) {
        speakEnglish(currentSentence.english, settings.speechRate);
      }
    }
  }, [timeLeft, isRevealed, settings, currentSentence, isCompleted]);

  // STT
  const recognizer = useMemo(() => new SpeechRecognizer(), []);

  const toggleMic = () => {
    if (!recognizer.isSupported) {
      alert('현재 브라우저에서는 음성 인식이 지원되지 않습니다. Chrome 브라우저를 권장합니다.');
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
    const nextResults = [...results, { sentence: currentSentence, isCorrect }];
    setResults(nextResults);

    if (currentIndex + 1 < testSentences.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Test Completed
      setIsCompleted(true);
      const correctCount = nextResults.filter((r) => r.isCorrect).length;
      const rate = (correctCount / testSentences.length) * 100;
      if (rate >= 70) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  };

  // If Test Completed: Show Comprehensive Result Dashboard
  if (isCompleted) {
    const total = testSentences.length;
    const correctCount = results.filter((r) => r.isCorrect).length;
    const wrongCount = total - correctCount;
    const scoreRate = Math.round((correctCount / total) * 100);

    const filteredDisplayResults = results.filter((r) => {
      if (resultTab === 'wrong') return !r.isCorrect;
      if (resultTab === 'correct') return r.isCorrect;
      return true;
    });

    let grade = 'Lv.6 기초 실력';
    let gradeColor = '#f59e0b';
    if (scoreRate >= 90) {
      grade = 'Lv.8 고득점 마스터 (Advanced)';
      gradeColor = '#10b981';
    } else if (scoreRate >= 75) {
      grade = 'Lv.7 중상급 실전 완성 (Intermediate)';
      gradeColor = '#6366f1';
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Result Header Card */}
        <div
          className="glass-panel"
          style={{
            padding: '24px 20px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.15), rgba(15, 23, 42, 0.7))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Trophy size={32} color="#fff" />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
            실전 테스트 완료!
          </h2>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255,255,255,0.06)',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: '0.82rem',
              color: gradeColor,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            <Award size={14} /> {grade}
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 4 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '12px 6px' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 2 }}>정답률</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: scoreRate >= 80 ? '#34d399' : '#f8fafc' }}>
                {scoreRate}%
              </div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: 14, padding: '12px 6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginBottom: 2 }}>맞춘 문장</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>
                {correctCount}
              </div>
            </div>

            <div style={{ background: 'rgba(244, 63, 94, 0.1)', borderRadius: 14, padding: '12px 6px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
              <div style={{ fontSize: '0.75rem', color: '#fda4af', marginBottom: 2 }}>틀린 문장</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f43f5e' }}>
                {wrongCount}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          <button
            onClick={onRestartTest}
            className="reveal-btn"
            style={{
              padding: '12px',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <RotateCcw size={16} /> 다시 테스트하기
          </button>
          <button
            onClick={onOpenTestModal}
            className="reveal-btn"
            style={{
              padding: '12px',
              fontSize: '0.88rem',
              fontWeight: 700,
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={16} color="#38bdf8" /> 새 조건 설정
          </button>
        </div>

        {/* Review Filter Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 4 }}>
          <button
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 10,
              fontSize: '0.8rem',
              fontWeight: 700,
              color: resultTab === 'all' ? '#fff' : '#94a3b8',
              background: resultTab === 'all' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setResultTab('all')}
          >
            전체 ({total})
          </button>
          <button
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 10,
              fontSize: '0.8rem',
              fontWeight: 700,
              color: resultTab === 'wrong' ? '#fda4af' : '#94a3b8',
              background: resultTab === 'wrong' ? 'rgba(244, 63, 94, 0.25)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setResultTab('wrong')}
          >
            오답 복습 ({wrongCount})
          </button>
          <button
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 10,
              fontSize: '0.8rem',
              fontWeight: 700,
              color: resultTab === 'correct' ? '#6ee7b7' : '#94a3b8',
              background: resultTab === 'correct' ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={() => setResultTab('correct')}
          >
            정답 ({correctCount})
          </button>
        </div>

        {/* Results Sentence List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredDisplayResults.map(({ sentence, isCorrect }) => (
            <div
              key={sentence.id}
              className="glass-panel"
              style={{
                padding: '14px 16px',
                borderLeft: isCorrect ? '3px solid #10b981' : '3px solid #f43f5e',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {isCorrect ? (
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <CheckCircle2 size={14} /> 정답
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <XCircle size={14} /> 오답
                    </span>
                  )}
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {sentence.categoryName} • {sentence.pattern}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    className="icon-btn"
                    style={{ width: 28, height: 28 }}
                    onClick={() => speakEnglish(sentence.english)}
                    title="발음 듣기"
                  >
                    <Volume2 size={13} color="#818cf8" />
                  </button>
                  <button
                    className="icon-btn"
                    style={{ width: 28, height: 28 }}
                    onClick={() => onBookmark(sentence.id)}
                    title="북마크"
                  >
                    <Bookmark
                      size={13}
                      color={records[sentence.id]?.isBookmarked ? '#f59e0b' : '#94a3b8'}
                      fill={records[sentence.id]?.isBookmarked ? '#f59e0b' : 'none'}
                    />
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>
                {sentence.korean}
              </div>
              <div style={{ fontSize: '0.88rem', color: '#38bdf8' }}>
                {sentence.english}
              </div>
            </div>
          ))}
        </div>

        {/* Exit to Main */}
        <button
          onClick={onExitTest}
          style={{
            padding: '12px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14,
            color: '#94a3b8',
            fontSize: '0.85rem',
            cursor: 'pointer',
            marginTop: 8,
          }}
        >
          기본 학습 모드로 돌아가기
        </button>
      </div>
    );
  }

  // Active Test Playing View
  if (!currentSentence) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: 'var(--text-muted)' }}>테스트할 문장이 없습니다.</p>
        <button onClick={onExitTest} className="reveal-btn" style={{ marginTop: 12 }}>
          돌아가기
        </button>
      </div>
    );
  }

  const isBookmarked = Boolean(currentRecord?.isBookmarked);
  const correctCount = results.filter((r) => r.isCorrect).length;
  const wrongCount = results.filter((r) => !r.isCorrect).length;
  const progressPercent = ((currentIndex + 1) / testSentences.length) * 100;

  return (
    <div className="card-container">
      {/* Test Header Progress Bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                color: '#fff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: 8,
              }}
            >
              TEST {currentIndex + 1}/{testSentences.length}
            </span>
            <div style={{ display: 'flex', gap: 6, fontSize: '0.78rem' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>O {correctCount}</span>
              <span style={{ color: '#f43f5e', fontWeight: 700 }}>X {wrongCount}</span>
            </div>
          </div>

          <button
            onClick={onExitTest}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.78rem',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            테스트 중단
          </button>
        </div>

        <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #6366f1, #a855f7)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
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
              <span
                style={{
                  fontSize: '0.78rem',
                  color: timeLeft <= 2 ? '#ef4444' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
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
              <Bookmark
                size={15}
                color={isBookmarked ? '#f59e0b' : '#94a3b8'}
                fill={isBookmarked ? '#f59e0b' : 'none'}
              />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="flashcard-body">
          <div className="speaking-hint">
            <span>🗣️ 한국어 뜻을 보고 영어로 소리 내어 말해보세요</span>
          </div>

          <h2 className="korean-prompt">{currentSentence.korean}</h2>

          {/* STT Display */}
          {spokenText && (
            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '8px 14px',
                fontSize: '0.9rem',
                color: '#e2e8f0',
              }}
            >
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
            문항 {currentIndex + 1} / {testSentences.length}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
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
