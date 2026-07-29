function LoginCard({ login, verification, cognito, onSignupNavigate }) {
  const isCognitoVerification = verification.provider === 'cognito';

  return (
    <article className="card">
      <div className="card-heading">
        <div>
          <p className="card-kicker">Route: /login</p>
          <h2>Sign in</h2>
        </div>
      </div>

      <p className="card-intro">
        Keep your current username or email login, and add Amazon Cognito as a
        second sign-in option on the same page.
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

      <div className="section-divider" />

      <section className="provider-panel">
        <div>
          <p className="card-kicker">Second option</p>
          <h3>Login with Amazon Cognito</h3>
          <p className="helper-text">
            Redirects to the Cognito managed login page, then comes back here
            and finishes local 2FA only if this account already requires it.
          </p>
        </div>

        <button
          type="button"
          className="ghost-button provider-button"
          onClick={cognito.login}
        >
          Continue with Cognito
        </button>
      </section>

      {verification.required ? (
        <>
          <div className="section-divider" />

          <form className="stack sub-panel" onSubmit={verification.submit}>
            <div>
              <p className="card-kicker">Second step</p>
              <h3>Verify 2FA login</h3>
              <p className="helper-text">
                {isCognitoVerification
                  ? 'Cognito sign-in succeeded. Finish the app 2FA check with your authenticator code.'
                  : `User ID: ${verification.userId}`}
              </p>
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
