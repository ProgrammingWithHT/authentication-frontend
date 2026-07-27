function SignupCard({ register, onLoginNavigate }) {
  return (
    <article className="card">
      <div className="card-heading">
        <div>
          <p className="card-kicker">Route: /signup</p>
          <h2>Create account</h2>
        </div>
      </div>

      <p className="card-intro">
        Register here first. After the API accepts the new user, the app sends
        you to the login page with your email already filled in.
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
    </article>
  );
}

export default SignupCard;
