import React from 'react';
import {
  CheckCircle2,
  XCircle,
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
  FileCheck,
  Train
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

  const passengers = ticket.passengers || [];
  const isMultiPassenger = passengers.length > 1;
  const cleanDate = ticket.dateOfJourney || '--';

  // Helper to detect if a passenger is cancelled
  const isPassengerCancelled = (p) => {
    if (!p) return false;
    const curr = String(p.currentStatus || p.currentStatusDetails || '').toUpperCase().trim();
    const cnfTkt = String(p.confirmTktStatus || '').toUpperCase().trim();
    if (curr.includes('RAC')) return false;

    if (
      curr === 'CAN' ||
      curr.startsWith('CAN ') ||
      curr.startsWith('CAN/') ||
      curr.startsWith('CAN,') ||
      curr.includes('CANCEL') ||
      /\bCAN\b/.test(curr) ||
      cnfTkt.includes('CANCEL') ||
      cnfTkt === 'CAN'
    ) {
      return true;
    }

    if (ticket.overallStatus === 'CAN' || ticket.overallStatus === 'CANCELLED') {
      if (!curr.includes('CNF') && !curr.includes('WL') && !curr.includes('RAC')) {
        return true;
      }
    }
    return false;
  };

  // Dynamic Chances Theme based on standardized ConfirmTkt & Ixigo brackets
  const isAllCancelled = passengers.length > 0 && passengers.every(isPassengerCancelled);
  const isTicketCancelled = ticket.overallStatus === 'CAN' || ticket.overallStatus === 'CANCELLED' || isAllCancelled;
  const prob = ticket.confirmationProbability || (isTicketCancelled ? 0 : 72);
  const probTheme = getProbTheme(prob, ticket.overallStatus === 'CNF', isTicketCancelled);

  const isChartPrepared = ticket.chartStatus?.toLowerCase().includes('prepared') && !ticket.chartStatus?.toLowerCase().includes('not');

  // Extract clean status badge text matching ConfirmTkt screenshots (e.g. "B4, 14", "D4, 18", "WL, 5", "RAC, 12", "CAN", "CNF")
  const getStatusBadgeText = (p) => {
    if (!p) return '--';
    if (isPassengerCancelled(p)) {
      return 'CAN';
    }

    const coach = p.coach && p.coach !== '--' && p.coach !== '0' && p.coach !== 'NA' ? p.coach : '';
    const berth = p.berthNumber && p.berthNumber !== '--' && p.berthNumber !== '0' ? p.berthNumber : '';

    if (coach && berth) {
      return `${coach}, ${berth}`;
    }

    const raw = p.currentStatus || '';
    const rawCnfMatch = raw.match(/CNF[\/,\s]+([A-Z0-9]+)[\/,\s]+(\d+)/i);
    if (rawCnfMatch) {
      return `${rawCnfMatch[1].toUpperCase()}, ${rawCnfMatch[2]}`;
    }

    if (raw.includes('CNF')) {
      if (coach) return coach;
      return 'CNF';
    }

    const wlMatch = raw.match(/([A-Z]*WL|\bWL\b)\s*[\/,]?\s*(\d+)/i);
    if (wlMatch) {
      return `${wlMatch[1].toUpperCase()}, ${wlMatch[2]}`;
    }

    const racMatch = raw.match(/RAC\s*[\/,]?\s*(\d+)/i);
    if (racMatch) {
      return `RAC, ${racMatch[1]}`;
    }

    return raw || 'CNF';
  };

  // Extract or calculate berth type name (e.g. "Upper Berth", "Lower Berth", etc.)
  const getBerthTypeLabel = (p) => {
    if (!p) return '';

    // Check code abbreviation
    const code = String(p.berthCode || p.currentBerthCode || p.bookingBerthCode || '').toUpperCase().trim();
    const codeMap = {
      'UB': 'Upper Berth',
      'MB': 'Middle Berth',
      'LB': 'Lower Berth',
      'SL': 'Side Lower',
      'SU': 'Side Upper',
      'SUB': 'Side Upper',
      'SLB': 'Side Lower',
      'WS': 'Window Seat',
      'CB': 'Cabin',
      'CP': 'Coupe'
    };
    if (codeMap[code]) return codeMap[code];

    // If p.berthType is already a descriptive string
    if (p.berthType && typeof p.berthType === 'string') {
      const clean = p.berthType.replace(/\s*\([A-Z0-9]+\)/gi, '').trim();
      if (
        clean &&
        clean !== 'Confirmed Berth' &&
        clean !== 'Sitting Berth' &&
        clean !== 'Pending Charting' &&
        clean !== 'Ticket Cancelled'
      ) {
        return clean;
      }
    }

    // Determine from berth number
    const rawNum = p.berthNumber || p.currentBerthNo || p.berth || '';
    const bNum = parseInt(String(rawNum).replace(/\D/g, ''), 10);
    if (!isNaN(bNum) && bNum > 0) {
      const is2A = ticket?.classCode?.includes('2A');
      if (is2A) {
        const mod = bNum % 6;
        if (mod === 1 || mod === 3) return 'Lower Berth';
        if (mod === 2 || mod === 4) return 'Upper Berth';
        if (mod === 5) return 'Side Lower';
        if (mod === 0) return 'Side Upper';
      } else {
        const mod = bNum % 8;
        if (mod === 1 || mod === 4) return 'Lower Berth';
        if (mod === 2 || mod === 5) return 'Middle Berth';
        if (mod === 3 || mod === 6) return 'Upper Berth';
        if (mod === 7) return 'Side Lower';
        if (mod === 0) return 'Side Upper';
      }
    }

    // Check if status contains berth code like "UB", "LB", etc.
    const raw = `${p.currentStatus || ''} ${p.currentStatusDetails || ''} ${p.bookingStatusDetails || ''}`;
    for (const [abbr, label] of Object.entries(codeMap)) {
      const reg = new RegExp(`\\b${abbr}\\b`, 'i');
      if (reg.test(raw)) {
        return label;
      }
    }

    return '';
  };

  // Extract booking label matching ConfirmTkt screenshots (e.g. "Booking: RLWL, 94", "Booking: WL 11", "Not chosen")
  const getBookingLabel = (p) => {
    if (!p) return '';
    const booking = p.bookingStatus || p.bookingStatusDetails || '';
    if (!booking || booking === '--' || booking === 'NA') {
      return 'Not chosen';
    }
    if (booking === 'CNF' || booking === 'CONFIRMED') {
      return 'Not chosen';
    }
    let cleaned = booking;
    if (cleaned.toLowerCase().startsWith('booking:') || cleaned.toLowerCase().startsWith('booked:')) {
      cleaned = cleaned.replace(/^booking:\s*/i, '').replace(/^booked:\s*/i, '').trim();
    }
    // Normalize "RLWL 94" or "RLWL/94" -> "RLWL, 94"
    cleaned = cleaned.replace(/([A-Z]*WL|\bWL\b)\s*[\/,]?\s*(\d+)/i, (m, p1, p2) => `${p1.toUpperCase()}, ${p2}`);
    cleaned = cleaned.replace(/RAC\s*[\/,]?\s*(\d+)/i, (m, p1) => `RAC, ${p1}`);
    return `Booking: ${cleaned}`;
  };

  // Get passenger subtext: if CNF and has berth, show berth type (e.g. "Upper Berth"), else show booking label
  const getPassengerSubtext = (p, isCnf, isCan) => {
    if (isCan) {
      return getBookingLabel(p);
    }
    if (isCnf) {
      const berthLabel = getBerthTypeLabel(p);
      if (berthLabel) {
        return berthLabel;
      }
    }
    return getBookingLabel(p);
  };

  const handleWhatsAppShare = () => {
    if (onShareStatus) {
      onShareStatus();
    }
    const text = `*pnrBuddy Live PNR Status*\n` +
      `PNR: ${ticket.pnr}\n` +
      `Train: ${ticket.trainNumber} ${ticket.trainName}\n` +
      passengers.map((p, idx) => {
        const isCan = isPassengerCancelled(p);
        const isCnf = !isCan && (p.currentStatus?.includes('CNF') || (!p.currentStatus?.includes('WL') && !p.currentStatus?.includes('RAC') && ticket.overallStatus === 'CNF'));
        return `P${p.number || idx + 1}: ${getStatusBadgeText(p)} (${getPassengerSubtext(p, isCnf, isCan)})`;
      }).join('\n') +
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
            const isCan = isPassengerCancelled(p);
            const badgeText = getStatusBadgeText(p);
            const isCnf = !isCan && (p.currentStatus?.includes('CNF') || (!p.currentStatus?.includes('WL') && !p.currentStatus?.includes('RAC') && ticket.overallStatus === 'CNF'));
            const isWl = !isCan && (p.currentStatus?.includes('WL') || p.currentStatus?.includes('W/L'));
            const isRac = !isCan && p.currentStatus?.includes('RAC');
            const subtext = getPassengerSubtext(p, isCnf, isCan);
            const match = p.prediction ? p.prediction.match(/(\d+)%/) : null;
            const pProb = isCan ? 0 : (p.predictionPercentage || (match ? parseInt(match[1], 10) : (isCnf ? 100 : isRac ? 85 : prob)));
            const pTheme = getProbTheme(pProb, isCnf, isCan);

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

                {/* Bottom Line: [Status Badge] Booking Text / Berth Type ... Outcome */}
                <div className="confirmtkt-passenger-body">
                  <div className="confirmtkt-status-col">
                    <span
                      className="confirmtkt-status-badge"
                      style={{
                        color: pTheme.labelColor,
                        background: pTheme.bg,
                        border: `1px solid ${pTheme.border}`
                      }}
                    >
                      {badgeText}
                    </span>
                    <span className="confirmtkt-booking-desc">
                      {subtext}
                    </span>
                  </div>

                  <div className="confirmtkt-outcome-col">
                    {isCan ? (
                      <span
                        className="confirmtkt-outcome can"
                        style={{ color: pTheme.labelColor }}
                      >
                        <XCircle size={16} />
                        <span>Cancelled</span>
                      </span>
                    ) : isCnf ? (
                      <span
                        className="confirmtkt-outcome cnf"
                        style={{ color: pTheme.labelColor }}
                      >
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

        {/* Tile 4: Coach */}
        <div className="overview-tile">
          <div className="tile-icon-box">
            <Train size={15} />
          </div>
          <div className="tile-content">
            <span className="tile-label">Coach</span>
            <strong 
              className="tile-value" 
              style={{ color: ticket.coach && ticket.coach !== 'Pending Chart' && ticket.coach !== '--' ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}
              title={ticket.coach || 'Coach allotment'}
            >
              {ticket.coach && ticket.coach !== 'Pending Chart' && ticket.coach !== '--' 
                ? ticket.coach 
                : 'Pending Chart'}
            </strong>
          </div>
        </div>

        {/* Tile 5: System Telemetry */}
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
