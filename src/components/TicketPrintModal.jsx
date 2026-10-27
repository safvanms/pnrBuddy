import React from 'react';
import { X, Printer, Train, ShieldCheck, QrCode } from 'lucide-react';

export default function TicketPrintModal({ ticket, onClose }) {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Printer size={18} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Electronic Reservation Slip (ERS)</h3>
          </div>
          <button type="button" className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Printable Ticket Container */}
          <div className="boarding-pass-ticket">
            {/* Top header */}
            <div className="ticket-irctc-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: '#0284c7',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <Train size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
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
                  background: ticket.overallStatus === 'CNF' ? '#dcfce7' : '#fef3c7',
                  color: ticket.overallStatus === 'CNF' ? '#15803d' : '#b45309',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '0.8rem'
                }}>
                  {ticket.overallStatus} • {ticket.statusLabel}
                </span>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {ticket.chartStatus}
                </div>
              </div>
            </div>

            {/* PNR & Train Details Banner */}
            <div className="ticket-pnr-banner">
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>PNR NUMBER</span>
                <span style={{ fontSize: '1.25rem', color: '#0284c7', fontWeight: 800 }}>{ticket.pnr}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>TRAIN NO & NAME</span>
                <span style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 700 }}>
                  {ticket.trainNumber} / {ticket.trainName}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>CLASS & QUOTA</span>
                <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                  {ticket.classCode} • {ticket.quota}
                </span>
              </div>
            </div>

            {/* Station Route Details */}
            <div className="ticket-stations-grid">
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>BOARDING STATION</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{ticket.fromStation.code}</div>
                <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>{ticket.fromStation.name}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', marginTop: '4px' }}>
                  Dep: {ticket.departureTime} • {ticket.dateOfJourney}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ticket.fromStation.platform}</div>
              </div>

              <div style={{ textAlign: 'center', padding: '0 1rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  {ticket.duration}
                </span>
                <div style={{ width: '80px', height: '2px', background: '#cbd5e1', position: 'relative', margin: '0 auto' }}>
                  <div style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#0284c7'
                  }}></div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>RESERVATION UPTO</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{ticket.toStation.code}</div>
                <div style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>{ticket.toStation.name}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', marginTop: '4px' }}>
                  Arr: {ticket.arrivalTime} • {ticket.arrivalDate}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ticket.toStation.platform}</div>
              </div>
            </div>

            {/* Passenger List on Ticket */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                PASSENGER BOOKING DETAILS
              </span>
              <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '0.4rem 0.5rem' }}>#</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>Booking Status</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>Current Status</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>Prediction</th>
                    <th style={{ padding: '0.4rem 0.5rem' }}>Coach / Berth</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.passengers.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 700 }}>Passenger {p.number || idx + 1}</td>
                      <td style={{ padding: '0.5rem', color: '#475569' }}>{p.bookingStatus}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 700, color: p.currentStatus?.includes('CNF') ? '#16a34a' : '#ea580c' }}>
                        {p.currentStatus}
                      </td>
                      <td style={{ padding: '0.5rem', color: '#0284c7', fontWeight: 600 }}>{p.prediction || '--'}</td>
                      <td style={{ padding: '0.5rem', fontWeight: 700, color: '#0284c7' }}>
                        {p.coach && p.coach !== 'NA' ? `${p.coach} / ${p.berthNumber}` : 'Chart Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Fare & Security */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              fontSize: '0.82rem'
            }}>
              <div>
                <span style={{ color: '#64748b' }}>Total Fare Paid: </span>
                <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                  {ticket.fareDetails?.totalFare || ticket.ticketFare || ticket.bookingFare ? `₹${ticket.fareDetails?.totalFare || ticket.ticketFare || ticket.bookingFare}` : 'As per IRCTC receipt'}
                </strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#16a34a', fontWeight: 600 }}>
                <ShieldCheck size={16} />
                <span>IRCTC Official Reservation Record</span>
              </div>
            </div>

            {/* Barcode Simulation */}
            <div className="ticket-barcode">
              <div className="barcode-sim">||| | ||||| || |||| ||| |||| || ||| |||||||</div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                *{ticket.pnr}* - CARRY VALID ORIGINAL PHOTO ID CARD (AADHAAR / PAN / PASSPORT)
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn-primary" onClick={handlePrint}>
              <Printer size={16} />
              <span>Print / Download Slip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
