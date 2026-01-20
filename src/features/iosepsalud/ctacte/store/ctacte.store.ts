import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  AfiliadoItem,
  CtaCteItem,
  CtaCteViejoItem,
  ComprobantePayload,
  Empresa,
  FechasVencimientoResponse,
  GrupoFamiliarItem,
  MovimientoGrupo,
} from '@/shared/types/iosepsalud/ctacte.types';
import type { APIResponse } from '@/shared/types/service-response';
import { CtaCteService } from '../services/ctacte.service';

const service = new CtaCteService();

const unwrapResponse = <T>(response: APIResponse<T>, fallback: T): T => {
  if (!response.success) {
    const message = response.message ?? response.error ?? 'Request failed';
    throw new Error(message);
  }
  return response.content ?? fallback;
};

export const useCtaCteStore = defineStore('ctacte', () => {
  const dataModel = ref<CtaCteItem[]>([]);
  const empresasFiltradas = ref<Empresa[]>([]);
  const loading = ref(false);
  const showCtaCte = ref(false);

  const buscarEmpresas = async (query: string) => {
    loading.value = true;
    try {
      const response = await service.fetchEmpresas(query);
      empresasFiltradas.value = unwrapResponse(response, []);
    } finally {
      loading.value = false;
    }
  };

  const cargarCtaCte = async (params: {
    idAfiliado?: number;
    idEmpresa?: number;
    desde: string;
    hasta: string;
  }) => {
    loading.value = true;
    try {
      if (params.idEmpresa) {
        const response = await service.fetchCtaCteEmpresa(params.idEmpresa, params.desde, params.hasta);
        dataModel.value = unwrapResponse(response, []);
      } else if (params.idAfiliado) {
        const response = await service.fetchCtaCteAfiliado(params.idAfiliado, params.desde, params.hasta);
        dataModel.value = unwrapResponse(response, []);
      } else {
        dataModel.value = [];
      }
      showCtaCte.value = true;
    } catch (error) {
      showCtaCte.value = false;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const anularComprobante = async (params: {
    idComprobante: number;
    idAfiliado?: number;
    periodo?: string;
    esEmpresa: boolean;
  }) => {
    loading.value = true;
    try {
      if (params.esEmpresa) {
        if (!params.idAfiliado || !params.periodo) {
          throw new Error('Missing afiliado or periodo for empresa anular.');
        }
        const response = await service.anularComprobanteEmpresa({
          IdComprobante: params.idComprobante,
          IdAfiliado: params.idAfiliado,
          Periodo: params.periodo,
        });
        dataModel.value = unwrapResponse(response, []);
      } else {
        const response = await service.anularComprobanteAfiliado(params.idComprobante);
        dataModel.value = unwrapResponse(response, []);
      }
    } finally {
      loading.value = false;
    }
  };

  const obtenerPdf = async (idComprobante: number) => {
    const response = await service.fetchComprobantePdf(idComprobante);
    return unwrapResponse(response, new ArrayBuffer(0));
  };

  const buscarAfiliados = async (query: string): Promise<AfiliadoItem[]> => {
    const response = await service.searchAfiliados(query);
    return unwrapResponse(response, []);
  };

  const cargarCtaCteViejo = async (idAfiliado: number): Promise<CtaCteViejoItem[]> => {
    const response = await service.fetchCtaCteViejo(idAfiliado);
    return unwrapResponse(response, []);
  };

  const cargarGrupoFamiliar = async (idAfiliado: number): Promise<GrupoFamiliarItem[]> => {
    const response = await service.fetchGrupoFamiliar(idAfiliado);
    return unwrapResponse(response, []);
  };

  const cargarMovimientos = async (esEmpresa: boolean): Promise<MovimientoGrupo[]> => {
    console.log("esEmpresa",esEmpresa)
    const response = await service.fetchMovimientos(esEmpresa);
    console.log(response)
    return unwrapResponse(response, []);
  };

  const cargarFechasVencimiento = async (periodo: string): Promise<FechasVencimientoResponse | null> => {
    const response = await service.fetchFechasVencimiento(periodo);
    return unwrapResponse(response, null);
  };

  const cargarCuotaAfiliado = async (
    idAfiliado: number,
    periodo: string
  ): Promise<{ valorCuota: number }[]> => {
    const response = await service.fetchCuotaAfiliado(idAfiliado, periodo);
    return unwrapResponse(response, []);
  };

  const cargarCuotaEmpresa = async (
    idEmpresa: number,
    periodo: string
  ): Promise<{ valorCuota: number }[]> => {
    const response = await service.fetchCuotaEmpresa(idEmpresa, periodo);
    return unwrapResponse(response, []);
  };

  const autenticarUsuario = async (usuario: string, contrasena: string): Promise<string> => {
    const response = await service.autenticarUsuarioCuota(usuario, contrasena);
    return unwrapResponse(response, '');
  };

  const crearComprobanteAfiliado = async (payload: ComprobantePayload) => {
    const response = await service.crearComprobanteAfiliado(payload);
    return unwrapResponse(response, []);
  };

  const crearComprobanteEmpresa = async (payload: ComprobantePayload) => {
    const response = await service.crearComprobanteEmpresa(payload);
    return unwrapResponse(response, []);
  };

  const resetCtaCte = () => {
    dataModel.value = [];
    showCtaCte.value = false;
  };

  return {
    dataModel,
    empresasFiltradas,
    loading,
    showCtaCte,
    buscarEmpresas,
    cargarCtaCte,
    anularComprobante,
    obtenerPdf,
    buscarAfiliados,
    cargarCtaCteViejo,
    cargarGrupoFamiliar,
    cargarMovimientos,
    cargarFechasVencimiento,
    cargarCuotaAfiliado,
    cargarCuotaEmpresa,
    autenticarUsuario,
    crearComprobanteAfiliado,
    crearComprobanteEmpresa,
    resetCtaCte,
  };
});
