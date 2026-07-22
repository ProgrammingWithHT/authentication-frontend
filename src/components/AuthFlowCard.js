function AuthFlowCard({ register, login, verification }) {
  return (
    <article className="card">
      <div className="card-heading">
        <div>
          <p className="card-kicker">Account access</p>
          <h2>Register and sign in</h2>
        </div>
      </div>

      <p className="card-intro">
        Start with registration. After sign-in, the profile section becomes the
        place where the user can review account details and enable 2FA.
      </p>

      <ol className="workflow-list">
        <li className="workflow-item">
          <span className="workflow-step">1</span>
          <div>
            <strong>Create account</strong>
            <p className="helper-text">Register the user with username, email, and password.</p>
          </div>
        </li>
        <li className="workflow-item">
          <span className="workflow-step">2</span>
          <div>
            <strong>Sign in</strong>
            <p className="helper-text">Use the new account to unlock the protected profile section.</p>
          </div>
        </li>
        <li className="workflow-item">
          <span className="workflow-step">3</span>
          <div>
            <strong>Verify only when prompted</strong>
            <p className="helper-text">If 2FA is already on, complete the final code step here.</p>
          </div>
        </li>
      </ol>

      <div className="auth-sections">
        <form className="stack sub-panel" onSubmit={register.submit}>
          <div>
            <p className="card-kicker">Step 1</p>
            <h3>Create account</h3>
          </div>

          <label className="field">
            <span>Username</span>
            <input
              type="text"
              value={register.form.username}
              onChange={(event) =>
                register.updateField('username', event.target.value)
              }
              placeholder="hamza.dev"
              required
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={register.form.email}
              onChange={(event) => register.updateField('email', event.target.value)}
              placeholder="hamza@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={register.form.password}
              onChange={(event) =>
                register.updateField('password', event.target.value)
              }
              placeholder="Minimum 8 characters"
              minLength={8}
              required
            />
          </label>

          <button type="submit" disabled={register.isSubmitting}>
            {register.isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <form className="stack sub-panel" onSubmit={login.submit}>
          <div>
            <p className="card-kicker">Step 2</p>
            <h3>Sign in</h3>
          </div>

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

          <button type="submit" disabled={login.isSubmitting}>
            {login.isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>

      {verification.required ? (
        <form className="stack sub-panel" onSubmit={verification.submit}>
          <div>
            <p className="card-kicker">Step 3</p>
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
      ) : null}
    </article>
  );
}

export default AuthFlowCard;
