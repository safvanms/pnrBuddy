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
    <div className="pnr-loader-container">
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
    </div>
  );
}
