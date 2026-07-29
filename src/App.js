import { useEffect, useState } from 'react';
import './App.css';
import DashboardOverview from './components/DashboardOverview';
import HeroPanel from './components/HeroPanel';
import LoginCard from './components/LoginCard';
import ProfileSecurityCard from './components/ProfileSecurityCard';
import ResponseCard from './components/ResponseCard';
import StatusBanner from './components/StatusBanner';
import SignupCard from './components/SignupCard';
import TopNavigation from './components/TopNavigation';
import { APP_ROUTES, normalizeRoute } from './constants/routes';
import useAuthDashboard from './hooks/useAuthDashboard';

function App() {
  const dashboard = useAuthDashboard();
  const [pathname, setPathname] = useState(() =>
    normalizeRoute(window.location.pathname),
  );

  const activePath =
    pathname === APP_ROUTES.profile && !dashboard.accessToken
      ? APP_ROUTES.login
      : pathname;

  useEffect(() => {
    const normalizedRoute = normalizeRoute(window.location.pathname);

    if (window.location.pathname !== normalizedRoute) {
      window.history.replaceState({}, '', normalizedRoute);
    }

    setPathname(normalizedRoute);

    function handlePopState() {
      setPathname(normalizeRoute(window.location.pathname));
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (pathname === activePath) {
      return;
    }

    window.history.replaceState({}, '', activePath);
    setPathname(activePath);
  }, [activePath, pathname]);

  useEffect(() => {
    if (!dashboard.redirectRoute) {
      return;
    }

    const normalizedRoute = normalizeRoute(dashboard.redirectRoute);

    if (window.location.pathname !== normalizedRoute) {
      window.history.replaceState({}, '', normalizedRoute);
    }

    setPathname(normalizedRoute);
    dashboard.consumeRedirectRoute();
  }, [dashboard]);

  function navigate(nextPath, options = {}) {
    const normalizedRoute = normalizeRoute(nextPath);

    if (window.location.pathname !== normalizedRoute) {
      const historyMethod = options.replace ? 'replaceState' : 'pushState';
      window.history[historyMethod]({}, '', normalizedRoute);
    }

    if (pathname !== normalizedRoute) {
      setPathname(normalizedRoute);
    }
  }

  async function handleRegisterSubmit(event) {
    const result = await dashboard.register.submit(event);

    if (result?.ok) {
      navigate(APP_ROUTES.login, { replace: true });
    }
  }

  async function handleLoginSubmit(event) {
    const result = await dashboard.login.submit(event);

    if (!result?.ok) {
      return;
    }

    if (result.requiresTwoFactor) {
      navigate(APP_ROUTES.login, { replace: true });
      return;
    }

    navigate(APP_ROUTES.dashboard);
  }

  async function handleVerificationSubmit(event) {
    const result = await dashboard.verification.submit(event);

    if (result?.ok) {
      navigate(APP_ROUTES.profile);
    }
  }

  const routedRegister = {
    ...dashboard.register,
    submit: handleRegisterSubmit,
  };

  const routedLogin = {
    ...dashboard.login,
    submit: handleLoginSubmit,
  };

  const routedVerification = {
    ...dashboard.verification,
    submit: handleVerificationSubmit,
  };

  function renderPage() {
    if (activePath === APP_ROUTES.signup) {
      return (
        <section className="page-grid">
          <SignupCard
            cognito={dashboard.cognito}
            register={routedRegister}
            onLoginNavigate={() => navigate(APP_ROUTES.login)}
          />
          <ResponseCard lastResponse={dashboard.lastResponse} />
        </section>
      );
    }

    if (activePath === APP_ROUTES.login) {
      return (
        <section className="page-grid">
          <LoginCard
            cognito={dashboard.cognito}
            login={routedLogin}
            verification={routedVerification}
            onSignupNavigate={() => navigate(APP_ROUTES.signup)}
          />
          <ResponseCard lastResponse={dashboard.lastResponse} />
        </section>
      );
    }

    if (activePath === APP_ROUTES.profile) {
      return (
        <section className="page-stack">
          <ProfileSecurityCard
            accessToken={dashboard.accessToken}
            profile={dashboard.profile}
            twoFactor={dashboard.twoFactor}
          />
          <ResponseCard lastResponse={dashboard.lastResponse} />
        </section>
      );
    }

    return (
      <section className="page-grid">
        <DashboardOverview
          accessToken={dashboard.accessToken}
          authProvider={dashboard.authProvider}
          sessionState={dashboard.sessionState}
          verificationRequired={dashboard.verification.required}
          onNavigate={navigate}
        />
        <ResponseCard lastResponse={dashboard.lastResponse} />
      </section>
    );
  }

  return (
    <main className="app-shell">
      <HeroPanel
        apiBaseUrl={dashboard.apiBaseUrl}
        authProvider={dashboard.authProvider}
        onApiBaseUrlChange={dashboard.setApiBaseUrl}
        sessionState={dashboard.sessionState}
        onClearSession={dashboard.clearSession}
        canClearSession={dashboard.canClearSession}
      />

      <TopNavigation activePath={activePath} onNavigate={navigate} />

      <StatusBanner feedback={dashboard.feedback} />

      {renderPage()}
    </main>
  );
}

export default App;
