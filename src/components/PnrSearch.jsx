import React, { useState, useEffect, useRef } from 'react';
import { Train, X, ArrowRight, Radio, ClipboardPaste } from 'lucide-react';

export default function PnrSearch({
  onSearch,
  loading,
  currentPnr,
  isLiveApi
}) {
  const [inputValue, setInputValue] = useState(currentPnr || '');
  const [inputError, setInputError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedDigits, setAnimatedDigits] = useState([]);
  const inputRef = useRef(null);

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
    setIsAnimating(false);
    setAnimatedDigits([]);
    inputRef.current?.focus();
  };

  // Shared: run digit-by-digit reveal animation for a given digits string
  const runPasteAnimation = (digits) => {
    if (!digits) return;
    setInputValue('');
    setInputError('');
    setIsAnimating(true);
    setAnimatedDigits([]);

    const arr = digits.split('');
    arr.forEach((_, i) => {
      setTimeout(() => {
        setAnimatedDigits(prev => [...prev, arr[i]]);
        if (i === arr.length - 1) {
          // Commit to real input after animation finishes
          setTimeout(() => {
            setInputValue(digits);
            setIsAnimating(false);
            setAnimatedDigits([]);
            inputRef.current?.focus();
          }, 120);
        }
      }, i * 60);
    });
  };

  // Intercept native Ctrl+V / right-click paste on the <input>
  const handleNativePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    const digits = pasted.replace(/\D/g, '').slice(0, 10);
    if (digits) {
      runPasteAnimation(digits);
    }
  };

  // Paste button: read from clipboard API, then animate
  const handlePasteBtn = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const digits = text.replace(/\D/g, '').slice(0, 10);
      if (digits) {
        runPasteAnimation(digits);
      }
    } catch {
      // Clipboard API blocked — focus input so the user can Ctrl+V manually
      inputRef.current?.focus();
    }
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
            {/* Input field with train icon, animated overlay & action buttons */}
            <div className="search-field-wrapper">
              <div className="search-prefix-icon">
                <Train size={20} />
              </div>

              {/* Animated digit overlay shown during paste animation */}
              {isAnimating ? (
                <div className="pnr-digit-reveal" aria-hidden="true">
                  {animatedDigits.map((d, i) => (
                    <span key={i} className="pnr-digit-char">{d}</span>
                  ))}
                  <span className="pnr-digit-cursor" />
                </div>
              ) : (
                <input
                  ref={inputRef}
                  type="text"
                  id="pnr-input-box"
                  className="search-input-field"
                  placeholder="Enter 10-digit PNR"
                  value={inputValue}
                  onChange={handleInputChange}
                  onPaste={handleNativePaste}
                  maxLength={10}
                  autoFocus
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  aria-label="10-digit PNR number"
                />
              )}

              {/* Right-side actions: clear (when has value) OR paste */}
              <div className="search-field-actions">
                {inputValue && !isAnimating ? (
                  <button
                    type="button"
                    className="clear-icon-btn"
                    onClick={handleClear}
                    title="Clear input"
                    aria-label="Clear PNR number"
                  >
                    <X size={12} />
                  </button>
                ) : !isAnimating ? (
                  <button
                    type="button"
                    className="paste-icon-btn"
                    onClick={handlePasteBtn}
                    title="Paste PNR from clipboard"
                    aria-label="Paste PNR number"
                  >
                    <ClipboardPaste size={14} />
                    <span className="paste-btn-label">Paste</span>
                  </button>
                ) : null}
              </div>
            </div>

            {/* Check status submit button */}
            <button
              type="submit"
              className="btn-primary search-submit-btn"
              disabled={loading || (!isComplete && !isAnimating)}
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
