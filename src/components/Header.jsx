import React from 'react';
import { Train, Sun, Moon, HelpCircle } from 'lucide-react';

export default function Header({ theme, toggleTheme, onOpenGuide }) {
  return (
    <header className="site-header">
      <div className="brand-section" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="brand-icon-wrapper">
          <Train size={22} />
        </div>
        <div>
          <h1 className="brand-title">
            <span className="brand-accent">pnrBuddy</span>
          </h1>
        </div>
      </div>

      <div className="header-controls">
        <div className="pulse-badge" title="Live CRIS / Indian Railways Gateway">
          <span className="pulse-dot"></span>
          <span>LIVE</span>
        </div>

        <button 
          className="btn-icon" 
          onClick={onOpenGuide}
          title="PNR Status Guide & Rules"
          aria-label="Help Guide"
        >
          <HelpCircle size={18} />
        </button>

        <button 
          className="btn-icon" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
