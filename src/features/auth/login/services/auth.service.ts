import { BaseService } from '@/core/base/base.service'
import type { APIResponse } from '@/shared/types/service-response'

export interface LoginPayload {
  user: string
  password: string
}

export interface LoginResponse {
  email: string
  phone: string
  refreshToken: string
  token: string
  user: string
}

export class AuthService extends BaseService {
  constructor() {
    super('/Users')
  }

  login(payload: LoginPayload): Promise<APIResponse<LoginResponse>> {
    return this.post<LoginResponse>({
      endpoint: '',
      payload,
      defaultValue: {} as LoginResponse,
      useDto: false,
    })
  }
}
