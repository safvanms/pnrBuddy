import React, { useState, useEffect } from 'react';
import { Train, X, ArrowRight, Radio } from 'lucide-react';

export default function PnrSearch({
  onSearch,
  loading,
  currentPnr,
  isLiveApi
}) {
  const [inputValue, setInputValue] = useState(currentPnr || '');
  const [inputError, setInputError] = useState('');

  // Sync input value whenever currentPnr prop updates (e.g. clicking a recent search history chip)
  useEffect(() => {
    if (currentPnr) {
      setInputValue(currentPnr);
      setInputError('');
    }
  }, [currentPnr]);

  const handleInputChange = (e) => {
    // Only accept numbers up to 10 digits
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setInputValue(val);
    if (inputError) setInputError('');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const clean = inputValue.trim();
    if (!clean) {
      setInputError('Please enter your 10-digit PNR number');
      return;
    }
    if (clean.length !== 10) {
      setInputError(`Enter complete 10 digits (${clean.length}/10 entered)`);
      return;
    }
    onSearch(clean);
  };

  const handleClear = () => {
    setInputValue('');
    setInputError('');
  };

  const isComplete = inputValue.length === 10;

  return (
    <section className="search-hero">
      <div className="search-hero-content">
        <div className="api-badge-pill">
          <Radio size={12} className="animate-pulse" />
          <span>Live CRIS PRS Gateway</span>
        </div>

        <h2 className="search-hero-title">
          Live PNR <span className="gradient-text">Tracker</span>
        </h2>
        <p className="search-hero-subtitle">
          Real-time confirmation chances, live charting & berth allotment
        </p>
      </div>

      <div className="search-box-wrap">
        <form onSubmit={handleFormSubmit} className="search-form">
          <div className="search-input-container">
            {/* Input field with train icon & clear button */}
            <div className="search-field-wrapper">
              <div className="search-prefix-icon">
                <Train size={20} />
              </div>

              <input
                type="text"
                id="pnr-input-box"
                className="search-input-field"
                placeholder="Enter 10-digit PNR"
                value={inputValue}
                onChange={handleInputChange}
                maxLength={10}
                autoFocus
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                aria-label="10-digit PNR number"
              />

              {/* Clear button & Digit counter */}
              <div className="search-field-actions">
                {inputValue && (
                  <button
                    type="button"
                    className="clear-icon-btn"
                    onClick={handleClear}
                    title="Clear input"
                    aria-label="Clear PNR number"
                  >
                    <X size={12} />
                  </button>
                )}

                {/* {inputValue.length > 0 && (
                  <span className={`digit-badge ${isComplete ? 'complete' : ''}`}>
                    {inputValue.length}/10
                  </span>
                )} */}
              </div>
            </div>

            {/* Check status submit button */}
            <button
              type="submit"
              className="btn-primary search-submit-btn"
              disabled={loading || !isComplete}
              id="check-pnr-button"
            >
              {loading ? (
                <span>Querying...</span>
              ) : (
                <>
                  <span>Check Status</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </form>

        {inputError && (
          <div className="input-error-msg">
            {inputError}
          </div>
        )}
      </div>
    </section>
  );
}
