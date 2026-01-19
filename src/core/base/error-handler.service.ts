import { AxiosError } from 'axios'
import type { APIErrorMetadata, APIResponse, ErrorResponseData, ErrorType } from '@/core/types/service-response.ts'
import { ErrorLogger } from './error-logger.service.ts'
import { ErrorStatusMapper } from '@/app/mappers/error-status.mapper.ts'

export class ErrorHandler {
  private static createMetadata(errorType: ErrorType = 'UNKNOWN'): APIErrorMetadata {
    return {
      timestamp: new Date().toISOString(),
      errorType,
    }
  }

  private static handleAxiosError<T>(
    error: AxiosError,
    context: string,
    metadata: APIErrorMetadata
  ): APIResponse<T> {
    metadata.errorType = 'API'
    metadata.path = error.config?.url
    metadata.method = error.config?.method?.toUpperCase()
    metadata.code = error.code

    const isNetworkError = this.isNetworkError(error)
    if (isNetworkError) {
      metadata.errorType = 'NETWORK'
    }

    ErrorLogger.log(
      'API_REQUEST_ERROR',
      context,
      {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      },
      metadata.timestamp
    )

    return {
      success: false,
      status: error.response?.status ?? (isNetworkError ? 503 : 500),
      content: error as T,
    }
  }

  private static handleStandardError<T>(
    error: Error,
    context: string,
    metadata: APIErrorMetadata
  ): APIResponse<T> {
    metadata.errorType = 'UNEXPECTED'

    ErrorLogger.log(
      'UNEXPECTED_ERROR',
      context,
      {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      metadata.timestamp
    )

    return {
      success: false,
      status: ErrorStatusMapper.getStatus(error),
      content: error.message as T,
    }
  }

  static handleError<T>(error: unknown, context = 'API Request'): APIResponse<T> {
    const metadata = this.createMetadata()

    if (this.isAxiosError(error)) {
      return this.handleAxiosError(error, context, metadata)
    }

    if (error instanceof Error) {
      return this.handleStandardError(error, context, metadata)
    }

    ErrorLogger.log('UNKNOWN_ERROR', context, error, metadata.timestamp)

    return {
      success: false,
      status: 500,
      content: 'An unexpected error occurred' as T,
    }
  }

  static handleServiceError<T>(
    error: unknown,
    emptyContent: T,
    serviceName = 'Unknown Service'
  ): APIResponse<T> {
    if (this.isAxiosError(error)) {
      return this.handleServiceAxiosError(error, emptyContent)
    }

    if (error instanceof Error) {
      return this.handleServiceStandardError(error, emptyContent, serviceName)
    }

    ErrorLogger.log('UNKNOWN_ERROR', serviceName, error, new Date().toISOString())

    return {
      success: false,
      content: emptyContent,
      status: 500,
      error: 'An unexpected error occurred',
    }
  }

  private static handleServiceAxiosError<T>(error: AxiosError, emptyContent: T): APIResponse<T> {
    const responseData = error.response?.data as ErrorResponseData<T>
    const isNetworkError = this.isNetworkError(error)

    return {
      success: false,
      content: responseData?.result ?? emptyContent,
      status: error.response?.status ?? (isNetworkError ? 503 : 500),
      error: this.formatErrorMessage(responseData, error),
    }
  }

  private static handleServiceStandardError<T>(
    error: Error,
    emptyContent: T,
    serviceName: string
  ): APIResponse<T> {
    ErrorLogger.log('UNEXPECTED_ERROR', serviceName, error, new Date().toISOString())

    return {
      success: false,
      content: emptyContent,
      status: ErrorStatusMapper.getStatus(error),
      error: error.message,
    }
  }

  private static formatErrorMessage<T>(
    responseData: ErrorResponseData<T> | undefined,
    error: AxiosError
  ): string {
    if (!responseData) return error.message

    return (
      responseData.error ?? responseData.message ?? error.message ?? 'An unexpected error occurred'
    )
  }

  static isAxiosError(error: unknown): error is AxiosError {
    return error instanceof AxiosError
  }

  static isNetworkError(error: unknown): boolean {
    return this.isAxiosError(error) && error.code === 'ERR_NETWORK'
  }
}
