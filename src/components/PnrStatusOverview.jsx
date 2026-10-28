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

import { getProbTheme } from '../services/pnrService';

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

  // Dynamic Chances Theme based on standardized ConfirmTkt & Ixigo brackets
  const prob = ticket.confirmationProbability || 72;
  const probTheme = getProbTheme(prob, ticket.overallStatus === 'CNF');

  const isChartPrepared = ticket.chartStatus?.toLowerCase().includes('prepared') && !ticket.chartStatus?.toLowerCase().includes('not');
  const passengers = ticket.passengers || [];
  const isMultiPassenger = passengers.length > 1;
  const cleanDate = ticket.dateOfJourney || '--';

  // Extract clean status badge text matching ConfirmTkt screenshots (e.g. "D4,18", "WL,5", "RAC,12", "CNF")
  const getStatusBadgeText = (p) => {
    if (!p) return '--';
    const coach = p.coach && p.coach !== '--' && p.coach !== '0' && p.coach !== 'NA' ? p.coach : '';
    const berth = p.berthNumber && p.berthNumber !== '--' && p.berthNumber !== '0' ? p.berthNumber : '';

    if (coach && berth) {
      return `${coach},${berth}`;
    }

    const raw = p.currentStatus || '';
    if (raw.includes('CNF')) {
      if (coach) return coach;
      return 'CNF';
    }

    const wlMatch = raw.match(/([A-Z]*WL|\bWL\b)\s*[\/,]?\s*(\d+)/i);
    if (wlMatch) {
      return `${wlMatch[1].toUpperCase()},${wlMatch[2]}`;
    }

    const racMatch = raw.match(/RAC\s*[\/,]?\s*(\d+)/i);
    if (racMatch) {
      return `RAC,${racMatch[1]}`;
    }

    return raw || 'CNF';
  };

  // Extract booking label matching ConfirmTkt screenshots (e.g. "Booking: WL 11", "Not chosen")
  const getBookingLabel = (p) => {
    if (!p) return '';
    const booking = p.bookingStatus || p.bookingStatusDetails || '';
    if (!booking || booking === '--' || booking === 'NA') {
      return 'Not chosen';
    }
    if (booking === 'CNF' || booking === 'CONFIRMED') {
      return 'Not chosen';
    }
    if (booking.toLowerCase().startsWith('booking:') || booking.toLowerCase().startsWith('booked:')) {
      return booking;
    }
    return `Booking: ${booking}`;
  };

  const handleWhatsAppShare = () => {
    if (onShareStatus) {
      onShareStatus();
    }
    const text = `*pnrBuddy Live PNR Status*\n` +
      `PNR: ${ticket.pnr}\n` +
      `Train: ${ticket.trainNumber} ${ticket.trainName}\n` +
      passengers.map((p, idx) => `P${p.number || idx + 1}: ${getStatusBadgeText(p)} (${getBookingLabel(p)})`).join('\n') +
      `\nRoute: ${ticket.fromStation?.name || ticket.fromStation?.code} ➔ ${ticket.toStation?.name || ticket.toStation?.code}` +
      `\nDOJ: ${ticket.dateOfJourney}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="glass-panel pnr-overview-panel">
      {/* 1. Train Title Bar */}
      <div className="overview-train-bar">
        <div className="train-title-group">
          <span className="train-number-tag">#{ticket.trainNumber}</span>
          <h2 className="train-name-text">{ticket.trainName}</h2>
          <div className="pulse-dot" style={{ height: 6, width: 6, marginLeft: "4px" }}></div>
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

      {/* 2. Passenger Status Card (As in Attached UI) */}
      <div
        className="confirmtkt-status-card"
        style={{
          background: probTheme.bg,
          borderColor: probTheme.border,
          marginBottom: '1rem'
        }}
      >
        {/* Passenger Rows List */}
        <div className="confirmtkt-passenger-list">
          {passengers.map((p, idx) => {
            const badgeText = getStatusBadgeText(p);
            const bookingText = getBookingLabel(p);
            const isCnf = p.currentStatus?.includes('CNF') || (!p.currentStatus?.includes('WL') && !p.currentStatus?.includes('RAC') && ticket.overallStatus === 'CNF');
            const isWl = p.currentStatus?.includes('WL') || p.currentStatus?.includes('W/L');
            const isRac = p.currentStatus?.includes('RAC');
            const pProb = p.predictionPercentage || (isCnf ? 100 : isRac ? 85 : prob);
            const pTheme = getProbTheme(pProb, isCnf);

            return (
              <div key={p.id || idx} className="confirmtkt-passenger-item">
                {/* Top Line: Name and Tags */}
                <div className="confirmtkt-passenger-header">
                  <span className="confirmtkt-passenger-name">
                    {p.name || `Passenger ${p.number || idx + 1}`}
                  </span>
                  {p.food && (
                    <span className="confirmtkt-veg-badge">
                      {p.food.toUpperCase()}
                    </span>
                  )}
                  {p.quota && p.quota !== 'GN' && (
                    <span className="confirmtkt-quota-badge">
                      {p.quota}
                    </span>
                  )}
                </div>

                {/* Bottom Line: [Status Badge] Booking Text ... Outcome */}
                <div className="confirmtkt-passenger-body">
                  <div className="confirmtkt-status-col">
                    <span className={`confirmtkt-status-badge badge-${isCnf ? 'cnf' : pTheme.key}`}>
                      {badgeText}
                    </span>
                    <span className="confirmtkt-booking-desc">
                      {bookingText}
                    </span>
                  </div>

                  <div className="confirmtkt-outcome-col">
                    {isCnf ? (
                      <span className="confirmtkt-outcome cnf">
                        <CheckCircle2 size={16} />
                        <span>Confirmed</span>
                      </span>
                    ) : (
                      <span
                        className={`confirmtkt-outcome ${pTheme.key}`}
                        style={{ color: pTheme.labelColor }}
                      >
                        <Clock size={15} />
                        <span>{pProb}% Chance</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Share Trip Button matching attached image */}
        <div className="confirmtkt-card-footer">
          <button
            type="button"
            className="confirmtkt-share-trip-btn"
            onClick={handleWhatsAppShare}
            title="Share Live Status via WhatsApp"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="#25D366" style={{ flexShrink: 0 }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.89 11.89 0 005.71 1.454h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>SHARE TRIP</span>
          </button>
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
