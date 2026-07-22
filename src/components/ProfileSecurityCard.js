import { formatDate } from '../utils/formatters';

function ProfileSecurityCard({ accessToken, profile, twoFactor }) {
  const refreshLabel = profile.data ? 'Refresh profile' : 'Open profile';

  return (
    <article className="card">
      <div className="card-heading">
        <div>
          <p className="card-kicker">Protected area</p>
          <h2>User profile</h2>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={profile.refresh}
          disabled={!accessToken || profile.isRefreshing}
        >
          {profile.isRefreshing ? 'Loading...' : refreshLabel}
        </button>
      </div>

      {!accessToken ? (
        <p className="empty-state">
          Register the account and sign in first. The profile section opens only
          after authentication.
        </p>
      ) : profile.data ? (
        <>
          <dl className="profile-grid">
            <div>
              <dt>Username</dt>
              <dd>{profile.data.username}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile.data.email}</dd>
            </div>
            <div>
              <dt>2FA status</dt>
              <dd>{profile.data.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}</dd>
            </div>
            <div>
              <dt>User ID</dt>
              <dd>{profile.data.id}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDate(profile.data.createdAt)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDate(profile.data.updatedAt)}</dd>
            </div>
          </dl>

          <label className="field">
            <span>Access token</span>
            <textarea readOnly value={accessToken} rows={5} />
          </label>
        </>
      ) : (
        <p className="empty-state">
          Your session is active. Use <strong>{refreshLabel}</strong> if the
          profile card does not fill in automatically.
        </p>
      )}

      <div className="section-divider" />

      <section className="security-panel">
        <div className="security-state">
          <div>
            <p className="card-kicker">Profile security</p>
            <h3>Enable two-factor authentication</h3>
          </div>
          <span
            className={`security-badge ${
              twoFactor.isEnabled ? 'enabled' : 'disabled'
            }`}
          >
            {twoFactor.isEnabled ? '2FA enabled' : '2FA disabled'}
          </span>
        </div>

        <p className="helper-text">
          Once the user profile is open, the security action starts here. Click
          the button below, scan the QR code, and confirm with the authenticator
          code.
        </p>

        {!accessToken ? (
          <p className="empty-state">
            Sign in to access the profile security tools.
          </p>
        ) : twoFactor.isEnabled ? (
          <p className="empty-state">
            Two-factor authentication is already active for this user.
          </p>
        ) : twoFactor.setupData ? (
          <div className="stack">
            <div className="qr-panel">
              <img src={twoFactor.setupData.qrCode} alt="Two-factor QR code" />
            </div>

            <label className="field">
              <span>Manual secret</span>
              <textarea readOnly value={twoFactor.setupData.secret} rows={3} />
            </label>

            <form className="stack sub-panel" onSubmit={twoFactor.enable}>
              <div>
                <p className="card-kicker">Final step</p>
                <h3>Confirm 2FA</h3>
              </div>

              <label className="field">
                <span>Authenticator code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  value={twoFactor.form.token}
                  onChange={(event) =>
                    twoFactor.updateField('token', event.target.value)
                  }
                  placeholder="123456"
                  required
                />
              </label>

              <button type="submit" disabled={twoFactor.isEnabling}>
                {twoFactor.isEnabling ? 'Enabling...' : 'Enable 2FA'}
              </button>
            </form>
          </div>
        ) : (
          <button
            type="button"
            onClick={twoFactor.startSetup}
            disabled={!twoFactor.canStart || twoFactor.isGenerating}
          >
            {twoFactor.isGenerating ? 'Preparing 2FA...' : 'Enable 2FA'}
          </button>
        )}
      </section>
    </article>
  );
}

export default ProfileSecurityCard;
