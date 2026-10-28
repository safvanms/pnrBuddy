import React from 'react';
import { Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { getProbTheme } from '../services/pnrService';

export default function PassengerTable({ passengers, overallStatus }) {
  if (!passengers || passengers.length === 0) return null;

  return (
    <div className="glass-panel passenger-card">
      <div className="section-subhead">
        <h3>
          <Users size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>Passenger Booking & Live Status ({passengers.length} {passengers.length > 1 ? 'Passengers' : 'Passenger'})</span>
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Official IRCTC Passenger Manifest
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="passenger-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Passenger</th>
              <th>Booking Status</th>
              <th>Current Status</th>
              <th>Live Prediction</th>
              <th>Coach / Berth</th>
              <th>Berth Allocation</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((p, idx) => {
              const isCnf = p.currentStatus?.includes('CNF') || overallStatus === 'CNF';
              const match = p.prediction ? p.prediction.match(/(\d+)%/) : null;
              const pVal = p.predictionPercentage || (match ? parseInt(match[1], 10) : (isCnf ? 100 : (p.currentStatus?.includes('RAC') ? 85 : 70)));
              const pTheme = getProbTheme(pVal, isCnf);

              return (
                <tr key={p.id || idx} className="passenger-row">
                  <td data-label="Passenger #" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-muted)' }}>
                    P{p.number || idx + 1}
                  </td>
                  <td data-label="Passenger">
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name || `Passenger ${p.number || idx + 1}`}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Quota: {p.quota || 'General'}
                    </div>
                  </td>
                  <td data-label="Booking Status">
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-tertiary)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {p.bookingStatus}
                    </span>
                  </td>
                  <td data-label="Current Status">
                    <span 
                      style={{
                        display: 'inline-block',
                        padding: '0.28rem 0.75rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: pTheme.labelColor,
                        background: pTheme.bg,
                        border: `1px solid ${pTheme.border}`,
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      {p.currentStatus}
                    </span>
                  </td>
                  <td data-label="Live Prediction">
                    {isCnf ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: pTheme.labelColor,
                        background: pTheme.bg,
                        border: `1px solid ${pTheme.border}`,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        <CheckCircle2 size={13} />
                        100% Confirmed
                      </span>
                    ) : (p.prediction || pVal) ? (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: pTheme.labelColor,
                        background: pTheme.bg,
                        border: `1px solid ${pTheme.border}`,
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        <TrendingUp size={13} />
                        {p.prediction || `${pVal}% Chance`}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>--</span>
                    )}
                  </td>
                  <td data-label="Coach / Seat">
                    <span className="seat-highlight-badge">
                      {p.coach && p.coach !== 'NA' ? `${p.coach} / ${p.berthNumber}` : 'Unallotted'}
                    </span>
                  </td>
                  <td data-label="Allocation">
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {p.berthType}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
