import React from 'react';
import { RefreshCw, Search, Clock, Archive, CheckCircle, ShieldAlert } from 'lucide-react';

// Custom vector illustration of a torn Indian Railways reservation ticket
function TornTicketIllustration() {
  return (
    <div className="torn-ticket-container" aria-label="Torn ticket illustration">
      <svg
        className="torn-ticket-svg"
        viewBox="0 0 140 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ticketGradLeft" x1="16" y1="18" x2="62" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--ticket-fill-start)" />
            <stop offset="100%" stopColor="var(--ticket-fill-end)" />
          </linearGradient>
          <linearGradient id="ticketGradRight" x1="68" y1="18" x2="124" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--ticket-fill-start)" />
            <stop offset="100%" stopColor="var(--ticket-fill-end)" />
          </linearGradient>
          <filter id="tornGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--ticket-glow)" />
          </filter>
        </defs>

        {/* Ambient aura glow behind the torn ticket */}
        <ellipse cx="70" cy="50" rx="46" ry="34" fill="var(--ticket-aura)" filter="blur(14px)" />

        {/* Left Torn Piece */}
        <g className="torn-piece left-piece">
          {/* Ticket body with left circular notch and jagged right tear */}
          <path
            d="M 24 20
               L 60 20
               L 53 32
               L 62 43
               L 52 55
               L 61 67
               L 54 80
               L 24 80
               A 6 6 0 0 1 18 74
               L 18 57
               A 7 7 0 0 0 18 43
               L 18 26
               A 6 6 0 0 1 24 20 Z"
            fill="url(#ticketGradLeft)"
            stroke="var(--ticket-stroke)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Left piece decorative details: Indian Rail badge and header */}
          <rect x="25" y="27" width="16" height="3.5" rx="1.5" fill="var(--ticket-accent)" opacity="0.8" />
          <rect x="25" y="34" width="22" height="2.5" rx="1.2" fill="var(--ticket-stroke)" opacity="0.45" />
          <rect x="25" y="40" width="15" height="2.5" rx="1.2" fill="var(--ticket-stroke)" opacity="0.3" />

          {/* Mini Train Locomotive Silhouette */}
          <g transform="translate(25, 49) scale(0.72)" stroke="var(--ticket-accent)" strokeWidth="1.5" fill="none">
            <rect x="0" y="0" width="17" height="22" rx="3" fill="var(--ticket-aura)" />
            <circle cx="5" cy="17" r="2" fill="var(--ticket-accent)" />
            <circle cx="12" cy="17" r="2" fill="var(--ticket-accent)" />
            <line x1="3" y1="5" x2="14" y2="5" strokeLinecap="round" />
            <line x1="3" y1="9" x2="14" y2="9" strokeLinecap="round" />
            <line x1="4.5" y1="13" x2="12.5" y2="13" strokeLinecap="round" strokeDasharray="1 1" />
          </g>

          {/* Perforated stitch line near the notch */}
          <line x1="23" y1="23" x2="23" y2="77" stroke="var(--ticket-stroke)" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
        </g>

        {/* Right Torn Piece */}
        <g className="torn-piece right-piece">
          {/* Ticket body with matching jagged left tear and right circular notch */}
          <path
            d="M 68 20
               L 116 20
               A 6 6 0 0 1 122 26
               L 122 43
               A 7 7 0 0 0 122 57
               L 122 74
               A 6 6 0 0 1 116 80
               L 63 80
               L 70 67
               L 61 55
               L 71 43
               L 62 32
               Z"
            fill="url(#ticketGradRight)"
            stroke="var(--ticket-stroke)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Barcode Lines on the right piece */}
          <g opacity="0.6">
            <line x1="80" y1="27" x2="80" y2="48" stroke="var(--ticket-stroke)" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="85" y1="27" x2="85" y2="48" stroke="var(--ticket-stroke)" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="89" y1="27" x2="89" y2="48" stroke="var(--ticket-stroke)" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="94" y1="27" x2="94" y2="48" stroke="var(--ticket-stroke)" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="98" y1="27" x2="98" y2="48" stroke="var(--ticket-stroke)" strokeWidth="2" strokeLinecap="round" />
            <line x1="102" y1="27" x2="102" y2="48" stroke="var(--ticket-stroke)" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="106" y1="27" x2="106" y2="48" stroke="var(--ticket-stroke)" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="110" y1="27" x2="110" y2="48" stroke="var(--ticket-stroke)" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Seat / Class snippet placeholder */}
          <rect x="80" y="56" width="30" height="6" rx="2" fill="var(--ticket-accent)" opacity="0.35" />
          <rect x="80" y="66" width="20" height="4" rx="1.5" fill="var(--ticket-stroke)" opacity="0.3" />

          {/* Perforated stitch line near the right notch */}
          <line x1="117" y1="23" x2="117" y2="77" stroke="var(--ticket-stroke)" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
        </g>

        {/* Floating Paper Scrap / Tear Particles */}
        <polygon points="61,47 66,45 64,51" fill="var(--ticket-accent)" opacity="0.85" className="torn-particle-1" />
        <circle cx="64" cy="36" r="1.5" fill="var(--ticket-accent)" opacity="0.75" className="torn-particle-2" />
        <circle cx="58" cy="62" r="1.2" fill="var(--ticket-accent)" opacity="0.65" className="torn-particle-3" />
      </svg>
    </div>
  );
}

