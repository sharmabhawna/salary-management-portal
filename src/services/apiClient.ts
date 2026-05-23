export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

function getBaseUrl(): string {
  return import.meta.env.VITE_API_URL;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
  const message = body?.error?.message ?? response.statusText;
  const code = body?.error?.code ?? 'UNKNOWN_ERROR';

  return new ApiError(message, code, response.status);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  return response.json() as Promise<T>;
}

async function handleNoContentResponse(response: Response): Promise<void> {
  if (!response.ok) {
    throw await parseErrorResponse(response);
  }
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | undefined>,
): string {
  const url = new URL(`${getBaseUrl()}${path}`, window.location.origin);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const response = await fetch(buildUrl(path, params));
  return handleResponse<T>(response);
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}${path}`, { method: 'DELETE' });
  await handleNoContentResponse(response);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return handleResponse<T>(response);
}
