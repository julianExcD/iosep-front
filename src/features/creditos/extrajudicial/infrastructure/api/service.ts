import type { AxiosResponse } from 'axios';
import { BaseService } from '@/core/base/base.service';
import { ErrorHandler } from '@/core/base/error-handler.service';
import type { APIResponse } from '@/shared/types/service-response';
import type { AnyRecord, ApiParams, ApiPayload } from '../../domain/models/types';

type LegacyPayload = AnyRecord | AnyRecord[];

export const ENDPOINTS = {
  DELEGACIONES: '/api/Creditos/GetDelegaciones',
  AFILIADO: '/api/Creditos/getAfiliadoByNumAfiliado',
  SOLICITAR: '/api/Creditos/solicitarCredito',
  PROCESAR_EXCEL: '/api/Creditos/procesarSolicitudCreditoExcel',
  LOTE_DETALLE: '/api/Creditos/getIDLoteOtorgar',
  ANULAR_CREDITO: '/api/creditos/AnularCredito',
  AFILIADOS_FALLECIDOS: '/api/Creditos/GetCreditosAfiliadosMotivoBaja',
  CREDITOS_ANULADOS: '/api/Creditos/GetCreditosAnuladosPorPeriodo',
  VALIDAR_PERIODO: '/api/Creditos/GetPeriodoCerrado',
  DETALLE_CREDITO_FARMACIA: '/api/Creditos/GetDetalleCreditoFarmacia',
  ACTUALIZAR_CREDITO: '/api/creditos/ActualizarCredito',
  RESUMEN_LOTE: '/api/Creditos/GetResumenLote',
  DETALLE_RESUMEN_LOTE: '/api/Creditos/GetDetalleResumenLote',
  AFILIADO_RESUMEN_LOTE: '/api/Creditos/GetAfiliadoResumenLote',
  INSERTAR_CREDITO: '/api/Creditos/InsertarCredito',
};

export class ExtrajudicialService extends BaseService {
  constructor() {
    super('');
  }

  private buildLegacyResponse<T extends LegacyPayload>(
    response: AxiosResponse<T>,
    defaultValue: T
  ): APIResponse<T> {
    if (!response?.data) {
      throw new Error('No se obtuvo respuesta del servidor');
    }
    const payload = response.data as AnyRecord | AnyRecord[];
    const hasObjectPayload = payload && typeof payload === 'object' && !Array.isArray(payload);
    const success =
      hasObjectPayload && typeof (payload as AnyRecord).success === 'boolean'
        ? (payload as AnyRecord).success
        : hasObjectPayload && typeof (payload as AnyRecord).isSuccess === 'boolean'
          ? (payload as AnyRecord).isSuccess
          : response.status === 200;

    const message =
      hasObjectPayload && ((payload as AnyRecord).message || (payload as AnyRecord).Message)
        ? ((payload as AnyRecord).message ?? (payload as AnyRecord).Message)
        : undefined;
    const error =
      hasObjectPayload && ((payload as AnyRecord).error || (payload as AnyRecord).Error)
        ? ((payload as AnyRecord).error ?? (payload as AnyRecord).Error)
        : response.statusText;

    return {
      success,
      content: (response.data ?? defaultValue) as T,
      status: response.status,
      message,
      error,
      type: hasObjectPayload ? (payload as AnyRecord).type ?? (payload as AnyRecord).Type : undefined,
    };
  }

  private async getLegacy<T extends LegacyPayload>(
    endpoint: string,
    params: ApiParams | null,
    defaultValue: T
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.client.get<T>(endpoint, params ? { params } : undefined);
      return this.buildLegacyResponse(response, defaultValue);
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  }

  private async postLegacy<T extends LegacyPayload>(
    endpoint: string,
    payload: ApiPayload,
    defaultValue: T
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.client.post<T>(endpoint, payload);
      return this.buildLegacyResponse(response, defaultValue);
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  }

  private async putLegacy<T extends LegacyPayload>(
    endpoint: string,
    payload: ApiPayload,
    defaultValue: T
  ): Promise<APIResponse<T>> {
    try {
      const response = await this.client.put<T>(endpoint, payload);
      return this.buildLegacyResponse(response, defaultValue);
    } catch (error) {
      return ErrorHandler.handleError(error);
    }
  }

  fetchDelegaciones(params: ApiParams): Promise<APIResponse<LegacyPayload>> {
    return this.getLegacy(ENDPOINTS.DELEGACIONES, params, {});
  }

  fetchDetalleCreditoFarmacia(numeroCredito: string | number): Promise<APIResponse<LegacyPayload>> {
    return this.getLegacy(ENDPOINTS.DETALLE_CREDITO_FARMACIA, { idEncabezado: numeroCredito }, {});
  }

  actualizarCredito(payload: ApiPayload): Promise<APIResponse<LegacyPayload>> {
    return this.putLegacy(ENDPOINTS.ACTUALIZAR_CREDITO, payload, {});
  }

  anularCredito(payload: ApiPayload): Promise<APIResponse<LegacyPayload>> {
    return this.putLegacy(ENDPOINTS.ANULAR_CREDITO, payload, {});
  }

  fetchResumenLote(params: ApiParams): Promise<APIResponse<LegacyPayload>> {
    return this.getLegacy(ENDPOINTS.RESUMEN_LOTE, params, {});
  }

  fetchDetalleResumenLote(params: ApiParams): Promise<APIResponse<LegacyPayload>> {
    return this.getLegacy(ENDPOINTS.DETALLE_RESUMEN_LOTE, params, {});
  }

  fetchAfiliadoResumenLote(params: ApiParams): Promise<APIResponse<LegacyPayload>> {
    return this.getLegacy(ENDPOINTS.AFILIADO_RESUMEN_LOTE, params, {});
  }

  fetchAfiliadoByNumero(params: ApiParams): Promise<APIResponse<LegacyPayload>> {
    return this.getLegacy(ENDPOINTS.AFILIADO, params, {});
  }

  solicitarCredito(payload: ApiPayload): Promise<APIResponse<LegacyPayload>> {
    return this.postLegacy(ENDPOINTS.SOLICITAR, payload, {});
  }

  procesarSolicitudExcel(payload: ApiPayload): Promise<APIResponse<LegacyPayload>> {
    return this.postLegacy(ENDPOINTS.PROCESAR_EXCEL, payload, {});
  }

  fetchIdLoteDetalle(params: ApiParams): Promise<APIResponse<LegacyPayload>> {
    return this.getLegacy(ENDPOINTS.LOTE_DETALLE, params, {});
  }

  fetchCreditosAnulados(params: ApiParams): Promise<APIResponse<LegacyPayload>> {
    return this.getLegacy(ENDPOINTS.CREDITOS_ANULADOS, params, {});
  }

  fetchAfiliadosFallecidos(params: ApiParams): Promise<APIResponse<LegacyPayload>> {
    return this.getLegacy(ENDPOINTS.AFILIADOS_FALLECIDOS, params, {});
  }

  fetchPeriodoCerrado(params: ApiParams): Promise<APIResponse<LegacyPayload>> {
    return this.getLegacy(ENDPOINTS.VALIDAR_PERIODO, params, {});
  }
}
