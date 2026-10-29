import React, { useState, useRef, useEffect } from 'react';
import { 
  Train, 
  Navigation, 
  ArrowLeftRight, 
  MapPin, 
  UserCheck, 
  Info, 
  CheckCircle2, 
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import { getOrdinalSuffix } from '../services/pnrService';

export default function CoachPositionView({ ticket }) {
  if (!ticket || !ticket.rakeComposition) return null;

  const { rakeComposition, passengers = [] } = ticket;
  const rawCoaches = rakeComposition.coaches || [];

  const [reversed, setReversed] = useState(false);
  const [selectedCoachId, setSelectedCoachId] = useState(() => {
    const firstUserCoach = rawCoaches.find(c => c.isUserCoach);
    return firstUserCoach ? firstUserCoach.id : (rawCoaches[1] ? rawCoaches[1].id : 0);
  });

  const trackRef = useRef(null);

  // If coaches order is reversed (e.g. train undergoes engine reversal)
  const coaches = reversed ? [...rawCoaches].reverse() : rawCoaches;

  // Selected coach object
  const selectedCoach = rawCoaches.find(c => c.id === selectedCoachId) || rawCoaches[0];

  // User coaches summary
  const userCoachesList = rawCoaches.filter(c => c.isUserCoach);
  const primaryPax = passengers[0];
  const isChartPrepared = ticket.chartStatus?.toLowerCase().includes('prepared') && !ticket.chartStatus?.toLowerCase().includes('not');

  // Smooth scroll to passenger coach
  const scrollToUserCoach = () => {
    if (!trackRef.current) return;
    const targetElement = trackRef.current.querySelector('.coach-item.user-coach');
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
      const coachIdAttr = targetElement.getAttribute('data-coach-id');
      if (coachIdAttr !== null) {
        setSelectedCoachId(parseInt(coachIdAttr, 10));
      }
    }
  };

  // Center on user's coach on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToUserCoach();
    }, 450);
    return () => clearTimeout(timer);
  }, [ticket.pnr]);

  return (
    <div className="glass-panel coach-position-panel" style={{ marginTop: '1.25rem' }}>
      {/* 1. Header with Title & Action Controls */}
      <div className="section-subhead coach-position-header">
        <div className="coach-head-title">
          <h3>
            <Train size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>Coach Position & Platform Layout</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Live Rake Formation & Engine Distance
          </span>
        </div>

        {/* Right side controls */}
        <div className="coach-header-actions">
          {userCoachesList.length > 0 && (
            <button
              type="button"
              className="btn-secondary coach-action-btn locate-btn"
              onClick={scrollToUserCoach}
              title="Center view on your assigned coach"
            >
              <Navigation size={13} style={{ color: 'var(--accent-cyan)' }} />
              <span>Locate My Coach</span>
            </button>
          )}

          <button
            type="button"
            className="btn-secondary coach-action-btn reverse-btn"
            onClick={() => setReversed(prev => !prev)}
            title="Toggle engine direction in case of engine reversal"
          >
            <ArrowLeftRight size={13} />
            <span>{reversed ? 'Engine: Rear' : 'Engine: Front'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Banner / Status Summary */}
      <div className="coach-summary-strip">
        {userCoachesList.length > 0 ? (
          <div className="coach-summary-user">
            <div className="user-coach-badge-wrap">
              <span className="user-coach-badge-label">Allotted Coach:</span>
              <strong className="user-coach-badge-val">
                {userCoachesList.map(c => c.code).join(', ')}
              </strong>
            </div>

            <div className="user-coach-distance-tag">
              <MapPin size={13} style={{ color: 'var(--accent-cyan)' }} />
              <span>
                {primaryPax?.coachPositionLabel || `${userCoachesList[0]?.positionLabel || 'Assigned Coach'}`}
              </span>
              <span className="user-coach-meters">
                (~{userCoachesList[0]?.distanceFromEngineMeters || 250}m from Loco)
              </span>
            </div>
          </div>
        ) : (
          <div className="coach-summary-pending">
            <Info size={15} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <span>
              Coach numbers will be finalized upon chart preparation. Standard rake composition for Train #{ticket.trainNumber} ({ticket.classCode}) is visualized below.
            </span>
          </div>
        )}

        <div className="coach-chart-badge">
          <span className={`coach-chart-dot ${isChartPrepared ? 'prepared' : 'pending'}`}></span>
          <span>{isChartPrepared ? 'CRIS PRS Verified Rake' : 'Standard Rake Model'}</span>
        </div>
      </div>

      {/* 3. Train Track & Direction Indicator Strip */}
      <div className="coach-direction-bar">
        <div className="direction-label front">
          <span>{reversed ? '◀ TRAIN REAR (GUARD)' : '▶ FRONT (LOCOMOTIVE)'}</span>
        </div>
        <div className="direction-track-line">
          <span className="track-rail-top"></span>
          <span className="track-rail-bottom"></span>
        </div>
        <div className="direction-label rear">
          <span>{reversed ? 'FRONT (LOCOMOTIVE) ▶' : 'REAR (GUARD) ◀'}</span>
        </div>
      </div>

      {/* 4. Scrollable Rake Visualization Track */}
      <div className="coach-track-scroll-wrapper" ref={trackRef}>
        <div className="coach-track-container">
          {coaches.map((coach) => {
            const isSelected = selectedCoach?.id === coach.id;
            const isUser = coach.isUserCoach;

            return (
              <React.Fragment key={coach.id}>
                {/* Coupler link */}
                <div className="coach-coupler" aria-hidden="true">
                  <span className="coupler-joint"></span>
                </div>

                {/* Individual Coach Unit */}
                <div
                  className={`coach-item ${coach.category} ${isUser ? 'user-coach' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedCoachId(coach.id)}
                  data-coach-id={coach.id}
                  role="button"
                  tabIndex={0}
                  title={`${coach.label} - ${coach.className}`}
                >
                  {/* Floating User Highlight Marker */}
                  {isUser && (
                    <div className="coach-user-marker">
                      <Sparkles size={10} />
                      <span>YOUR COACH</span>
                    </div>
                  )}

                  {/* Top: Category / Class Abbr */}
                  <div className="coach-unit-top">
                    <span className="coach-class-tag">{coach.shortClass}</span>
                  </div>

                  {/* Middle: Coach Identifier Code (e.g. B4, S1, ENG) */}
                  <div className="coach-unit-body">
                    {coach.isEngine ? (
                      <div className="engine-face">
                        <Train size={22} className="engine-icon" />
                        <span className="engine-headlight"></span>
                      </div>
                    ) : (
                      <span className="coach-code-text">{coach.code}</span>
                    )}
                  </div>

                  {/* Bottom: Position / Seat Number */}
                  <div className="coach-unit-bottom">
                    {isUser && coach.passengers?.length > 0 ? (
                      <span className="coach-seat-tag">
                        Seat {coach.passengers[0].berthNumber}
                      </span>
                    ) : (
                      <span className="coach-pos-number">
                        {coach.isEngine ? 'LOCO' : `#${coach.positionFromEngine}`}
                      </span>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 5. Interactive Selected Coach Detail Sheet */}
      {selectedCoach && (
        <div className={`coach-detail-card ${selectedCoach.category} ${selectedCoach.isUserCoach ? 'user-selected' : ''}`}>
          <div className="coach-detail-header">
            <div className="coach-detail-title-group">
              <span className={`coach-code-pill ${selectedCoach.category}`}>
                {selectedCoach.code}
              </span>
              <div>
                <h4 className="coach-full-title">
                  {selectedCoach.className}
                  {selectedCoach.isUserCoach && (
                    <span className="coach-user-verified-badge">
                      <CheckCircle2 size={13} />
                      Your Allotted Coach
                    </span>
                  )}
                </h4>
                <p className="coach-desc-text">
                  {selectedCoach.description} • {selectedCoach.positionLabel}
                </p>
              </div>
            </div>

            {/* Approximate distance from locomotive */}
            <div className="coach-detail-metrics">
              <div className="metric-item">
                <span className="metric-label">Engine Distance</span>
                <strong className="metric-val">
                  {selectedCoach.isEngine ? '0 m (Locomotive)' : `~${selectedCoach.distanceFromEngineMeters} meters`}
                </strong>
              </div>
              <div className="metric-item">
                <span className="metric-label">Platform Halting Area</span>
                <strong className="metric-val">{selectedCoach.platformSector}</strong>
              </div>
            </div>
          </div>

          {/* Passenger manifest matching this coach */}
          {selectedCoach.passengers?.length > 0 && (
            <div className="coach-pax-match-list">
              <div className="coach-pax-match-title">
                <UserCheck size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span>Passengers Boarding This Coach:</span>
              </div>
              <div className="coach-pax-chips">
                {selectedCoach.passengers.map((pax, idx) => (
                  <div key={idx} className="coach-pax-chip">
                    <span className="pax-name">{pax.passengerName}</span>
                    <span className="pax-seat">Berth: <strong>{pax.berthNumber}</strong></span>
                    <span className="pax-status">({pax.status})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Station Platform Tip */}
          <div className="coach-platform-tip">
            <Info size={13} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
            <span>
              <strong>Platform Display Guide:</strong> Overhead platform electronic indicators (POIS) display <code>{selectedCoach.code}</code> above the track. Walk towards {selectedCoach.platformSector} to stand directly in front of this coach before train arrival.
            </span>
          </div>
        </div>
      )}

      {/* 6. Coach Class Color Legend */}
      <div className="coach-legend-strip">
        <div className="legend-item"><span className="legend-dot engine"></span><span>Engine (Loco)</span></div>
        <div className="legend-item"><span className="legend-dot first-ac"></span><span>1A (First AC)</span></div>
        <div className="legend-item"><span className="legend-dot two-tier"></span><span>2A (AC 2 Tier)</span></div>
        <div className="legend-item"><span className="legend-dot three-tier"></span><span>3A / 3E (AC 3 Tier)</span></div>
        <div className="legend-item"><span className="legend-dot sleeper"></span><span>SL (Sleeper)</span></div>
        <div className="legend-item"><span className="legend-dot chair-car"></span><span>CC (Chair Car)</span></div>
        <div className="legend-item"><span className="legend-dot general"></span><span>GS (General)</span></div>
        <div className="legend-item"><span className="legend-dot pantry"></span><span>PC (Pantry)</span></div>
        <div className="legend-item"><span className="legend-dot guard"></span><span>SLR / EOG</span></div>
      </div>
    </div>
  );
}

