import './App.css';
import AuthFlowCard from './components/AuthFlowCard';
import HeroPanel from './components/HeroPanel';
import ProfileSecurityCard from './components/ProfileSecurityCard';
import ResponseCard from './components/ResponseCard';
import StatusBanner from './components/StatusBanner';
import useAuthDashboard from './hooks/useAuthDashboard';

function App() {
  const dashboard = useAuthDashboard();

  return (
    <main className="app-shell">
      <HeroPanel
        apiBaseUrl={dashboard.apiBaseUrl}
        onApiBaseUrlChange={dashboard.setApiBaseUrl}
        sessionState={dashboard.sessionState}
        onClearSession={dashboard.clearSession}
        canClearSession={dashboard.canClearSession}
      />

      <StatusBanner feedback={dashboard.feedback} />

      <section className="dashboard-grid">
        <AuthFlowCard
          register={dashboard.register}
          login={dashboard.login}
          verification={dashboard.verification}
        />

        <ProfileSecurityCard
          accessToken={dashboard.accessToken}
          profile={dashboard.profile}
          twoFactor={dashboard.twoFactor}
        />
      </section>

      <ResponseCard lastResponse={dashboard.lastResponse} />
    </main>
  );
}

export default App;
