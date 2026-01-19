import type { AxiosResponse } from 'axios'
import type { APIResponse, ResponseDTO } from '@/shared/types/service-response'

export class ResponseHandler {
  static handleWithDTO<T>(
    response: AxiosResponse<ResponseDTO<T>>,
    defaultValue: T
  ): APIResponse<T> {
    this.validateResponse(response)

    return {
      success: response.data.isSuccess ,
      content: response.data.items ?? defaultValue,
      status: response.status,
      error: response.data.error,
      type: response.data.type,
      message: response.data.message,
    }
  }

  static handleWithoutDTO<T>(response: AxiosResponse<any>, defaultValue: T): APIResponse<T> {
    this.validateResponse(response)

    const content = (response.data as any)?.items ?? response.data.data ?? response.data ?? defaultValue

    return {
      success: response.status === 200,
      content: content,
      status: response.status,
      error: response.statusText,
    }
  }

  private static validateResponse<T>(response: AxiosResponse<T>): void {
    if (!response.data) {
      throw new Error('No se obtuvo respuesta del servidor')
    }
  }
}
