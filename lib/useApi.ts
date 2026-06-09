import { useCallback } from 'react';

export interface ApiError {
  message: string;
  status?: number;
}

export function useApi() {
  const getToken = useCallback(() => {
    if (typeof document === 'undefined') return null;
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('auth_token=') || row.startsWith('sb-auth-token='))
      ?.split('=')[1] || null;
  }, []);

  const request = useCallback(
    async <T,>(
      method: string,
      path: string,
      body?: Record<string, any>
    ): Promise<{ data?: T; error?: ApiError }> => {
      try {
        const token = getToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const options: RequestInit = {
          method,
          headers,
        };

        if (body) {
          options.body = JSON.stringify(body);
        }

        const res = await fetch(path, options);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          return {
            error: {
              message: errorData.error || `HTTP ${res.status}`,
              status: res.status,
            },
          };
        }

        const data = await res.json();
        return { data: data as T };
      } catch (err) {
        return {
          error: {
            message: err instanceof Error ? err.message : 'Request failed',
          },
        };
      }
    },
    [getToken]
  );

  const get = useCallback(
    async <T,>(path: string) => request<T>('GET', path),
    [request]
  );

  const post = useCallback(
    async <T,>(path: string, body: Record<string, any>) =>
      request<T>('POST', path, body),
    [request]
  );

  const put = useCallback(
    async <T,>(path: string, body: Record<string, any>) =>
      request<T>('PUT', path, body),
    [request]
  );

  const del = useCallback(
    async <T,>(path: string) => request<T>('DELETE', path),
    [request]
  );

  return { get, post, put, del };
}
