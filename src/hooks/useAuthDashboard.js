import { useEffect, useState } from 'react';
import {
  createInitialFeedback,
  createLoginForm,
  createRegisterForm,
  createTokenForm,
  DEFAULT_API_URL,
  STORAGE_KEY,
} from '../constants/auth';
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
  const [profile, setProfile] = useState(null);
  const [pendingTwoFactorUserId, setPendingTwoFactorUserId] = useState('');
  const [setupData, setSetupData] = useState(null);
  const [feedback, setFeedback] = useState(createInitialFeedback);
  const [lastResponse, setLastResponse] = useState('No API calls yet.');
  const [activeAction, setActiveAction] = useState('');

  const normalizedApiBaseUrl = apiBaseUrl.trim().replace(/\/+$/, '');
  const sessionState = accessToken
    ? 'Authenticated'
    : pendingTwoFactorUserId
      ? 'Waiting for 2FA'
      : 'Signed out';

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem(STORAGE_KEY, accessToken);
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  }, [accessToken]);

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
          setPendingTwoFactorUserId('');
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
        setAccessToken('');
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
      setAccessToken(response.accessToken);
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
      setPendingTwoFactorUserId('');
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
    setAccessToken('');
    setProfile(null);
    setPendingTwoFactorUserId('');
    setSetupData(null);
    setEnableForm(createTokenForm());
    setVerifyForm(createTokenForm());
    setFeedback({
      type: 'info',
      text: 'Session cleared from the browser.',
    });
  }

  return {
    apiBaseUrl,
    setApiBaseUrl,
    sessionState,
    canClearSession: Boolean(accessToken || pendingTwoFactorUserId),
    clearSession: handleLogout,
    feedback,
    lastResponse,
    accessToken,
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
