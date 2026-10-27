import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Share2,
  Printer,
  RefreshCw,
  Calendar,
  Zap,
  TrendingUp,
  Code2,
  Armchair,
  FileCheck
} from 'lucide-react';

export default function PnrStatusOverview({
  ticket,
  onPrintTicket,
  onShareStatus,
  onToggleAlert,
  alertActive,
  onRefresh,
  isRefreshing,
  onOpenJsonModal
}) {
  const statusClass = ticket.overallStatus.toLowerCase();
  const currentStatusText = ticket.passengers?.[0]?.currentStatus || ticket.statusLabel;

  // Circle progress calculation (48x48 viewBox, r=19 with stroke=4 has margins 3px and never clips)
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  // Dynamic Chances Theme based on percentage
  const prob = ticket.confirmationProbability || 72;
  const strokeDashoffset = circumference - (prob / 100) * circumference;

  const getProbTheme = (val) => {
    if (val >= 70) {
      return {
        key: 'high',
        color: '#10b981',
        labelColor: '#34d399',
        tier: 'High Chance',
        bg: 'rgba(16, 185, 129, 0.14)',
        border: 'rgba(16, 185, 129, 0.4)'
      };
    }
    if (val >= 45) {
      return {
        key: 'medium',
        color: '#f59e0b',
        labelColor: '#fbbf24',
        tier: 'Medium Chance',
        bg: 'rgba(245, 158, 11, 0.14)',
        border: 'rgba(245, 158, 11, 0.4)'
      };
    }
    return {
      key: 'low',
      color: '#f43f5e',
      labelColor: '#fb7185',
      tier: 'Low Chance',
      bg: 'rgba(244, 63, 94, 0.14)',
      border: 'rgba(244, 63, 94, 0.4)'
    };
  };

  const probTheme = getProbTheme(prob);

  const isChartPrepared = ticket.chartStatus?.toLowerCase().includes('prepared') && !ticket.chartStatus?.toLowerCase().includes('not');
  const passengers = ticket.passengers || [];
  const isMultiPassenger = passengers.length > 1;
  const cleanDate = ticket.dateOfJourney || '--';

  return (
    <div className="glass-panel pnr-overview-panel">
      {/* 1. Train Title Bar */}
      <div className="overview-train-bar">
        <div className="train-title-group">
          <span className="train-number-tag">#{ticket.trainNumber}</span>
          <h2 className="train-name-text">{ticket.trainName}</h2>
          <div className="pulse-dot" style={{ height: 10, width: 10 }}></div>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={onRefresh}
          disabled={isRefreshing}
          id="refresh-status-btn"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 2. Balanced Status & Prediction Hero Duo */}
      <div className="status-hero-duo-grid">
        {/* Status Card with Same Dynamic Color Pattern */}
        <div
          className={`status-highlight-card prob-${probTheme.key}`}
          style={{
            background: probTheme.bg,
            borderColor: probTheme.border
          }}
        >
          <div className="status-highlight-header">
            <span
              className="highlight-subtitle"
            >
              Current Status
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {ticket.overallStatus === 'CNF' && <CheckCircle2 size={16} style={{ color: probTheme.color }} />}
              {ticket.overallStatus === 'RAC' && <AlertCircle size={16} style={{ color: probTheme.color }} />}
              {ticket.overallStatus === 'WL' && <Clock size={16} style={{ color: probTheme.color }} />}
              <span
                className="prob-tier-badge"
                style={{
                  color: probTheme.labelColor,
                  background: probTheme.bg,
                  borderColor: probTheme.border
                }}
              >
                {isMultiPassenger
                  ? `${passengers.length} TICKETS • ${ticket.overallStatus}`
                  : (ticket.overallStatus === 'CNF' ? 'CONFIRMED' : ticket.overallStatus === 'RAC' ? 'RAC' : (passengers[0]?.currentStatus || 'WAITLIST'))}
              </span>
            </div>
          </div>

          {isMultiPassenger ? (
            <div className="multi-passenger-hero-wrap">
              <div className="status-hero-val" style={{ color: probTheme.labelColor }}>
                {ticket.statusLabel}
              </div>
              <div className="multi-passenger-badges-grid">
                {passengers.map((p, idx) => {
                  const pProb = p.predictionPercentage || (p.currentStatus?.includes('CNF') ? 100 : prob);
                  const pTheme = getProbTheme(pProb);

                  return (
                    <div
                      key={p.id || idx}
                      className="hero-passenger-chip"
                      style={{
                        background: pTheme.bg,
                        border: `1px solid ${pTheme.border}`,
                        color: pTheme.labelColor
                      }}
                    >
                      <span className="chip-pnum">P{p.number || idx + 1}:</span>
                      <strong className="chip-status">
                        {p.currentStatus}
                      </strong>
                    </div>
                  );
                })}
              </div>
              <span className="status-hero-desc">
                {passengers.length} Passenger Tickets • Booked: {passengers.map(p => `P${p.number || ''}: ${p.bookingStatus}`).join(', ')}
              </span>
            </div>
          ) : (
            <>
              <div className="status-hero-val" style={{ color: probTheme.labelColor }}>
                {passengers[0]?.currentStatus || ticket.statusLabel}
              </div>
              <span className="status-hero-desc">
                {passengers[0]?.bookingStatus
                  ? `Booked: ${passengers[0].bookingStatus}`
                  : ticket.statusLabel}
              </span>
            </>
          )}
        </div>

        {/* Prediction / Chances Card with Dynamic Percentage Colors - Standardized with Card 1 */}
        <div
          className={`prediction-highlight-card prob-${probTheme.key}`}
          style={{
            background: probTheme.bg,
            borderColor: probTheme.border
          }}
        >
          {/* Symmetrical Top Header matching Card 1 */}
          <div className="status-highlight-header">
            <span className="highlight-subtitle">Chances</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={16} style={{ color: probTheme.color }} />
              <span
                className="prob-tier-badge"
                style={{
                  color: probTheme.labelColor,
                  background: probTheme.bg,
                  borderColor: probTheme.border
                }}
              >
                {probTheme.tier}
              </span>
            </div>
          </div>

          {/* Symmetrical Body Row */}
          <div className="prediction-body-row">
            <div className="prediction-chart-col">
              <div className="circle-progress compact">
                <svg viewBox="0 0 48 48" width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    stroke={probTheme.color}
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <span className="circle-progress-val" style={{ color: probTheme.labelColor }}>
                  {prob}%
                </span>
              </div>
            </div>
            <div className="prediction-body-text">
              <div className="status-hero-val" style={{ color: probTheme.labelColor }}>
                {ticket.predictionSummary || `${prob}% Chance`}
              </div>
              <span className="status-hero-desc">Historical PRS trend</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Balanced 2x2 Info Tiles Grid */}
      <div className="overview-tiles-grid">
        {/* Tile 1: Date of Journey */}
        <div className="overview-tile">
          <div className="tile-icon-box">
            <Calendar size={15} />
          </div>
          <div className="tile-content">
            <span className="tile-label">Journey Date</span>
            <strong className="tile-value">{cleanDate}</strong>
          </div>
        </div>

        {/* Tile 2: Class & Quota */}
        <div className="overview-tile">
          <div className="tile-icon-box">
            <Armchair size={15} />
          </div>
          <div className="tile-content">
            <span className="tile-label">Class & Quota</span>
            <strong className="tile-value">
              {ticket.classCode} • {ticket.quota?.split(' ')[0] || 'GN'}{isMultiPassenger ? ` • ${passengers.length} Pax` : ''}
            </strong>
          </div>
        </div>

        {/* Tile 3: Chart Status */}
        <div className="overview-tile">
          <div className="tile-icon-box">
            <FileCheck size={15} />
          </div>
          <div className="tile-content">
            <span className="tile-label">Chart Status</span>
            <strong className="tile-value" style={{ color: isChartPrepared ? '#34d399' : '#f59e0b' }}>
              ● {ticket.chartStatus || 'Not Prepared'}
            </strong>
          </div>
        </div>

        {/* Tile 4: System Telemetry */}
        <div className="overview-tile">
          <div className="tile-icon-box">
            <Zap size={15} />
          </div>
          <div className="tile-content">
            <span className="tile-label">Data Source</span>
            <strong className="tile-value" style={{ color: 'var(--accent-cyan)' }}>
              CRIS PRS Node
            </strong>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons Centered */}
      <div className="overview-actions-grid centered-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onPrintTicket}
          id="print-ticket-btn"
        >
          <Printer size={16} />
          <span>e-Ticket Slip</span>
        </button>

        <button
          type="button"
          className="btn-secondary json-action-btn"
          onClick={onOpenJsonModal}
          id="view-json-btn"
          title="Inspect the exact official Indian Railways JSON schema without captcha"
        >
          <Code2 size={16} />
          <span>CRIS JSON</span>
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={onShareStatus}
          id="share-status-btn"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
