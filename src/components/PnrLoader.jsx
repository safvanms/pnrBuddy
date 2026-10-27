import React, { useEffect, useState } from 'react';
import { Train, ShieldCheck, Cpu } from 'lucide-react';

export default function PnrLoader({ pnr }) {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    'Connecting to Indian Railways CRIS PRS Node...',
    `Querying Passenger Record #${pnr || 'PNR'}...`,
    'Bypassing Captcha via Direct Rail Gateway...',
    'Fetching Live Berth Allotment & Waitlist Telemetry...',
    'Analyzing Confirmation Probability...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 350);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pnr-loader-container">
      {/* Central Rail Scanner Graphic */}
      <div className="pnr-scanner-card">
        <div className="scanner-radar-wrap">
          <div className="radar-ring ring-1"></div>
          <div className="radar-ring ring-2"></div>
          <div className="radar-ring ring-3"></div>
          <div className="radar-train-core">
            <Train size={30} className="train-pulse-icon" />
          </div>
        </div>

        <div className="scanner-text-box">
          <div className="scanner-badge">
            <Cpu size={14} className="animate-spin-slow" />
            <span>REAL-TIME QUERY IN PROGRESS</span>
          </div>
          <h3 className="scanner-title">Fetching Live PNR Status</h3>
          <p className="scanner-pnr">PNR: <strong>{pnr || 'Connecting...'}</strong></p>
          <div className="scanner-step-msg">
            <span className="step-bullet">●</span>
            <span>{steps[stepIndex]}</span>
          </div>

          {/* Shimmer mini progress bar */}
          <div className="scanner-bar-track">
            <div className="scanner-bar-fill"></div>
          </div>
        </div>
      </div>

      {/* Matching Skeleton Wireframe */}
      <div className="skeleton-grid">
        {/* Status Card Skeleton */}
        <div className="skeleton-card">
          <div className="skeleton-row" style={{ justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div className="skeleton-box" style={{ width: '80px', height: '28px', borderRadius: '6px' }}></div>
              <div className="skeleton-box" style={{ width: '180px', height: '32px', borderRadius: '6px' }}></div>
              <div className="skeleton-box" style={{ width: '90px', height: '28px', borderRadius: '20px' }}></div>
            </div>
            <div className="skeleton-box" style={{ width: '60px', height: '60px', borderRadius: '50%' }}></div>
          </div>
          <div className="skeleton-row" style={{ gap: '0.6rem' }}>
            <div className="skeleton-box" style={{ width: '120px', height: '24px', borderRadius: '6px' }}></div>
            <div className="skeleton-box" style={{ width: '140px', height: '24px', borderRadius: '6px' }}></div>
            <div className="skeleton-box" style={{ width: '100px', height: '24px', borderRadius: '6px' }}></div>
          </div>
        </div>

        {/* Route Timeline Skeleton */}
        <div className="skeleton-card">
          <div className="skeleton-timeline-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '120px' }}>
              <div className="skeleton-box" style={{ width: '60px', height: '32px', borderRadius: '6px' }}></div>
              <div className="skeleton-box" style={{ width: '110px', height: '16px', borderRadius: '4px' }}></div>
              <div className="skeleton-box" style={{ width: '80px', height: '18px', borderRadius: '4px' }}></div>
            </div>
            <div style={{ flex: 1, padding: '0 1rem' }}>
              <div className="skeleton-box" style={{ width: '100%', height: '8px', borderRadius: '999px' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '120px', alignItems: 'flex-end' }}>
              <div className="skeleton-box" style={{ width: '60px', height: '32px', borderRadius: '6px' }}></div>
              <div className="skeleton-box" style={{ width: '110px', height: '16px', borderRadius: '4px' }}></div>
              <div className="skeleton-box" style={{ width: '80px', height: '18px', borderRadius: '4px' }}></div>
            </div>
          </div>
        </div>

        {/* Passengers Table Skeleton */}
        <div className="skeleton-card">
          <div className="skeleton-box" style={{ width: '220px', height: '22px', borderRadius: '4px', marginBottom: '1rem' }}></div>
          <div className="skeleton-box" style={{ width: '100%', height: '48px', borderRadius: '8px', marginBottom: '0.5rem' }}></div>
          <div className="skeleton-box" style={{ width: '100%', height: '48px', borderRadius: '8px' }}></div>
        </div>
      </div>
    </div>
  );
}
