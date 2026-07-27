import { APP_ROUTES } from '../constants/routes';

const navigationItems = [
  {
    href: APP_ROUTES.dashboard,
    label: 'Dashboard',
  },
  {
    href: APP_ROUTES.signup,
    label: 'Signup',
  },
  {
    href: APP_ROUTES.login,
    label: 'Login',
  },
  {
    href: APP_ROUTES.profile,
    label: 'Profile',
  },
];

function TopNavigation({ activePath, onNavigate }) {
  function handleClick(event, href) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    onNavigate(href);
  }

  return (
    <nav className="top-nav" aria-label="Authentication routes">
      {navigationItems.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`nav-link ${activePath === item.href ? 'active' : ''}`}
          onClick={(event) => handleClick(event, item.href)}
          aria-current={activePath === item.href ? 'page' : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export default TopNavigation;
