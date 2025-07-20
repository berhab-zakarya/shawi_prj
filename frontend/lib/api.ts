/* eslint-disable */


import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from './apiConstants';
import { getToken, refreshToken } from './jwtService';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift() || null;
  return null;
}

// Add token if private API
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.headers?.['X-Is-Private-API'] === 'true') {
      const token = getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // ✅ أضف CSRF token إذا كان الطلب من نوع تعديل أو يتطلب حماية
    const method = config.method?.toUpperCase();
    const csrfSafeMethod = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];

    if (!csrfSafeMethod.includes(method || '')) {
      const csrfToken = getCookie('csrftoken');
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }

    config.withCredentials = true; // ضروري لإرسال الكوكيز
    return config;
  },
  (error) => Promise.reject(error)
);


// Extend Axios config to support _retry
interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Auto-refresh token on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryConfig;

    if (
      error.response?.status === 401 &&
      originalRequest.headers?.['X-Is-Private-API'] === 'true' &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers!['Authorization'] = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject: (err: any) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        originalRequest.headers!['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ApiConfig extends AxiosRequestConfig
interface ApiConfig extends AxiosRequestConfig {
  isPrivate?: boolean;
}

const withPrivateHeader = (config: ApiConfig): AxiosRequestConfig => ({
  ...config,
  headers: {
    ...config.headers,
    'X-Is-Private-API': config.isPrivate ? 'true' : 'false',
  },
});

// CRUD operations
export const get = async <T>(
  url: string,
  config: ApiConfig = {}
): Promise<AxiosResponse<T>> => {
  return axiosInstance.get<T>(url, withPrivateHeader(config));
};

export const post = async <T, D>(
  url: string,
  data: D,
  config: ApiConfig = {}
): Promise<AxiosResponse<T>> => {
  return axiosInstance.post<T>(url, data, withPrivateHeader(config));
};

export const put = async <T, D>(
  url: string,
  data: D,
  config: ApiConfig = {}
): Promise<AxiosResponse<T>> => {
  return axiosInstance.put<T>(url, data, withPrivateHeader(config));
};

export const patch = async <T, D>(
  url: string,
  data: D,
  config: ApiConfig = {}
): Promise<AxiosResponse<T>> => {
  return axiosInstance.patch<T>(url, data, withPrivateHeader(config));
};

export const del = async <T>(
  url: string,
  config: ApiConfig = {}
): Promise<AxiosResponse<T>> => {
  return axiosInstance.delete<T>(url, withPrivateHeader(config));
};
