export const DEFAULT_API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const STORAGE_KEY = 'authenticationapp.accessToken';
export const PROVIDER_STORAGE_KEY = 'authenticationapp.authProvider';
export const LOCAL_AUTH_PROVIDER = 'local';
export const COGNITO_AUTH_PROVIDER = 'cognito';

export function createRegisterForm() {
  return {
    username: '',
    email: '',
    password: '',
  };
}

export function createLoginForm() {
  return {
    usernameOrEmail: '',
    password: '',
  };
}

export function createTokenForm() {
  return {
    token: '',
  };
}

export function createInitialFeedback() {
  return {
    type: 'info',
    text: 'Create an account, sign in, then open the profile section to enable 2FA.',
  };
}
