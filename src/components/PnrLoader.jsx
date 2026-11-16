import React, { useState, useEffect } from 'react';
import { Train } from 'lucide-react';

const STEPS = [
  'Connecting to CRIS PRS Node...',
  'Querying Passenger Record...',
  'Fetching Live Berth Allotment...',
  'Analyzing Confirmation Probability...',
  'Almost there...'
];

export default function PnrLoader({ pnr }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pnr-loader-container" style={{marginTop:"40px"}}>
      {/* Central logo pulse */}
      <div className="pnr-logo-loader">
        {/* Ripple rings */}
        <span className="logo-ring logo-ring-1" />
        <span className="logo-ring logo-ring-2" />
        <span className="logo-ring logo-ring-3" />

        {/* Brand icon — same as Header */}
        <div className="logo-icon-core">
          <Train size={28} />
        </div>
      </div>

      {/* Status text */}
      <div className="pnr-logo-loader-text">
        {pnr && (
          <p className="loader-pnr-label">
            PNR <span>{pnr}</span>
          </p>
        )}
        <p className="loader-step-msg">{STEPS[stepIndex]}</p>
      </div>

      {/* Skeleton wireframes */}
      <div className="skeleton-grid">
        <div className="skeleton-card">
          <div className="skeleton-row" style={{ justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="skeleton-box" style={{ width: '80px', height: '28px', borderRadius: '6px' }} />
              <div className="skeleton-box" style={{ width: '180px', height: '32px', borderRadius: '6px' }} />
            </div>
          </div>
          <div className="skeleton-row" style={{ gap: '0.6rem' }}>
            <div className="skeleton-box" style={{ width: '120px', height: '24px', borderRadius: '6px' }} />
            <div className="skeleton-box" style={{ width: '140px', height: '24px', borderRadius: '6px' }} />
            <div className="skeleton-box" style={{ width: '100px', height: '24px', borderRadius: '6px' }} />
          </div>
        </div>

        <div className="skeleton-card">
          <div className="skeleton-timeline-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '120px' }}>
              <div className="skeleton-box" style={{ width: '60px', height: '32px', borderRadius: '6px' }} />
              <div className="skeleton-box" style={{ width: '110px', height: '16px', borderRadius: '4px' }} />
            </div>
            <div style={{ flex: 1, padding: '0 1rem' }}>
              <div className="skeleton-box" style={{ width: '100%', height: '8px', borderRadius: '999px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '120px', alignItems: 'flex-end' }}>
              <div className="skeleton-box" style={{ width: '60px', height: '32px', borderRadius: '6px' }} />
              <div className="skeleton-box" style={{ width: '110px', height: '16px', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        <div className="skeleton-card">
          <div className="skeleton-box" style={{ width: '220px', height: '22px', borderRadius: '4px', marginBottom: '1rem' }} />
          <div className="skeleton-box" style={{ width: '100%', height: '48px', borderRadius: '8px', marginBottom: '0.5rem' }} />
          <div className="skeleton-box" style={{ width: '100%', height: '48px', borderRadius: '8px' }} />
        </div>
      </div>
    </div>
  );
}
