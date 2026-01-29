import type { AxiosInstance } from 'axios'

import { api } from './axios-instance'
import type { APIResponse, PostArgs, ResponseDTO } from '@/shared/types/service-response'
import { ErrorHandler } from '@/core/errors/error-handler.service'
import { ResponseHandler } from './response-handler.service'

export abstract class BaseService {
  protected constructor(
    protected readonly baseURL: string,
    protected readonly client: AxiosInstance = api
  ) {}

  protected async get<T>(endpoint: string, defaultValue: T, useDTO: boolean = true): Promise<APIResponse<T>> {
    try {
      const response = await this.client.get<ResponseDTO<T>>(`${this.baseURL}/${endpoint}`)
      return useDTO
        ? ResponseHandler.handleWithDTO<T>(response, defaultValue)
        : ResponseHandler.handleWithoutDTO<T>(response, defaultValue)
    } catch (error) {
      return ErrorHandler.handleError(error)
    }
  }

  protected async post<T>(args: PostArgs<T>): Promise<APIResponse<T>> {
    let endpoint: string
    let payload: any
    let defaultValue: T
    let headers: Record<string, string> | undefined
    let useDto: boolean | undefined

    // Detectamos si es array o objeto
    if (Array.isArray(args)) {
      ;[endpoint, payload, defaultValue, headers, useDto] = args
    } else {
      ;({ endpoint, payload, defaultValue, headers, useDto = true } = args)
    }

    try {
      const response = await this.client.post<any>(`${this.baseURL}/${endpoint}`, payload, {
        headers,
      })
      return useDto ?? true
        ? ResponseHandler.handleWithDTO<T>(response, defaultValue)
        : ResponseHandler.handleWithoutDTO<T>(response, defaultValue)
    } catch (error) {
      return ErrorHandler.handleError(error)
    }
  }

  protected async put<T>(endpoint: string, payload: unknown, defaultValue: T): Promise<APIResponse<T>> {
    try {
      const response = await this.client.put<ResponseDTO<T>>(`${this.baseURL}/${endpoint}`, payload)
      return ResponseHandler.handleWithDTO<T>(response, defaultValue)
    } catch (error) {
      return ErrorHandler.handleError(error)
    }
  }

  protected async delete<T>(endpoint: string, defaultValue: T): Promise<APIResponse<T>> {
    try {
      const response = await this.client.delete<ResponseDTO<T>>(`${this.baseURL}/${endpoint}`)
      return ResponseHandler.handleWithDTO<T>(response, defaultValue)
    } catch (error) {
      return ErrorHandler.handleError(error)
    }
  }
}

