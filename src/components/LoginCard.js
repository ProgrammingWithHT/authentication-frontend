function LoginCard({ login, verification, onSignupNavigate }) {
  return (
    <article className="card">
      <div className="card-heading">
        <div>
          <p className="card-kicker">Route: /login</p>
          <h2>Sign in</h2>
        </div>
      </div>

      <p className="card-intro">
        Use your username or email to log in. If the account already has
        two-factor authentication enabled, the verification step appears below.
      </p>

      <form className="stack" onSubmit={login.submit}>
        <label className="field">
          <span>Username or email</span>
          <input
            type="text"
            value={login.form.usernameOrEmail}
            onChange={(event) =>
              login.updateField('usernameOrEmail', event.target.value)
            }
            placeholder="hamza@example.com"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={login.form.password}
            onChange={(event) => login.updateField('password', event.target.value)}
            placeholder="Your password"
            minLength={8}
            required
          />
        </label>

        <div className="inline-actions">
          <button type="submit" disabled={login.isSubmitting}>
            {login.isSubmitting ? 'Signing in...' : 'Login'}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={onSignupNavigate}
          >
            Create account
          </button>
        </div>
      </form>

      {verification.required ? (
        <>
          <div className="section-divider" />

          <form className="stack sub-panel" onSubmit={verification.submit}>
            <div>
              <p className="card-kicker">Second step</p>
              <h3>Verify 2FA login</h3>
              <p className="helper-text">User ID: {verification.userId}</p>
            </div>

            <label className="field">
              <span>Authenticator code</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={verification.form.token}
                onChange={(event) =>
                  verification.updateField('token', event.target.value)
                }
                placeholder="123456"
                required
              />
            </label>

            <button type="submit" disabled={verification.isSubmitting}>
              {verification.isSubmitting ? 'Verifying...' : 'Complete login'}
            </button>
          </form>
        </>
      ) : null}
    </article>
  );
}

export default LoginCard;
