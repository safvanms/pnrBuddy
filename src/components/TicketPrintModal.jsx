import React from 'react';
import {
  X,
  Printer,
  Download,
  Train,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Check
} from 'lucide-react';
import { getProbTheme } from '../services/pnrService';

export default function TicketPrintModal({ ticket, onClose, onDownloadSuccess }) {
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

  const [downloaded, setDownloaded] = React.useState(false);

  const handleDownload = () => {
    try {
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

      setDownloaded(true);
      if (onDownloadSuccess) {
        onDownloadSuccess('e-Ticket downloaded successfully!');
      }
      setTimeout(() => setDownloaded(false), 3500);
    } catch (err) {
      console.error('Download ticket error:', err);
    }
  };

  const statusLabelText = isCanTicket
    ? 'CANCELLED'
    : (isCnfTicket ? 'CONFIRMED' : `${ticket.overallStatus} • ${ticket.statusLabel}`);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title-wrap">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Printer size={18} style={{ color: 'var(--accent-cyan)', flexShrink: 0 }} />
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0 }}>Electronic Reservation Slip (ERS)</h3>
            </div>
            <span className="ticket-printed-header-badge">
              <Clock size={11} />
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
                      ? `${p.coach}, ${p.berthNumber}${berthType ? ` • ${berthType}` : ''}${p.coachPositionLabel ? ` (${p.coachPositionLabel})` : ''}`
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
                    ? `${p.coach}, ${p.berthNumber}${berthType ? ` (${berthType})` : ''}${p.coachPositionLabel ? ` • ${p.coachPositionLabel}` : ''}`
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
              className={downloaded ? "btn-primary btn-success-glow" : "btn-primary"}
              onClick={handleDownload}
              id="download-ticket-btn"
              title="Download standalone offline e-Ticket"
              style={downloaded ? { background: '#16a34a', borderColor: '#16a34a' } : undefined}
            >
              {downloaded ? (
                <>
                  <Check size={16} />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Download e-Ticket</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Boarding-Pass Style HTML Generator (reference-image layout) ─────────────
// Matches the reference: dark-navy header "PNR e-TICKET", FROM→TO route,
// all passenger details, right-side tear-off stub, MANDATORY section.
// No barcode/QR. Saves as a self-contained .html file on click.
function generatePrintableHtml(ticket, probTheme, isCanTicket, isCnfTicket, getBerthTypeLabel, printTimestamp) {
  const pnr        = ticket.pnr        || 'PNR';
  const trainNo    = ticket.trainNumber || '';
  const trainName  = ticket.trainName   || '';
  const passengers = ticket.passengers  || [];

  const statusColor  = isCanTicket ? '#dc2626' : isCnfTicket ? '#16a34a' : '#d97706';
  const statusBg     = isCanTicket ? '#fef2f2' : isCnfTicket ? '#dcfce7' : '#fffbeb';
  const statusBorder = isCanTicket ? '#fca5a5' : isCnfTicket ? '#86efac' : '#fcd34d';
  const statusText   = isCanTicket ? 'CANCELLED' : isCnfTicket ? 'CONFIRMED'
    : (ticket.overallStatus + ' • ' + ticket.statusLabel);

  const fromCode  = (ticket.fromStation && ticket.fromStation.code) || '--';
  const fromName  = (ticket.fromStation && ticket.fromStation.name) || fromCode;
  const toCode    = (ticket.toStation   && ticket.toStation.code)   || '--';
  const toName    = (ticket.toStation   && ticket.toStation.name)   || toCode;
  const depTime   = ticket.departureTime || '--:--';
  const arrTime   = ticket.arrivalTime   || '--:--';
  const doj       = ticket.dateOfJourney || '--';
  const arrDate   = ticket.arrivalDate   || doj;
  const dur       = ticket.duration      || '--';
  const distKm    = ticket.distanceKm ? (ticket.distanceKm + ' km') : '';
  const classCode = ticket.classCode  || '--';
  const quota     = ticket.quota      || 'General (GN)';
  const fareAmt   = ticket.ticketFare  ? ('₹' + ticket.ticketFare)
                  : ticket.bookingFare ? ('₹' + ticket.bookingFare)
                  : 'As per IRCTC Receipt';
  const chartSt   = ticket.chartStatus || 'Chart Not Prepared';

  // Stub: first passenger coach/berth
  const fp       = passengers[0] || {};
  const fpCoach  = (fp.coach && fp.coach !== '--' && fp.coach !== 'NA') ? fp.coach : '--';
  const fpBerth  = (fp.berthNumber && fp.berthNumber !== '--') ? fp.berthNumber : '--';
  const fpPos    = fp.coachPositionLabel ? (' • ' + fp.coachPositionLabel) : '';
  const firstSeat = fpCoach !== '--' ? (fpCoach + ' / ' + fpBerth + fpPos) : 'Pending';

  // ── Passenger table rows ─────────────────────────────────
  const paxRows = passengers.map(function(p, idx) {
    const isCan = !String(p.currentStatus||'').toUpperCase().includes('RAC') && (
      String(p.currentStatus||'').toUpperCase().includes('CAN') ||
      (isCanTicket && !String(p.currentStatus||'').toUpperCase().includes('CNF'))
    );
    const isCnf = !isCan && (
      String(p.currentStatus||'').toUpperCase().includes('CNF') || isCnfTicket
    );
    const bt = getBerthTypeLabel(p);
    const cb = (p.coach && p.coach !== 'NA' && p.coach !== '--')
      ? (p.coach + ' / ' + p.berthNumber + (bt ? (' (' + bt + ')') : '') + (p.coachPositionLabel ? (' • ' + p.coachPositionLabel) : ''))
      : 'Chart Pending';
    const ps   = isCan ? 'CANCELLED' : isCnf ? 'CONFIRMED' : (p.currentStatus || '--');
    const pc   = isCan ? '#dc2626'   : isCnf ? '#16a34a'   : '#d97706';
    const conf = isCan ? 'Cancelled' : isCnf ? '100% Confirmed' : (p.prediction || '--');
    return '<tr class="pr">'
      + '<td class="pn">' + (idx+1) + '</td>'
      + '<td class="nm">' + (p.name || ('Passenger ' + (p.number || idx+1))) + '</td>'
      + '<td class="pc">' + (p.bookingStatus || '--') + '</td>'
      + '<td class="pc cur" style="color:' + pc + '">' + ps + '</td>'
      + '<td class="pc">' + cb + '</td>'
      + '<td class="pc" style="color:' + pc + ';font-weight:700">' + conf + '</td>'
      + '</tr>';
  }).join('');

  // ── Mobile passenger cards ───────────────────────────────
  const paxCards = passengers.map(function(p, idx) {
    const isCan = !String(p.currentStatus||'').toUpperCase().includes('RAC') && (
      String(p.currentStatus||'').toUpperCase().includes('CAN') ||
      (isCanTicket && !String(p.currentStatus||'').toUpperCase().includes('CNF'))
    );
    const isCnf = !isCan && (
      String(p.currentStatus||'').toUpperCase().includes('CNF') || isCnfTicket
    );
    const bt  = getBerthTypeLabel(p);
    const cb  = (p.coach && p.coach !== 'NA' && p.coach !== '--')
      ? (p.coach + ' / ' + p.berthNumber + (bt ? (' (' + bt + ')') : '') + (p.coachPositionLabel ? (' • ' + p.coachPositionLabel) : ''))
      : 'Chart Pending';
    const ps  = isCan ? 'CANCELLED' : isCnf ? 'CONFIRMED' : (p.currentStatus || '--');
    const pc  = isCan ? '#dc2626'   : isCnf ? '#16a34a'   : '#d97706';
    const pbg = isCan ? '#fef2f2'   : isCnf ? '#dcfce7'   : '#fffbeb';
    const pbd = isCan ? '#fca5a5'   : isCnf ? '#86efac'   : '#fcd34d';
    const conf = isCan ? 'Cancelled' : isCnf ? '100% Confirmed' : (p.prediction || '--');
    return '<div class="mc">'
      + '<div class="mh"><span class="mn">' + (p.name || ('Passenger ' + (p.number || idx+1))) + '</span>'
      + '<span class="mb" style="background:' + pbg + ';color:' + pc + ';border:1px solid ' + pbd + '">' + ps + '</span></div>'
      + '<div class="mg">'
      + '<div class="mf"><span class="ml">BOOKING STATUS</span><span class="mv">' + (p.bookingStatus||'--') + '</span></div>'
      + '<div class="mf"><span class="ml">CURRENT STATUS</span><span class="mv" style="color:' + pc + '">' + ps + '</span></div>'
      + '<div class="mf mfw"><span class="ml">COACH / BERTH</span><span class="mv">' + cb + '</span></div>'
      + '<div class="mf mfw"><span class="ml">CONFIRMATION</span><span class="mv" style="color:' + pc + ';font-weight:700">' + conf + '</span></div>'
      + '</div></div>';
  }).join('');

  // Interpolated CSS (with statusColor/Bg/Border baked in)
  const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;background:#e8edf4;min-height:100vh;padding:20px 14px 40px;color:#0f172a;line-height:1.45}
.pw{max-width:840px;margin:0 auto}
.tk{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.13);display:flex;flex-direction:row}
.tm{flex:1;min-width:0}
.th{background:linear-gradient(135deg,#0f2460,#1a3a8f);padding:18px 22px;display:flex;align-items:center;gap:14px}
.ti{width:46px;height:46px;background:rgba(255,255,255,.18);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ti svg{width:28px;height:28px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.tt{font-size:21px;font-weight:900;color:#fff;letter-spacing:.06em}
.ts2{font-size:10px;color:rgba(255,255,255,.62);font-weight:600;letter-spacing:.08em;margin-top:3px}
.ths{margin-left:auto;text-align:right;flex-shrink:0}
.sb{display:inline-block;padding:5px 13px;border-radius:20px;font-size:11px;font-weight:800;letter-spacing:.06em;border:1.5px solid ${statusBorder};background:${statusBg};color:${statusColor}}
.cs{font-size:10px;color:rgba(255,255,255,.58);margin-top:5px;font-weight:600}
.ps{background:#f0f4fa;border-bottom:1px solid #dde4ef;padding:12px 22px;display:flex;flex-wrap:wrap;gap:14px 26px}
.pf{display:flex;flex-direction:column}
.pl{font-size:9px;font-weight:800;color:#64748b;letter-spacing:.1em;text-transform:uppercase;margin-bottom:2px}
.pv{font-size:13px;font-weight:700;color:#0f172a}
.pvb{font-size:19px;font-weight:900;color:#1d4ed8;font-family:monospace;letter-spacing:.08em}
.rs{padding:18px 22px 14px;border-bottom:1px dashed #cbd5e1}
.rr{display:flex;align-items:center;gap:10px}
.sb2{flex:1;min-width:0}.sb2r{text-align:right}
.sl{font-size:9px;font-weight:800;color:#64748b;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
.sc{font-size:28px;font-weight:900;color:#0f172a;font-family:monospace;line-height:1}
.sn{font-size:12px;font-weight:600;color:#334155;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st{font-size:13px;font-weight:700;color:#1d4ed8;margin-top:4px}
.sd{font-size:10px;color:#64748b;font-weight:600;margin-top:2px}
.rm{flex:0 0 auto;text-align:center;padding:0 12px;display:flex;flex-direction:column;align-items:center;gap:5px}
.db{background:#e2e8f0;color:#475569;font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;white-space:nowrap}
.ar{font-size:26px;font-weight:900;color:#0f2460}
.rd{height:1px;background:#e2e8f0;margin-top:14px}
.xs{padding:14px 22px 16px}
.xt{font-size:10px;font-weight:800;color:#64748b;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px;padding-bottom:6px;border-bottom:1.5px solid #e2e8f0}
.pt{width:100%;border-collapse:collapse;font-size:12px}
.pt th{background:#f1f5f9;padding:7px 10px;text-align:left;font-size:9px;font-weight:800;color:#64748b;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid #e2e8f0}
.pr td{padding:9px 10px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
.pn{font-weight:700;color:#94a3b8;font-size:11px;width:22px}
.nm{font-weight:700;color:#0f172a}
.pc{color:#475569}.cur{font-weight:700}
.pr:last-child td{border-bottom:none}
.xc{display:none}
.mc{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;margin-bottom:10px}
.mc:last-child{margin-bottom:0}
.mh{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;gap:8px}
.mn{font-size:14px;font-weight:800;color:#0f172a}
.mb{font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;letter-spacing:.06em}
.mg{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.mf{display:flex;flex-direction:column;gap:2px}.mfw{grid-column:span 2}
.ml{font-size:9px;font-weight:800;color:#94a3b8;letter-spacing:.1em;text-transform:uppercase}
.mv{font-size:12px;font-weight:700;color:#0f172a}
.fr{padding:12px 22px;border-top:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;font-size:12px}
.fl{color:#64748b}.fa{font-size:16px;font-weight:900;color:#0f172a}
.vt{color:#16a34a;font-weight:700;font-size:11px;display:flex;align-items:center;gap:4px}
.mx{margin:0 22px 20px;background:#eff6ff;border:1px solid #bfdbfe;border-left:4px solid #1d4ed8;border-radius:6px;padding:10px 14px;font-size:11px;color:#1e3a8a;line-height:1.55}
.mx strong{font-weight:900}
.tf{background:#f8fafc;border-top:1px solid #e2e8f0;padding:8px 22px;font-size:9px;color:#94a3b8;display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px}
.sep{width:1px;background:repeating-linear-gradient(to bottom,#cbd5e1 0,#cbd5e1 8px,transparent 8px,transparent 14px);position:relative;flex-shrink:0}
.sep::before,.sep::after{content:'';position:absolute;left:50%;transform:translateX(-50%);width:20px;height:20px;background:#e8edf4;border-radius:50%}
.sep::before{top:-10px}.sep::after{bottom:-10px}
.stb{width:176px;flex-shrink:0;background:#f0f4fa;padding:20px 16px;display:flex;flex-direction:column;gap:14px}
.sfld{display:flex;flex-direction:column;gap:3px}
.slb{font-size:9px;font-weight:800;color:#64748b;letter-spacing:.1em;text-transform:uppercase}
.svl{font-size:13px;font-weight:800;color:#0f172a;word-break:break-word}
.svlb{font-size:16px;font-weight:900;color:#1d4ed8}
.sdv{height:1px;background:#cbd5e1}
.sts{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:800;letter-spacing:.04em;border:1.5px solid ${statusBorder};background:${statusBg};color:${statusColor}}
@media(max-width:620px){body{padding:10px 8px 30px}.tk{flex-direction:column}.sep{display:none}.stb{width:100%;flex-direction:row;flex-wrap:wrap;gap:10px 20px;background:#e8edf4;border-top:1px dashed #94a3b8;padding:14px 16px}.sfld{min-width:70px}.pt{display:none}.xc{display:block}.sc{font-size:20px}.tt{font-size:16px}}
`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>PNR e-Ticket ${pnr} - IRCTC</title>
<style>${css}</style>
</head>
<body>
<div class="pw">
  <div class="tk">
    <div class="tm">
      <!-- Header -->
      <div class="th">
        <div class="ti"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 15V9a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6M2 18h20M8 18v2M16 18v2M10 5V3M14 5V3M6 9h12M6 12h12"/></svg></div>
        <div>
          <div class="tt">PNR e-TICKET</div>
          <div class="ts2">INDIAN RAILWAYS &bull; IRCTC ELECTRONIC RESERVATION SLIP</div>
        </div>
        <div class="ths">
          <div class="sb">${statusText}</div>
          <div class="cs">&bull; ${chartSt}</div>
        </div>
      </div>
      <!-- PNR / Train info -->
      <div class="ps">
        <div class="pf"><span class="pl">PNR Number</span><span class="pvb">${pnr}</span></div>
        <div class="pf"><span class="pl">Train</span><span class="pv">#${trainNo} ${trainName}</span></div>
        <div class="pf"><span class="pl">Class</span><span class="pv">${classCode}</span></div>
        <div class="pf"><span class="pl">Quota</span><span class="pv">${quota}</span></div>
        <div class="pf"><span class="pl">Date of Journey</span><span class="pv">${doj}</span></div>
      </div>
      <!-- Route -->
      <div class="rs">
        <div class="rr">
          <div class="sb2">
            <div class="sl">FROM</div>
            <div class="sc">${fromCode}</div>
            <div class="sn">${fromName}</div>
            <div class="st">DEP ${depTime}</div>
            <div class="sd">${doj}</div>
          </div>
          <div class="rm">
            <span class="db">${dur}${distKm ? ' &middot; ' + distKm : ''}</span>
            <div class="ar">&rarr;</div>
          </div>
          <div class="sb2 sb2r">
            <div class="sl">TO</div>
            <div class="sc">${toCode}</div>
            <div class="sn">${toName}</div>
            <div class="st">ARR ${arrTime}</div>
            <div class="sd">${arrDate}</div>
          </div>
        </div>
        <div class="rd"></div>
      </div>
      <!-- Passengers -->
      <div class="xs">
        <div class="xt">Passenger Details (${passengers.length} Passenger${passengers.length !== 1 ? 's' : ''})</div>
        <table class="pt">
          <thead><tr><th>#</th><th>Passenger Name</th><th>Booking Status</th><th>Current Status</th><th>Coach / Berth</th><th>Confirmation</th></tr></thead>
          <tbody>${paxRows}</tbody>
        </table>
        <div class="xc">${paxCards}</div>
      </div>
      <!-- Fare -->
      <div class="fr">
        <div><span class="fl">Total Ticket Fare: </span><span class="fa">${fareAmt}</span></div>
        <div class="vt"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>Official IRCTC / CRIS Record</div>
      </div>
      <!-- MANDATORY -->
      <div class="mx">
        <strong>MANDATORY:</strong> All passengers must carry a valid original Govt.-issued photo ID
        (Aadhaar Card / Voter ID / Passport / Driving Licence / Student ID with photograph)
        throughout the journey for verification by the Travelling Ticket Examiner (TTE).
        Failure to present valid ID may render this ticket invalid.
      </div>
      <!-- Footer -->
      <div class="tf">
        <span>Printed: ${printTimestamp}</span>
        <span>IRCTC e-Ticketing Service (ERS) &bull; CRIS-PRS &bull; Valid Electronic Reservation Slip</span>
      </div>
    </div><!-- /tm -->
    <!-- Separator -->
    <div class="sep"></div>
    <!-- Stub -->
    <div class="stb">
      <div class="sfld"><span class="slb">DATE</span><span class="svl">${doj}</span></div>
      <div class="sdv"></div>
      <div class="sfld"><span class="slb">FROM</span><span class="svlb">${fromCode}</span></div>
      <div class="sfld"><span class="slb">TO</span><span class="svlb">${toCode}</span></div>
      <div class="sdv"></div>
      <div class="sfld"><span class="slb">TRAIN</span><span class="svl">${trainNo}</span></div>
      <div class="sfld"><span class="slb">CLASS</span><span class="svl">${classCode}</span></div>
      <div class="sfld"><span class="slb">SEAT / COACH</span><span class="svl">${firstSeat}</span></div>
      <div class="sfld"><span class="slb">STATUS</span><span class="sts">${statusText}</span></div>
      <div class="sfld"><span class="slb">PNR</span><span class="svl" style="font-family:monospace;font-size:11px;letter-spacing:.06em">${pnr}</span></div>
    </div><!-- /stb -->
  </div><!-- /tk -->
</div><!-- /pw -->
</body>
</html>`;
}
