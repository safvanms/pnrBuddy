import React from 'react';
import { X, Download, Check, Clock } from 'lucide-react';
import html2canvas from 'html2canvas';

/* ── Inline SVG: Train icon ──────────────────────────────────── */
const TrainSvg = ({ size = 20, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="16" rx="2"/>
    <path d="M4 11h16"/><path d="M12 3v8"/>
    <circle cx="8" cy="19" r="1"/><circle cx="16" cy="19" r="1"/>
    <path d="M5 19H3"/><path d="M21 19h-2"/>
  </svg>
);

/* ── Inline SVG: Calendar icon ───────────────────────────────── */
const CalSvg = ({ size = 18, color = '#374151' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
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

export default function TicketPrintModal({ ticket, onClose, onDownloadSuccess }) {
  if (!ticket) return null;

  const passengers  = ticket.passengers || [];
  const isAllCan    = passengers.length > 0 && passengers.every(isPassengerCancelled);
  const isCanTicket = ticket.overallStatus === 'CAN' || ticket.overallStatus === 'CANCELLED' || isAllCan;
  const isCnfTicket = !isCanTicket && ticket.overallStatus === 'CNF';
  const isRacTicket = !isCanTicket && !isCnfTicket && ticket.overallStatus === 'RAC';

  /* ── Color theme keyed to status ─────────────────────────── */
  const T = isCanTicket
    ? { bar:'#ef4444', leftBg:'#fff5f5', badgeColor:'#dc2626', badgeBg:'#fee2e2',
        pillColor:'#dc2626', pillBg:'#fee2e2', pillBorder:'#fca5a5', dot:'#ef4444' }
    : isCnfTicket
    ? { bar:'#4ade80', leftBg:'#f0fdf4', badgeColor:'#15803d', badgeBg:'#dcfce7',
        pillColor:'#166534', pillBg:'#dcfce7', pillBorder:'#86efac', dot:'#22c55e' }
    : isRacTicket
    ? { bar:'#f59e0b', leftBg:'#fffbeb', badgeColor:'#92400e', badgeBg:'#fde68a',
        pillColor:'#92400e', pillBg:'#fef3c7', pillBorder:'#fcd34d', dot:'#f59e0b' }
    : { bar:'#fb923c', leftBg:'#fff7ed', badgeColor:'#c2410c', badgeBg:'#ffedd5',
        pillColor:'#c2410c', pillBg:'#ffedd5', pillBorder:'#fdba74', dot:'#f97316' };

  /* ── Per-passenger badge text ─────────────────────────────── */
  const getPaxBadge = (p) => {
    if (isPassengerCancelled(p)) return 'CAN';
    const coach = p.coach && p.coach !== '--' && p.coach !== 'NA' ? p.coach : '';
    const berth = p.berthNumber && p.berthNumber !== '--' ? p.berthNumber : '';
    if (coach && berth) return isCnfTicket ? `CNF ${coach} ${berth}` : `${coach} ${berth}`;
    const s = p.currentStatus || '';
    if (s.includes('WL') || s.includes('W/L')) { const m = s.match(/(\d+)/); return `WL ${m?.[1] || ''}`; }
    if (s.includes('RAC')) { const m = s.match(/(\d+)/); return `RAC ${m?.[1] || ''}`; }
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

  /* ref attached to the ticket card — html2canvas screenshots this */
  const cardRef = React.useRef(null);
  const [downloaded, setDownloaded] = React.useState(false);
  const [capturing, setCapturing]   = React.useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || capturing) return;
    try {
      setCapturing(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,            // 3× pixel ratio for crisp high-DPI image
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), {
          href: url,
          download: `PNR_${ticket.pnr}_eTicket.png`,
        });
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setDownloaded(true);
        if (onDownloadSuccess) onDownloadSuccess('e-Ticket saved as PNG!');
        setTimeout(() => setDownloaded(false), 3500);
      }, 'image/png');
    } catch (e) {
      console.error('PNG capture failed:', e);
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
          <button type="button" className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">

          {/* ── TICKET CARD — ref used by html2canvas ──────── */}
          <div className="tk-wrap">
            {/* tk-capture has left padding to include the overflowing icon circle */}
            <div className="tk-capture" ref={cardRef}>
              <div className="tk-card">

              {/* Thick coloured top bar */}
              <div className="tk-bar" style={{ background: T.bar }} />

              <div className="tk-body">

                {/* ── LEFT panel ──────────────────────────── */}
                <div className="tk-left" style={{ background: T.leftBg }}>

                  {/* Blue circle train icon on left edge */}
                  <div className="tk-icon-circle">
                    <TrainSvg size={20} color="#fff" />
                  </div>

                  {/* Route: FROM • 🚂 • TO */}
                  <div className="tk-route">
                    <div className="tk-stn">
                      <span className="tk-code">{fromCode}</span>
                      <span className="tk-city">{fromName}</span>
                    </div>
                    <div className="tk-mid">
                      <span className="tk-dot" style={{ background: T.dot }} />
                      <span className="tk-mid-icon">
                        <TrainSvg size={24} color={T.dot} />
                      </span>
                      <span className="tk-dot" style={{ background: T.dot }} />
                    </div>
                    <div className="tk-stn tk-stn-right">
                      <span className="tk-code">{toCode}</span>
                      <span className="tk-city">{toName}</span>
                    </div>
                  </div>

                  {/* Passenger rows */}
                  <div className="tk-pax-list">
                    {passengers.map((p, i) => {
                      const badge = getPaxBadge(p);
                      const isCan = isPassengerCancelled(p);
                      const bc = isCan ? '#dc2626' : T.badgeColor;
                      const bb = isCan ? '#fee2e2' : T.badgeBg;
                      return (
                        <div key={i} className="tk-pax-row">
                          <span className="tk-pax-name">{p.name || `Passenger ${i + 1}`}</span>
                          <span className="tk-pipe">|</span>
                          <span className="tk-pax-meta">{p.quota || quota}</span>
                          <span className="tk-pipe">|</span>
                          <span className="tk-pax-meta">{ticket.classCode || '--'}</span>
                          <span className="tk-badge" style={{ color: bc, background: bb }}>{badge}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Dashed separator ────────────────────── */}
                <div className="tk-sep">
                  <span className="tk-notch tk-notch-top" />
                  <span className="tk-notch tk-notch-bot" />
                </div>

                {/* ── RIGHT stub ──────────────────────────── */}
                <div className="tk-right">
                  <div className="tk-pnr-pill"
                    style={{ color: T.pillColor, background: T.pillBg, borderColor: T.pillBorder }}>
                    PNR {ticket.pnr}
                  </div>
                  <div className="tk-stub-row">
                    <span className="tk-stub-icon"><CalSvg size={18} color="#374151" /></span>
                    <span className="tk-stub-val">{ticket.dateOfJourney || '--'}</span>
                  </div>
                  <div className="tk-stub-row">
                    <span className="tk-stub-icon"><TrainSvg size={18} color="#374151" /></span>
                    <span className="tk-stub-val">{ticket.trainNumber} {ticket.trainName}</span>
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
                ? <><span style={{ display:'inline-block', width:16, height:16, border:'2px solid #fff', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /><span>Capturing…</span></>
                : <><Download size={16} /><span>Download PNG</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
