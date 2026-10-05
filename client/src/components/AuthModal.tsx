import React, { useState } from 'react';
import { api } from '../utils/api';
import type { User, UserProgress } from '../types';
import { X, Sparkles, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, progress?: UserProgress) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLoginTab, setIsLoginTab] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLoginTab) {
        const { user } = await api.login(email, password);
        const me = await api.getMe();
        onSuccess(user, me?.progress);
      } else {
        const { user } = await api.register(email, password, username);
        const me = await api.getMe();
        onSuccess(user, me?.progress);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '인증 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
              {isLoginTab ? '스픽토스 로그인' : '간편 회원가입'}
            </h3>
          </div>
          <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 3, marginBottom: 16 }}>
          <button
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 700,
              color: isLoginTab ? '#fff' : '#94a3b8',
              background: isLoginTab ? 'var(--primary)' : 'transparent',
            }}
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg('');
            }}
          >
            로그인
          </button>
          <button
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              fontSize: '0.85rem',
              fontWeight: 700,
              color: !isLoginTab ? '#fff' : '#94a3b8',
              background: !isLoginTab ? 'var(--primary)' : 'transparent',
            }}
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg('');
            }}
          >
            회원가입
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 14 }}>
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLoginTab && (
            <div className="form-group">
              <label className="form-label">닉네임</label>
              <input
                type="text"
                className="form-input"
                placeholder="예: 토스마스터"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLoginTab}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">아이디 (이메일)</label>
            <input
              type="text"
              className="form-input"
              placeholder="user@example.com 또는 아이디"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              className="form-input"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            className="form-btn-primary"
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            {isLoginTab ? <LogIn size={18} /> : <UserPlus size={18} />}
            {loading ? '처리 중...' : isLoginTab ? '로그인하기' : '가입하고 학습 시작'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            onClick={onClose}
            style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
          >
            로그인 없이 게스트 모드로 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};
