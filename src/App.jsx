import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

import Header from './components/Header';
import PnrSearch from './components/PnrSearch';
import PnrLoader from './components/PnrLoader';
import PnrNotFound from './components/PnrNotFound';
import PnrStatusOverview from './components/PnrStatusOverview';
import RouteTimeline from './components/RouteTimeline';
import PassengerTable from './components/PassengerTable';
import SearchHistory from './components/SearchHistory';
import TicketPrintModal from './components/TicketPrintModal';
import PnrGuideModal from './components/PnrGuideModal';
import IndianRailJsonModal from './components/IndianRailJsonModal';
import NotificationToast from './components/NotificationToast';

import { fetchLivePnr, normalizeErrorMessage } from './services/pnrService';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pnrbuddy_theme') || 'dark';
  });

  const [currentTicket, setCurrentTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queriedPnr, setQueriedPnr] = useState('4146937169');
  const [notFoundState, setNotFoundState] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alertActive, setAlertActive] = useState(false);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Search history initialized from actual user history only
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('pnrbuddy_pnr_history');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pnrbuddy_theme', theme);
  }, [theme]);

  // Initial load: Fetch real verified live PNR 4146937169
  useEffect(() => {
    handleSearch('4146937169', true);
  }, []);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showNotification = (message) => {
    setToast({ message });
  };

  const handleSearch = async (pnrString, isInitial = false) => {
    const cleanPnr = pnrString.replace(/\D/g, '').slice(0, 10);
    if (cleanPnr.length !== 10) {
      showNotification('Please enter a valid 10-digit Indian Railway PNR');
      return;
    }

    setQueriedPnr(cleanPnr);
    setLoading(true);
    setNotFoundState(null);
    setAlertActive(false);

    try {
      const result = await fetchLivePnr(cleanPnr);
      setLoading(false);

      if (result.success && result.ticket && result.ticket.trainNumber) {
        const liveData = result.ticket;
        setCurrentTicket(liveData);
        setNotFoundState(null);

        // Confetti for confirmed tickets
        if (liveData.overallStatus === 'CNF') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 }
          });
        }

        // Save real searched PNR to history
        const newEntry = {
          pnr: liveData.pnr,
          title: `${liveData.trainNumber} ${liveData.trainName}`,
          status: liveData.passengers?.[0]?.currentStatus || liveData.overallStatus
        };

        setSearchHistory(prev => {
          const filtered = prev.filter(item => item.pnr !== liveData.pnr);
          const updated = [newEntry, ...filtered].slice(0, 8);
          localStorage.setItem('pnrbuddy_pnr_history', JSON.stringify(updated));
          return updated;
        });

        if (!isInitial) {
          showNotification(`PNR #${liveData.pnr} status loaded!`);
        }
      } else {
        setCurrentTicket(null);
        setNotFoundState({
          pnr: cleanPnr,
          message: normalizeErrorMessage(result.error)
        });
      }
    } catch (err) {
      setLoading(false);
      console.error('Search error:', err);
      setCurrentTicket(null);
      setNotFoundState({
        pnr: cleanPnr,
        message: normalizeErrorMessage(err)
      });
    }
  };

  const handleRefresh = async () => {
    if (!currentTicket) return;
    setIsRefreshing(true);
    await handleSearch(currentTicket.pnr);
    setIsRefreshing(false);
    showNotification(`Live status for PNR #${currentTicket.pnr} refreshed!`);
  };

  const handleShareStatus = () => {
    if (!currentTicket) return;
    const shareText = `*pnrBuddy Live PNR Status*\nPNR: ${currentTicket.pnr}\nTrain: ${currentTicket.trainNumber} ${currentTicket.trainName}\nCurrent Status: ${currentTicket.passengers?.[0]?.currentStatus || currentTicket.overallStatus}\nPrediction: ${currentTicket.predictionSummary || ''}\nRoute: ${currentTicket.fromStation?.name} (${currentTicket.fromStation?.code}) ➔ ${currentTicket.toStation?.name} (${currentTicket.toStation?.code})\nDOJ: ${currentTicket.dateOfJourney}\nClass: ${currentTicket.classCode} (${currentTicket.quota})`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showNotification('Copied to clipboard! Ready to share.');
    } else {
      showNotification('Status details copied.');
    }
  };

  const handleToggleAlert = () => {
    const newState = !alertActive;
    setAlertActive(newState);
    if (newState) {
      showNotification('🔔 Alerts activated! You will receive updates when the train chart is prepared.');
    } else {
      showNotification('Alerts turned off for this PNR.');
    }
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('pnrbuddy_pnr_history');
    showNotification('Search history cleared.');
  };

  return (
    <div className="app-container">
      {/* Background ambient neon orbs */}
      <div className="bg-ambient">
        <div className="ambient-orb ambient-orb-1"></div>
        <div className="ambient-orb ambient-orb-2"></div>
        <div className="ambient-orb ambient-orb-3"></div>
      </div>

      {/* Top Header */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenGuide={() => setShowGuideModal(true)}
      />

      {/* Hero PNR Search Section */}
      <PnrSearch
        onSearch={(pnr) => handleSearch(pnr)}
        loading={loading}
        currentPnr={queriedPnr}
        isLiveApi={currentTicket?.isLiveFromApi}
      />

      {/* Recent Searches Bar */}
      <SearchHistory
        history={searchHistory}
        onSelectPnr={(pnr) => handleSearch(pnr)}
        onClearHistory={handleClearHistory}
      />

      {/* Custom Rail Scanner Loader */}
      {loading && (
        <PnrLoader pnr={queriedPnr} />
      )}

      {/* Clean Not Found Panel */}
      {!loading && notFoundState && (
        <PnrNotFound
          pnr={notFoundState.pnr}
          errorMessage={notFoundState.message}
          onRetry={() => handleSearch(notFoundState.pnr)}
        />
      )}

      {/* Main Ticket Display */}
      {!loading && currentTicket && (
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Status & Probability Overview */}
          <PnrStatusOverview
            ticket={currentTicket}
            onPrintTicket={() => setShowPrintModal(true)}
            onShareStatus={handleShareStatus}
            onToggleAlert={handleToggleAlert}
            alertActive={alertActive}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            onOpenJsonModal={() => setShowJsonModal(true)}
          />

          {/* Route Timeline */}
          <RouteTimeline ticket={currentTicket} />

          {/* Passenger Booking & Current Status Manifest */}
          <PassengerTable
            passengers={currentTicket.passengers}
            overallStatus={currentTicket.overallStatus}
          />
        </main>
      )}

      {/* Modals */}
      {showPrintModal && currentTicket && (
        <TicketPrintModal
          ticket={currentTicket}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {showGuideModal && (
        <PnrGuideModal
          onClose={() => setShowGuideModal(false)}
        />
      )}

      {showJsonModal && currentTicket?.officialIndianRailData && (
        <IndianRailJsonModal
          officialData={currentTicket.officialIndianRailData}
          pnr={currentTicket.pnr}
          onClose={() => setShowJsonModal(false)}
        />
      )}

      {/* Toast Notification */}
      <NotificationToast
        toast={toast}
        onClose={() => setToast(null)}
      />

      {/* Clean Footer */}
      <footer className="site-footer">
        <strong>pnrBuddy</strong>
        <p>
          Fast, Live Indian Railways PNR Status & Telemetry
        </p>
        <p style={{ fontSize: '0.72rem', opacity: 0.6 }}>
          Direct CRIS PRS Gateway: <code>/api/pnr/:pnr?format=raw</code>
        </p>
        <p style={{ fontSize: '0.72rem', opacity: 0.6 }}>
        <code> muhammedsafvan1ms@icloud.com</code>
      </p>
      <code style={{ fontSize: '0.72rem', opacity: 0.6 }}>&copy;2026 pnrBuddy.dev All rights reserved.</code>
    </footer>
    </div >
  );
}

export default App;
