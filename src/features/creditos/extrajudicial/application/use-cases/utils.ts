import { format, addMonths, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import type {
  AnyRecord,
  CodigoStyle,
  ExcelRow,
  LoteResumen,
  MapeoColumnaPreview,
  PeriodoProcesoItem,
} from '../../domain/models/types';

export const CABECERAS_ARCHIVO = [
  'NRO AFILIA',
  'NOMBRE APELLIDO',
  'SUB COD',
  'CUPON',
  'COD MOV',
  'FECHA (formato dd/MM/yyyy)',
  'CTA',
  'IMP CTA (monto con separador de miles y coma decimal)',
  'TOTAL (monto con separador de miles y coma decimal)',
];

export const CABECERAS_ARCHIVO_DISPLAY = [
  'N\u00B0 AFILIA',
  'NOMBRE APELLIDO',
  'SUB COD',
  'CUPON',
  'COD MOV',
  'FECHA (formato dd/MM/yyyy)',
  'CTA',
  'IMP. CTA (monto con separador de miles . y coma decimal ,)',
  'TOTAL (monto con separador de miles . y coma decimal ,)',
];

export const MAPEO_COLUMNAS_PREVIEW: MapeoColumnaPreview[] = [
  { key: 'nroAfiliado', header: CABECERAS_ARCHIVO_DISPLAY[0] },
  { key: 'nombre', header: CABECERAS_ARCHIVO_DISPLAY[1] },
  { key: 'subCod', header: CABECERAS_ARCHIVO_DISPLAY[2] },
  { key: 'cupon', header: CABECERAS_ARCHIVO_DISPLAY[3] },
  { key: 'codMov', header: CABECERAS_ARCHIVO_DISPLAY[4] },
  { key: 'fecha', header: CABECERAS_ARCHIVO_DISPLAY[5] },
  { key: 'cta', header: CABECERAS_ARCHIVO_DISPLAY[6] },
  { key: 'impCta', header: CABECERAS_ARCHIVO_DISPLAY[7] },
  { key: 'total', header: CABECERAS_ARCHIVO_DISPLAY[8] },
];

export const MONTO_TOTAL_MAXIMO = 100000000;

export const CODIGO_COLOR_STYLES: Record<string, CodigoStyle> = {
  '630': {
    border: 'border-blue-800',
    badge: 'bg-blue-100 text-blue-700',
    bg: 'bg-blue-50/70',
    hover: 'hover:bg-blue-100',
  },
  '631': {
    border: 'border-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    bg: 'bg-emerald-50/70',
    hover: 'hover:bg-emerald-100',
  },
  '638': {
    border: 'border-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    bg: 'bg-amber-50/70',
    hover: 'hover:bg-amber-100',
  },
};

export const DEFAULT_CODIGO_STYLE: CodigoStyle = {
  border: 'border-slate-700',
  badge: 'bg-slate-100 text-slate-700',
  bg: 'bg-white/95',
  hover: 'hover:bg-slate-50',
};

export const CABECERAS_ARCHIVO_NORMALIZADAS = CABECERAS_ARCHIVO.map((valor) =>
  valor
    .toString()
    .trim()
    .replace(/N[\u00BA\u00B0]/gi, 'NRO')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

export const CLAVES_COLECCION_DETALLE_MODAL = [
  'detalleCreditoDto',
  'detalleCredito',
  'detalleCreditoDetalle',
  'detalles',
  'detalle',
  'resultado',
  'data',
];

export const DESCRIPCION_ESTRUCTURA_ARCHIVO = CABECERAS_ARCHIVO_DISPLAY.map(
  (columna, idx) => `${idx + 1}. ${columna}`
).join('\n');

export const DENOMINA_POR_CONCEPTO = {
  630: 'Asistencial',
  631: 'Farmacia',
  638: 'Turismo',
};

export const NOMBRES_LOTE_EXCLUIDOS_CASA_CENTRAL = new Set(['C', 'M']);

export const normalizarId = (valor: unknown): number | null => {
  if (valor === null || valor === undefined) {
    return null;
  }
  const numero = Number(valor);
  return Number.isNaN(numero) ? null : numero;
};

export const getClaveLote = (lote: AnyRecord | null | undefined): string | null => {
  if (!lote) return null;
  const codigo = String(lote.codigo ?? '').trim();
  const numero = String(lote.nropaq ?? lote.nroLote ?? '').trim();
  const partes = [];
  if (codigo) partes.push(codigo);
  if (numero) partes.push(numero);
  if (!partes.length) {
    return null;
  }
  return partes.join('-');
};

export const getNumeroLoteListado = (lote: LoteResumen | null | undefined): number | null => {
  if (!lote) {
    return null;
  }
  const candidatos = [lote.nropaq, lote.nroLote, lote.nroPaquete, lote.numeroLote];
  for (const candidato of candidatos) {
    const numero = Number.parseInt(String(candidato ?? '').trim(), 10);
    if (Number.isFinite(numero)) {
      return numero;
    }
  }
  return null;
};

export const getEstilosCodigo = (codigo: string | number | null | undefined): CodigoStyle => {
  const key = String(codigo ?? '').trim();
  return CODIGO_COLOR_STYLES[key] ?? DEFAULT_CODIGO_STYLE;
};

export const parseDecimal = (valor: unknown): number => {
  if (valor === null || valor === undefined) {
    return NaN;
  }
  if (typeof valor === 'number') {
    return valor;
  }
  const normalized = String(valor).replace(',', '.').trim();
  if (normalized === '') {
    return NaN;
  }
  return Number(normalized);
};

export const obtenerNumeroSeguro = (valor: unknown, fallback = 0): number => {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : fallback;
};

export const obtenerEnteroSeguro = (valor: unknown, fallback = 0): number => {
  const numero = Number(valor);
  if (Number.isNaN(numero)) {
    return fallback;
  }
  return Math.round(numero);
};

export const calcularReconocePorcentaje = (
  registro: AnyRecord | null | undefined,
  honorarios = 0,
  gastos = 0
): number => {
  const porcentajesPosibles = [
    registro?.reconocePorcentaje,
    registro?.ReconocePorcentaje,
    registro?.reconoce_Porcentaje,
    registro?.reconocePorcentajePorcentual,
    registro?.reconoceHonorariosPorcentaje,
    registro?.ReconoceHonorariosPorcentaje,
    registro?.reconoce_Honorarios,
    registro?.Reconoce_Honorarios,
  ];
  const valorExplicito = porcentajesPosibles.find(
    (valor) => valor !== undefined && valor !== null && valor !== ''
  );
  if (valorExplicito !== undefined) {
    const porcentaje = Number(valorExplicito);
    if (Number.isFinite(porcentaje)) {
      return porcentaje;
    }
  }
  const reconoceHonorariosImporte = obtenerNumeroSeguro(
    registro?.reconoceHonorarios ?? registro?.reconoce_honorarios
  );
  const reconoceGastos = obtenerNumeroSeguro(
    registro?.reconoce_Gastos ?? registro?.reconoceGastos ?? registro?.reconoce_gastos
  );
  const totalBase = honorarios + gastos;
  if (totalBase <= 0) {
    return 0;
  }
  const totalReconoce = reconoceHonorariosImporte + reconoceGastos;
  return (totalReconoce / totalBase) * 100;
};

export type DetalleModalFila = {
  numeroBono: string;
  nombrePractica: string;
  honorarios: number;
  gastos: number;
  coseguro: number;
  reconocePorcentaje: number;
  cantSolicitada: number;
  cantAutorizada: number;
};

export const normalizarDetalleModalFila = (
  registro: AnyRecord | null | undefined
): DetalleModalFila | null => {
  if (!registro) {
    return null;
  }
  const honorarios = obtenerNumeroSeguro(registro?.honorarios ?? registro?.Honorarios ?? registro?.Honorario);
  const gastos = obtenerNumeroSeguro(registro?.gastos ?? registro?.Gastos ?? registro?.Gasto);
  const coseguro = obtenerNumeroSeguro(
    registro?.coseguro ??
      registro?.Coseguro ??
      registro?.coseguro_Honorarios ??
      registro?.coseguroHonorarios ??
      registro?.coseguro_Honorario
  );
  return {
    numeroBono:
      (registro?.numeroBono ??
        registro?.NumeroBono ??
        registro?.bonoAmbulatorio ??
        registro?.bono ??
        '')?.toString().trim() || '-',
    nombrePractica:
      (registro?.nombrePractica ??
        registro?.NombrePractica ??
        registro?.practica ??
        registro?.descripcionPractica ??
        '')?.toString().trim() || '-',
    honorarios,
    gastos,
    coseguro,
    reconocePorcentaje: calcularReconocePorcentaje(registro, honorarios, gastos),
    cantSolicitada: obtenerEnteroSeguro(
      registro?.cantSolicitada ?? registro?.CantSolicitada ?? registro?.cant_Solicitada ?? registro?.cantidadSolicitada
    ),
    cantAutorizada: obtenerEnteroSeguro(
      registro?.cantAutorizada ?? registro?.CantAutorizada ?? registro?.cant_Autorizada ?? registro?.cantidadAutorizada
    ),
  };
};

export const buscarColeccionDetalleEnNodo = (
  nodo: unknown,
  claves: readonly string[]
): unknown[] | null => {
  if (Array.isArray(nodo)) {
    return nodo;
  }
  if (!nodo || typeof nodo !== 'object') {
    return null;
  }
  for (const clave of claves) {
    if (Object.prototype.hasOwnProperty.call(nodo, clave)) {
      const encontrado = buscarColeccionDetalleEnNodo((nodo as AnyRecord)[clave], claves);
      if (Array.isArray(encontrado)) {
        return encontrado;
      }
    }
  }
  return null;
};

export const extraerFilasDetalleDesdeRespuesta = (
  respuesta: AnyRecord | null | undefined,
  claves: readonly string[]
): DetalleModalFila[] => {
  const coleccion = buscarColeccionDetalleEnNodo(respuesta?.data ?? respuesta, claves);
  if (!Array.isArray(coleccion)) {
    return [];
  }
  return coleccion
    .map((registro) => normalizarDetalleModalFila(registro as AnyRecord))
    .filter((fila): fila is DetalleModalFila => Boolean(fila));
};

export const obtenerNumeroCreditoDesdeDetalle = (
  detalle: AnyRecord | null | undefined
): number | null => {
  const candidato =
    detalle?.nroCredito ??
    detalle?.numeroCredito ??
    detalle?.Encabezado_PresupuestoAutorizacionesId ??
    detalle?.encabezado_PresupuestoAutorizacionesId ??
    detalle?.idPresupuestoEncabezado;
  const numero = Number(candidato);
  return Number.isFinite(numero) ? numero : null;
};

export const getDetalleId = (detalle: AnyRecord | null | undefined): string | number | null =>
  detalle?.idDetalleCredito ??
  detalle?.idCredito ??
  detalle?.idCreditoUsuario ??
  detalle?.id ??
  null;

export const crearEstadoNuevoCredito = () => ({
  identificador: '',
  proc: '',
  nroPaquete: '',
  codCredito: '',
  cantDoc: '',
  totalImpCuotas: '',
  importeTotalCredito: '',
  numeroAfiliado: '',
  subCod: '',
  numeroCredito: '',
  creditoMigracion: '',
  codMov: '',
  diasOt: '',
  signo: '',
  cantCuotas: '',
  importeCuota: '',
  fechaPrimerVencimiento: '',
});

export const limpiarTextoPlano = (valor: unknown): string => String(valor ?? '').trim();

export const normalizarNombreDelegacion = (valor: unknown): string =>
  limpiarTextoPlano(valor).toUpperCase();

export const esLoteExcluidoCasaCentral = (
  lote: AnyRecord | null | undefined,
  nombresExcluidos: ReadonlySet<string>
): boolean => {
  if (!lote) {
    return false;
  }
  const candidatos = [
    lote?.nombre,
    lote?.nombreLote,
    lote?.tipoCredito,
    lote?.descripcionTipoCredito,
    lote?.descripcionCredito,
    lote?.tipoCreditoDescripcion,
    lote?.denomina,
    lote?.conceptoDescripcion,
    lote?.conceptoCodigo,
    lote?.codigo,
  ];
  return candidatos.some((valor) => nombresExcluidos.has(limpiarTextoPlano(valor).toUpperCase()));
};

export const normalizarNumeroCreditoBusqueda = (valor: unknown): string =>
  String(valor ?? '').trim();

export type AfiliadoFallecidoNormalizado = {
  id: string | number;
  numeroAfiliado: string;
  nombre: string;
  cuil: string;
  fechaCobro: unknown;
  tipoCredito: string;
  fechaBaja: unknown;
  numeroCredito: string;
  cuotas: unknown;
  importeTotal: number;
  motivoBaja: string;
};

export const normalizarAfiliadoFallecido = (
  registro: AnyRecord | null | undefined,
  index = 0
): AfiliadoFallecidoNormalizado => {
  if (!registro) {
    return {
      id: `sin-datos-${index}`,
      numeroAfiliado: '',
      nombre: '',
      cuil: '',
      fechaCobro: null,
      tipoCredito: '',
      fechaBaja: null,
      numeroCredito: '',
      cuotas: '-',
      importeTotal: 0,
      motivoBaja: '',
    };
  }
  const numeroAfiliado = limpiarTextoPlano(
    registro?.nroAfiliado ?? registro?.numeroAfiliado ?? registro?.aNumero ?? registro?.afiliado
  );
  const identificadorFila =
    registro?.nroCredito ??
    registro?.numeroCredito ??
    registro?.idCredito ??
    registro?.idDetalleCredito ??
    registro?.id ??
    `${numeroAfiliado || 'afiliado'}-${index}`;
  const fechaCobroNormalizada = registro?.fechaCobro ?? registro?.fecha ?? registro?.fechaPago ?? null;
  const fechaBaja = registro?.fechaBaja ?? registro?.fechaBajaCredito ?? registro?.fechaBajaAfiliado ?? null;
  return {
    id: identificadorFila,
    numeroAfiliado,
    nombre: limpiarTextoPlano(registro?.nombreAfiliado ?? registro?.nombre ?? registro?.afiliadoNombre),
    cuil: limpiarTextoPlano(registro?.cuil ?? registro?.cuilAfiliado ?? registro?.nroCuil),
    fechaCobro: fechaCobroNormalizada,
    fechaBaja,
    tipoCredito: limpiarTextoPlano(registro?.tipoCredito ?? ''),
    numeroCredito: limpiarTextoPlano(registro?.nroCredito ?? registro?.numeroCredito ?? ''),
    cuotas: registro?.cantCuotas ?? registro?.cuotas ?? registro?.cantidadCuotas ?? '-',
    importeTotal: Number(registro?.importeTotal ?? registro?.total ?? registro?.montoCredito ?? 0),
    motivoBaja: limpiarTextoPlano(registro?.motivoBaja ?? ''),
  };
};

export type CreditoAnuladoNormalizado = {
  id: string | number;
  paquete: string;
  numeroAfiliado: string;
  nombreAfiliado: string;
  cuil: string;
  idAutoriza: unknown;
  cuotas: unknown;
  importeTotal: number;
  nroCreditoMigracion: string;
  observacion: string;
  usuarioCrea: string;
  fechaAnula: unknown;
};

export const normalizarCreditoAnulado = (
  registro: AnyRecord | null | undefined,
  index = 0
): CreditoAnuladoNormalizado => {
  if (!registro) {
    return {
      id: `anulado-${index}`,
      paquete: '',
      numeroAfiliado: '',
      nombreAfiliado: '',
      cuil: '',
      idAutoriza: '',
      cuotas: '-',
      importeTotal: 0,
      nroCreditoMigracion: '',
      observacion: '',
      usuarioCrea: '',
      fechaAnula: null,
    };
  }
  const numeroAfiliado = limpiarTextoPlano(
    registro?.numAfiliado ?? registro?.nroAfiliado ?? registro?.numeroAfiliado ?? registro?.afiliado
  );
  const nombreAfiliado = limpiarTextoPlano(registro?.nombreAfiliado ?? registro?.nombre ?? '');
  return {
    id: registro?.idAutoriza ?? registro?.id ?? `${numeroAfiliado || 'credito'}-anulado-${index}`,
    paquete: limpiarTextoPlano(registro?.nropaq ?? registro?.codigo ?? registro?.paquete),
    numeroAfiliado,
    nombreAfiliado,
    cuil: limpiarTextoPlano(registro?.cuil ?? registro?.cuilAfiliado ?? registro?.nroCuil ?? ''),
    idAutoriza: registro?.idAutoriza ?? '',
    cuotas: registro?.cuotas ?? registro?.cantCuotas ?? registro?.cantidadCuotas ?? '-',
    importeTotal: Number(registro?.importeTotal ?? registro?.monto ?? registro?.total ?? 0),
    nroCreditoMigracion: limpiarTextoPlano(
      registro?.nroCreditoMigracion ?? registro?.numeroCredito ?? registro?.creditoMigracion ?? ''
    ),
    observacion: limpiarTextoPlano(registro?.observacion ?? registro?.observaciones ?? ''),
    usuarioCrea: limpiarTextoPlano(registro?.usuarioCrea ?? registro?.usuario ?? ''),
    fechaAnula: registro?.fechaAnula ?? registro?.fecha ?? null,
  };
};

export const obtenerRangoFechasDesdePeriodo = (
  periodoConsulta: unknown
): { fechaDesde: string | null; fechaHasta: string | null; periodoEfectivo: string | null } => {
  const periodoNormalizado = limpiarTextoPlano(periodoConsulta);
  if (!periodoNormalizado || periodoNormalizado.length !== 6) {
    return { fechaDesde: null, fechaHasta: null, periodoEfectivo: null };
  }
  let mes = Number(periodoNormalizado.slice(0, 2));
  let anio = Number(periodoNormalizado.slice(2));
  if (!Number.isFinite(mes) || !Number.isFinite(anio) || mes < 1 || mes > 12) {
    return { fechaDesde: null, fechaHasta: null, periodoEfectivo: null };
  }
  mes -= 1;
  if (mes < 1) {
    mes = 12;
    anio -= 1;
  }
  const fechaInicio = new Date(anio, mes - 1, 1);
  const fechaFin = addDays(addMonths(fechaInicio, 1), -1);
  const periodoEfectivo = `${String(mes).padStart(2, '0')}${anio}`;
  return {
    fechaDesde: format(fechaInicio, 'yyyy-MM-dd'),
    fechaHasta: format(fechaFin, 'yyyy-MM-dd'),
    periodoEfectivo,
  };
};

export const normalizarArchivoGenerado = (valor: unknown): boolean | null => {
  if (valor === null || valor === undefined) {
    return null;
  }
  if (typeof valor === 'boolean') {
    return valor;
  }
  if (typeof valor === 'number') {
    return valor !== 0;
  }
  if (typeof valor === 'string') {
    const normalizado = valor.trim().toLowerCase();
    if (['true', '1', 'si', 'yes', 'y'].includes(normalizado)) {
      return true;
    }
    if (['false', '0', 'no', 'n'].includes(normalizado)) {
      return false;
    }
  }
  return Boolean(valor);
};

export const limpiarCadena = (valor: unknown): string => {
  if (valor === null || valor === undefined) return '';
  return String(valor).replace(/\s+/g, ' ').trim();
};

export const normalizarNumeroLatino = (valor: unknown): number | null => {
  if (valor === null || valor === undefined || valor === '') return null;
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? Number(valor) : null;
  }
  const texto = String(valor).trim();
  if (texto === '') return null;
  const sinEspacios = texto.replace(/\s+/g, '');
  const sinPuntos = sinEspacios.replace(/\./g, '');
  const normalizado = sinPuntos.replace(',', '.');
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
};

export const normalizarEntero = (valor: unknown): number | null => {
  const numero = normalizarNumeroLatino(valor);
  if (numero === null) return null;
  return Number.isFinite(numero) ? Math.trunc(numero) : null;
};

export const pad2 = (value: string | number): string => value.toString().padStart(2, '0');

export const normalizarFecha = (valor: unknown): string | null => {
  if (valor === null || valor === undefined || valor === '') return null;
  if (valor instanceof Date) {
    return `${valor.getFullYear()}-${pad2(valor.getMonth() + 1)}-${pad2(valor.getDate())}`;
  }
  if (typeof valor === 'number') {
    const parsed = XLSX.SSF.parse_date_code(valor);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      return `${parsed.y}-${pad2(parsed.m)}-${pad2(parsed.d)}`;
    }
  }
  const texto = String(valor).trim();
  if (texto === '') return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
    const [dia, mes, anio] = texto.split('/');
    return `${anio}-${mes}-${dia}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return texto;
  }
  const fecha = new Date(texto);
  if (!Number.isNaN(fecha.getTime())) {
    return `${fecha.getFullYear()}-${pad2(fecha.getMonth() + 1)}-${pad2(fecha.getDate())}`;
  }
  return null;
};

export const parseIntegerLike = (valor: unknown): number | null => {
  if (valor === null || valor === undefined || valor === '') return null;
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? Math.trunc(valor) : null;
  }
  const texto = String(valor).trim();
  if (texto === '') return null;
  const numeroNormalizado = normalizarNumeroLatino(texto);
  if (numeroNormalizado !== null && Number.isFinite(numeroNormalizado)) {
    return Math.trunc(numeroNormalizado);
  }
  const soloDigitos = texto.replace(/\D/g, '');
  if (soloDigitos === '') return null;
  const numero = Number(soloDigitos);
  return Number.isFinite(numero) ? Math.trunc(numero) : null;
};

export const ensureFechaDateTime = (fechaIso: unknown): string | null => {
  if (!fechaIso) return null;
  const texto = String(fechaIso).trim();
  if (texto === '') return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(texto)) {
    const parsed = new Date(texto);
    return Number.isNaN(parsed.getTime()) ? null : texto;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return `${texto}T00:00:00`;
  }
  const parsed = new Date(texto);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const iso = parsed.toISOString().split('T')[0];
  return `${iso}T00:00:00`;
};

export type SolicitudExcelError = { fila: number; mensaje: string; codigo?: string };

export const construirRegistrosSolicitudExcel = (
  filas: ExcelRow[] = [],
  intlMontosInstance: Intl.NumberFormat
): { registros: AnyRecord[]; errores: SolicitudExcelError[] } => {
  const registros: AnyRecord[] = [];
  const errores: SolicitudExcelError[] = [];

  filas.forEach((fila, index) => {
    const numeroFila = parseIntegerLike(fila?.filaExcel) ?? index + 2;
    const nroAfilia = parseIntegerLike(fila?.nroAfiliado);
    if (nroAfilia === null) {
      errores.push({ fila: numeroFila, mensaje: 'El campo "NRO AFILIA" debe ser numerico.' });
      return;
    }

    const cupon = parseIntegerLike(fila?.cupon);
    if (cupon === null) {
      errores.push({ fila: numeroFila, mensaje: 'El campo "CUPON" debe ser numerico.' });
      return;
    }

    const codMov = parseIntegerLike(fila?.codMov);
    const fecha = ensureFechaDateTime(fila?.fecha);
    const subCod = parseIntegerLike(fila?.subCod);
    const cta = parseIntegerLike(fila?.cta) ?? 1;
    const importeCuotaValor = Number(fila?.impCta ?? 0);
    const totalValor = Number(fila?.total ?? 0);
    const importeCuota = Number.isFinite(importeCuotaValor) ? importeCuotaValor : 0;
    const total = Number.isFinite(totalValor) ? totalValor : 0;

    if (Number.isFinite(total) && total > MONTO_TOTAL_MAXIMO) {
      errores.push({
        fila: numeroFila,
        mensaje: `El campo "TOTAL" supera el maximo permitido (${intlMontosInstance.format(MONTO_TOTAL_MAXIMO)}).`,
        codigo: 'MONTO_TOTAL_EXCEDIDO',
      });
      return;
    }

    registros.push({
      NroAfilia: nroAfilia,
      NombreApellido: fila?.nombre ?? '',
      SubCod: subCod ?? 0,
      Cupon: cupon,
      CodMov: codMov ?? null,
      Fecha: fecha,
      Cta: cta,
      ImporteCuota: importeCuota,
      Total: total,
    });
  });

  return { registros, errores };
};

export const formatearFechaPreview = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const partes = iso.split('-');
  if (partes.length !== 3) return '';
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

export const formatearMontoPreview = (
  valor: number | null | undefined,
  formatter: Intl.NumberFormat
): string => {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '';
  return formatter.format(valor);
};

export const formatearEnteroPreview = (
  valor: number | null | undefined,
  formatter: Intl.NumberFormat
): string => {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '';
  return formatter.format(valor);
};

export const normalizarPeriodoCodigo = (valor: unknown): string | null => {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === 'number') {
    const textoNum = Math.trunc(valor).toString().padStart(6, '0');
    return textoNum.length === 6 ? textoNum : null;
  }
  const texto = String(valor).trim();
  if (/^\d{2}\/\d{4}$/.test(texto)) {
    return texto.replace('/', '');
  }
  if (/^\d{6}$/.test(texto)) {
    return texto;
  }
  const posibleFecha = new Date(texto);
  if (!Number.isNaN(posibleFecha.getTime())) {
    const mes = String(posibleFecha.getMonth() + 1).padStart(2, '0');
    const anio = String(posibleFecha.getFullYear());
    return `${mes}${anio}`;
  }
  return null;
};

export const esPeriodoCodigoValido = (codigo: string | null | undefined): boolean => {
  if (!codigo || typeof codigo !== 'string') return false;
  const limpio = codigo.trim();
  if (!/^\d{6}$/.test(limpio)) return false;
  const mes = Number(limpio.slice(0, 2));
  const anio = Number(limpio.slice(2));
  if (!Number.isFinite(mes) || !Number.isFinite(anio)) return false;
  return mes >= 1 && mes <= 12 && anio >= 1900;
};

export const parsePeriodoSortValue = (codigo: string | null | undefined): number | null => {
  const normalizado = normalizarPeriodoCodigo(codigo);
  if (!normalizado || normalizado.length !== 6) return null;
  const mm = normalizado.slice(0, 2);
  const yyyy = normalizado.slice(2);
  return Number(`${yyyy}${mm}`);
};

export const normalizarPeriodoProcesoItem = (
  item: AnyRecord | null | undefined
): PeriodoProcesoItem | null => {
  const codigo =
    normalizarPeriodoCodigo(
      item?.periodo ??
        item?.periodoProceso ??
        item?.periodoProcesoGrabacion ??
        item?.periodoId ??
        item?.periodoGrabacion ??
        item?.periodoImputacion
    ) ??
    null;
  if (!codigo) {
    return null;
  }
  const estadoRaw =
    item?.estado ??
    item?.Estado ??
    item?.estadoProceso ??
    item?.estadoPeriodo ??
    item?.estadoGrabacion ??
    null;
  const archivoFlag = normalizarArchivoGenerado(
    item?.archivoGenerado ?? item?.ArchivoGenerado ?? item?.archivo_generado ?? null
  );
  const estadoLower = typeof estadoRaw === 'string' ? estadoRaw.trim().toLowerCase() : '';
  const cerradoDesdeEstado = estadoLower.includes('cerrado') || estadoLower === '0' || estadoLower === 'false';
  const abiertoDesdeEstado = estadoLower.includes('abierto') || estadoLower === '1' || estadoLower === 'true';
  const cerrado = cerradoDesdeEstado || archivoFlag === true;
  const abierto = abiertoDesdeEstado || (!cerrado && archivoFlag !== true);
  const sortValue = parsePeriodoSortValue(codigo);
  return {
    codigo,
    nombre: formatPeriodo(codigo) || codigo,
    estado: estadoRaw ?? (cerrado ? 'Cerrado' : 'Abierto'),
    cerrado,
    abierto: Boolean(abierto && !cerrado),
    esActual: Boolean(item?.actual ?? item?.esActual ?? item?.vigente ?? item?.activo ?? item?.esVigente),
    sortValue,
  };
};

export const construirEtiquetaPeriodo = (
  periodoItem: PeriodoProcesoItem | null | undefined,
  { incluirEstado = true, incluirActual = true }: { incluirEstado?: boolean; incluirActual?: boolean } = {}
): string => {
  if (!periodoItem) return '';
  const estadoLegible = incluirEstado ? ` • ${periodoItem.cerrado ? 'Cerrado' : 'Abierto'}` : '';
  const actualLegible = incluirActual && periodoItem.esActual ? ' • Actual' : '';
  return `${periodoItem.nombre}${estadoLegible}${actualLegible}`.trim();
};

export const calcularPeriodoProcesamiento = (fechaIso: string | null | undefined): string | null => {
  if (!fechaIso) return null;
  const [anioStr, mesStr, diaStr] = fechaIso.split('-');
  if (!anioStr || !mesStr || !diaStr) return null;
  let mes = Number(mesStr);
  let anio = Number(anioStr);
  if (!Number.isFinite(mes) || !Number.isFinite(anio)) return null;
  mes += 1;
  if (mes > 12) {
    mes = 1;
    anio += 1;
  }
  const mesFormateado = mes.toString().padStart(2, '0');
  return `${mesFormateado}${anio}`;
};

export const inferirPeriodoDesdeFilas = (filas: ExcelRow[] = []): string | null => {
  for (const fila of filas) {
    const periodoInferido = calcularPeriodoProcesamiento(fila?.fecha ?? null);
    if (periodoInferido) {
      return periodoInferido;
    }
  }
  return null;
};

export const determinarConceptoCodigo = (fila: ExcelRow): number => {
  const sub = Number(fila?.subCod);
  if (sub === 0) return 630;
  if (sub === 3) return 638;
  return 631;
};

export type GrupoAfiliadoConcepto = {
  nroAfiliado: string;
  conceptoCodigo: number;
  filas: ExcelRow[];
};

export const agruparFilasPorAfiliadoYConcepto = (filas: ExcelRow[] = []): GrupoAfiliadoConcepto[] => {
  const mapa = new Map<string, GrupoAfiliadoConcepto>();
  filas.forEach((fila) => {
    const afiliado = (fila?.nroAfiliado ?? '').trim();
    if (!afiliado) return;
    const concepto = determinarConceptoCodigo(fila);
    const clave = `${afiliado}__${concepto}`;
    if (!mapa.has(clave)) {
      mapa.set(clave, {
        nroAfiliado: afiliado,
        conceptoCodigo: concepto,
        filas: [],
      });
    }
    mapa.get(clave)?.filas.push(fila);
  });
  return Array.from(mapa.values());
};

export const obtenerValorVistaPrevia = (
  fila: ExcelRow,
  key: string,
  formatterMontos: Intl.NumberFormat,
  formatterEnteros: Intl.NumberFormat
): string => {
  switch (key) {
    case 'nroAfiliado':
      return fila.nroAfiliado ?? '';
    case 'nombre':
      return fila.nombre ?? '';
    case 'subCod':
      return formatearEnteroPreview(fila.subCod, formatterEnteros);
    case 'cupon':
      return formatearEnteroPreview(fila.cupon, formatterEnteros);
    case 'codMov':
      return formatearEnteroPreview(fila.codMov, formatterEnteros);
    case 'fecha':
      return formatearFechaPreview(fila.fecha);
    case 'cta':
      return formatearEnteroPreview(fila.cta, formatterEnteros);
    case 'impCta':
      return formatearMontoPreview(fila.impCta, formatterMontos);
    case 'total':
      return formatearMontoPreview(fila.total, formatterMontos);
    default:
      return '';
  }
};

export const formatProcesoGrabacion = (fechaStr: string | null | undefined): string => {
  if (!fechaStr) return '';
  try {
    const fecha = new Date(fechaStr);
    return format(fecha, "MMMM 'de' yyyy", { locale: es });
  } catch {
    return fechaStr;
  }
};

export const formatPeriodo = (mmYYYY: string | null | undefined): string => {
  if (!mmYYYY || mmYYYY.length !== 6) return '';
  try {
    const mm = parseInt(mmYYYY.slice(0, 2), 10) - 1;
    const yyyy = parseInt(mmYYYY.slice(2), 10);
    const fecha = new Date(yyyy, mm, 1);
    return format(fecha, "MMMM 'de' yyyy", { locale: es });
  } catch {
    return mmYYYY;
  }
};

export const formatCurrency = (value: unknown): string => {
  const numericValue = Number(value ?? 0);
  const safeValue = Number.isFinite(numericValue) ? numericValue : 0;

  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue);
};

export const formatPercentage = (value: unknown): string => {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) {
    return '0%';
  }
  return `${Math.round(numericValue)}%`;
};

export const formatDateForPdf = (value: unknown): string => {
  if (!value) return '';
  try {
    return format(new Date(value as any), 'dd/MM/yyyy', { locale: es });
  } catch {
    return '';
  }
};

export const formatCuotas = (value: unknown): number | '-' => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : '-';
};

export const obtenerNumeroLoteCredito = (credito: AnyRecord | null | undefined): string => {
  if (!credito) {
    return '-';
  }
  const candidatos = [
    credito.numeroLote,
    credito.numeroLoteActual,
    credito.nroLote,
    credito.nroPaquete,
    credito.nropaq,
    credito.lote,
  ];
  const encontrado = candidatos.find((valor) => limpiarTextoPlano(valor));
  return limpiarTextoPlano(encontrado) || '-';
};

export const compararPeriodos = (a: string | null | undefined, b: string | null | undefined): number => {
  const valorA = parsePeriodoSortValue(a);
  const valorB = parsePeriodoSortValue(b);
  if (valorA === null || valorB === null) return 0;
  return valorA - valorB;
};

export const construirPayloadSolicitarCredito = (
  idAfiliado: string | number | null,
  filas: ExcelRow[] = [],
  conceptoCodigo: string,
  idLoteDetalle: unknown = null,
  creditoMigracion = '',
  idAutoriza: number | null = null
): AnyRecord => {
  const detalles: AnyRecord[] = [];
  let contadorCuota = 1;

  filas.forEach((fila) => {
    const fechaBaseIso = fila.fecha ?? format(new Date(), 'yyyy-MM-dd');
    let fechaReferencia = parseISO(fechaBaseIso);
    if (Number.isNaN(fechaReferencia.getTime())) {
      fechaReferencia = new Date();
    }
    const cantidadCuotas = Math.max(1, Number.isFinite(fila.cta) ? Number(fila.cta) : 1);
    const importeCuota = Number(fila.impCta ?? 0);
    const importeCuotaNormalizado = Number.isFinite(importeCuota) ? Number(importeCuota.toFixed(2)) : 0;
    const importeVence1 = Number((importeCuotaNormalizado / 2).toFixed(2));
    const importeVence2 = Number((importeCuotaNormalizado - importeVence1).toFixed(2));
    const subcodigo = fila.subCod != null ? String(fila.subCod) : '1';
    const codMovimiento = fila.codMov != null ? String(fila.codMov) : '3';

    for (let i = 0; i < cantidadCuotas; i += 1) {
      const vencimiento1Date = addMonths(fechaReferencia, i);
      const vencimiento2Date = addMonths(fechaReferencia, i + 1);
      detalles.push({
        subcodigo,
        nroCredito: String(contadorCuota),
        codMovimiento,
        importeCuota: importeCuotaNormalizado,
        vencimiento1: format(vencimiento1Date, 'yyyy-MM-dd'),
        importeVence1,
        vencimiento2: format(vencimiento2Date, 'yyyy-MM-dd'),
        importeVence2,
      });
      contadorCuota += 1;
    }
  });

  return {
    idAfiliado,
    denomina: DENOMINA_POR_CONCEPTO[conceptoCodigo] ?? '631',
    conceptoCodigo,
    idLote: normalizarId(idLoteDetalle) ?? null,
    idAutoriza: Number.isFinite(Number(idAutoriza)) ? Number(idAutoriza) : 0,
    creditoMigracion,
    creditoDetalle: detalles,
  };
};
