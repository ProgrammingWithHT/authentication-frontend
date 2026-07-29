function HeroPanel({
  apiBaseUrl,
  authProvider,
  onApiBaseUrlChange,
  sessionState,
  onClearSession,
  canClearSession,
}) {
  const providerLabel =
    authProvider === 'cognito'
      ? 'Amazon Cognito'
      : authProvider
        ? 'Local API'
        : 'No provider yet';

  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">React client for your NestJS auth API</p>
        <h1>Authentication Frontend</h1>
        <p className="hero-text">
          Move through dedicated routes for signup, login, dashboard, and
          profile while keeping your original NestJS auth API and adding Amazon
          Cognito as an alternate login and signup provider.
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
            <p className="helper-text">Current provider: {providerLabel}</p>
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
