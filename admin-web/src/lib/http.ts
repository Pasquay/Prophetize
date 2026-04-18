const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;
  path: string;

  constructor(message: string, status: number, path: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.path = path;
  }
}

export const getStoredAdminToken = () => localStorage.getItem('admin_token') || '';

export const setStoredAdminToken = (token: string) => {
  const normalized = token.trim();
  if (!normalized) {
    localStorage.removeItem('admin_token');
    return;
  }

  localStorage.setItem('admin_token', normalized);
};

export const getApiBaseUrl = () => baseUrl;

const buildHeaders = () => {
  const token = getStoredAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const parseErrorMessage = async (response: Response) => {
  const bodyText = await response.text();
  if (!bodyText) {
    return `Request failed (${response.status})`;
  }

  try {
    const payload = JSON.parse(bodyText) as { error?: string; message?: string };
    if (typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error;
    }
    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message;
    }
  } catch {
    // Ignore parse errors and fallback to status text.
  }

  return bodyText.slice(0, 180);
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(),
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    throw new ApiError(message || 'Request failed', response.status, path);
  }

  return response.json() as Promise<T>;
};

export const apiGet = async <T>(path: string): Promise<T> => request<T>(path);

export const apiPost = async <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
