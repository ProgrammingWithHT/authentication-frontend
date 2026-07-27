import { APP_ROUTES } from '../constants/routes';

const routeCards = [
  {
    href: APP_ROUTES.signup,
    label: 'Signup',
    description: 'Create a new account with username, email, and password.',
  },
  {
    href: APP_ROUTES.login,
    label: 'Login',
    description: 'Sign in with your account and finish 2FA when prompted.',
  },
  {
    href: APP_ROUTES.profile,
    label: 'Profile',
    description: 'Open the protected account details and manage 2FA setup.',
  },
];

function DashboardOverview({
  accessToken,
  sessionState,
  verificationRequired,
  onNavigate,
}) {
  const readinessItems = [
    {
      label: 'Session state',
      value: sessionState,
    },
    {
      label: 'Saved access token',
      value: accessToken ? 'Available' : 'Not available',
    },
    {
      label: '2FA verification',
      value: verificationRequired ? 'Waiting for code' : 'Not required right now',
    },
  ];

  return (
    <article className="card">
      <div className="card-heading">
        <div>
          <p className="card-kicker">Overview</p>
          <h2>Frontend routes</h2>
        </div>
      </div>

      <p className="card-intro">
        The authentication flow is now split into dedicated React pages, so each
        step has its own route instead of sharing one crowded screen.
      </p>

      <div className="route-grid">
        {routeCards.map((item) => (
          <button
            key={item.href}
            type="button"
            className="route-card"
            onClick={() => onNavigate(item.href)}
          >
            <span className="route-pill">{item.label}</span>
            <strong>{item.label} page</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </div>

      <div className="section-divider" />

      <div className="card-heading">
        <div>
          <p className="card-kicker">Session snapshot</p>
          <h3>Current browser state</h3>
        </div>
      </div>

      <ol className="workflow-list">
        {readinessItems.map((item, index) => (
          <li key={item.label} className="workflow-item">
            <span className="workflow-step">{index + 1}</span>
            <div>
              <strong>{item.label}</strong>
              <p className="helper-text">{item.value}</p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

export default DashboardOverview;
