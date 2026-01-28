export type AnyRecord = Record<string, any>;
export type ApiParams = Record<string, any>;
export type ApiPayload = Record<string, any>;
export type Nullable<T> = T | null;
export type ExcelRow = Record<string, any>;

export interface CodigoStyle {
  border: string;
  badge: string;
  bg: string;
  hover: string;
}

export interface MapeoColumnaPreview {
  key: string;
  header: string;
}

export interface DelegacionItem {
  idDelegacion?: string | number | null;
  id?: string | number | null;
  codigo?: string | number | null;
  nombre?: string | null;
  [key: string]: any;
}

export interface PeriodoProcesoItem {
  codigo?: string | null;
  descripcion?: string | null;
  periodo?: string | null;
  sortValue?: number | null;
  [key: string]: any;
}

export interface SolicitudResumen {
  totalCuotas?: number;
  cantidadCreditos?: number;
  totalImporte?: number | string;
  importePromedioCuota?: number | string;
  [key: string]: any;
}

export interface LoteResumen {
  codigo?: string | number | null;
  nropaq?: string | number | null;
  nroLote?: string | number | null;
  nroPaquete?: string | number | null;
  numeroLote?: string | number | null;
  [key: string]: any;
}

export interface ExtrajudicialDetalle {
  id?: string | number | null;
  idDetalle?: string | number | null;
  idLoteDetalle?: string | number | null;
  [key: string]: any;
}

export interface NuevoCreditoState {
  [key: string]: any;
}
