import React, { useState, useEffect } from 'react';
import type { Sentence, User, UserProgress, TabType, AppSettings, TestOptions } from './types';
import { api } from './utils/api';
import { sampleTestSentences } from './utils/testSampler';
import { Header } from './components/Header';
import { StudyView } from './components/StudyView';
import { TestSessionView } from './components/TestSessionView';
import { NotebookView } from './components/NotebookView';
import { AllSentencesView } from './components/AllSentencesView';
import { StatsView } from './components/StatsView';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { TestModal } from './components/TestModal';
import { BookOpen, Zap, BookmarkCheck, ListChecks, BarChart2 } from 'lucide-react';

const SETTINGS_KEY = 'speaktos_settings';

export const App: React.FC = () => {
  const [tab, setTab] = useState<TabType>('study');
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [activeStudySentences, setActiveStudySentences] = useState<Sentence[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress>({
    records: {},
    streak: 1,
    lastStudyDate: new Date().toISOString().split('T')[0],
  });

  // Modals & Test State
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [testSession, setTestSession] = useState<{
    sentences: Sentence[];
    options: TestOptions;
  } | null>(null);

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      autoPlayTts: true,
      speechRate: 1.0,
      timerDuration: 0, // 0 = off
    };
  });

  const handleUpdateSettings = (newSet: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSet };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Initial Load
  useEffect(() => {
    async function loadData() {
      // 1. Fetch Sentences
      const fetchedSentences = await api.fetchSentences();
      setSentences(fetchedSentences);
      setActiveStudySentences(fetchedSentences);

      // 2. Fetch User & Progress
      const meData = await api.getMe();
      if (meData) {
        setUser(meData.user);
        setProgress(meData.progress);
      } else {
        // Guest mode fallback
        const guest = api.getGuestProgress();
        setProgress(guest);
      }
    }
    loadData();
  }, []);

  // Handle Record Result (O / X)
  const handleRecord = async (sentenceId: number, isCorrect: boolean) => {
    const updatedRecord = await api.recordResult(sentenceId, isCorrect);
    setProgress((prev) => ({
      ...prev,
      records: {
        ...prev.records,
        [sentenceId]: updatedRecord,
      },
    }));
  };

  // Handle Bookmark Toggle
  const handleBookmark = async (sentenceId: number) => {
    const updatedRecord = await api.toggleBookmark(sentenceId);
    setProgress((prev) => ({
      ...prev,
      records: {
        ...prev.records,
        [sentenceId]: updatedRecord,
      },
    }));
  };

  // Start Test with Options
  const handleStartTest = (allSentences: Sentence[], options: TestOptions) => {
    const sampled = sampleTestSentences(allSentences, progress.records || {}, options);
    if (sampled.length === 0) {
      alert('선택한 조건에 해당하는 문장이 없습니다.');
      return;
    }
    setTestSession({
      sentences: sampled,
      options,
    });
    setTab('test');
  };

  // Restart Current Test with Same Options
  const handleRestartTest = () => {
    if (!testSession) return;
    const sampled = sampleTestSentences(sentences, progress.records || {}, testSession.options);
    setTestSession({
      sentences: sampled,
      options: testSession.options,
    });
  };

  const handleExitTest = () => {
    setTestSession(null);
    setTab('study');
  };

  // Handle Logout
  const handleLogout = () => {
    api.clearToken();
    setUser(null);
    setProgress(api.getGuestProgress());
  };

  // Start Custom Study from Notebook
  const handleStartCustomStudy = (customList: Sentence[]) => {
    setActiveStudySentences(customList);
    setTab('study');
  };

  // Reset Records
  const handleReset = async () => {
    if (user) {
      try {
        const res = await fetch('/api/user/reset', {
          method: 'POST',
          headers: api.getHeaders(),
        });
        const data = await res.json();
        setProgress(data.progress);
      } catch (e) {
        console.error(e);
      }
    } else {
      const emptyProgress: UserProgress = { records: {}, streak: 1, lastStudyDate: null };
      api.saveGuestProgress(emptyProgress);
      setProgress(emptyProgress);
    }
  };

  return (
    <div className="app-viewport">
      <Header
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      <main className="app-main">
        {tab === 'study' && (
          <StudyView
            sentences={activeStudySentences.length > 0 ? activeStudySentences : sentences}
            records={progress.records || {}}
            settings={settings}
            onRecord={handleRecord}
            onBookmark={handleBookmark}
            onOpenTestModal={() => setTab('test')}
          />
        )}

        {tab === 'test' && (
          testSession ? (
            <TestSessionView
              key={testSession.sentences.map((s) => s.id).join('-')}
              testSentences={testSession.sentences}
              records={progress.records || {}}
              settings={settings}
              testOptions={testSession.options}
              onRecord={handleRecord}
              onBookmark={handleBookmark}
              onRestartTest={handleRestartTest}
              onOpenTestModal={() => setTestSession(null)}
              onExitTest={handleExitTest}
            />
          ) : (
            <TestModal
              isOpen={true}
              sentences={sentences}
              records={progress.records || {}}
              onClose={() => setTab('study')}
              onStartTest={handleStartTest}
            />
          )
        )}

        {tab === 'notebook' && (
          <NotebookView
            sentences={sentences}
            records={progress.records || {}}
            onBookmark={handleBookmark}
            onStartCustomStudy={handleStartCustomStudy}
          />
        )}

        {tab === 'all' && (
          <AllSentencesView
            sentences={sentences}
            records={progress.records || {}}
            onBookmark={handleBookmark}
          />
        )}

        {tab === 'stats' && (
          <StatsView
            sentences={sentences}
            records={progress.records || {}}
            streak={progress.streak || 1}
            user={user}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation */}
      <nav className="app-nav">
        <button
          id="nav-tab-study"
          className={`nav-item ${tab === 'study' ? 'active' : ''}`}
          onClick={() => {
            setActiveStudySentences(sentences); // Reset to full list
            setTab('study');
          }}
        >
          <BookOpen size={20} />
          <span>스피킹</span>
        </button>

        <button
          id="nav-tab-test"
          className={`nav-item ${tab === 'test' ? 'active' : ''}`}
          onClick={() => {
            if (tab === 'test' && testSession) {
              setTestSession(null); // Back to setup if clicking test tab while testing
            }
            setTab('test');
          }}
        >
          <Zap size={20} color={tab === 'test' ? '#a855f7' : undefined} />
          <span>테스트</span>
        </button>

        <button
          id="nav-tab-notebook"
          className={`nav-item ${tab === 'notebook' ? 'active' : ''}`}
          onClick={() => setTab('notebook')}
        >
          <BookmarkCheck size={20} />
          <span>오답노트</span>
        </button>

        <button
          id="nav-tab-all"
          className={`nav-item ${tab === 'all' ? 'active' : ''}`}
          onClick={() => setTab('all')}
        >
          <ListChecks size={20} />
          <span>전체문장</span>
        </button>

        <button
          id="nav-tab-stats"
          className={`nav-item ${tab === 'stats' ? 'active' : ''}`}
          onClick={() => setTab('stats')}
        >
          <BarChart2 size={20} />
          <span>통계</span>
        </button>
      </nav>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser, loggedProgress) => {
          setUser(loggedUser);
          if (loggedProgress) setProgress(loggedProgress);
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
};

export default App;
