import axios from 'axios';
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const REFRESH_TOKEN_ENDPOINT = '/auth/token/refresh/';

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

export const setTokens = (access: string, refresh: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
// access: 1 day = 60 * 60 * 24
document.cookie = `access_token=${access}; path=/; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} max-age=${60 * 60 * 24}`;

// refresh: 7 days = 60 * 60 * 24 * 7
document.cookie = `refresh_token=${refresh}; path=/; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''} max-age=${60 * 60 * 24 * 7}`;

     }
};

export const clearTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    document.cookie = `access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

export const refreshToken = async (): Promise<string> => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token found');

  const response = await fetch(REFRESH_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    clearTokens();
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  const { access, refresh: newRefresh } = data;

  setTokens(access, newRefresh);
  return access;
};