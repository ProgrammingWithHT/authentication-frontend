export const APP_ROUTES = {
  dashboard: '/dashboard',
  signup: '/signup',
  login: '/login',
  profile: '/profile',
};

export const DEFAULT_ROUTE = APP_ROUTES.dashboard;

const knownRoutes = new Set(Object.values(APP_ROUTES));

export function normalizeRoute(pathname) {
  const trimmedPath = pathname?.replace(/\/+$/, '') || '/';

  if (trimmedPath === '/') {
    return DEFAULT_ROUTE;
  }

  return knownRoutes.has(trimmedPath) ? trimmedPath : DEFAULT_ROUTE;
}
