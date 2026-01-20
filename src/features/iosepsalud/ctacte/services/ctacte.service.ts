import type { AxiosResponse } from 'axios';
import { BaseService } from '@/core/base/base.service';
import { ResponseHandler } from '@/core/base/response-handler.service';
import type { APIResponse } from '@/shared/types/service-response';
import type {
  AfiliadoItem,
  AnularComprobanteEmpresaPayload,
  ComprobantePayload,
  CtaCteItem,
  CtaCteViejoItem,
  Empresa,
  FechasVencimientoResponse,
  GrupoFamiliarItem,
  MovimientoGrupo,
} from '@/shared/types/iosepsalud/ctacte.types';

export class CtaCteService extends BaseService {
  constructor() {
    super('.');
  }

  fetchEmpresas(query: string): Promise<APIResponse<Empresa[]>> {
    return this.get<Empresa[]>(`empresas/${query}`, [], false);
  }

  fetchCtaCteAfiliado(idAfiliado: number, desde: string, hasta: string): Promise<APIResponse<CtaCteItem[]>> {
    return this.get<CtaCteItem[]>(`Comprobantes/Afiliado/${idAfiliado}?desde=${desde}&hasta=${hasta}`, [], false);
  }

  fetchCtaCteEmpresa(idEmpresa: number, desde: string, hasta: string): Promise<APIResponse<CtaCteItem[]>> {
    return this.get<CtaCteItem[]>(`Comprobantes/Empresa/${idEmpresa}?desde=${desde}&hasta=${hasta}`, [], false);
  }

  fetchCtaCteViejo(idAfiliado: number): Promise<APIResponse<CtaCteViejoItem[]>> {
    return this.get<CtaCteViejoItem[]>(`Comprobantes/Viejo/${idAfiliado}`, [], false);
  }

  fetchMovimientos(esEmpresa: boolean): Promise<APIResponse<MovimientoGrupo[]>> {
    const param = esEmpresa ? 1 : 0;
    return this.get<MovimientoGrupo[]>(`Comprobantes/Movimiento/${param}`, [], false);
  }

  fetchFechasVencimiento(periodo: string): Promise<APIResponse<FechasVencimientoResponse | null>> {
    return this.get<FechasVencimientoResponse | null>(`Comprobantes/FechasVencimiento/${periodo}`, null, false);
  }

  fetchCuotaAfiliado(idAfiliado: number, periodo: string): Promise<APIResponse<{ valorCuota: number }[]>> {
    return this.get<{ valorCuota: number }[]>(`Comprobantes/Cuota/${idAfiliado}/${periodo}/`, [], false);
  }

  fetchCuotaEmpresa(idEmpresa: number, periodo: string): Promise<APIResponse<{ valorCuota: number }[]>> {
    return this.get<{ valorCuota: number }[]>(`Comprobantes/CuotaEmpresa/${idEmpresa}/${periodo}/`, [], false);
  }

  autenticarUsuarioCuota(usuario: string, contrasena: string): Promise<APIResponse<string>> {
    return this.get<string>(`Comprobantes/AutenticarUsuarioCuota/${usuario}/${contrasena}/`, '', false);
  }

  crearComprobanteAfiliado(payload: ComprobantePayload): Promise<APIResponse<CtaCteItem[]>> {
    return this.post<CtaCteItem[]>({ endpoint: 'Comprobantes/', payload, defaultValue: [], useDto: false });
  }

  crearComprobanteEmpresa(payload: ComprobantePayload): Promise<APIResponse<CtaCteItem[]>> {
    return this.post<CtaCteItem[]>({
      endpoint: 'Comprobantes/ComprobanteEmpresa/',
      payload,
      defaultValue: [],
      useDto: false,
    });
  }

  async anularComprobanteAfiliado(idComprobante: number): Promise<APIResponse<CtaCteItem[]>> {
    const response = await this.client.delete(`Comprobantes/${idComprobante}`);
    return ResponseHandler.handleWithoutDTO<CtaCteItem[]>(response, []);
  }

  anularComprobanteEmpresa(payload: AnularComprobanteEmpresaPayload): Promise<APIResponse<CtaCteItem[]>> {
    return this.post<CtaCteItem[]>({
      endpoint: 'Comprobantes/anularComprobante/',
      payload,
      defaultValue: [],
      useDto: false,
    });
  }

  async fetchComprobantePdf(idComprobante: number): Promise<APIResponse<ArrayBuffer>> {
    const response: AxiosResponse<ArrayBuffer> = await this.client.get(
      `Comprobantes/Imprimir/${idComprobante}`,
      { responseType: 'arraybuffer' }
    );
    return {
      success: response.status === 200,
      content: response.data,
      status: response.status,
    };
  }

  fetchGrupoFamiliar(idAfiliado: number): Promise<APIResponse<GrupoFamiliarItem[]>> {
    return this.get<GrupoFamiliarItem[]>(`Afiliados/IosepSalud/GetGrupoFamiliar/${idAfiliado}`, [], false);
  }

  searchAfiliados(query: string): Promise<APIResponse<AfiliadoItem[]>> {
    return this.get<AfiliadoItem[]>(`afiliados/iosepsalud/${query}`, [], false);
  }
}
