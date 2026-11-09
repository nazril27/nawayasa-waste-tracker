import type { PageMeta, Paginated } from '@/types';

const API_BASE_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

type ApiPayload<T> = ApiEnvelope<T> & Partial<PageMeta>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
}

async function send<T>(path: string, options: RequestOptions): Promise<ApiPayload<T>> {
  const hasBody = options.body !== undefined;
  const isFormData = options.body instanceof FormData;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: hasBody && !isFormData ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? (isFormData ? (options.body as FormData) : JSON.stringify(options.body)) : undefined,
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi Anda.', 0);
  }

  let payload: ApiPayload<T> | null = null;
  try {
    payload = (await response.json()) as ApiPayload<T>;
  } catch {
    payload = null;
  }

  if (!payload || typeof payload.success !== 'boolean') {
    throw new ApiError('Respons dari server tidak valid.', response.status);
  }

  if (!response.ok || !payload.success) {
    throw new ApiError(payload.message || 'Terjadi kesalahan pada server.', response.status);
  }

  return payload;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const payload = await send<T>(path, options);
  return payload.data as T;
}

export async function apiRequestPage<T>(path: string, options: RequestOptions = {}): Promise<Paginated<T>> {
  const { data, total, page, pageSize, totalPages } = await send<T[]>(path, options);
  if (
    !Array.isArray(data) ||
    typeof total !== 'number' ||
    typeof page !== 'number' ||
    typeof pageSize !== 'number' ||
    typeof totalPages !== 'number'
  ) {
    throw new ApiError('Data halaman dari server tidak valid.', 500);
  }
  return { data, total, page, pageSize, totalPages };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Terjadi kesalahan tak terduga.';
}