export default function PnrNotFound({ pnr, errorMessage, onRetry, onClear }) {
  const displayError = typeof errorMessage === 'string'
    ? errorMessage
    : (errorMessage?.message || errorMessage?.error || null);

  return (
    <div className="glass-panel not-found-panel">
      {/* 1. Torn Ticket Icon Visual */}
      <TornTicketIllustration />

      {/* 2. Primary Heading as requested */}
      <h2 className="not-found-title">
        Flushed PNR / PNR not yet generated
      </h2>

      {/* 3. Subtitle with PNR tag */}
      <p className="not-found-desc">
        No active booking found for PNR <span className="pnr-highlight">#{pnr}</span> on Indian Railways central reservation database.
      </p>

      {/* 5. Helpful Intuitive Cards */}
      <div className="not-found-cards-grid">
        <div className="not-found-info-card">
          <div className="info-card-header">
            <Archive size={16} className="info-card-icon" />
            <h4>Flushed PNR (Journey Completed)</h4>
          </div>
          <p>
            CRIS automatically flushes and archives journey records from active PRS servers within 2–5 days after the train arrives at destination.
          </p>
        </div>

        <div className="not-found-info-card">
          <div className="info-card-header">
            <Clock size={16} className="info-card-icon" />
            <h4>PNR Not Yet Generated / Sync Delay</h4>
          </div>
          <p>
            If recently booked through IRCTC or travel partners, PRS gateway synchronization may take a few minutes before the record reflects publicly.
          </p>
        </div>

        <div className="not-found-info-card not-found-info-full">
          <div className="info-card-header">
            <CheckCircle size={16} className="info-card-icon" />
            <h4>Verification Tip</h4>
          </div>
          <p>
            Please double-check that the 10-digit number matches your official IRCTC booking SMS or electronic reservation slip (ERS) without any hyphens or spaces.
          </p>
        </div>
      </div>

      {/* 6. Action Buttons */}
      <div className="not-found-actions">
        <button
          type="button"
          className="btn-primary not-found-btn"
          onClick={onRetry}
          id="retry-search-btn"
        >
          <RefreshCw size={15} />
          <span>Retry Search</span>
        </button>

        {onClear && (
          <button
            type="button"
            className="btn-secondary not-found-btn"
            onClick={onClear}
            id="clear-search-btn"
          >
            <Search size={15} />
            <span>Search Another PNR</span>
          </button>
        )}
      </div>
    </div>
  );
}
