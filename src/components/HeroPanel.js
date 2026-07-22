function HeroPanel({
  apiBaseUrl,
  onApiBaseUrlChange,
  sessionState,
  onClearSession,
  canClearSession,
}) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">React client for your NestJS auth API</p>
        <h1>Authentication Frontend</h1>
        <p className="hero-text">
          Register a user first, sign in to open the profile section, and
          enable 2FA from the profile security area instead of managing
          everything from one crowded screen.
        </p>
      </div>

      <div className="hero-controls">
        <label className="field">
          <span>API base URL</span>
          <input
            type="text"
            value={apiBaseUrl}
            onChange={(event) => onApiBaseUrlChange(event.target.value)}
            placeholder="http://localhost:3000"
          />
        </label>

        <div className="session-strip">
          <div>
            <p className="session-label">Session</p>
            <strong>{sessionState}</strong>
          </div>
          <button
            type="button"
            className="ghost-button"
            onClick={onClearSession}
            disabled={!canClearSession}
          >
            Clear session
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroPanel;
