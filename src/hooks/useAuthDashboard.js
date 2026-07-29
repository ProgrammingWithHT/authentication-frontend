import { useEffect, useState } from 'react';
import {
  COGNITO_AUTH_PROVIDER,
  createInitialFeedback,
  createLoginForm,
  createRegisterForm,
  createTokenForm,
  DEFAULT_API_URL,
  LOCAL_AUTH_PROVIDER,
  PROVIDER_STORAGE_KEY,
  STORAGE_KEY,
} from '../constants/auth';
import { APP_ROUTES } from '../constants/routes';
import { apiRequest } from '../utils/api';
import { formatResponse } from '../utils/formatters';

function useAuthDashboard() {
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_URL);
  const [registerForm, setRegisterForm] = useState(createRegisterForm);
  const [loginForm, setLoginForm] = useState(createLoginForm);
  const [verifyForm, setVerifyForm] = useState(createTokenForm);
  const [enableForm, setEnableForm] = useState(createTokenForm);
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem(STORAGE_KEY) || '',
  );
  const [authProvider, setAuthProvider] = useState(
    () =>
      localStorage.getItem(PROVIDER_STORAGE_KEY) ||
      (localStorage.getItem(STORAGE_KEY) ? LOCAL_AUTH_PROVIDER : ''),
  );
  const [profile, setProfile] = useState(null);
  const [pendingTwoFactorUserId, setPendingTwoFactorUserId] = useState('');
  const [pendingAuthProvider, setPendingAuthProvider] = useState('');
  const [setupData, setSetupData] = useState(null);
  const [feedback, setFeedback] = useState(createInitialFeedback);
  const [lastResponse, setLastResponse] = useState('No API calls yet.');
  const [activeAction, setActiveAction] = useState('');
  const [redirectRoute, setRedirectRoute] = useState('');

  const normalizedApiBaseUrl = apiBaseUrl.trim().replace(/\/+$/, '');
  const sessionProviderLabel =
    authProvider === COGNITO_AUTH_PROVIDER ? 'Amazon Cognito' : 'Local API';
  const sessionState = accessToken
    ? `Authenticated with ${sessionProviderLabel}`
    : pendingTwoFactorUserId
      ? pendingAuthProvider === COGNITO_AUTH_PROVIDER
        ? 'Waiting for 2FA after Amazon Cognito'
        : 'Waiting for 2FA'
      : 'Signed out';

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(STORAGE_KEY, accessToken);
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && authProvider) {
      localStorage.setItem(PROVIDER_STORAGE_KEY, authProvider);
      return;
    }

    localStorage.removeItem(PROVIDER_STORAGE_KEY);
  }, [accessToken, authProvider]);

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const token = currentUrl.searchParams.get('token');
    const provider =
      currentUrl.searchParams.get('provider') || COGNITO_AUTH_PROVIDER;
    const pendingTwoFactorId = currentUrl.searchParams.get('pending2fa');
    const flow = currentUrl.searchParams.get('flow');
    const error = currentUrl.searchParams.get('error');

    if (!token && !pendingTwoFactorId && !error) {
      return;
    }

    if (token) {
      setAccessToken(token);
      setAuthProvider(provider);
      setPendingTwoFactorUserId('');
      setPendingAuthProvider('');
      setVerifyForm(createTokenForm());
      setEnableForm(createTokenForm());
      setSetupData(null);
      setFeedback({
        type: 'success',
        text:
          flow === 'signup'
            ? 'Amazon Cognito signup completed. Opening your profile section.'
            : 'Amazon Cognito sign-in completed. Opening your profile section.',
      });
      rememberResponse('cognito', {
        flow,
        provider,
        token,
      });
      setRedirectRoute(APP_ROUTES.profile);
    } else if (pendingTwoFactorId) {
      setAccessToken('');
      setAuthProvider('');
      setPendingTwoFactorUserId(pendingTwoFactorId);
      setPendingAuthProvider(provider);
      setVerifyForm(createTokenForm());
      setFeedback({
        type: 'info',
        text:
          'Amazon Cognito accepted your credentials. Enter your 6-digit code to finish the local 2FA step.',
      });
      rememberResponse('cognito', {
        flow,
        provider,
        requires2FA: true,
        userId: pendingTwoFactorId,
      });
      setRedirectRoute(APP_ROUTES.login);
    } else if (error) {
      setFeedback({
        type: 'error',
        text: error,
      });
      rememberResponse('cognito-error', {
        error,
      });
      setRedirectRoute(APP_ROUTES.login);
    }

    window.history.replaceState({}, '', currentUrl.pathname);
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await apiRequest(normalizedApiBaseUrl, '/auth/profile', {
          token: accessToken,
        });

        if (!cancelled) {
          setProfile(response);
        }
      } catch (error) {
        if (!cancelled) {
          setAccessToken('');
          setAuthProvider('');
          setPendingTwoFactorUserId('');
          setPendingAuthProvider('');
          setProfile(null);
          setSetupData(null);
          setFeedback({
            type: 'error',
            text:
              error instanceof Error
                ? error.message
                : 'Saved session is no longer valid.',
          });
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [accessToken, normalizedApiBaseUrl]);

  function updateForm(setter, field, value) {
    setter((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function rememberResponse(label, payload) {
    setLastResponse(formatResponse(label, payload));
  }

  async function handleRegister(event) {
    event.preventDefault();
    setActiveAction('register');

    try {
      const response = await apiRequest(normalizedApiBaseUrl, '/auth/register', {
        method: 'POST',
        body: registerForm,
      });

      setFeedback({
        type: 'success',
        text: 'Registration successful. Sign in to open the profile section.',
      });
      setLoginForm({
        usernameOrEmail: registerForm.email,
        password: registerForm.password,
      });
      setRegisterForm(createRegisterForm());
      rememberResponse('register', response);
      return {
        ok: true,
        response,
      };
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Registration failed.',
      });
      return {
        ok: false,
      };
    } finally {
      setActiveAction('');
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    setActiveAction('login');

    try {
      const response = await apiRequest(normalizedApiBaseUrl, '/auth/login', {
        method: 'POST',
        body: loginForm,
      });

      rememberResponse('login', response);

      if (response.requires2FA) {
        setPendingTwoFactorUserId(response.userId);
        setPendingAuthProvider(LOCAL_AUTH_PROVIDER);
        setAccessToken('');
        setAuthProvider('');
        setProfile(null);
        setVerifyForm(createTokenForm());
        setFeedback({
          type: 'info',
          text: 'Password accepted. Enter the 6-digit code to finish sign-in.',
        });
        return {
          ok: true,
          requiresTwoFactor: true,
          response,
        };
      }

      setPendingTwoFactorUserId('');
      setPendingAuthProvider('');
      setAccessToken(response.accessToken);
      setAuthProvider(LOCAL_AUTH_PROVIDER);
      setProfile(response.user);
      setSetupData(null);
      setEnableForm(createTokenForm());
      setFeedback({
        type: 'success',
        text: `Welcome back, ${response.user.username}. Your profile section is ready.`,
      });
      return {
        ok: true,
        requiresTwoFactor: false,
        response,
      };
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Login failed.',
      });
      return {
        ok: false,
        requiresTwoFactor: false,
      };
    } finally {
      setActiveAction('');
    }
  }

  async function handleVerifyTwoFactor(event) {
    event.preventDefault();
    setActiveAction('verify2fa');

    try {
      const response = await apiRequest(normalizedApiBaseUrl, '/auth/verify-2fa', {
        method: 'POST',
        body: {
          userId: pendingTwoFactorUserId,
          token: verifyForm.token,
        },
      });

      setAccessToken(response.accessToken);
      setAuthProvider(pendingAuthProvider || LOCAL_AUTH_PROVIDER);
      setPendingTwoFactorUserId('');
      setPendingAuthProvider('');
      setVerifyForm(createTokenForm());
      setFeedback({
        type: 'success',
        text: 'Two-factor verification complete. Opening your profile section.',
      });
      rememberResponse('verify-2fa', response);
      return {
        ok: true,
        response,
      };
    } catch (error) {
      setFeedback({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Two-factor verification failed.',
      });
      return {
        ok: false,
      };
    } finally {
      setActiveAction('');
    }
  }

  async function handleFetchProfile() {
    setActiveAction('profile');

    try {
      const response = await apiRequest(normalizedApiBaseUrl, '/auth/profile', {
        token: accessToken,
      });

      setProfile(response);
      setFeedback({
        type: 'success',
        text: 'Profile loaded from the API.',
      });
      rememberResponse('profile', response);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Could not load profile.',
      });
    } finally {
      setActiveAction('');
    }
  }

  async function handleGenerateTwoFactor() {
    setActiveAction('generate2fa');

    try {
      const response = await apiRequest(normalizedApiBaseUrl, '/2fa/generate', {
        method: 'POST',
        token: accessToken,
      });

      setSetupData(response);
      setEnableForm(createTokenForm());
      setFeedback({
        type: 'success',
        text: 'Scan the QR code, then confirm it to enable 2FA from your profile.',
      });
      rememberResponse('generate-2fa', response);
    } catch (error) {
      setFeedback({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Could not generate a 2FA secret.',
      });
    } finally {
      setActiveAction('');
    }
  }

  async function handleEnableTwoFactor(event) {
    event.preventDefault();
    setActiveAction('enable2fa');

    try {
      const response = await apiRequest(normalizedApiBaseUrl, '/2fa/enable', {
        method: 'POST',
        body: enableForm,
        token: accessToken,
      });

      const refreshedProfile = await apiRequest(
        normalizedApiBaseUrl,
        '/auth/profile',
        {
          token: accessToken,
        },
      );

      setProfile(refreshedProfile);
      setSetupData(null);
      setEnableForm(createTokenForm());
      setFeedback({
        type: 'success',
        text: response.message,
      });
      rememberResponse('enable-2fa', {
        ...response,
        profile: refreshedProfile,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text:
          error instanceof Error ? error.message : 'Could not enable two-factor.',
      });
    } finally {
      setActiveAction('');
    }
  }

  function handleLogout() {
    const currentProvider = authProvider;

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROVIDER_STORAGE_KEY);
    setAccessToken('');
    setAuthProvider('');
    setProfile(null);
    setPendingTwoFactorUserId('');
    setPendingAuthProvider('');
    setSetupData(null);
    setEnableForm(createTokenForm());
    setVerifyForm(createTokenForm());

    if (currentProvider === COGNITO_AUTH_PROVIDER) {
      window.location.assign(`${normalizedApiBaseUrl}/auth/cognito/logout`);
      return;
    }

    setFeedback({
      type: 'info',
      text: 'Session cleared from the browser.',
    });
  }

  function consumeRedirectRoute() {
    setRedirectRoute('');
  }

  function startCognitoLogin() {
    window.location.assign(`${normalizedApiBaseUrl}/auth/cognito/login`);
  }

  function startCognitoSignup() {
    window.location.assign(`${normalizedApiBaseUrl}/auth/cognito/signup`);
  }

  return {
    apiBaseUrl,
    setApiBaseUrl,
    authProvider,
    sessionState,
    canClearSession: Boolean(accessToken || pendingTwoFactorUserId),
    clearSession: handleLogout,
    redirectRoute,
    consumeRedirectRoute,
    feedback,
    lastResponse,
    accessToken,
    cognito: {
      login: startCognitoLogin,
      signup: startCognitoSignup,
    },
    register: {
      form: registerForm,
      updateField: (field, value) => updateForm(setRegisterForm, field, value),
      submit: handleRegister,
      isSubmitting: activeAction === 'register',
    },
    login: {
      form: loginForm,
      updateField: (field, value) => updateForm(setLoginForm, field, value),
      submit: handleLogin,
      isSubmitting: activeAction === 'login',
    },
    verification: {
      required: Boolean(pendingTwoFactorUserId),
      userId: pendingTwoFactorUserId,
      provider: pendingAuthProvider,
      form: verifyForm,
      updateField: (field, value) => updateForm(setVerifyForm, field, value),
      submit: handleVerifyTwoFactor,
      isSubmitting: activeAction === 'verify2fa',
    },
    profile: {
      data: profile,
      refresh: handleFetchProfile,
      isRefreshing: activeAction === 'profile',
    },
    twoFactor: {
      isEnabled: Boolean(profile?.isTwoFactorEnabled),
      setupData,
      form: enableForm,
      updateField: (field, value) => updateForm(setEnableForm, field, value),
      startSetup: handleGenerateTwoFactor,
      enable: handleEnableTwoFactor,
      isGenerating: activeAction === 'generate2fa',
      isEnabling: activeAction === 'enable2fa',
      canStart: Boolean(accessToken) && !profile?.isTwoFactorEnabled,
    },
  };
}

export default useAuthDashboard;
