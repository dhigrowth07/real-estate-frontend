export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  public async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { params, headers, ...restOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const token = this.getToken();
    const isFormData = typeof FormData !== 'undefined' && restOptions.body instanceof FormData;
    const defaultHeaders: Record<string, string> = {
      Accept: 'application/json',
    };

    if (!isFormData) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const mergedHeaders = {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    };

    const response = await fetch(url, {
      ...restOptions,
      headers: mergedHeaders,
    });

    if (!response.ok) {
      let errorData: { message?: string | string[] } = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      const errorMessage = Array.isArray(errorData?.message)
        ? errorData.message.join(', ')
        : errorData?.message || `Request failed with status ${response.status}`;

      throw new ApiError(response.status, errorMessage, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const json = await response.json();
    // Unwrap standard NestJS TransformInterceptor { success: true, data: T }
    if (json && typeof json === 'object' && 'data' in json && 'success' in json) {
      return json.data as T;
    }
    return json as T;
  }

  public get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params, ...options });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  public delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }

  public upload<T>(endpoint: string, formData: FormData, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      ...options,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { API_ENDPOINTS } from './endpoints';
