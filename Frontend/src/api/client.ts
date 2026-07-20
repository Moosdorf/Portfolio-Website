import { API_URL } from '../config';
interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}


async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Failed to load: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
    get: <T,>(path: string, options?: RequestOptions) => request<T>(path, options),
    post: <T,>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: <T,>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: <T,>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};


/*
Using this file:

// GET with fetch options (credentials, custom headers, etc.)
await api.get<ResponseType>('/api/path', { credentials: 'include' });

// POST/PUT with a body + optional fetch options
await api.post<ResponseType>('/api/path', { someField: 'value' }, { credentials: 'include' });

// DELETE
await api.delete<ResponseType>('/api/path', { credentials: 'include' });
*/