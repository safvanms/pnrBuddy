import React, { useState } from 'react';
import { Train, MapPin, Gauge, ChevronDown, ChevronUp, Clock, Navigation } from 'lucide-react';

export default function RouteTimeline({ ticket }) {
  const [showStops, setShowStops] = useState(false);
  const running = ticket.runningStatus;

  return (
    <div className="glass-panel" style={{ marginTop: '1.25rem' }}>
      <div className="section-subhead">
        <h3>
          <Navigation size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>Route & Scheduled Timings</span>
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Total Distance: <strong>{ticket.distanceKm ? `${ticket.distanceKm.toLocaleString()} km` : 'Scheduled Rail Corridor'}</strong>
        </span>
      </div>

      {/* Main Departure / Arrival Nodes */}
      <div className="timeline-section">
        {/* Origin */}
        <div className="station-node">
          <span className="station-code">{ticket.fromStation.code}</span>
          <span className="station-name">{ticket.fromStation.name}</span>
          <span className="station-time">{ticket.departureTime}</span>
          <span className="station-platform">{ticket.fromStation.platform}</span>
        </div>

        {/* Dynamic Journey Bar */}
        <div className="journey-path-col">
          <span className="journey-duration-badge">
            <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
            {ticket.duration || '--'}
          </span>

          <div className="journey-track-bar">
            <div 
              className="journey-fill" 
              style={{ width: `${running ? running.progressPercent : 35}%` }}
            ></div>
            <div 
              className="train-mover-icon" 
              style={{ left: `${running ? running.progressPercent : 35}%` }}
              title={`Track monitored: ${ticket.fromStation.code} ➔ ${ticket.toStation.code}`}
            >
              <Train size={13} />
            </div>
          </div>

          <span className="journey-distance">
            Indian Railways Mainline
          </span>
        </div>

        {/* Destination */}
        <div className="station-node right">
          <span className="station-code">{ticket.toStation.code}</span>
          <span className="station-name">{ticket.toStation.name}</span>
          <span className="station-time">{ticket.arrivalTime}</span>
          <span className="station-platform">{ticket.toStation.platform}</span>
        </div>
      </div>

      {/* Live Running Status Ribbon */}
      {running && (
        <div className="live-status-ribbon">
          <div className="live-station-info">
            <MapPin size={16} style={{ color: 'var(--accent-cyan)' }} />
            <span>
              <strong>Station Route:</strong> {running.currentStation} ➔ {running.nextStation}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ 
              fontWeight: 700, 
              color: '#34d399' 
            }}>
              ● {running.status}
            </span>
            {running.currentSpeed && (
              <span className="speed-tag">
                <Gauge size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                {running.currentSpeed}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
