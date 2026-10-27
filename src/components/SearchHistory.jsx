import React from 'react';
import { History, Trash2, ArrowUpRight } from 'lucide-react';

export default function SearchHistory({ history, onSelectPnr, onClearHistory }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="glass-panel history-section" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>
          <History size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span>Recent PNR Searches ({history.length})</span>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}
          title="Clear search history"
        >
          <Trash2 size={13} />
          <span>Clear All</span>
        </button>
      </div>

      <div className="history-chips-wrap">
        {history.map((item) => (
          <div
            key={item.pnr}
            className="history-chip-item"
            onClick={() => onSelectPnr(item.pnr, item.mode)}
            title={`Check status for ${item.pnr}`}
          >
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.pnr}
              </span>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {item.title}
              </div>
            </div>
            <span
              className={`status-badge-pill ${item.status?.toLowerCase() || 'cnf'}`}
              style={{ padding: '0.18rem 0.45rem', fontSize: '0.68rem' }}
            >
              {item.status}
            </span>
            <ArrowUpRight size={14} style={{ color: 'var(--text-muted)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
