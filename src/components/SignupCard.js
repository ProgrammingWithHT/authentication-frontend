function SignupCard({ register, cognito, onLoginNavigate }) {
  return (
    <article className="card">
      <div className="card-heading">
        <div>
          <p className="card-kicker">Route: /signup</p>
          <h2>Create account</h2>
        </div>
      </div>

      <p className="card-intro">
        Choose the existing local registration form or send the user to Amazon
        Cognito managed signup without removing your current auth flow.
      </p>

      <form className="stack" onSubmit={register.submit}>
        <label className="field">
          <span>Username</span>
          <input
            type="text"
            value={register.form.username}
            onChange={(event) => register.updateField('username', event.target.value)}
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
            onChange={(event) => register.updateField('password', event.target.value)}
            placeholder="Minimum 8 characters"
            minLength={8}
            required
          />
        </label>

        <div className="inline-actions">
          <button type="submit" disabled={register.isSubmitting}>
            {register.isSubmitting ? 'Creating account...' : 'Register'}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={onLoginNavigate}
          >
            Go to login
          </button>
        </div>
      </form>

      <div className="section-divider" />

      <section className="provider-panel">
        <div>
          <p className="card-kicker">Second option</p>
          <h3>Signup with Amazon Cognito</h3>
          <p className="helper-text">
            Opens the Cognito hosted signup page, then returns to this app and
            keeps the same protected profile workflow.
          </p>
        </div>

        <button
          type="button"
          className="ghost-button provider-button"
          onClick={cognito.signup}
        >
          Continue with Cognito
        </button>
      </section>
    </article>
  );
}

export default SignupCard;
