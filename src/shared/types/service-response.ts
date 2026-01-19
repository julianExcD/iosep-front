//types/service-response.ts

export type APIResponse<T> = {
  success: boolean
  content: T | null
  status?: number
  message?: string
  error?: string
  type?: number
}

export interface ResponseDTO<T> {
  isSuccess: boolean
  message: string
  items: T | null
  error?: string
  type: number
}

export interface ErrorResponseData<T> {
  result?: T
  error?: string
  message?: string
}

export interface APIErrorMetadata {
  timestamp: string
  path?: string
  method?: string
  code?: string
  errorType: ErrorType
}

export type PostArgs<T> =
  | {
      endpoint: string;
      payload: any;
      defaultValue: T;
      headers?: Record<string, string>;
      useDto?: boolean;
    }
  | [endpoint: string, payload: any, defaultValue: T, headers?: Record<string, string>, useDto?: boolean];

export type ErrorType = 'API' | 'NETWORK' | 'UNEXPECTED' | 'UNKNOWN'
export type NetworkErrorCode = 'ERR_NETWORK' | 'ECONNABORTED' | 'TIMEOUT'
