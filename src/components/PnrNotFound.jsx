import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function PnrNotFound({ pnr, errorMessage, onRetry }) {
  return (
    <div className="glass-panel not-found-panel">
      <div className="not-found-icon-wrap">
        <AlertCircle size={40} className="not-found-icon" />
      </div>

      <h3 className="not-found-title">PNR Record Not Found in PRS</h3>
      
      <p className="not-found-desc">
        No active booking found for PNR <span className="pnr-highlight">#{pnr}</span> on Indian Railways reservation servers.
      </p>

      {errorMessage && (
        <div className="not-found-server-note">
          <strong>Railway Server Response:</strong>{' '}
          {typeof errorMessage === 'string'
            ? errorMessage
            : (errorMessage?.message || errorMessage?.error || 'Record purged or not yet generated in PRS.')}
        </div>
      )}

      <div className="not-found-reasons-box">
        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Common Reasons:
        </h4>
        <ul className="not-found-reasons-list">
          <li><strong>Flushed PNR:</strong> Indian Railways automatically flushes/archives journey records from PRS database within a few days after journey completion.</li>
          <li><strong>Typo in PNR:</strong> Verify that the 10-digit number matches your ticket or IRCTC SMS exactly.</li>
          <li><strong>Cancelled Booking:</strong> If the transaction failed during payment or was cancelled immediately, no PRS record is maintained.</li>
        </ul>
      </div>

      <div className="not-found-actions">
        <button type="button" className="btn-primary" onClick={onRetry}>
          <RefreshCw size={15} />
          <span>Retry Search</span>
        </button>
      </div>
    </div>
  );
}
