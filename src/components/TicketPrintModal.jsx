import React from 'react';
import {
  X,
  Printer,
  Download,
  Train,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { getProbTheme } from '../services/pnrService';

export default function TicketPrintModal({ ticket, onClose }) {
  if (!ticket) return null;

  // Cancellation and Confirmation checks
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

  const passengers = ticket.passengers || [];
  const isAllCancelled = passengers.length > 0 && passengers.every(isPassengerCancelled);
  const isCanTicket = ticket.overallStatus === 'CAN' || ticket.overallStatus === 'CANCELLED' || isAllCancelled;
  const isCnfTicket = !isCanTicket && ticket.overallStatus === 'CNF';
  const prob = ticket.confirmationProbability || (isCanTicket ? 0 : 72);
  const probTheme = getProbTheme(prob, isCnfTicket, isCanTicket);

  // Extract or calculate berth type name (e.g. "Upper Berth", "Lower Berth", etc.)
  const getBerthTypeLabel = (p) => {
    if (!p) return '';

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

    const raw = `${p.currentStatus || ''} ${p.currentStatusDetails || ''} ${p.bookingStatusDetails || ''}`;
    for (const [abbr, label] of Object.entries(codeMap)) {
      const reg = new RegExp(`\\b${abbr}\\b`, 'i');
      if (reg.test(raw)) {
        return label;
      }
    }

    return '';
  };

  // const handlePrint = () => {
  //   window.print();
  // };

  const printTimestamp = React.useMemo(() => {
    const now = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    return `${dateStr}, ${timeStr}`;
  }, []);

  const handleDownload = () => {
    const htmlContent = generatePrintableHtml(ticket, probTheme, isCanTicket, isCnfTicket, getBerthTypeLabel, printTimestamp);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IRCTC_eTicket_${ticket.pnr}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statusLabelText = isCanTicket
    ? 'CANCELLED'
    : (isCnfTicket ? 'CONFIRMED' : `${ticket.overallStatus} • ${ticket.statusLabel}`);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <Printer size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Electronic Reservation Slip (ERS)</h3>
            <span className="ticket-printed-header-badge">
              <Clock size={12} />
              Printed: {printTimestamp}
            </span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Printable Ticket Container */}
          <div className="boarding-pass-ticket" id="printable-ticket-content">
            {/* Top Meta Strip: Printed Date & Time */}
            <div className="ticket-top-meta">
              <span className="ticket-top-meta-service">
                IRCTC e-Ticketing Service • Electronic Reservation Slip (ERS)
              </span>
              <span className="ticket-top-meta-time">
                <Clock size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />
                Printed Time: <strong>{printTimestamp}</strong>
              </span>
            </div>


            {/* 1. IRCTC Header */}
            <div className="ticket-irctc-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  <Train size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '0.02em' }}>
                    INDIAN RAILWAYS
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    Centre for Railway Information Systems (CRIS)
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  background: probTheme.bg,
                  color: probTheme.color,
                  border: `1px solid ${probTheme.border}`,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  letterSpacing: '0.04em'
                }}>
                  {statusLabelText}
                </span>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px', fontWeight: 500 }}>
                  ● {ticket.chartStatus || 'Chart Not Prepared'}
                </div>
                <div className="ticket-top-meta">
                  <span>
                    Printed on: <strong>{printTimestamp}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. PNR & Train Details Banner (Responsive Grid) */}
            <div className="ticket-pnr-banner">
              <div className="ticket-pnr-item">
                <span className="ticket-pnr-label">PNR NUMBER</span>
                <span className="ticket-pnr-val pnr-highlight">{ticket.pnr}</span>
              </div>
              <div className="ticket-pnr-item">
                <span className="ticket-pnr-label">TRAIN NO & NAME</span>
                <span className="ticket-pnr-val" title={`#${ticket.trainNumber} ${ticket.trainName}`}>
                  #{ticket.trainNumber} {ticket.trainName}
                </span>
              </div>
              <div className="ticket-pnr-item">
                <span className="ticket-pnr-label">CLASS & QUOTA</span>
                <span className="ticket-pnr-val">
                  {ticket.classCode} • {ticket.quota?.split(' ')[0] || 'GN'}
                </span>
              </div>
              <div className="ticket-pnr-item">
                <span className="ticket-pnr-label">DATE OF JOURNEY</span>
                <span className="ticket-pnr-val">{ticket.dateOfJourney || '--'}</span>
              </div>
            </div>

            {/* 3. Station Route Details Box */}
            <div className="ticket-route-box">
              <div className="ticket-stations-grid">
                {/* Boarding Station */}
                <div className="ticket-station-block">
                  <span className="ticket-pnr-label">BOARDING STATION</span>
                  <div className="ticket-station-code">{ticket.fromStation?.code || '--'}</div>
                  <div className="ticket-station-name" title={ticket.fromStation?.name}>
                    {ticket.fromStation?.name || ticket.fromStation?.code}
                  </div>
                  <div className="ticket-station-time">
                    DEP {ticket.departureTime || '--:--'}
                  </div>
                  {ticket.fromStation?.platform && (
                    <div className="ticket-station-platform">
                      {ticket.fromStation.platform}
                    </div>
                  )}
                </div>

                {/* Journey Mid Connector */}
                <div className="ticket-journey-mid">
                  <span className="ticket-duration-badge">
                    {ticket.duration || '--'}
                  </span>
                  <div className="ticket-route-line">
                    <span className="dot"></span>
                    <span className="dash"></span>
                    <Train size={14} className="train-icon" />
                    <span className="dash"></span>
                    <span className="dot"></span>
                  </div>
                  {ticket.distanceKm && (
                    <span style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>
                      {ticket.distanceKm} km
                    </span>
                  )}
                </div>

                {/* Destination Station */}
                <div className="ticket-station-block dest">
                  <span className="ticket-pnr-label">RESERVATION UPTO</span>
                  <div className="ticket-station-code">{ticket.toStation?.code || '--'}</div>
                  <div className="ticket-station-name" title={ticket.toStation?.name}>
                    {ticket.toStation?.name || ticket.toStation?.code}
                  </div>
                  <div className="ticket-station-time">
                    ARR {ticket.arrivalTime || '--:--'}
                  </div>
                  {ticket.toStation?.platform && (
                    <div className="ticket-station-platform">
                      {ticket.toStation.platform}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Passenger Manifest Section */}
            <div className="ticket-passenger-section">
              <span className="ticket-section-title">
                PASSENGER BOOKING DETAILS ({passengers.length} {passengers.length > 1 ? 'PASSENGERS' : 'PASSENGER'})
              </span>

              {/* Desktop / Print Table (> 580px) */}
              <table className="ticket-passenger-desktop-table">
                <thead>
                  <tr>
                    <th># Passenger</th>
                    <th>Booking Status</th>
                    <th>Current Status</th>
                    <th>Coach / Berth</th>
                    <th>Confirmation</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.map((p, idx) => {
                    const isCan = isPassengerCancelled(p);
                    const isCnf = !isCan && (p.currentStatus?.includes('CNF') || isCnfTicket);
                    const pChance = p.predictionPercentage || (isCnf ? 100 : prob);
                    const pTheme = getProbTheme(pChance, isCnf, isCan);
                    const berthType = getBerthTypeLabel(p);
                    const coachBerthText = (p.coach && p.coach !== 'NA' && p.coach !== '--')
                      ? `${p.coach}, ${p.berthNumber}${berthType ? ` • ${berthType}` : ''}`
                      : 'Chart Pending';

                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>
                          {p.name || `Passenger ${p.number || idx + 1}`}
                        </td>
                        <td style={{ color: '#475569' }}>
                          {p.bookingStatus || '--'}
                        </td>
                        <td style={{ fontWeight: 700, color: pTheme.color }}>
                          {isCan ? 'CAN' : (p.currentStatus || '--')}
                        </td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          {coachBerthText}
                        </td>
                        <td style={{ fontWeight: 700, color: pTheme.color }}>
                          {isCan ? 'Cancelled' : (isCnf ? '100% Confirmed' : (p.prediction || `${pChance}%`))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile Cards (<= 580px) */}
              <div className="ticket-passenger-mobile-list">
                {passengers.map((p, idx) => {
                  const isCan = isPassengerCancelled(p);
                  const isCnf = !isCan && (p.currentStatus?.includes('CNF') || isCnfTicket);
                  const pChance = p.predictionPercentage || (isCnf ? 100 : prob);
                  const pTheme = getProbTheme(pChance, isCnf, isCan);
                  const berthType = getBerthTypeLabel(p);
                  const coachBerthText = (p.coach && p.coach !== 'NA' && p.coach !== '--')
                    ? `${p.coach}, ${p.berthNumber}${berthType ? ` (${berthType})` : ''}`
                    : 'Chart Pending';

                  return (
                    <div key={idx} className="ticket-pax-card">
                      <div className="ticket-pax-card-top">
                        <span className="ticket-pax-name">
                          {p.name || `Passenger ${p.number || idx + 1}`}
                        </span>
                        <span
                          className="ticket-pax-status-tag"
                          style={{
                            background: pTheme.bg,
                            color: pTheme.color,
                            border: `1px solid ${pTheme.border}`
                          }}
                        >
                          {isCan ? 'Cancelled' : (isCnf ? 'Confirmed' : p.currentStatus)}
                        </span>
                      </div>
                      <div className="ticket-pax-grid">
                        <div className="ticket-pax-grid-item">
                          <span className="ticket-pax-grid-label">BOOKING STATUS</span>
                          <span className="ticket-pax-grid-val">{p.bookingStatus || '--'}</span>
                        </div>
                        <div className="ticket-pax-grid-item">
                          <span className="ticket-pax-grid-label">CURRENT STATUS</span>
                          <span className="ticket-pax-grid-val" style={{ color: pTheme.color }}>
                            {p.currentStatus || '--'}
                          </span>
                        </div>
                        <div className="ticket-pax-grid-item" style={{ gridColumn: 'span 2' }}>
                          <span className="ticket-pax-grid-label">COACH / BERTH</span>
                          <span className="ticket-pax-grid-val">
                            {coachBerthText}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Total Fare & Security */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.85rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              fontSize: '0.82rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <span style={{ color: '#64748b' }}>Total Fare Paid: </span>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                  {ticket.ticketFare ? `₹${ticket.ticketFare}` : (ticket.bookingFare ? `₹${ticket.bookingFare}` : 'As per IRCTC receipt')}
                </strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontWeight: 600 }}>
                <ShieldCheck size={16} />
                <span>IRCTC Official Reservation Record</span>
              </div>
            </div>

            {/* Travel Guidelines Notice */}
            <div className="ticket-id-warning">
              <span className="warning-prefix">MANDATORY:</span>
              Original Govt. photo ID proof (Aadhaar / Voter ID / Passport / Driving License) is required during the journey for TTE verification.
            </div>
          </div>

          {/* Action Row */}
          <div className="ticket-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
            {/* <button
              type="button"
              className="btn-secondary"
              onClick={handlePrint}
              id="print-ticket-btn"
              title="Print ticket directly or save as PDF"
            >
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button> */}
            <button
              type="button"
              className="btn-primary"
              onClick={handleDownload}
              id="download-ticket-btn"
              title="Download standalone offline e-Ticket"
            >
              <Download size={16} />
              <span>Download e-Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generates a self-contained, standalone, offline HTML e-Ticket file
function generatePrintableHtml(ticket, probTheme, isCanTicket, isCnfTicket, getBerthTypeLabel, printTimestamp) {
  const pnr = ticket.pnr || 'PNR';
  const trainNo = ticket.trainNumber || '';
  const trainName = ticket.trainName || '';
  const passengers = ticket.passengers || [];

  const statusColor = isCanTicket ? '#dc2626' : isCnfTicket ? '#16a34a' : '#d97706';
  const statusBg = isCanTicket ? '#fef2f2' : isCnfTicket ? '#f0fdf4' : '#fffbeb';
  const statusBorder = isCanTicket ? '#fca5a5' : isCnfTicket ? '#86efac' : '#fcd34d';
  const statusText = isCanTicket ? 'CANCELLED' : isCnfTicket ? 'CONFIRMED' : `${ticket.overallStatus} • ${ticket.statusLabel}`;

  const paxRows = passengers.map((p, idx) => {
    const isCan = !p.currentStatus?.includes('RAC') && (
      p.currentStatus === 'CAN' ||
      p.currentStatus?.startsWith('CAN/') ||
      p.currentStatus?.startsWith('CAN ') ||
      p.currentStatus?.includes('CANCEL') ||
      isCanTicket
    );
    const isCnf = !isCan && (p.currentStatus?.includes('CNF') || isCnfTicket);
    const berthType = getBerthTypeLabel(p);
    const coachBerth = (p.coach && p.coach !== 'NA' && p.coach !== '--')
      ? `${p.coach}, ${p.berthNumber}${berthType ? ` • ${berthType}` : ''}`
      : 'Chart Pending';
    const statusCol = isCan ? 'Cancelled' : isCnf ? 'Confirmed' : p.currentStatus;
    const statusStyle = isCan ? 'color: #dc2626; font-weight: 700;' : isCnf ? 'color: #16a34a; font-weight: 700;' : 'color: #d97706; font-weight: 700;';

    return `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">${p.name || `Passenger ${p.number || idx + 1}`}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #475569;">${p.bookingStatus || '--'}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; ${statusStyle}">${p.currentStatus || '--'}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">${coachBerth}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; ${statusStyle}">${statusCol}</td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IRCTC Electronic Reservation Slip (ERS) - PNR ${pnr}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: #f1f5f9; padding: 24px 16px; color: #0f172a; line-height: 1.4; }
    .ticket-container { max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1.5px solid #0f172a; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    .top-meta { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #cbd5e1; flex-wrap: wrap; gap: 6px; }
    .top-meta strong { color: #0f172a; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
    .rail-logo { display: flex; align-items: center; gap: 10px; }
    .badge-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #0284c7, #0369a1); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 18px; }
    .title h1 { font-size: 17px; font-weight: 800; color: #0f172a; }
    .title span { font-size: 11px; color: #64748b; font-weight: 600; }
    .status-pill { background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusBorder}; padding: 4px 10px; border-radius: 4px; font-weight: 800; font-size: 12px; text-transform: uppercase; }
    .pnr-bar { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 16px; }
    .pnr-item { display: flex; flex-direction: column; }
    .pnr-lbl { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
    .pnr-val { font-size: 13px; font-weight: 700; color: #0f172a; }
    .pnr-num { font-size: 18px; font-weight: 900; color: #0284c7; font-family: monospace; }
    .route-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; }
    .station { flex: 1; min-width: 0; }
    .station.dest { text-align: right; }
    .stn-code { font-size: 22px; font-weight: 900; color: #0f172a; font-family: monospace; }
    .stn-name { font-size: 13px; font-weight: 600; color: #334155; margin: 2px 0 4px; }
    .stn-time { font-size: 13px; font-weight: 700; color: #0284c7; }
    .route-mid { text-align: center; flex-shrink: 0; padding: 0 12px; }
    .duration { font-size: 11px; font-weight: 700; background: #e2e8f0; padding: 3px 10px; border-radius: 12px; color: #475569; display: inline-block; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
    th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-weight: 700; color: #475569; border-bottom: 1px solid #cbd5e1; }
    .fare-box { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 14px; margin-bottom: 16px; font-size: 13px; flex-wrap: wrap; gap: 8px; }
    .id-notice { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 3px solid #0284c7; padding: 10px 14px; font-size: 11px; color: #475569; border-radius: 4px; line-height: 1.4; margin-top: 14px; }
    .actions-bar { max-width: 680px; margin: 0 auto 16px auto; display: flex; justify-content: flex-end; gap: 10px; }
    .print-btn { padding: 10px 18px; background: #0284c7; color: white; border: none; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    @media print {
      body { background: white; padding: 0; }
      .actions-bar { display: none !important; }
      .ticket-container { box-shadow: none; border: 1.5px solid #0f172a; max-width: 100%; border-radius: 0; padding: 16px; }
    }
  </style>
</head>
<body>
  <div class="actions-bar">
    <button type="button" class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="ticket-container">
    <div class="top-meta">
      <span>IRCTC e-Ticketing Service • Electronic Reservation Slip (ERS)</span>
      <span>Printed Time: <strong>${printTimestamp}</strong></span>
    </div>
    <div class="header">
      <div class="rail-logo">
        <div class="badge-icon">IR</div>
        <div class="title">
          <h1>INDIAN RAILWAYS</h1>
          <span>Centre for Railway Information Systems (CRIS) • ERS</span>
        </div>
      </div>
      <div style="text-align: right;">
        <span class="status-pill">${statusText}</span>
        <div style="font-size: 11px; color: #64748b; margin-top: 3px;">● ${ticket.chartStatus || 'Chart Not Prepared'}</div>
      </div>
    </div>

    <div class="pnr-bar">
      <div class="pnr-item">
        <span class="pnr-lbl">PNR NUMBER</span>
        <span class="pnr-num">${pnr}</span>
      </div>
      <div class="pnr-item">
        <span class="pnr-lbl">TRAIN NO & NAME</span>
        <span class="pnr-val">#${trainNo} ${trainName}</span>
      </div>
      <div class="pnr-item">
        <span class="pnr-lbl">CLASS & QUOTA</span>
        <span class="pnr-val">${ticket.classCode || ''} • ${ticket.quota || 'General (GN)'}</span>
      </div>
      <div class="pnr-item">
        <span class="pnr-lbl">JOURNEY DATE</span>
        <span class="pnr-val">${ticket.dateOfJourney || '--'}</span>
      </div>
    </div>

    <div class="route-box">
      <div class="station">
        <span class="pnr-lbl">BOARDING STATION</span>
        <div class="stn-code">${ticket.fromStation?.code || '--'}</div>
        <div class="stn-name">${ticket.fromStation?.name || ticket.fromStation?.code || '--'}</div>
        <div class="stn-time">DEP ${ticket.departureTime || '--:--'} • ${ticket.dateOfJourney}</div>
      </div>
      <div class="route-mid">
        <span class="duration">${ticket.duration || '--'}</span>
        <div style="font-size: 15px; color: #0284c7; margin: 2px 0;">➔</div>
        ${ticket.distanceKm ? `<span style="font-size: 10px; color: #64748b; font-weight: 600;">${ticket.distanceKm} km</span>` : ''}
      </div>
      <div class="station dest">
        <span class="pnr-lbl">RESERVATION UPTO</span>
        <div class="stn-code">${ticket.toStation?.code || '--'}</div>
        <div class="stn-name">${ticket.toStation?.name || ticket.toStation?.code || '--'}</div>
        <div class="stn-time">ARR ${ticket.arrivalTime || '--:--'} • ${ticket.arrivalDate || ticket.dateOfJourney}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th># Passenger</th>
          <th>Booking Status</th>
          <th>Current Status</th>
          <th>Coach / Berth</th>
          <th>Confirmation</th>
        </tr>
      </thead>
      <tbody>
        ${paxRows}
      </tbody>
    </table>

    <div class="fare-box">
      <div>
        <span style="color: #64748b;">Total Ticket Fare: </span>
        <strong style="font-size: 16px; color: #0f172a;">${ticket.ticketFare ? `₹${ticket.ticketFare}` : (ticket.bookingFare ? `₹${ticket.bookingFare}` : 'As per official IRCTC receipt')}</strong>
      </div>
      <div style="color: #16a34a; font-weight: 700; display: flex; align-items: center; gap: 4px;">
        ✓ Official CRIS Reservation Record
      </div>
    </div>

    <div class="id-notice">
      <strong>MANDATORY:</strong> Prescribed original photo ID proof (Aadhaar / Voter ID / Passport / Driving License / Student ID) is required during journey for verification by TTE.
    </div>
  </div>
</body>
</html>`;
}
