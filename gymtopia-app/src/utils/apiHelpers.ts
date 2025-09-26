import { handleError } from './errorUtils'

export interface ApiRequestOptions extends RequestInit {
  timeout?: number
}

export interface ApiResponse<T = any> {
  data: T | null
  error: string | null
  status: number
}

export async function apiRequest<T = any>(
  url: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  const { timeout = 30000, ...fetchOptions } = options || {}

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = await response.json()

    if (!response.ok) {
      return {
        data: null,
        error: data.error || `Request failed with status ${response.status}`,
        status: response.status,
      }
    }

    return {
      data,
      error: null,
      status: response.status,
    }
  } catch (error) {
    clearTimeout(timeoutId)

    if ((error as any)?.name === 'AbortError') {
      return {
        data: null,
        error: 'Request timeout',
        status: 408,
      }
    }

    const errorMessage = handleError(error, {
      context: 'API Request',
      logToConsole: true,
    })

    return {
      data: null,
      error: errorMessage,
      status: 0,
    }
  }
}

export function createApiClient(baseUrl: string, defaultHeaders?: HeadersInit) {
  return {
    async get<T = any>(path: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
      return apiRequest<T>(`${baseUrl}${path}`, {
        ...options,
        method: 'GET',
        headers: {
          ...defaultHeaders,
          ...options?.headers,
        },
      })
    },

    async post<T = any>(
      path: string,
      body?: any,
      options?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
      return apiRequest<T>(`${baseUrl}${path}`, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
    },

    async put<T = any>(
      path: string,
      body?: any,
      options?: ApiRequestOptions
    ): Promise<ApiResponse<T>> {
      return apiRequest<T>(`${baseUrl}${path}`, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...defaultHeaders,
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      })
    },

    async delete<T = any>(path: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
      return apiRequest<T>(`${baseUrl}${path}`, {
        ...options,
        method: 'DELETE',
        headers: {
          ...defaultHeaders,
          ...options?.headers,
        },
      })
    },
  }
}