import React, { useState, useEffect } from 'react';
import { Train, MapPin, Gauge, Clock, Navigation } from 'lucide-react';

// Parse departure date and time into a valid Date object
function parseDepartureDateTime(dateStr, timeStr) {
  if (!dateStr && !timeStr) return null;
  let d = (dateStr || '').trim();
  let t = (timeStr || '').trim();

  // If date contains time component (e.g. "28-10-2026 14:30")
  if (d.includes(' ') && !t) {
    const parts = d.split(' ');
    d = parts[0];
    t = parts.slice(1).join(' ');
  }

  let h = 0;
  let m = 0;
  if (t && t !== '--:--') {
    const match = t.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      h = parseInt(match[1], 10);
      m = parseInt(match[2], 10);
    }
  }

  if (!d || d === '--') {
    const fallback = new Date();
    fallback.setHours(h, m, 0, 0);
    return fallback;
  }

  // DD-MM-YYYY or DD/MM/YYYY
  const dmy = d.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    return new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10), h, m, 0);
  }

  // DD-MM-YY or DD/MM/YY
  const dmy2 = d.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2})$/);
  if (dmy2) {
    return new Date(2000 + parseInt(dmy2[3], 10), parseInt(dmy2[2], 10) - 1, parseInt(dmy2[1], 10), h, m, 0);
  }

  // YYYY-MM-DD
  const ymd = d.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymd) {
    return new Date(parseInt(ymd[1], 10), parseInt(ymd[2], 10) - 1, parseInt(ymd[3], 10), h, m, 0);
  }

  // DD-Mon-YYYY (e.g. 28-Oct-2026)
  const monthNames = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const dmon = d.match(/^(\d{1,2})[- ]([a-zA-Z]{3})[- ](\d{4})/i);
  if (dmon) {
    return new Date(parseInt(dmon[3], 10), monthNames[dmon[2].toLowerCase()] ?? 0, parseInt(dmon[1], 10), h, m, 0);
  }

  const fallbackParsed = new Date(d + (t ? ` ${t}` : ''));
  if (!isNaN(fallbackParsed.getTime())) {
    return fallbackParsed;
  }

  return null;
}

function getDepartureCountdown(departureDate, now = new Date()) {
  if (!departureDate || isNaN(departureDate.getTime())) return null;

  const diffMs = departureDate.getTime() - now.getTime();

  if (diffMs > 0) {
    const totalMins = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMins / 1440);
    const hours = Math.floor((totalMins % 1440) / 60);
    const mins = totalMins % 60;

    let timeStr = '';
    if (days > 0) {
      timeStr = hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    } else if (hours > 0) {
      timeStr = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else if (mins > 0) {
      timeStr = `${mins}m`;
    } else {
      timeStr = '< 1m';
    }

    return {
      isPast: false,
      label: `Departs in ${timeStr}`,
      shortLabel: `In ${timeStr}`
    };
  } else {
    const pastMins = Math.floor(Math.abs(diffMs) / 60000);
    const days = Math.floor(pastMins / 1440);
    const hours = Math.floor((pastMins % 1440) / 60);
    const mins = pastMins % 60;

    if (days >= 1) {
      return {
        isPast: true,
        label: `Departed ${days}d ago`,
        shortLabel: `${days}d ago`
      };
    } else if (hours >= 1) {
      return {
        isPast: true,
        label: `Departed ${hours}h ${mins}m ago`,
        shortLabel: `${hours}h ago`
      };
    } else if (pastMins > 0) {
      return {
        isPast: true,
        label: `Departed ${pastMins}m ago`,
        shortLabel: `${pastMins}m ago`
      };
    } else {
      return {
        isPast: true,
        label: 'Departed just now',
        shortLabel: 'Departed'
      };
    }
  }
}

export default function RouteTimeline({ ticket }) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const running = ticket.runningStatus;

  // Periodic timer for live countdown calculation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const departureDate = parseDepartureDateTime(ticket.dateOfJourney, ticket.departureTime);
  const countdown = getDepartureCountdown(departureDate, currentTime);

  return (
    <div className="glass-panel" style={{ marginTop: '1.25rem' }}>
      <div className="section-subhead">
        <h3>
          <Navigation size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span>Route & Scheduled Timings</span>
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Scheduled Rail Corridor
        </span>
      </div>

      {/* Main Departure / Arrival Nodes */}
      <div className="timeline-section">
        {/* Origin (Boarding Station) */}
        <div className="station-node station-node-origin">
          <span className="station-code">{ticket.fromStation?.code || 'SRC'}</span>
          <span className="station-name" title={ticket.fromStation?.name}>{ticket.fromStation?.name || ticket.fromStation?.code || 'Boarding Station'}</span>
          <span className="station-time">{ticket.departureTime || '--:--'}</span>
          <span className="station-platform">{ticket.fromStation?.platform || 'Platform --'}</span>
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
              title={`Track monitored: ${ticket.fromStation?.code || ''} ➔ ${ticket.toStation?.code || ''}`}
            >
              <Train size={13} />
            </div>
          </div>

          {/* Under track: Left = Total Distance, Right = Departure Countdown */}
          <div className="journey-track-meta">
            <span className="journey-distance-meta">
              Total Distance: <strong>{ticket.distanceKm ? `${ticket.distanceKm.toLocaleString()} km` : 'Mainline'}</strong>
            </span>
            <span className={`journey-countdown-meta ${countdown?.isPast ? 'is-past' : 'is-upcoming'}`}>
              <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              <span>{countdown?.label || (ticket.departureTime ? `Departs at ${ticket.departureTime}` : 'Departure Scheduled')}</span>
            </span>
          </div>
        </div>

        {/* Destination Station */}
        <div className="station-node station-node-dest right">
          <span className="station-code">{ticket.toStation?.code || 'DST'}</span>
          <span className="station-name" title={ticket.toStation?.name}>{ticket.toStation?.name || ticket.toStation?.code || 'Destination Station'}</span>
          <span className="station-time">{ticket.arrivalTime || '--:--'}</span>
          <span className="station-platform">{ticket.toStation?.platform || 'Platform --'}</span>
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
