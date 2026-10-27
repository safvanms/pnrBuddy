import React from 'react';
import { CreditCard, Star, UtensilsCrossed, PhoneCall, ShieldAlert, Sparkles, CheckCircle, Clock } from 'lucide-react';

export default function JourneyExtras({ ticket }) {
  const fare = ticket.fareDetails;
  const ratings = ticket.ratings || {
    overall: 4.0,
    food: 3.8,
    punctuality: 4.1,
    cleanliness: 4.0,
    ratingCount: 1024
  };

  return (
    <div className="extras-grid">
      {/* Train Performance & User Ratings */}
      <div className="info-card-box">
        <div className="info-card-header">
          <Star size={18} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <span>Train Ratings & Service Quality</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {ratings.overall.toFixed(1)}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            / 5.0 ({ratings.ratingCount.toLocaleString()} traveler reviews)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>🍲 Food & Catering Quality</span>
            <strong style={{ color: '#f59e0b' }}>★ {ratings.food.toFixed(1)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>⏰ Punctuality & Schedule</span>
            <strong style={{ color: '#10b981' }}>★ {ratings.punctuality.toFixed(1)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>✨ Coach Cleanliness & Hygiene</span>
            <strong style={{ color: '#38bdf8' }}>★ {ratings.cleanliness.toFixed(1)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px dashed var(--surface-glass-border)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Pantry Car</span>
            <strong style={{ color: ticket.hasPantry ? '#10b981' : '#94a3b8' }}>
              {ticket.hasPantry ? '✓ Attached On Train' : 'Not Available'}
            </strong>
          </div>
        </div>
      </div>

      {/* Fare Breakdown Card */}
      {fare && (
        <div className="info-card-box">
          <div className="info-card-header">
            <CreditCard size={18} />
            <span>Official Fare Breakdown</span>
          </div>

          <div>
            <div className="fare-row-item">
              <span>Base Ticket Fare</span>
              <span>₹{fare.baseFare}</span>
            </div>
            {fare.cateringCharge > 0 && (
              <div className="fare-row-item">
                <span>Catering & Food Charges</span>
                <span>₹{fare.cateringCharge}</span>
              </div>
            )}
            {fare.superfastFee > 0 && (
              <div className="fare-row-item">
                <span>Superfast Express Surcharge</span>
                <span>₹{fare.superfastFee}</span>
              </div>
            )}
            <div className="fare-row-item">
              <span>IRCTC Service GST</span>
              <span>₹{fare.gst || Math.round(fare.baseFare * 0.05)}</span>
            </div>
            <div className="fare-total-row">
              <span>Total Ticket Fare</span>
              <span style={{ color: 'var(--accent-cyan)' }}>₹{fare.totalFare}</span>
            </div>
          </div>
        </div>
      )}

      {/* Emergency & Rail Helplines */}
      <div className="info-card-box">
        <div className="info-card-header">
          <PhoneCall size={18} />
          <span>24x7 Rail Madad Helplines</span>
        </div>

        <ul className="info-bullet-list">
          <li>
            📞 <strong>139</strong> — Rail Madad One-Touch All India Helpline (Enquiries, Complaints, PNR)
          </li>
          <li>
            🚨 <strong>182 / 112</strong> — RPF Security & Emergency Assistance
          </li>
          <li>
            🚑 <strong>Medical Assistance:</strong> Dial 139 or alert TTE / Station Superintendent
          </li>
          <li>
            🕒 <strong>Charting Notice:</strong> 1st chart prepared 4 hours prior; 2nd chart 30 mins before train departure.
          </li>
        </ul>
      </div>
    </div>
  );
}
