import React from 'react';
import { ViewId } from '../types';

interface Props {
  activeView: ViewId;
  onChangeView: (view: ViewId) => void;
}

// Нижнее главное меню, адаптированное под мобильные телефоны
export const MainMenu: React.FC<Props> = ({ activeView, onChangeView }) => {
  return (
    <nav className="main-menu">
      <button
        className={activeView === 'feed' ? 'main-menu-btn main-menu-btn--active' : 'main-menu-btn'}
        onClick={() => onChangeView('feed')}
      >
        <span className="icon">✨</span>
        <span className="label">Лента</span>
      </button>
      <button
        className={activeView === 'profile' ? 'main-menu-btn main-menu-btn--active' : 'main-menu-btn'}
        onClick={() => onChangeView('profile')}
      >
        <span className="icon">🗝</span>
        <span className="label">Профиль</span>
      </button>
      <button
        className={activeView === 'swipe' ? 'main-menu-btn main-menu-btn--active' : 'main-menu-btn'}
        onClick={() => onChangeView('swipe')}
      >
        <span className="icon">🔥</span>
        <span className="label">Свайп</span>
      </button>
      <button
        className={activeView === 'challenges' ? 'main-menu-btn main-menu-btn--active' : 'main-menu-btn'}
        onClick={() => onChangeView('challenges')}
      >
        <span className="icon">💖</span>
        <span className="label">Тайники</span>
      </button>
      <button
        className={activeView === 'codes' ? 'main-menu-btn main-menu-btn--active' : 'main-menu-btn'}
        onClick={() => onChangeView('codes')}
      >
        <span className="icon">🔐</span>
        <span className="label">Коды</span>
      </button>
    </nav>
  );
};




