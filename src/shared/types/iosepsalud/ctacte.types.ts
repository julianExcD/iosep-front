export interface Empresa {
  idEmpresa: number;
  nombre: string;
  [key: string]: unknown;
}

export interface CtaCteItem {
  idComprobante: number;
  periodo: string;
  numero: string;
  detalleFactura?: string;
  detalle?: string;
  debe: number;
  haber: number;
  saldo: number;
  Estado?: string;
  idAfiliado?: number;
  numeroPago?: string | null;
}

export interface CtaCteViejoItem {
  periodo: string;
  numero: string;
  detalle: string;
  cuotas?: number;
  debe: number;
  haber: number;
  saldo: number;
}

export interface MovimientoDetalle {
  idDetalle: number;
  nombre: string;
  cuotas?: boolean;
  consultaValorCuota?: boolean;
  ordenesOnline?: boolean;
}

export interface MovimientoGrupo {
  nombre: string;
  detalle: MovimientoDetalle[];
}

export interface FechasVencimientoResponse {
  vencimiento_1_Original: string;
  vencimiento_2_Original: string;
}

export interface GrupoFamiliarItem {
  afiliadoID: number;
  familiar: string;
  cuil: string;
  nombre: string;
  estado: string;
  getFechaNacimiento: string;
  edad: number;
}

export interface AfiliadoItem {
  idAfiliado: number;
  cuil: string;
  nombre: string;
  titular: boolean;
  cTitular?: string;
  nTitular?: string;
  a_Numero?: string;
  idMotivoBaja?: number;
}

export interface AnularComprobanteEmpresaPayload {
  IdComprobante: number;
  IdAfiliado: number;
  Periodo: string;
}

export interface ComprobantePayload {
  idComprobante: number;
  idAfiliado: number;
  idCajaTipoOrigen: number;
  numero: string;
  cuotas: number;
  importe: number;
  codigoBarra: string;
  idTipoMovimiento: number;
  idDetalle: number;
  detalle: string;
  idEmpresa: number | null;
  periodo: string;
  anulado: boolean;
  Vencimiento_1_Original: string;
  Vencimiento_2_Original: string;
}
