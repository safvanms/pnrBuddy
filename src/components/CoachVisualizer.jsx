import React, { useState } from 'react';
import { Eye, Train, Sparkles, Utensils, Info } from 'lucide-react';

export default function CoachVisualizer({ ticket }) {
  const myCoach = ticket.passengers?.[0]?.coach || ticket.coach || '';
  const myBerths = ticket.passengers
    ?.filter(p => p.berthNumber && p.berthNumber !== '--')
    ?.map(p => parseInt(p.berthNumber, 10)) || [];

  const [selectedSeat, setSelectedSeat] = useState(myBerths[0] || null);

  // Coach composition from API e.g. "L SLR UR S1 S2 S3 S4 S5 S6 PC S7 S8 S9 B1 B2 B3 B4 B5 A1 UR UR SLR"
  const composition = ticket.coachComposition || ['L', 'SLR', 'UR', 'S1', 'S2', 'PC', 'B1', 'B2', 'B3', 'A1', 'UR', 'SLR'];

  const getBerthTypeByNum = (num) => {
    const mod = num % 8;
    if (mod === 1 || mod === 4) return 'LB';
    if (mod === 2 || mod === 5) return 'MB';
    if (mod === 3 || mod === 6) return 'UB';
    if (mod === 7) return 'SL';
    return 'SU';
  };

  const getBerthFullTitle = (type) => {
    switch (type) {
      case 'LB': return 'Lower Berth (Near Window)';
      case 'MB': return 'Middle Berth';
      case 'UB': return 'Upper Berth';
      case 'SL': return 'Side Lower (Track View)';
      case 'SU': return 'Side Upper';
      default: return 'Berth';
    }
  };

  return (
    <div className="glass-panel" style={{ marginTop: '1.25rem' }}>
      <div className="section-subhead">
        <h3>
          <Eye size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>Train Coach Composition & Rake Layout</span>
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Assigned Coach: <strong style={{ color: myCoach && myCoach !== 'NA' ? 'var(--status-cnf)' : 'var(--status-wl)' }}>
            {myCoach && myCoach !== 'NA' ? myCoach : 'Pending Charting (WL)'}
          </strong>
        </span>
      </div>

      {/* Train Rake Composition Sequence */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Train size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>Full Train Coach Sequence (From Engine to Rear):</span>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          padding: '0.85rem 0.5rem',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--surface-glass-border)'
        }}>
          {composition.map((code, index) => {
            const isEngine = code === 'L';
            const isPantry = code === 'PC';
            const isMyCoach = myCoach && code.toUpperCase() === myCoach.toUpperCase();

            let bg = 'var(--bg-secondary)';
            let borderColor = 'var(--surface-glass-border)';
            let textColor = 'var(--text-secondary)';

            if (isEngine) {
              bg = 'rgba(239, 68, 68, 0.2)';
              borderColor = '#ef4444';
              textColor = '#fca5a5';
            } else if (isPantry) {
              bg = 'rgba(245, 158, 11, 0.2)';
              borderColor = '#f59e0b';
              textColor = '#fcd34d';
            } else if (isMyCoach) {
              bg = 'rgba(16, 185, 129, 0.25)';
              borderColor = '#10b981';
              textColor = '#34d399';
            }

            return (
              <div
                key={`${code}-${index}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: isEngine ? '52px' : '44px',
                  height: '48px',
                  background: bg,
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: isEngine ? '12px 4px 4px 12px' : '6px',
                  padding: '0.2rem',
                  position: 'relative',
                  boxShadow: isMyCoach ? '0 0 12px rgba(16, 185, 129, 0.6)' : 'none',
                  flexShrink: 0
                }}
                title={isEngine ? 'Locomotive Engine' : isPantry ? 'Pantry Car' : `Coach ${code}`}
              >
                {isEngine ? (
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: textColor }}>ENG</span>
                ) : isPantry ? (
                  <>
                    <Utensils size={12} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, color: textColor }}>PC</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: textColor }}>{code}</span>
                    <span style={{ fontSize: '0.52rem', color: 'var(--text-muted)' }}>#{index}</span>
                  </>
                )}
                {isMyCoach && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    background: '#10b981',
                    color: '#070b14',
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    padding: '1px 4px',
                    borderRadius: '4px'
                  }}>
                    YOU
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.6rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          <span><strong style={{ color: '#fca5a5' }}>ENG:</strong> Locomotive Engine</span>
          <span><strong style={{ color: '#fcd34d' }}>PC:</strong> Pantry Car</span>
          <span><strong style={{ color: '#60a5fa' }}>S/B/A:</strong> Sleeper / 3A / 2A Coaches</span>
          <span><strong style={{ color: '#34d399' }}>YOU:</strong> Your Allotted Coach</span>
        </div>
      </div>

      {/* Interactive Berth Layout if coach/berth is known */}
      {myBerths.length > 0 && (
        <div className="coach-visualizer-container">
          <div className="coach-header">
            <div>
              <span className="coach-tag">Coach {myCoach} — Berth Layout</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                Standard LHB Cabin Configuration
              </span>
            </div>
            {selectedSeat && (
              <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                Berth {selectedSeat} ({getBerthFullTitle(getBerthTypeByNum(selectedSeat))})
              </div>
            )}
          </div>

          <div className="coach-grid-wrap">
            <div className="coach-layout-train">
              {[
                { name: 'Bay 1', start: Math.max(1, myBerths[0] - 3) },
                { name: 'Bay 2', start: Math.max(1, myBerths[0] - 3) + 8 }
              ].map((bay) => (
                <div key={bay.name} className="cabin-bay">
                  <span className="cabin-title">{bay.name}</span>
                  <div className="berths-grid">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((offset) => {
                      const num = bay.start + offset;
                      const type = getBerthTypeByNum(num);
                      const isMySeat = myBerths.includes(num);

                      return (
                        <div
                          key={num}
                          className={`berth-cell ${isMySeat ? 'my-seat' : ''}`}
                          onClick={() => setSelectedSeat(num)}
                          title={`Berth ${num} - ${getBerthFullTitle(type)}`}
                        >
                          <span>{num}</span>
                          <span className="berth-cell-type">{type}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
