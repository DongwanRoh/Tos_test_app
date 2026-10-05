import React from 'react';
import type { AppSettings } from '../types';
import { X, Volume2, Clock, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={18} color="#818cf8" /> 학습 환경 설정
          </h3>
          <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* 1. Auto Play TTS */}
        <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>정답 확인 시 자동 발음 재생</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>정답을 열면 미국식 원어민 음성을 자동 재생합니다.</div>
          </div>
          <input
            type="checkbox"
            checked={settings.autoPlayTts}
            onChange={(e) => onUpdateSettings({ autoPlayTts: e.target.checked })}
            style={{ width: 20, height: 20, accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
        </div>

        {/* 2. Speech Rate */}
        <div className="form-group" style={{ marginTop: 18 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Volume2 size={15} color="#06b6d4" /> 원어민 발음 속도 ({settings.speechRate}x)
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[0.8, 1.0, 1.2].map((rate) => (
              <button
                key={rate}
                onClick={() => onUpdateSettings({ speechRate: rate })}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  border: '1px solid var(--border-subtle)',
                  background: settings.speechRate === rate ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: settings.speechRate === rate ? '#fff' : 'var(--text-muted)',
                }}
              >
                {rate === 1.0 ? '기본 (1.0x)' : `${rate}x`}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Timer Mode */}
        <div className="form-group" style={{ marginTop: 18 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={15} color="#f59e0b" /> 실전 스피킹 타이머 (타임어택)
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { val: 0, label: '끄기' },
              { val: 5, label: '5초' },
              { val: 10, label: '10초' },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => onUpdateSettings({ timerDuration: item.val })}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 8,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  border: '1px solid var(--border-subtle)',
                  background: settings.timerDuration === item.val ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: settings.timerDuration === item.val ? '#fff' : 'var(--text-muted)',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 6 }}>
            * 토익스피킹 시험처럼 제한시간 안에 문장을 빠르게 말하는 순발력을 기를 수 있습니다.
          </p>
        </div>

        <button
          onClick={onClose}
          className="form-btn-primary"
          style={{ marginTop: 20 }}
        >
          설정 저장 및 완료
        </button>
      </div>
    </div>
  );
};
