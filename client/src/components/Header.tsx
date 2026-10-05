import React from 'react';
import type { User } from '../types';
import { Sparkles, User as UserIcon, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onOpenAuth, onOpenSettings, onLogout }) => {
  return (
    <header className="app-header">
      <div className="brand-badge" onClick={() => window.location.reload()}>
        <div className="brand-icon">
          <Sparkles size={20} color="#ffffff" />
        </div>
        <div className="brand-text">
          <h1>스픽토스</h1>
          <span>TOEIC Speaking Prep</span>
        </div>
      </div>

      <div className="header-actions">
        {user ? (
          <div className="user-pill" title={user.email}>
            <div className="user-avatar">{user.username.charAt(0).toUpperCase()}</div>
            <span>{user.username}</span>
            <button
              onClick={onLogout}
              style={{ marginLeft: 4, display: 'flex', alignItems: 'center' }}
              title="로그아웃"
            >
              <LogOut size={14} color="#94a3b8" />
            </button>
          </div>
        ) : (
          <button id="login-open-btn" className="icon-btn" onClick={onOpenAuth} title="로그인 / 회원가입">
            <UserIcon size={18} />
          </button>
        )}

        <button id="settings-open-btn" className="icon-btn" onClick={onOpenSettings} title="설정">
          <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
