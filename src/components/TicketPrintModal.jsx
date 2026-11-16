import React from 'react';
import { X, Download, Check, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';

/* ── Inline SVG: Front-facing Train icon (matches reference image) ─ */
const TrainFrontSvg = ({ size = 20, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="3" width="16" height="15" rx="3" />
    <line x1="4" y1="11" x2="20" y2="11" />
    <line x1="12" y1="3" x2="12" y2="11" />
    <circle cx="8" cy="15" r="1.2" fill={color} stroke="none" />
    <circle cx="16" cy="15" r="1.2" fill={color} stroke="none" />
    <path d="M8 18l-2 3" />
    <path d="M16 18l2 3" />
  </svg>
);

/* ── Inline SVG: Calendar icon with grid dots (matches reference image) ─ */
const CalSvg = ({ size = 16, color = '#1e293b' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <circle cx="8" cy="14" r="1.1" fill={color} stroke="none" />
    <circle cx="12" cy="14" r="1.1" fill={color} stroke="none" />
    <circle cx="16" cy="14" r="1.1" fill={color} stroke="none" />
    <circle cx="8" cy="18" r="1.1" fill={color} stroke="none" />
    <circle cx="12" cy="18" r="1.1" fill={color} stroke="none" />
  </svg>
);

/* ── Passenger cancellation check ────────────────────────────── */
const isPassengerCancelled = (p) => {
  if (!p) return false;
  const s = String(p.currentStatus || '').toUpperCase().trim();
  if (s.includes('RAC')) return false;
  return s === 'CAN' || s.startsWith('CAN ') || s.startsWith('CAN/') ||
    s.includes('CANCEL') || /\bCAN\b/.test(s) ||
    String(p.confirmTktStatus || '').toUpperCase().includes('CANCEL');
};

/* ── Helpers to clean and shorten display values for authentic look ─ */
const cleanStationName = (name) => {
  if (!name) return '';
  return name
    .replace(/\bJunction\b/gi, 'Jn')
    .replace(/\bTerminal\b/gi, 'Term')
    .replace(/\bCentral\b/gi, 'Ctrl')
    .replace(/\bCantt\b/gi, 'Cantt')
    .replace(/\bRailway Station\b/gi, '')
    .trim();
};

const formatTrainName = (num, name) => {
  if (!name) return num || '--';
  const clean = name
    .toLowerCase()
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
    .join(' ')
    .replace(/\bExpress\b/gi, 'SF')
    .replace(/\bSuperfast\b/gi, 'SF')
    .replace(/\bSpecial\b/gi, 'Spl');
  return `${num} ${clean}`.trim();
};

const getQuotaLabel = (q) => {
  const code = String(q || 'GN').split(' ')[0].toUpperCase();
  const map = {
    GN: 'General',
    TQ: 'Tatkal',
    CK: 'Tatkal',
    PT: 'Premium Tatkal',
    LD: 'Ladies',
    SS: 'Senior',
    HP: 'Divyang',
    DF: 'Defence',
    FT: 'Foreign',
    DP: 'Duty Pass',
  };
  return map[code] || q || 'General';
};

const formatDateOfJourney = (doj) => {
  if (!doj || doj === '--') return '--';
  return String(doj).trim().replace(/[-/]/g, ':');
};

export default function TicketPrintModal({ ticket, onClose, onDownloadSuccess }) {
  if (!ticket) return null;

  const passengers  = ticket.passengers || [];
  const isAllCan    = passengers.length > 0 && passengers.every(isPassengerCancelled);
  const isCanTicket = ticket.overallStatus === 'CAN' || ticket.overallStatus === 'CANCELLED' || isAllCan;
  const isCnfTicket = !isCanTicket && ticket.overallStatus === 'CNF';
  const isRacTicket = !isCanTicket && !isCnfTicket && ticket.overallStatus === 'RAC';

  /* ── Color theme keyed to status (exact match to reference image) ─ */
  const T = isCanTicket
    ? {
        bar: '#ef4444',
        leftBg: '#fef2f2',
        badgeColor: '#dc2626',
        badgeBg: '#fee2e2',
        pillColor: '#dc2626',
        pillBg: '#fee2e2',
      }
    : isCnfTicket
    ? {
        bar: '#58c322', // vibrant clean green like reference image
        leftBg: '#f2f9ed', // soft light pastel green tint
        badgeColor: '#166534',
        badgeBg: '#dcf4ce', // pastel green badge
        pillColor: '#166534',
        pillBg: '#dcf4ce', // pastel green PNR pill
      }
    : isRacTicket
    ? {
        bar: '#f59e0b',
        leftBg: '#fffbeb',
        badgeColor: '#92400e',
        badgeBg: '#fef3c7',
        pillColor: '#92400e',
        pillBg: '#fef3c7',
      }
    : {
        // Waitlist (WL)
        bar: '#f9941e', // vibrant warm orange like reference image
        leftBg: '#fef7ee', // soft light pastel orange tint
        badgeColor: '#b4450a',
        badgeBg: '#fde6cf', // pastel orange badge
        pillColor: '#b4450a',
        pillBg: '#fde6cf', // pastel orange PNR pill
      };

  /* ── Per-passenger badge text ─────────────────────────────── */
  const getPaxBadge = (p) => {
    if (isPassengerCancelled(p)) return 'CAN';
    const coach = p.coach && p.coach !== '--' && p.coach !== 'NA' && p.coach !== '0' && p.coach !== 'Pending Chart' ? p.coach : '';
    const berth = p.berthNumber && p.berthNumber !== '--' && p.berthNumber !== '0' ? p.berthNumber : '';
    if (coach && berth) return isCnfTicket ? `CNF ${coach} ${berth}` : `${coach} ${berth}`;
    const s = String(p.currentStatus || '').toUpperCase().trim();
    if (s.includes('WL') || s.includes('W/L')) {
      const m = s.match(/(\d+)/);
      return `WL ${m?.[1] || ''}`.trim();
    }
    if (s.includes('RAC')) {
      const m = s.match(/(\d+)/);
      return `RAC ${m?.[1] || ''}`.trim();
    }
    if (s.includes('CNF') || s.includes('CONFIRM')) {
      return coach && berth ? `CNF ${coach} ${berth}` : 'CNF';
    }
    return s || '--';
  };

  const fromCode = ticket.fromStation?.code || '--';
  const fromName = ticket.fromStation?.name || fromCode;
  const toCode   = ticket.toStation?.code   || '--';
  const toName   = ticket.toStation?.name   || toCode;
  const quota    = ticket.quota?.split(' ')[0] || 'GN';

  const printTimestamp = React.useMemo(() => {
    const n = new Date(), m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${n.getDate()} ${m[n.getMonth()]} ${n.getFullYear()}, ${n.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',hour12:true})}`;
  }, []);

  /* ref attached to the capture wrapper for crisp html2canvas export */
  const cardRef = React.useRef(null);
  const [downloaded, setDownloaded] = React.useState(false);
  const [capturing, setCapturing]   = React.useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || capturing) return;
    try {
      setCapturing(true);

      // Temporarily set notch cutout to white for the PNG export so it blends cleanly into white canvas
      cardRef.current.style.setProperty('--tk-notch-bg', '#ffffff');

      const canvas = await html2canvas(cardRef.current, {
        scale: 3,            // 3× pixel ratio for crisp high-DPI image
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
      });

      cardRef.current.style.removeProperty('--tk-notch-bg');

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), {
          href: url,
          download: `PNR_${ticket.pnr || 'ticket'}_eTicket.png`,
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setDownloaded(true);
        if (onDownloadSuccess) onDownloadSuccess('e-Ticket saved as PNG!');
        setTimeout(() => setDownloaded(false), 3500);
      }, 'image/png');
    } catch (e) {
      console.error('PNG capture failed:', e);
      if (cardRef.current) cardRef.current.style.removeProperty('--tk-notch-bg');
    } finally {
      setCapturing(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="modal-header">
          <div className="modal-header-title-wrap">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>e-Ticket Slip</h3>
            <span className="ticket-printed-header-badge">
              <Clock size={11} /> {printTimestamp}
            </span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">

          {/* ── TICKET CARD — ref captured by html2canvas ───── */}
          <div className="tk-wrap">
            <div className="tk-capture" ref={cardRef}>
              <div className="tk-card">

                {/* Vibrant top bar */}
                <div className="tk-bar" style={{ background: T.bar }} />

                <div className="tk-body">

                  {/* ── SECTION 1: LOGO COLUMN ──────────────── */}
                  <div className="tk-sec-logo" style={{ background: T.leftBg }}>
                    <div className="tk-icon-circle">
                      <TrainFrontSvg size={18} color="#ffffff" />
                    </div>
                  </div>

                  {/* ── SECTION 2: ROUTE & PASSENGERS ───────── */}
                  <div className="tk-sec-main" style={{ background: T.leftBg }}>
                    {/* Route: FROM • 🚆 • TO */}
                    <div className="tk-route">
                      <div className="tk-stn">
                        <span className="tk-code">{fromCode}</span>
                        <span className="tk-city" title={fromName}>{cleanStationName(fromName)}</span>
                      </div>
                      <div className="tk-mid">
                        <div className="tk-route-line" />
                        <span className="tk-dot" />
                        <span className="tk-mid-icon">
                          <TrainFrontSvg size={16} color="#48b819" />
                        </span>
                        <span className="tk-dot" />
                      </div>
                      <div className="tk-stn tk-stn-right">
                        <span className="tk-code">{toCode}</span>
                        <span className="tk-city" title={toName}>{cleanStationName(toName)}</span>
                      </div>
                    </div>

                    {/* Passenger rows */}
                    <div className="tk-pax-list">
                      {passengers.map((p, i) => {
                        const badge = getPaxBadge(p);
                        const isCan = isPassengerCancelled(p);
                        const bc = isCan ? '#dc2626' : T.badgeColor;
                        const bb = isCan ? '#fee2e2' : T.badgeBg;
                        const paxName = p.name ? p.name : `Passenger ${i + 1}`;
                        const paxQuota = getQuotaLabel(p.quota || quota);
                        return (
                          <div key={i} className="tk-pax-row">
                            <span className="tk-pax-name" title={paxName}>{paxName}</span>
                            <span className="tk-pipe">|</span>
                            <span className="tk-pax-meta">{paxQuota}</span>
                            <span className="tk-pipe">|</span>
                            <span className="tk-pax-meta">{ticket.classCode || '--'}</span>
                            <span className="tk-badge" style={{ color: bc, background: bb }}>{badge}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── SEPARATOR: Dashed tear line + notches ─ */}
                  <div className="tk-sep">
                    <span className="tk-notch tk-notch-top" />
                    <span className="tk-notch tk-notch-bot" />
                  </div>

                  {/* ── SECTION 3: PNR, DATE & TRAIN (Items on top one by one) ─ */}
                  <div className="tk-sec-stub">
                    <div className="tk-pnr-pill" style={{ color: T.pillColor, background: T.pillBg }}>
                      PNR {ticket.pnr}
                    </div>
                    <div className="tk-stub-row">
                      <span className="tk-stub-icon"><CalSvg size={15} color="#1e293b" /></span>
                      <span className="tk-stub-val">{formatDateOfJourney(ticket.dateOfJourney)}</span>
                    </div>
                    <div className="tk-stub-row">
                      <span className="tk-stub-icon"><TrainFrontSvg size={15} color="#1e293b" /></span>
                      <span className="tk-stub-val" title={`${ticket.trainNumber} ${ticket.trainName}`}>
                        {formatTrainName(ticket.trainNumber, ticket.trainName)}
                      </span>
                    </div>
                  </div>

                </div>{/* /tk-body */}
              </div>{/* /tk-card */}
            </div>{/* /tk-capture */}
          </div>{/* /tk-wrap */}

          {/* Actions */}
          <div className="ticket-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleDownload}
              disabled={capturing}
              style={downloaded ? { background: '#16a34a' } : capturing ? { opacity: 0.7 } : undefined}
            >
              {downloaded
                ? <><Check size={16} /><span>Saved!</span></>
                : capturing
                ? <><span style={{ display:'inline-block', width:14, height:14, border:'2px solid #fff', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /><span>Capturing…</span></>
                : <><Download size={16} /><span>Download PNG</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
