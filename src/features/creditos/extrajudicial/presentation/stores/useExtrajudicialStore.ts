import { ref, reactive } from 'vue';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { getUserRoles, userHasRole } from '../utils/roles';
import type { APIResponse } from '@/shared/types/service-response';
import {
  CABECERAS_ARCHIVO,
  CABECERAS_ARCHIVO_DISPLAY,
  MAPEO_COLUMNAS_PREVIEW,
  MONTO_TOTAL_MAXIMO,
  CLAVES_COLECCION_DETALLE_MODAL,
  NOMBRES_LOTE_EXCLUIDOS_CASA_CENTRAL,
  normalizarId,
  getClaveLote,
  getNumeroLoteListado,
  getEstilosCodigo,
  parseDecimal,
  extraerFilasDetalleDesdeRespuesta,
  obtenerNumeroCreditoDesdeDetalle,
  getDetalleId,
  crearEstadoNuevoCredito,
  limpiarTextoPlano,
  normalizarNombreDelegacion,
  esLoteExcluidoCasaCentral,
  normalizarNumeroCreditoBusqueda,
  normalizarAfiliadoFallecido,
  normalizarCreditoAnulado,
  obtenerRangoFechasDesdePeriodo,
  normalizarArchivoGenerado,
  limpiarCadena,
  normalizarNumeroLatino,
  normalizarEntero,
  normalizarFecha,
  construirRegistrosSolicitudExcel,
  normalizarPeriodoCodigo,
  esPeriodoCodigoValido,
  parsePeriodoSortValue,
  construirEtiquetaPeriodo,
  inferirPeriodoDesdeFilas,
  determinarConceptoCodigo,
  obtenerValorVistaPrevia,
  formatProcesoGrabacion,
  formatPeriodo,
  formatCurrency,
  formatPercentage,
  formatDateForPdf,
  formatCuotas,
  obtenerNumeroLoteCredito,
  compararPeriodos,
  construirPayloadSolicitarCredito,
} from '../../application/use-cases/utils';
import type {
  AfiliadoFallecidoNormalizado,
  CreditoAnuladoNormalizado,
  DetalleModalFila,
  SolicitudExcelError,
} from '../../application/use-cases/utils';
import { ExtrajudicialService } from '../../infrastructure/api/service';
import type {
  AnyRecord,
  DelegacionItem,
  ExcelRow,
  LoteResumen,
  NuevoCreditoState,
  PeriodoProcesoItem,
  SolicitudResumen,
} from '../../domain/models/types';
import { defineStore } from 'pinia';

const service = new ExtrajudicialService();

const unwrapResponse = <T>(response: APIResponse<T>, fallback: T): T => {
  if (!response.success) {
    const message = response.message ?? response.error ?? 'Request failed';
    throw new Error(message);
  }
  return response.content ?? fallback;
};

const resolvePayloadList = (payload: AnyRecord | AnyRecord[] | null | undefined): AnyRecord[] => {
  if (!payload) {
    return [];
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  const data = (payload as AnyRecord).data;
  return Array.isArray(data) ? data : [];
};

export const useExtrajudicialStore = defineStore('extrajudicial', () => {
  const solicitudes = ref<SolicitudResumen[]>([]);
  const periodo = ref('');
  const loading = ref(false);
  const loteExpandido = ref<string | null>(null);
  const detalleLote = ref<Record<string, AnyRecord[] | null>>({});
  const loteDetalleSeleccionadoKey = ref<string | null>(null);
  const detalleLoading = ref<string | null>(null);
  const mostrarModalDetalleCredito = ref(false);
  const mostrarModalEdicion = ref(false);
  const detalleModalFilas = ref<DetalleModalFila[]>([]);
  const detalleModalCargando = ref(false);
  const loteImprimiendo = ref<string | number | null>(null);
  const imprimiendoResumen = ref(false);
  const numeroAfiliado = ref('');
  const periodoAfiliado = ref('');
  const creditosAfiliado = ref<AnyRecord[]>([]);
  const buscandoAfiliado = ref(false);
  const pageNumber = ref(1);
  const pageSize = ref(10);
  const totalRegistros = ref<number | null>(null);
  const customPageSize = ref(String(pageSize.value));
  const goToPageInput = ref('1');
  const numeroLoteObjetivo = ref('');
  const loteResaltadoClave = ref<string | null>(null);
  const archivoGenerado = ref(false);
  const mostrarBusquedaAfiliado = ref(false);
  const mostrarModalBusquedaCredito = ref(false);
  const numeroCreditoBusqueda = ref('');
  const resultadosBusquedaCredito = ref<AnyRecord[]>([]);
  const buscandoCreditoPorNumero = ref(false);
  const errorBusquedaCredito = ref('');
  const detalleBusquedaActivaId = ref<string | number | null>(null);
  const mostrarModalAuditoria = ref(false);
  const auditoriaTabActiva = ref('creditos');
  const afiliadosFallecidos = ref<AfiliadoFallecidoNormalizado[]>([]);
  const cargandoAfiliadosFallecidos = ref(false);
  const errorAfiliadosFallecidos = ref('');
  const ultimaConsultaFallecidos = ref<string | null>(null);
  const periodoConsultaFallecidos = ref('');
  const creditosAnulados = ref<CreditoAnuladoNormalizado[]>([]);
  const cargandoCreditosAnulados = ref(false);
  const errorCreditosAnulados = ref('');
  const ultimaConsultaCreditosAnulados = ref<string | null>(null);
  const periodoConsultaCreditosAnulados = ref('');
  const mostrarModalNuevoCredito = ref(false);
  const archivoMasivoInput = ref<HTMLInputElement | null>(null);
  const archivoMasivoSeleccionado = ref<File | null>(null);
  const nombreArchivoMasivo = ref('');
  const mostrarModalCargaMasiva = ref(false);
  const datosArchivoMasivo = ref<ExcelRow[]>([]);
  const erroresArchivoMasivo = ref<SolicitudExcelError[]>([]);
  const procesandoArchivoMasivo = ref(false);
  const impactandoArchivoMasivo = ref(false);
  const totalArchivoMasivo = ref(0);
  const periodosImputacion = ref<PeriodoProcesoItem[]>([]);
  const periodoProcesoSeleccionado = ref('');
  const cargandoPeriodosImputacion = ref(false);
  const delegaciones = ref<DelegacionItem[]>([]);
  const descripcionCredito = ref('');
  const delegacionSeleccionada = ref<AnyRecord | null>(null);
  const selectedCreditoId = ref<string | number | null>(null);
  const selectedDetalleCreditoId = ref<string | number | null>(null);
  const detalleSeleccionado = ref<AnyRecord | null>(null);
  const editLoading = ref(false);
  const anulandoCreditoId = ref<string | number | null>(null);
  const nuevoCredito = ref<NuevoCreditoState>(crearEstadoNuevoCredito() as NuevoCreditoState);
  const loteParaNuevoCredito = ref<AnyRecord | null>(null);
  const idLoteDetalleNuevoCredito = ref<number | null>(null);
  const periodoProcesoCerrado = ref(false);
  const ultimaConsultaPeriodo = ref<string | null>(null);
  const guardando = ref(false);
  const canManageCreditos = ref(false);

  const editForm = reactive({
    numeroAfiliado: '',
    nuevoImporteCuota: '',
    nuevoImporteTotal: '',
    nombre: '',
    cuil: '',
    subCodigo: '',
    nroCredito: '',
    cMovimiento: '',
    fechaCobro: '',
    cuotas: null,
    tipoCredito: '',
    observacion: '',
  });

  const pageSizeOptions = [10, 20, 50, 100, 200, 500];
  const intlMontos = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const intlEnteros = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const cacheIdLoteDetalle = new Map<string, number>();

  let coincidencias: Element[] = [];
  let indiceActual = -1;

  const setCanManageCreditos = (valor: unknown): void => {
    canManageCreditos.value = Boolean(valor);
  };

  const setCustomPageSizeFromValue = (value: unknown): void => {
    const parsed = Number(value);
    customPageSize.value = Number.isFinite(parsed) ? String(parsed) : '';
  };

  const setGoToPageInputFromValue = (value: unknown): void => {
    goToPageInput.value = String(value ?? 1);
  };

  const fetchDelegaciones = async (): Promise<void> => {
    try {
      const response = await service.fetchDelegaciones({ idDelegacion: 0 });
      const payload = unwrapResponse(response, {} as AnyRecord);
      const lista = resolvePayloadList(payload);
      delegaciones.value = lista as DelegacionItem[];
    } catch (error) {
      console.error('Error al cargar delegaciones:', error);
      delegaciones.value = [];
    }
  };

  const resetNuevoCredito = (lote: AnyRecord | null = null): void => {
    const base = crearEstadoNuevoCredito() as NuevoCreditoState;
    base.fechaPrimerVencimiento = format(new Date(), 'yyyy-MM-dd');
    if (lote) {
      base.nroPaquete = lote?.nropaq != null ? String(lote.nropaq) : '';
      base.proc = lote?.codigo != null ? String(lote.codigo) : '';
      base.identificador = lote?.identificador != null ? String(lote.identificador) : '';
    }
    nuevoCredito.value = base;
    guardando.value = false;
  };

  const esLoteDestinoNuevoCredito = (lote: AnyRecord | null | undefined): boolean => {
    if (!mostrarModalNuevoCredito.value || !loteParaNuevoCredito.value) {
      return false;
    }
    const seleccionado = normalizarId(loteParaNuevoCredito.value?.idLote ?? loteParaNuevoCredito.value?.id);
    const actual = normalizarId(lote?.idLote ?? lote?.id);
    if (seleccionado != null && actual != null) {
      return seleccionado === actual;
    }
    return getClaveLote(loteParaNuevoCredito.value) === getClaveLote(lote);
  };

  const resolveUsuarioModificacion = () =>
    // authStore?.auth?.user ??
    // authStore?.auth?.username ??
    // authStore?.auth?.usuario ??
    'operador.web';

  const getDetalleKey = (lote: AnyRecord | null | undefined): string => {
    if (!lote) return 'sin-clave';
    const id = normalizarId(lote?.idLote ?? lote?.id ?? null);
    if (id != null) return `id-${id}`;
    const clave = getClaveLote(lote);
    return clave ? `clave-${clave}` : 'sin-clave';
  };

  const getDetalleRegistros = (lote: AnyRecord | null | undefined): AnyRecord[] | null => {
    if (!lote) return null;
    const id = normalizarId(lote?.idLote ?? lote?.id ?? null);
    const key = getDetalleKey(lote);
    return (
      detalleLote.value?.[key] ??
      (id != null ? detalleLote.value?.[`id-${id}`] : null) ??
      (id != null ? detalleLote.value?.[id] : null) ??
      null
    );
  };

  const setDetalleRegistros = (
    lote: AnyRecord | null | undefined,
    registros: AnyRecord[] | null
  ): void => {
    if (!lote) return;
    const id = normalizarId(lote?.idLote ?? lote?.id ?? null);
    const key = getDetalleKey(lote);
    detalleLote.value[key] = registros;
    if (id != null) {
      detalleLote.value[`id-${id}`] = registros;
    }
  };

  const obtenerLotePorClave = (clave: string | null | undefined): SolicitudResumen | null => {
    if (!clave) return null;
    return solicitudes.value.find((lote) => getDetalleKey(lote) === clave) ?? null;
  };

  const recargarLotePorClave = async (clave: string | null | undefined): Promise<void> => {
    const lote = obtenerLotePorClave(clave);
    if (!lote) return;
    setDetalleRegistros(lote, null);
    try {
      await cargarDetalleLote(lote, { omitLoadingState: true });
    } catch (detalleError) {
      console.error('No se pudo recargar el detalle del lote', detalleError);
    }
  };

  const obtenerIdLoteDetalleDesdeLote = (lote: AnyRecord | null | undefined): number | null => {
    const directo = normalizarId(lote?.idLote ?? lote?.id ?? null);
    if (directo != null) return directo;
    const idDetalle = normalizarId(lote?.idLoteDetalle ?? null);
    if (idDetalle != null) return idDetalle;
    const registros = getDetalleRegistros(lote);
    if (Array.isArray(registros)) {
      const encontrado = registros.find((registro) => normalizarId(registro?.idLoteDetalle) != null);
      if (encontrado) return normalizarId(encontrado.idLoteDetalle);
    }
    return null;
  };

  const detalleModalAgrupado = (): { numeroBono: string; practicas: DetalleModalFila[] }[] => {
    const grupos = new Map<string, DetalleModalFila[]>();
    for (const fila of detalleModalFilas.value ?? []) {
      const key = fila.numeroBono || '-';
      if (!grupos.has(key)) {
        grupos.set(key, []);
      }
      grupos.get(key)?.push(fila);
    }
    return Array.from(grupos.entries()).map(([numeroBono, practicas]) => ({
      numeroBono,
      practicas,
    }));
  };

  const groupDetalleLote = (items: AnyRecord[] = []): AnyRecord[] => {
    const grupos = new Map<string, AnyRecord>();

    items.forEach((detalle) => {
      const clave = [
        (detalle.aNumero ?? '').trim(),
        detalle.cuil ?? '',
        detalle.nroCredito ?? '',
        detalle.cMovimiento ?? '',
        detalle.fechaCobro ?? '',
      ].join('|');

      if (!grupos.has(clave)) {
        grupos.set(clave, {
          ...detalle,
          aNumero: (detalle.aNumero ?? '').trim(),
          idsDetalle: [detalle.idDetalleCredito ?? detalle.idCredito ?? detalle.id],
          idDetalleCredito: detalle.idDetalleCredito ?? detalle.idCredito ?? detalle.id,
        });
      } else {
        const existente = grupos.get(clave) as AnyRecord | undefined;
        if (existente) {
          if (!Array.isArray(existente.idsDetalle)) {
            existente.idsDetalle = [];
          }
          existente.idsDetalle.push(detalle.idDetalleCredito ?? detalle.idCredito ?? detalle.id);
        }
      }
    });

    return Array.from(grupos.values());
  };

  const esDetalleSeleccionado = (detalle: AnyRecord | null | undefined): boolean =>
    getDetalleId(detalle) === selectedDetalleCreditoId.value;

  const seleccionarDetalle = (detalle: AnyRecord): void => {
    if (!canManageCreditos.value) {
      return;
    }
    const id = getDetalleId(detalle);
    if (!id) {
      alert('No se puede editar este crédito porque no se recibió un identificador.');
      return;
    }
    selectedDetalleCreditoId.value = id;
    selectedCreditoId.value = detalle?.idCredito ?? id;
    detalleSeleccionado.value = detalle;
    editForm.numeroAfiliado = (detalle.aNumero ?? '').trim();
    const importeCuotaDetalle = parseDecimal(detalle.importeCuota);
    const importeTotalDetalle = parseDecimal(detalle.importeTotal);
    editForm.nuevoImporteCuota = Number.isFinite(importeCuotaDetalle) ? importeCuotaDetalle.toFixed(2) : '';
    editForm.nuevoImporteTotal = Number.isFinite(importeTotalDetalle) ? importeTotalDetalle.toFixed(2) : '';
    editForm.nombre = detalle.nombre ?? '';
    editForm.cuil = detalle.cuil ?? '';
    editForm.subCodigo = detalle.subCodigo ?? '';
    editForm.nroCredito = detalle.nroCredito ?? '';
    editForm.cMovimiento = detalle.cMovimiento ?? '';
    editForm.fechaCobro = detalle.fechaCobro ? detalle.fechaCobro.substring(0, 10) : '';
    editForm.cuotas = detalle.cuotas ?? null;
    editForm.tipoCredito = detalle.tipoCredito ?? '';
    editForm.observacion = detalle.observacion ?? detalle.observaciones ?? '';
    mostrarModalEdicion.value = true;
  };

  const abrirModalDetalleCredito = async (detalle: AnyRecord): Promise<void> => {
    if (!detalle) {
      return;
    }
    const numeroCredito = obtenerNumeroCreditoDesdeDetalle(detalle);
    if (!numeroCredito) {
      Swal.fire('Sin datos', 'No se encontró un número de crédito para consultar.', 'info');
      return;
    }
    mostrarModalDetalleCredito.value = true;
    detalleModalCargando.value = true;
    detalleModalFilas.value = [];
    try {
      const response = await service.fetchDetalleCreditoFarmacia(numeroCredito);
      const payload = unwrapResponse(response, {} as AnyRecord);
      const filas = extraerFilasDetalleDesdeRespuesta(payload, CLAVES_COLECCION_DETALLE_MODAL) ?? [];
      if (!filas.length) {
        Swal.fire('Sin datos', 'No se encontraron detalles para este crédito.', 'info');
      }
      detalleModalFilas.value = filas;
    } catch (error) {
      console.error('Error al consultar el detalle del crédito', error);
      const mensaje =
        // error?.response?.data?.message ??
        // error?.message ??
        'No se pudo obtener el detalle del crédito.';
      Swal.fire('Error', mensaje, 'error');
      cerrarModalDetalleCredito();
    } finally {
      detalleModalCargando.value = false;
    }
  };

  const cerrarModalDetalleCredito = () => {
    mostrarModalDetalleCredito.value = false;
    detalleModalFilas.value = [];
    detalleModalCargando.value = false;
  };

  const handleRowDetalleClick = (
    detalle: AnyRecord | null | undefined,
    lote: AnyRecord | null | undefined,
    event: any
  ): void => {
    if (!detalle) {
      return;
    }
    if (lote) {
      loteDetalleSeleccionadoKey.value = getDetalleKey(lote);
    }
    if (event) {
      if (event.defaultPrevented) {
        return;
      }
      const accionesNodo =
        typeof event.target?.closest === 'function'
          ? event.target.closest('[data-acciones-detalle]')
          : null;
      if (accionesNodo) {
        return;
      }
    }
    abrirModalDetalleCredito(detalle);
  };

  const cancelarEdicionDetalle = () => {
    selectedDetalleCreditoId.value = null;
    selectedCreditoId.value = null;
    detalleSeleccionado.value = null;
    mostrarModalEdicion.value = false;
    editForm.numeroAfiliado = '';
    editForm.nuevoImporteCuota = '';
    editForm.nuevoImporteTotal = '';
    editForm.nombre = '';
    editForm.cuil = '';
    editForm.subCodigo = '';
    editForm.nroCredito = '';
    editForm.cMovimiento = '';
    editForm.fechaCobro = '';
    editForm.cuotas = null;
    editForm.tipoCredito = '';
    editForm.observacion = '';
  };

  const guardarEdicionDetalle = async () => {
    if (!canManageCreditos.value) {
      return;
    }
    if (!selectedDetalleCreditoId.value || !detalleSeleccionado.value) {
      alert('Primero debe seleccionar un crédito del listado.');
      return;
    }
    const idDetalleCredito = selectedDetalleCreditoId.value;
    const idCredito = selectedCreditoId.value ?? detalleSeleccionado.value?.idCredito ?? null;
    if (!idCredito && !idDetalleCredito) {
      alert('No se puede actualizar este crédito sin un identificador válido.');
      return;
    }
    editLoading.value = true;
    try {
      const fechaCobroNormalizada = editForm.fechaCobro
        ? (editForm.fechaCobro.includes('T') ? editForm.fechaCobro : `${editForm.fechaCobro}T00:00:00`)
        : null;
      const importeCuotaEditado = parseDecimal(editForm.nuevoImporteCuota);
      const importeTotalEditado = parseDecimal(editForm.nuevoImporteTotal);
      if (!Number.isFinite(importeCuotaEditado) || importeCuotaEditado <= 0) {
        alert('Ingrese un importe de cuota válido (hasta 18 dígitos y 2 decimales).');
        editLoading.value = false;
        return;
      }
      if (!Number.isFinite(importeTotalEditado) || importeTotalEditado <= 0) {
        alert('Ingrese un importe total válido (hasta 18 dígitos y 2 decimales).');
        editLoading.value = false;
        return;
      }
      const importeCuotaNormalizado = Number(importeCuotaEditado.toFixed(2));
      const importeTotalNormalizado = Number(importeTotalEditado.toFixed(2));
      const payload = {
        idCredito: idCredito != null ? Number(idCredito) : (idDetalleCredito != null ? Number(idDetalleCredito) : null),
        idDetalleCredito:
          detalleSeleccionado.value?.idDetalleCredito != null
            ? Number(detalleSeleccionado.value.idDetalleCredito)
            : idDetalleCredito != null
              ? Number(idDetalleCredito)
              : null,
        nuevoImporteTotal: importeTotalNormalizado,
        nuevoImporteCuota: importeCuotaNormalizado,
        numeroAfiliado: editForm.numeroAfiliado?.trim() ?? '',
        nombre: editForm.nombre?.trim() ?? '',
        cuil: editForm.cuil?.trim() ?? '',
        subCodigo: editForm.subCodigo !== '' && editForm.subCodigo !== null ? Number(editForm.subCodigo) : null,
        nroCredito: editForm.nroCredito !== '' && editForm.nroCredito !== null ? Number(editForm.nroCredito) : null,
        cMovimiento: editForm.cMovimiento !== '' && editForm.cMovimiento !== null ? Number(editForm.cMovimiento) : null,
        fechaCobro: fechaCobroNormalizada,
        cuotas: editForm.cuotas !== null ? Number(editForm.cuotas) : null,
        tipoCredito: editForm.tipoCredito?.trim() ?? '',
        observacion: editForm.observacion?.trim() ?? '',
        usuarioModificacion: resolveUsuarioModificacion(),
      };
      if (payload.idCredito == null) {
        alert('No se puede actualizar este crédito sin un identificador válido.');
        editLoading.value = false;
        return;
      }

      if (!payload.numeroAfiliado) {
        alert('Debe ingresar el número de afiliado.');
        editLoading.value = false;
        return;
      }

      const response = await service.actualizarCredito(payload);
      unwrapResponse(response, {} as AnyRecord);
      if (payload.idCredito != null) {
        detalleSeleccionado.value.idCredito = payload.idCredito;
      }
      if (payload.idDetalleCredito != null) {
        detalleSeleccionado.value.idDetalleCredito = payload.idDetalleCredito;
      }
      detalleSeleccionado.value.aNumero = payload.numeroAfiliado;
      detalleSeleccionado.value.nombre = editForm.nombre;
      detalleSeleccionado.value.cuil = editForm.cuil;
      detalleSeleccionado.value.subCodigo = payload.subCodigo ?? '';
      detalleSeleccionado.value.nroCredito = payload.nroCredito ?? '';
      detalleSeleccionado.value.cMovimiento = payload.cMovimiento ?? '';
      detalleSeleccionado.value.fechaCobro = payload.fechaCobro ?? '';
      detalleSeleccionado.value.cuotas = payload.cuotas ?? 0;
      detalleSeleccionado.value.tipoCredito = payload.tipoCredito;
      detalleSeleccionado.value.importeCuota = payload.nuevoImporteCuota;
      detalleSeleccionado.value.importeTotal = payload.nuevoImporteTotal;
      detalleSeleccionado.value.observacion = payload.observacion ?? '';
      const claveLote = loteDetalleSeleccionadoKey.value;
      cancelarEdicionDetalle();
      await Swal.fire({
        title: 'Crédito actualizado',
        text: 'El crédito fue actualizado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
      });
      await recargarLotePorClave(claveLote);
      await buscarResumen(true /* es casa central boolean */);
    } catch (error) {
      console.error('Error al actualizar el crédito', error);
      const message =
        // error?.customMessage ??
        // error?.data?.message ??
        // error?.data?.title ??
        // error?.message ??
        'Ocurrió un error al actualizar el crédito.';
      alert(message);
    } finally {
      editLoading.value = false;
    }
  };

  const confirmarAnulacion = async (item: AnyRecord, detalle: AnyRecord): Promise<void> => {
    if (!canManageCreditos.value) {
      return;
    }
    if (!detalle) {
      return;
    }

    loteDetalleSeleccionadoKey.value = getDetalleKey(item);
    const trackingId = normalizarId(getDetalleId(detalle) ?? detalle?.idCredito ?? null);
    const idCredito = normalizarId(detalle?.idCredito ?? null);
    const numeroAfiliadoDetalle = (detalle?.aNumero ?? detalle?.numeroAfiliado ?? '').toString().trim();

    if (idCredito == null) {
      alert('No se encontró un id de crédito válido para anular.');
      return;
    }

    if (!numeroAfiliadoDetalle) {
      alert('No se encontró el número de afiliado asociado al crédito.');
      return;
    }

    const { value: motivo, isConfirmed } = await Swal.fire({
      title: 'Anular crédito',
      text: 'Esta acción anulará el crédito seleccionado. ¿Desea continuar?',
      icon: 'warning',
      input: 'textarea',
      inputPlaceholder: 'Ingrese el motivo de la anulación',
      inputAttributes: {
        'aria-label': 'Motivo de anulación',
        rows: '3',
      },
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      allowOutsideClick: false,
      inputValidator: (value: string) => {
        if (!value || !value.trim()) {
          return 'Debe ingresar un motivo de anulación.';
        }
        return undefined;
      },
    });

    if (!isConfirmed) {
      return;
    }

    const payload = {
      idCredito,
      numeroAfiliado: numeroAfiliadoDetalle,
      motivo: motivo.trim(),
      usuario: resolveUsuarioModificacion(),
    };

    anulandoCreditoId.value = trackingId;

    try {
      const response = await service.anularCredito(payload);
      unwrapResponse(response, {} as AnyRecord);

      await Swal.fire({
        title: 'Crédito anulado',
        text: 'El crédito fue anulado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
      });

      const registrosLote = getDetalleRegistros(item);
      if (Array.isArray(registrosLote)) {
        const filtrado = registrosLote.filter((registro) => {
          const registroTrackingId = normalizarId(getDetalleId(registro) ?? registro?.idCredito ?? null);
          const registroCreditoId = normalizarId(registro?.idCredito ?? null);
          return registroTrackingId !== trackingId && registroCreditoId !== idCredito;
        });
        setDetalleRegistros(item, filtrado);
      }

      const selectedDetalleId = normalizarId(selectedDetalleCreditoId.value);
      const selectedCredito = normalizarId(selectedCreditoId.value);
      if (selectedDetalleId === trackingId || selectedCredito === idCredito) {
        cancelarEdicionDetalle();
      }

      await recargarLotePorClave(loteDetalleSeleccionadoKey.value);
      await buscarResumen(true /* es casa central boolean */);
    } catch (error) {
      console.error('Error al anular el crédito', error);
      const message =
        // error?.customMessage ??
        // error?.response?.data?.message ??
        // error?.response?.data?.title ??
        // error?.message ??
        'Ocurrió un error al anular el crédito.';

      await Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
      });
    } finally {
      anulandoCreditoId.value = null;
    }
  };

  const esDetalleAnulando = (detalle: AnyRecord | null | undefined): boolean => {
    const trackingId = normalizarId(getDetalleId(detalle) ?? detalle?.idCredito ?? null);
    if (trackingId == null) {
      return false;
    }
    return anulandoCreditoId.value === trackingId;
  };

  const limpiarBusquedaCredito = () => {
    resultadosBusquedaCredito.value = [];
    errorBusquedaCredito.value = '';
  };

  const abrirModalBusquedaCredito = () => {
    numeroCreditoBusqueda.value = '';
    limpiarBusquedaCredito();
    mostrarModalBusquedaCredito.value = true;
  };

  const cerrarModalBusquedaCredito = () => {
    mostrarModalBusquedaCredito.value = false;
    buscandoCreditoPorNumero.value = false;
  };

  const coincideNumeroCredito = (detalle: AnyRecord | null | undefined, numeroReferencia: string): boolean => {
    const numeroDetalle = normalizarNumeroCreditoBusqueda(
      detalle?.nroCredito ??
        detalle?.numeroCredito ??
        detalle?.nroCreditoMigracion ??
        detalle?.numeroTramite ??
        ''
    );
    if (!numeroDetalle || !numeroReferencia) {
      return false;
    }
    if (numeroDetalle === numeroReferencia) {
      return true;
    }
    const detalleNumero = Number(numeroDetalle);
    const referenciaNumero = Number(numeroReferencia);
    if (Number.isFinite(detalleNumero) && Number.isFinite(referenciaNumero)) {
      return detalleNumero === referenciaNumero;
    }
    return false;
  };

  const obtenerTipoCreditoDesdeDetalle = (idLote: string | number | null | undefined): string => {
    if (idLote == null) {
      return '';
    }
    const registros = getDetalleRegistros({ idLote });
    if (!Array.isArray(registros) || !registros.length) {
      return '';
    }
    const tipos = Array.from(
      new Set(
        registros
          .map((fila) => limpiarTextoPlano(fila?.tipoCredito))
          .filter(Boolean)
      )
    );
    if (!tipos.length) {
      return '';
    }
    return tipos.join(' / ');
  };

  const obtenerTituloTipoCredito = (item: AnyRecord | null | undefined): string => {
    if (!item) {
      return 'Tipo de crédito';
    }
    const candidatos = [
      item.tipoCredito,
      item.descripcionTipoCredito,
      item.descripcionCredito,
      item.denomina,
      item.conceptoDescripcion,
      item.tipoCreditoDescripcion,
    ];
    for (const candidato of candidatos) {
      const texto = limpiarTextoPlano(candidato);
      if (texto) {
        return texto;
      }
    }
    const desdeDetalle = obtenerTipoCreditoDesdeDetalle(item.idLote ?? item.id);
    if (desdeDetalle) {
      return desdeDetalle;
    }
    const codigo = limpiarTextoPlano(item.conceptoCodigo ?? item.codigo);
    if (codigo) {
      return `Crédito ${codigo}`;
    }
    return 'Tipo de crédito no informado';
  };

  const construirResultadoBusqueda = (
    lote: AnyRecord,
    detalle: AnyRecord,
    numeroReferencia: string
  ): AnyRecord => {
    const idLote = normalizarId(lote?.idLote ?? lote?.id);
    const detalleId = getDetalleId(detalle);
    const numeroCredito = normalizarNumeroCreditoBusqueda(
      detalle?.nroCredito ?? detalle?.numeroCredito ?? numeroReferencia
    );
    return {
      id: `${idLote ?? 'lote'}-${detalleId ?? numeroCredito ?? 'detalle'}`,
      idLote,
      loteReferencia: lote,
      detalleId,
      numeroCredito,
      numeroLote: lote?.nropaq ?? lote?.nroLote ?? '-',
      codigo: limpiarTextoPlano(lote?.codigo ?? ''),
      tipoCredito: obtenerTituloTipoCredito(lote),
      afiliado: limpiarTextoPlano(detalle?.aNumero),
      nombre: limpiarTextoPlano(detalle?.nombre),
      cuotas: detalle?.cuotas ?? '-',
      importeCuota: Number(detalle?.importeCuota ?? 0),
      importeTotal: Number(detalle?.importeTotal ?? 0),
    };
  };

  const buscarCreditoPorNumero = async (): Promise<void> => {
    const numeroReferencia = normalizarNumeroCreditoBusqueda(numeroCreditoBusqueda.value);
    detalleBusquedaActivaId.value = null;
    limpiarBusquedaCredito();
    if (!numeroReferencia) {
      errorBusquedaCredito.value = 'Ingrese el número de crédito que desea buscar.';
      return;
    }
    if (!solicitudes.value.length) {
      errorBusquedaCredito.value = 'Primero debe consultar un período para poder buscar dentro de los lotes.';
      return;
    }
    buscandoCreditoPorNumero.value = true;
    try {
      const resultados: AnyRecord[] = [];
      for (const lote of solicitudes.value) {
        const detalles = await cargarDetalleLote(lote, { omitLoadingState: true });
        if (!Array.isArray(detalles) || !detalles.length) {
          continue;
        }
        detalles.forEach((detalle) => {
          if (coincideNumeroCredito(detalle, numeroReferencia)) {
            resultados.push(construirResultadoBusqueda(lote, detalle, numeroReferencia));
          }
        });
      }
      resultadosBusquedaCredito.value = resultados;
      if (!resultados.length) {
        errorBusquedaCredito.value = 'No se encontraron créditos con el número indicado.';
      }
    } catch (error) {
      console.error('Error al buscar el crédito por número', error);
      errorBusquedaCredito.value =
        // error?.response?.data?.message ??
        // error?.message ??
        'Ocurrió un error al buscar el crédito.';
    } finally {
      buscandoCreditoPorNumero.value = false;
    }
  };

  const esDetalleCoincidenciaBusqueda = (detalle: AnyRecord | null | undefined): boolean => {
    const id = getDetalleId(detalle);
    if (!id) {
      return false;
    }
    return detalleBusquedaActivaId.value === id;
  };

  const enfocarResultadoBusqueda = async (resultado: AnyRecord): Promise<void> => {
    if (!resultado) {
      return;
    }
    const idLoteBusqueda = resultado.idLote ?? null;
    const loteRef =
      resultado.loteReferencia ??
      solicitudes.value.find((lote) => normalizarId(lote?.idLote ?? lote?.id) === idLoteBusqueda);
    if (!loteRef) {
      Swal.fire('Lote no disponible', 'No se pudo ubicar el lote asociado al crédito encontrado.', 'info');
      return;
    }
    const clave = getClaveLote(loteRef);
    if (!clave) {
      Swal.fire('Sin identificador', 'El lote no posee un identificador válido para abrirlo.', 'error');
      return;
    }
    try {
      detalleBusquedaActivaId.value = null;
      loteExpandido.value = clave;
      await cargarDetalleLote(loteRef);
      const registros = getDetalleRegistros(loteRef) ?? [];
      const coincidencia = registros.find((detalle) => {
        if (resultado.detalleId && getDetalleId(detalle) === resultado.detalleId) {
          return true;
        }
        return coincideNumeroCredito(detalle, resultado.numeroCredito);
      });
      if (coincidencia) {
        detalleBusquedaActivaId.value = getDetalleId(coincidencia);
      } else {
        await Swal.fire(
          'Fila no localizada',
          'Se abrió el lote pero no se pudo resaltar el crédito solicitado.',
          'info'
        );
      }
    } catch (error) {
      console.error('Error al enfocar el crédito encontrado', error);
      const mensaje =
        // error?.response?.data?.message ??
        // error?.message ??
        'No se pudo mostrar el lote asociado al crédito.';
      await Swal.fire('Error', mensaje, 'error');
    } finally {
      mostrarModalBusquedaCredito.value = false;
    }
  };

  const cargarCreditosAnulados = async (periodoConsulta = (periodo.value ?? '').trim()) => {
    const periodoNormalizado = (periodoConsulta ?? '').trim();
    if (!periodoNormalizado) {
      errorCreditosAnulados.value = 'Debe ingresar el período en formato MMYYYY para consultar.';
      creditosAnulados.value = [];
      periodoConsultaCreditosAnulados.value = '';
      return;
    }
    if (periodoNormalizado.length !== 6) {
      errorCreditosAnulados.value = 'El período debe tener 6 dígitos en formato MMYYYY.';
      creditosAnulados.value = [];
      periodoConsultaCreditosAnulados.value = '';
      return;
    }
    cargandoCreditosAnulados.value = true;
    errorCreditosAnulados.value = '';
    try {
      const response = await service.fetchCreditosAnulados({ periodo: periodoNormalizado });
      const payload = unwrapResponse(response, {} as AnyRecord);
      const lista = resolvePayloadList(payload);
      creditosAnulados.value = lista.map((registro: any, index: number) => normalizarCreditoAnulado(registro, index));
      periodoConsultaCreditosAnulados.value = periodoNormalizado;
      ultimaConsultaCreditosAnulados.value = periodoNormalizado;
    } catch (error) {
      console.error('Error al obtener créditos anulados', error);
      errorCreditosAnulados.value =
        // error?.response?.data?.message ??
        // error?.response?.data?.title ??
        // error?.message ??
        'Ocurrió un error al obtener los créditos anulados.';
      creditosAnulados.value = [];
      periodoConsultaCreditosAnulados.value = '';
    } finally {
      cargandoCreditosAnulados.value = false;
    }
  };

  const abrirModalAuditoria = async (tab: string = 'creditos'): Promise<void> => {
    const periodoActual = (periodo.value ?? '').trim();
    const mensajePeriodo =
      tab === 'creditos'
        ? 'Ingrese el período (MMYYYY) para ver los créditos anulados.'
        : 'Ingrese el período (MMYYYY) para consultar los afiliados suspendidos.';
    if (!periodoActual || periodoActual.length !== 6) {
      alert(mensajePeriodo);
      return;
    }
    auditoriaTabActiva.value = tab;
    mostrarModalAuditoria.value = true;
    if (tab === 'creditos') {
      if (ultimaConsultaCreditosAnulados.value === periodoActual && creditosAnulados.value.length) {
        return;
      }
      await cargarCreditosAnulados(periodoActual);
      return;
    }
    if (ultimaConsultaFallecidos.value === periodoActual && afiliadosFallecidos.value.length) {
      return;
    }
    await cargarAfiliadosFallecidos(periodoActual);
  };

  const cambiarTabAuditoria = async (tab: string): Promise<void> => {
    if (auditoriaTabActiva.value === tab) {
      return;
    }
    auditoriaTabActiva.value = tab;
    const periodoActual = (periodo.value ?? '').trim();
    if (!periodoActual || periodoActual.length !== 6) {
      return;
    }
    if (tab === 'creditos') {
      if (ultimaConsultaCreditosAnulados.value !== periodoActual || !creditosAnulados.value.length) {
        await cargarCreditosAnulados(periodoActual);
      }
      return;
    }
    if (ultimaConsultaFallecidos.value !== periodoActual || !afiliadosFallecidos.value.length) {
      await cargarAfiliadosFallecidos(periodoActual);
    }
  };

  const cerrarModalAuditoria = () => {
    mostrarModalAuditoria.value = false;
  };

  const abrirModalCreditosAnulados = async (): Promise<void> => {
    await abrirModalAuditoria('creditos');
  };

  const cargarAfiliadosFallecidos = async (
    periodoConsulta: string = (periodo.value ?? '').trim()
  ): Promise<void> => {
    const periodoNormalizado = (periodoConsulta ?? '').trim();
    if (!periodoNormalizado) {
      errorAfiliadosFallecidos.value = 'Debe ingresar el período en formato MMYYYY para consultar.';
      afiliadosFallecidos.value = [];
      periodoConsultaFallecidos.value = '';
      return;
    }
    const { fechaDesde, fechaHasta, periodoEfectivo } = obtenerRangoFechasDesdePeriodo(periodoNormalizado);
    if (!fechaDesde || !fechaHasta) {
      errorAfiliadosFallecidos.value = 'El período debe tener el formato MMYYYY para consultar.';
      afiliadosFallecidos.value = [];
      periodoConsultaFallecidos.value = '';
      return;
    }
    cargandoAfiliadosFallecidos.value = true;
    errorAfiliadosFallecidos.value = '';
    try {
      const response = await service.fetchAfiliadosFallecidos({ fechaDesde, fechaHasta });
      const payload = unwrapResponse(response, {} as AnyRecord);
      const lista = resolvePayloadList(payload);
      afiliadosFallecidos.value = lista.map((registro: any, index: number) => normalizarAfiliadoFallecido(registro, index));
      ultimaConsultaFallecidos.value = periodoNormalizado;
      periodoConsultaFallecidos.value = periodoEfectivo ?? periodoNormalizado;
    } catch (error) {
      console.error('Error al obtener afiliados suspendidos', error);
      errorAfiliadosFallecidos.value =
        // error?.response?.data?.message ??
        // error?.response?.data?.title ??
        // error?.message ??
        'Ocurrió un error al obtener los créditos de afiliados con baja.';
      afiliadosFallecidos.value = [];
      periodoConsultaFallecidos.value = '';
    } finally {
      cargandoAfiliadosFallecidos.value = false;
    }
  };

  const registrarTipoEnGrupo = (grupo: AnyRecord | null | undefined, valor: unknown): void => {
    if (!grupo) return;
    if (!grupo._tiposCredito) {
      grupo._tiposCredito = new Set<string>();
    }
    const texto = limpiarTextoPlano(valor);
    if (texto) {
      grupo._tiposCredito.add(texto);
    }
  };

  const agruparResumenPorLote = (items: AnyRecord[] = []): SolicitudResumen[] => {
    const grupos = new Map<string, AnyRecord>();

    items.forEach((lote) => {
      if (!lote) {
        return;
      }

      const idNormalizado = normalizarId(lote.idLote ?? lote.id);
      const clave =
        idNormalizado != null
          ? `lote-${idNormalizado}`
          : getClaveLote(lote) ??
            ['codigo', 'nropaq', 'nroLote', 'nroPaquete', 'numeroLote']
              .map((campo) => limpiarTextoPlano(lote?.[campo]))
              .filter(Boolean)
              .join('|');

      if (!clave) {
        return;
      }

      const cantidadCreditos = Number(lote.cantidadCreditos ?? 0);
      const totalCuotas = Number(lote.totalCuotas ?? 0);
      const totalImporteParsed = parseDecimal(lote.totalImporte);
      const totalImporte =
        Number.isFinite(totalImporteParsed) && totalImporteParsed >= 0
          ? totalImporteParsed
          : Number(lote.totalImporte ?? 0) || 0;
      const importePromedioParsed = parseDecimal(lote.importePromedioCuota);
      const importePromedio =
        Number.isFinite(importePromedioParsed) && importePromedioParsed >= 0
          ? importePromedioParsed
          : Number(lote.importePromedioCuota ?? 0) || 0;
      const fechaGeneracion = lote.fechaGeneracion ?? lote.fecha ?? null;

      if (!grupos.has(clave)) {
        const base = {
          ...lote,
          idLote: idNormalizado ?? lote.idLote ?? lote.id ?? null,
          cantidadCreditos: Number.isFinite(cantidadCreditos) ? cantidadCreditos : 0,
          totalCuotas: Number.isFinite(totalCuotas) ? totalCuotas : 0,
          totalImporte,
          importePromedioCuota: Number.isFinite(importePromedio) ? importePromedio : 0,
          _importeCuotaSum: Number.isFinite(importePromedio) ? importePromedio : 0,
          _fechasGeneracion:
            fechaGeneracion && String(fechaGeneracion).trim() !== ''
              ? new Set([String(fechaGeneracion).trim()])
              : new Set<string>(),
          _tiposCredito: new Set<string>(),
        };
        registrarTipoEnGrupo(base, lote.tipoCredito ?? lote.denomina ?? lote.conceptoDescripcion);
        grupos.set(clave, base);
        return;
      }

      const agrupado = grupos.get(clave);
      if (!agrupado) {
        return;
      }
      agrupado.cantidadCreditos += Number.isFinite(cantidadCreditos) ? cantidadCreditos : 0;
      agrupado.totalCuotas += Number.isFinite(totalCuotas) ? totalCuotas : 0;
      agrupado.totalImporte += Number.isFinite(totalImporte) ? totalImporte : 0;
      agrupado._importeCuotaSum += Number.isFinite(importePromedio) ? importePromedio : 0;
      agrupado.importePromedioCuota = agrupado._importeCuotaSum;
      registrarTipoEnGrupo(agrupado, lote.tipoCredito ?? lote.denomina ?? lote.conceptoDescripcion);

      if (fechaGeneracion && String(fechaGeneracion).trim() !== '') {
        agrupado._fechasGeneracion.add(String(fechaGeneracion).trim());
      }

      const conceptoActual = limpiarTextoPlano(agrupado.conceptoCodigo);
      const conceptoNuevo = limpiarTextoPlano(lote.conceptoCodigo);
      if (conceptoActual && conceptoNuevo && conceptoActual !== conceptoNuevo) {
        agrupado.conceptoCodigo = null;
      } else if (!conceptoActual && conceptoNuevo) {
        agrupado.conceptoCodigo = lote.conceptoCodigo;
      }

      const tipoActual = limpiarTextoPlano(agrupado.tipoCredito);
      const tipoNuevo = limpiarTextoPlano(lote.tipoCredito);
      if (tipoActual && !tipoNuevo) {
        registrarTipoEnGrupo(agrupado, tipoActual);
      }
      if (tipoNuevo) {
        registrarTipoEnGrupo(agrupado, tipoNuevo);
      }
    });

    return Array.from(grupos.values()).map((agrupado) => {
      const { _fechasGeneracion, _importeCuotaSum, _tiposCredito, ...resto } = agrupado;

      if (Number.isFinite(_importeCuotaSum)) {
        resto.importePromedioCuota = _importeCuotaSum;
      }

      if (_fechasGeneracion?.size > 1) {
        resto.fechaGeneracion = Array.from(_fechasGeneracion).join(' | ');
      } else if (_fechasGeneracion?.size === 1) {
        resto.fechaGeneracion = Array.from(_fechasGeneracion)[0];
      }

      if (_tiposCredito?.size) {
        const tiposOrdenados = Array.from(_tiposCredito).filter(Boolean);
        if (tiposOrdenados.length === 1) {
          resto.tipoCredito = tiposOrdenados[0];
        } else if (tiposOrdenados.length > 1) {
          resto.tipoCredito = Array.from(new Set(tiposOrdenados)).join(' / ');
        }
      }

      return resto;
    });
  };

  const buscarCreditosAfiliado = async (): Promise<void> => {
    const numero = limpiarTextoPlano(numeroAfiliado.value);
    const periodoIngreso = limpiarTextoPlano(periodoAfiliado.value);

    if (!numero) {
      alert('Ingrese el número de afiliado');
      return;
    }

    if (periodoIngreso && periodoIngreso.length !== 6) {
      alert('El período debe tener el formato MMYYYY');
      return;
    }

    buscandoAfiliado.value = true;
    try {
      const response = await service.fetchAfiliadoResumenLote({
        aNumero: numero,
        periodo: periodoIngreso || null,
      });

      const payload = unwrapResponse(response, {} as AnyRecord);
      const resultado = (payload as AnyRecord)?.data?.resultado ?? (payload as AnyRecord)?.resultado;
      creditosAfiliado.value = Array.isArray(resultado) ? resultado : [];
      numeroAfiliado.value = numero;
      periodoAfiliado.value = periodoIngreso;
    } catch (error) {
      console.error('Error al buscar créditos del afiliado:', error);
      creditosAfiliado.value = [];
      const message =
        // error?.response?.data?.message ??
        // error?.response?.data?.title ??
        // error?.message ??
        'Ocurrió un error al buscar los créditos del afiliado.';
      await Swal.fire({
        title: 'Búsqueda fallida',
        text: message,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
      });
    } finally {
      buscandoAfiliado.value = false;
    }
  };

  const toggleBusquedaAfiliado = () => {
    mostrarBusquedaAfiliado.value = !mostrarBusquedaAfiliado.value;
    if (!mostrarBusquedaAfiliado.value) {
      buscandoAfiliado.value = false;
    }
  };

  const buscarResumen = async (esCasaCentral: boolean): Promise<void> => {
    if (!periodo.value || periodo.value.length !== 6) {
      alert('Ingrese MMYYYY');
      return;
    }
    loading.value = true;
    loteResaltadoClave.value = null;
    try {
      const response = await service.fetchResumenLote({
        periodo: periodo.value,
        pageNumber: pageNumber.value,
        pageSize: pageSize.value,
        idDelegacion: delegacionSeleccionada.value ?? 0,
      });
      const responsePayload = unwrapResponse(response, {} as AnyRecord);
      const payload = (responsePayload as AnyRecord)?.data ?? responsePayload ?? {};
      const banderaArchivoGenerado = normalizarArchivoGenerado(
        payload?.archivoGenerado ??
          payload?.ArchivoGenerado ??
          payload?.archivo_generado ??
          (Array.isArray(payload?.resultado)
            ? payload.resultado[0]?.archivoGenerado ?? payload.resultado[0]?.ArchivoGenerado
            : null)
      );
      archivoGenerado.value = banderaArchivoGenerado === true;
      const resultado = Array.isArray(payload.resultado) ? payload.resultado : [];
      const resultadoFiltrado = esCasaCentral
        ? resultado.filter((lote: LoteResumen) => !esLoteExcluidoCasaCentral(lote, NOMBRES_LOTE_EXCLUIDOS_CASA_CENTRAL))
        : resultado;
      solicitudes.value = agruparResumenPorLote(resultadoFiltrado);
      const total =
        payload.totalRegistros ??
        payload.totalRecords ??
        payload.total ??
        payload.count ??
        payload.cantidad ??
        null;
      const parsedTotal = Number(total);
      if (Number.isFinite(parsedTotal) && parsedTotal >= 0) {
        totalRegistros.value =
          esCasaCentral && parsedTotal === resultado.length
            ? resultadoFiltrado.length
            : parsedTotal;
      } else {
        totalRegistros.value = null;
      }
    } catch (e) {
      console.error(e);
      solicitudes.value = [];
    } finally {
      loading.value = false;
      detalleBusquedaActivaId.value = null;
      limpiarBusquedaCredito();
    }
  };

  const resaltarLotePorNumero = async (
    numeroBuscado: unknown,
    nextTickFn?: (() => Promise<void>) | (() => void)
  ): Promise<void> => {
    const numeroNormalizado = Number.parseInt(String(numeroBuscado ?? '').trim(), 10);
    if (!Number.isFinite(numeroNormalizado)) {
      return;
    }
    if (nextTickFn) {
      await nextTickFn();
    }
    const loteObjetivo = solicitudes.value.find(
      (lote) => getNumeroLoteListado(lote) === numeroNormalizado
    );
    if (!loteObjetivo) {
      await Swal.fire('Lote no encontrado', 'El lote indicado no está en la página actual.', 'info');
      return;
    }
    const clave = getClaveLote(loteObjetivo);
    if (!clave) {
      return;
    }
    loteResaltadoClave.value = clave;
    if (nextTickFn) {
      await nextTickFn();
    }
    const elemento = document.querySelector(`[data-lote-key="${clave}"]`);
    if (elemento?.scrollIntoView) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    window.setTimeout(() => {
      if (loteResaltadoClave.value === clave) {
        loteResaltadoClave.value = null;
      }
    }, 1800);
  };

  const handlePageSizeChange = async (buscarResumenFn?: () => Promise<void>): Promise<void> => {
    if (loading.value) {
      return;
    }
    pageNumber.value = 1;
    goToPageInput.value = '1';
    if (buscarResumenFn) {
      await buscarResumenFn();
    }
  };

  const applyCustomPageSize = async (
    buscarResumenFn?: () => Promise<void>,
    nextTickFn?: (() => Promise<void>) | (() => void)
  ): Promise<void> => {
    if (loading.value) {
      return;
    }
    const parsed = Number.parseInt(customPageSize.value, 10);
    const numeroBuscado = Number.parseInt(numeroLoteObjetivo.value, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      customPageSize.value = String(pageSize.value ?? 1);
      return;
    }
    const sizeChanged = parsed !== pageSize.value;
    pageSize.value = parsed;
    if (sizeChanged && buscarResumenFn) {
      await handlePageSizeChange(buscarResumenFn);
    }
    if (Number.isFinite(numeroBuscado)) {
      await resaltarLotePorNumero(numeroBuscado, nextTickFn);
    }
  };

  const changePage = (step: number, buscarResumenFn?: () => Promise<void> | void): void => {
    if (loading.value) {
      return;
    }
    const target = pageNumber.value + step;
    if (target < 1) {
      return;
    }
    if (totalRegistros.value && pageSize.value) {
      const totalPages = Math.max(1, Math.ceil(totalRegistros.value / pageSize.value));
      if (target > totalPages) {
        return;
      }
    }
    pageNumber.value = target;
    if (buscarResumenFn) {
      buscarResumenFn();
    }
  };

  const goToFirstPage = (buscarResumenFn?: () => Promise<void> | void): void => {
    if (pageNumber.value <= 1 || loading.value) {
      return;
    }
    pageNumber.value = 1;
    if (buscarResumenFn) {
      buscarResumenFn();
    }
  };

  const goToLastPage = (totalPages: number, buscarResumenFn?: () => Promise<void> | void): void => {
    if (!totalPages || loading.value || pageNumber.value >= totalPages) {
      return;
    }
    pageNumber.value = totalPages;
    if (buscarResumenFn) {
      buscarResumenFn();
    }
  };

  const goToPage = (totalPages: number, buscarResumenFn?: () => Promise<void> | void): void => {
    if (loading.value) {
      return;
    }
    const parsed = Number.parseInt(goToPageInput.value, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      goToPageInput.value = String(Math.max(1, pageNumber.value));
      return;
    }
    if (totalPages && parsed > totalPages) {
      goToPageInput.value = String(totalPages);
      return;
    }
    if (parsed === pageNumber.value) {
      return;
    }
    pageNumber.value = parsed;
    if (buscarResumenFn) {
      buscarResumenFn();
    }
  };

  const cargarDetalleLote = async (
    item: AnyRecord,
    { omitLoadingState = false, throwOnError = false }: { omitLoadingState?: boolean; throwOnError?: boolean } = {}
  ): Promise<AnyRecord[]> => {
    if (!item) return [];

    const idLote = item.idLote;
    const detalleKey = getDetalleKey(item);
    const conceptoCodigo = item?.conceptoCodigo ?? item?.codigo ?? null;

    const cache = getDetalleRegistros(item);
    if (cache) {
      return cache;
    }

    if (!omitLoadingState) {
      detalleLoading.value = detalleKey;
    }

    try {
      const params: AnyRecord = {
        idLote,
        idDelegacion: delegacionSeleccionada.value || 0,
      };

      if (conceptoCodigo !== null && conceptoCodigo !== undefined && conceptoCodigo !== '') {
        params.conceptoCodigo = conceptoCodigo;
      }

      const response = await service.fetchDetalleResumenLote(params);
      if (!response.success) {
        setDetalleRegistros(item, []);
      } else {
        const payload = response.content ?? {};
        const resultado =
          (payload as AnyRecord)?.data?.resultado ??
          (payload as AnyRecord)?.resultado ??
          [];
        setDetalleRegistros(item, groupDetalleLote(resultado));
      }
    } catch (err) {
      console.error('Error al obtener detalle del lote', err);
      setDetalleRegistros(item, []);
      if (throwOnError) {
        throw err;
      }
    } finally {
      if (!omitLoadingState) {
        detalleLoading.value = null;
      }
    }

    return getDetalleRegistros(item) ?? [];
  };

  const toggleLote = async (lote: AnyRecord): Promise<void> => {
    const clave = getClaveLote(lote);
    if (!clave) return;

    if (loteExpandido.value === clave) {
      loteExpandido.value = null;
      detalleBusquedaActivaId.value = null;
      if (getClaveLote(loteParaNuevoCredito.value) === clave) {
        cerrarModalNuevoCredito();
      }
      return;
    }

    const item = solicitudes.value.find((x) => getClaveLote(x) === clave);
    if (!item) return;

    detalleBusquedaActivaId.value = null;
    loteExpandido.value = clave;
    await cargarDetalleLote(item);
  };

  const imprimirResumenGeneral = (
    periodoPG: string,
    resumenCantCreditos: number,
    resumenTotalCuotas: number,
    resumenImporteTotal: number,
    promedioGeneral: number
  ): void => {
    if (!solicitudes.value.length) {
      alert('No hay lotes para imprimir.');
      return;
    }
    if (imprimiendoResumen.value) {
      return;
    }

    imprimiendoResumen.value = true;
    try {
      const doc = new jsPDF({ orientation: 'landscape' });
      const marginLeft = 14;

      doc.setFontSize(16);
      doc.text('Resumen general de créditos', marginLeft, 18);

      doc.setFontSize(11);
      const periodoTexto = formatPeriodo(periodo.value) || '-';
      const fechaGeneracion = format(new Date(), 'dd/MM/yyyy HH:mm');

      doc.text(`Periodo: ${periodoTexto}`, marginLeft, 26);
      doc.text(`Generado: ${fechaGeneracion}`, marginLeft, 32);
      doc.text(`Total de lotes: ${solicitudes.value.length}`, marginLeft, 38);

      const resumenX = 140;
      doc.text(`Total créditos: ${resumenCantCreditos}`, resumenX, 26);
      doc.text(`Total cuotas: ${resumenTotalCuotas}`, resumenX, 32);
      doc.text(`Imp. total cuotas: $${formatCurrency(promedioGeneral)}`, resumenX, 38);
      doc.text(`Importe total: $${formatCurrency(resumenImporteTotal)}`, resumenX, 44);

      const body = solicitudes.value.map((lote) => {
        const tipo = limpiarTextoPlano(obtenerTituloTipoCredito(lote)) || '-';
        return [
          limpiarTextoPlano(lote.nropaq) || '-',
          limpiarTextoPlano(lote.codigo) || '-',
          tipo,
          Number(lote.cantidadCreditos ?? 0).toString(),
          Number(lote.totalCuotas ?? 0).toString(),
          `$${formatCurrency(lote.importePromedioCuota)}`,
          `$${formatCurrency(lote.totalImporte)}`,
        ];
      });

      autoTable(doc, {
        startY: 50,
        head: [
          [
            'Lote',
            'Código',
            'Tipo crédito',
            'Cant. créditos',
            'Total cuotas',
            'Imp. prom. cuota',
            'Importe total',
          ],
        ],
        body,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [4, 120, 87], textColor: 255 },
        alternateRowStyles: { fillColor: [236, 253, 245] },
        margin: { left: marginLeft, right: 14 },
      });

      const periodoArchivo = limpiarTextoPlano(periodo.value) || 'sin_periodo';
      doc.save(`resumen_lotes_${periodoArchivo}.pdf`);
    } catch (error) {
      console.error('Error al generar el resumen general', error);
      alert('No se pudo generar el resumen. Intente nuevamente.');
    } finally {
      imprimiendoResumen.value = false;
    }
  };

  const imprimirLote = async (item: AnyRecord): Promise<void> => {
    if (!item) return;

    loteImprimiendo.value = item.idLote;
    try {
      const detalles = await cargarDetalleLote(item, { omitLoadingState: true, throwOnError: true });

      if (!detalles || detalles.length === 0) {
        alert('No hay detalles disponibles para imprimir.');
        return;
      }

      const doc = new jsPDF({ orientation: 'landscape' });
      const marginLeft = 14;

      doc.setFontSize(16);
      doc.text(`Lote Nro ${item.nropaq}`, marginLeft, 18);

      doc.setFontSize(11);
      const periodoTexto = formatPeriodo(item.periodo ?? periodo.value) || '';
      const procesoTexto = capitalize(formatProcesoGrabacion(item.procesoGrabacion)) || '';

      doc.text(`Codigo: ${item.codigo ?? '-'}`, marginLeft, 26);
      doc.text(`Periodo: ${periodoTexto || '-'}`, marginLeft, 32);
      doc.text(`Proceso grabación: ${procesoTexto || '-'}`, marginLeft, 38);

      const rightColumnX = 160;
      doc.text(`Cant. Créditos: ${item.cantidadCreditos ?? 0}`, rightColumnX, 26);
      doc.text(`Total Cuotas: ${item.totalCuotas ?? 0}`, rightColumnX, 32);
      doc.text(`Importe Total: $${formatCurrency(item.totalImporte)}`, rightColumnX, 38);
      doc.text(`Imp. Prom. Cuota: $${formatCurrency(item.importePromedioCuota)}`, rightColumnX, 44);

      const tableBody = detalles.map((detalle) => [
        detalle.cuil ?? '',
        detalle.nombre ?? '',
        detalle.aNumero ?? '',
        detalle.subCodigo ?? '',
        detalle.nroCredito ?? '',
        detalle.cMovimiento ?? '',
        formatDateForPdf(detalle.fechaCobro),
        detalle.cuotas ?? '',
        `$${formatCurrency(detalle.importeCuota)}`,
        `$${formatCurrency(detalle.importeTotal)}`,
        detalle.tipoCredito ?? '',
      ]);

      autoTable(doc, {
        startY: 52,
        head: [
          [
            'CUIL',
            'Nombre',
            'A. Numero',
            'Sub',
            'NroCredito',
            'CM',
            'Fecha Cobro',
            'Cuotas',
            'Importe Cuota',
            'Importe Total',
            'Tipo Crédito',
          ],
        ],
        body: tableBody,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] },
        alternateRowStyles: { fillColor: [240, 244, 255] },
        margin: { left: marginLeft, right: 14 },
      });

      doc.save(`lote_${item.nropaq}.pdf`);
    } catch (err) {
      console.error('Error al generar PDF del lote', err);
      alert('No se pudo generar el PDF del lote. Intente nuevamente.');
    } finally {
      loteImprimiendo.value = null;
    }
  };

  const calcularTotalArchivo = (filas: ExcelRow[] = []): number =>
    filas.reduce((acc: number, fila: ExcelRow) => {
      const valor = Number(fila?.total ?? 0);
      return acc + (Number.isFinite(valor) ? valor : 0);
    }, 0);

  const mostrarAlerta = (titulo: string, mensaje: string, icono: any = 'info'): void => {
    Swal.fire({
      title: titulo,
      text: mensaje,
      icon: icono,
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false,
    });
  };

  const leerFilasDesdeArchivo = (file: File): Promise<unknown[][]> =>
    new Promise<unknown[][]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.onload = (ev: ProgressEvent<FileReader>) => {
        try {
          const raw = ev?.target?.result;
          if (!raw) {
            reject(new Error('El archivo está vacío.'));
            return;
          }
          const workbook = XLSX.read(new Uint8Array(raw), { type: 'array' });
          if (!workbook.SheetNames?.length) {
            reject(new Error('El archivo no contiene hojas.'));
            return;
          }
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as unknown[][];
          resolve(rows);
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Error al procesar el archivo.'));
        }
      };
      reader.readAsArrayBuffer(file);
    });

  const transformarFilasDesdeMatriz = (
    filasDatos: unknown[][] = []
  ): { filasNormalizadas: ExcelRow[]; erroresLocales: SolicitudExcelError[] } => {
    const erroresLocales: SolicitudExcelError[] = [];
    const filasNormalizadas: ExcelRow[] = [];

    filasDatos.forEach((fila: unknown[], indice: number) => {
      const numeroFila = indice + 2;
      const obtenerCelda = (pos: number): unknown => (fila[pos] !== undefined ? fila[pos] : '');

      const nroAfiliado = (() => {
        const valor = obtenerCelda(0);
        if (typeof valor === 'number') return limpiarCadena(Math.trunc(valor).toString());
        return limpiarCadena(valor);
      })();
      const nombre = limpiarCadena(obtenerCelda(1));
      const subCod = normalizarEntero(obtenerCelda(2));
      const cupon = normalizarEntero(obtenerCelda(3));
      const codMov = normalizarEntero(obtenerCelda(4));
      const fechaIso = normalizarFecha(obtenerCelda(5));
      const ctaNormalizado = normalizarEntero(obtenerCelda(6));
      const impCtaNormalizado = normalizarNumeroLatino(obtenerCelda(7));
      const totalNormalizado = normalizarNumeroLatino(obtenerCelda(8));

      if (!nroAfiliado) {
        erroresLocales.push({ fila: numeroFila, mensaje: 'El campo "N° AFILIA" es obligatorio.' });
        return;
      }
      if (cupon === null) {
        erroresLocales.push({ fila: numeroFila, mensaje: 'El campo "CUPON" es obligatorio.' });
        return;
      }
      const cta = ctaNormalizado === null ? 1 : ctaNormalizado;
      const impCta = impCtaNormalizado === null ? 0 : impCtaNormalizado;
      const total = totalNormalizado === null ? 0 : totalNormalizado;

      if (Number.isFinite(total) && total > MONTO_TOTAL_MAXIMO) {
        erroresLocales.push({
          fila: numeroFila,
          mensaje: `El campo "TOTAL" supera el máximo permitido (${intlMontos.format(MONTO_TOTAL_MAXIMO)}).`,
          codigo: 'MONTO_TOTAL_EXCEDIDO',
        });
        return;
      }

      filasNormalizadas.push({
        filaExcel: numeroFila,
        nroAfiliado,
        nombre,
        subCod,
        cupon,
        codMov,
        fecha: fechaIso,
        cta,
        impCta,
        total,
      });
    });

    return { filasNormalizadas, erroresLocales };
  };

  const procesarArchivoMasivo = async (file: File): Promise<void> => {
    if (!canManageCreditos.value) {
      return;
    }
    procesandoArchivoMasivo.value = true;
    erroresArchivoMasivo.value = [];
    datosArchivoMasivo.value = [];
    archivoMasivoSeleccionado.value = null;
    try {
      const filas = await leerFilasDesdeArchivo(file);
      if (!filas?.length) {
        mostrarAlerta('Archivo vacío', 'El archivo no contiene datos.', 'warning');
        return;
      }
      const { filasNormalizadas, erroresLocales } = transformarFilasDesdeMatriz(filas.slice(1));
      if (!filasNormalizadas.length) {
        erroresArchivoMasivo.value = erroresLocales;
        mostrarAlerta('Sin filas válidas', 'No se encontraron filas válidas en el archivo.', 'warning');
        return;
      }

      archivoMasivoSeleccionado.value = file;
      datosArchivoMasivo.value = filasNormalizadas;
      erroresArchivoMasivo.value = erroresLocales;
      totalArchivoMasivo.value = calcularTotalArchivo(filasNormalizadas);
      if (Number.isFinite(totalArchivoMasivo.value) && totalArchivoMasivo.value > MONTO_TOTAL_MAXIMO) {
        mostrarAlerta(
          'Monto total excedido',
          `El monto total del archivo (${intlMontos.format(
            totalArchivoMasivo.value
          )}) supera el límite permitido de ${intlMontos.format(MONTO_TOTAL_MAXIMO)}.`,
          'warning'
        );
      }
      await cargarPeriodosImputacion();
      periodoProcesoSeleccionado.value = '';
      mostrarModalCargaMasiva.value = true;
    } catch (error) {
      console.error('Error procesando archivo masivo', error);
      const mensajeError = 'No se pudo procesar el archivo.';
      mostrarAlerta('Error al procesar', mensajeError, 'error');
    } finally {
      procesandoArchivoMasivo.value = false;
    }
  };

  const resetCargaMasiva = ({ keepNombreArchivo = false }: { keepNombreArchivo?: boolean } = {}): void => {
    datosArchivoMasivo.value = [];
    erroresArchivoMasivo.value = [];
    archivoMasivoSeleccionado.value = null;
    totalArchivoMasivo.value = 0;
    mostrarModalCargaMasiva.value = false;
    descripcionCredito.value = '';
    periodoProcesoSeleccionado.value = '';
    if (!keepNombreArchivo) {
      nombreArchivoMasivo.value = '';
    }
    if (archivoMasivoInput.value) {
      archivoMasivoInput.value.value = '';
    }
  };

  const abrirSelectorArchivoMasivo = () => {
    if (!canManageCreditos.value) {
      return;
    }
    if (archivoMasivoInput.value) {
      archivoMasivoInput.value.value = '';
      archivoMasivoInput.value.click();
    }
  };

  const manejarArchivoMasivo = async (event: any): Promise<void> => {
    if (!canManageCreditos.value) {
      return;
    }
    const file = event?.target?.files?.[0];
    if (!file) {
      return;
    }
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const extensionesPermitidas = ['xlsx', 'xls', 'csv'];
    if (!extensionesPermitidas.includes(extension)) {
      mostrarAlerta('Formato no soportado', 'Seleccione un archivo Excel o CSV.', 'warning');
      if (event?.target) {
        event.target.value = '';
      }
      nombreArchivoMasivo.value = '';
      return;
    }
    nombreArchivoMasivo.value = file.name;
    await procesarArchivoMasivo(file);
    if (event?.target) {
      event.target.value = '';
    }
  };

  const cerrarModalCargaMasiva = () => {
    resetCargaMasiva();
  };

  const impactarCreditosMasivos = async (
    periodoImputacionActualCodigo: string,
    periodosImputacionOrdenados: PeriodoProcesoItem[]
  ): Promise<void> => {
    if (!canManageCreditos.value) {
      return;
    }

    if (!datosArchivoMasivo.value.length) {
      mostrarAlerta('Sin datos', 'No hay datos para impactar.', 'warning');
      return;
    }

    impactandoArchivoMasivo.value = true;

    try {
      let filasParaImpactar = datosArchivoMasivo.value;

      if (archivoMasivoSeleccionado.value) {
        try {
          const filas = await leerFilasDesdeArchivo(archivoMasivoSeleccionado.value);
          const { filasNormalizadas, erroresLocales } = transformarFilasDesdeMatriz(filas.slice(1));
          erroresArchivoMasivo.value = erroresLocales;
          if (filasNormalizadas.length) {
            filasParaImpactar = filasNormalizadas;
            datosArchivoMasivo.value = filasNormalizadas;
            totalArchivoMasivo.value = calcularTotalArchivo(filasNormalizadas);
          }
        } catch (reprocessError) {
          console.warn(
            'No se pudo reprocesar el archivo seleccionado. Se usará la vista previa existente.',
            reprocessError
          );
        }
      }

      if (Number.isFinite(totalArchivoMasivo.value) && totalArchivoMasivo.value > MONTO_TOTAL_MAXIMO) {
        mostrarAlerta(
          'Monto excedido',
          `El monto total del archivo (${intlMontos.format(
            totalArchivoMasivo.value
          )}) supera el límite de ${intlMontos.format(MONTO_TOTAL_MAXIMO)}. Ajusta el archivo antes de impactar.`,
          'error'
        );
        return;
      }

      const { registros, errores } = construirRegistrosSolicitudExcel(filasParaImpactar, intlMontos);

      if (errores.length) {
        erroresArchivoMasivo.value = errores;
        const mensajeErrores = errores.some((error) => error?.codigo === 'MONTO_TOTAL_EXCEDIDO')
          ? `Hay registros con "TOTAL" mayor a ${intlMontos.format(MONTO_TOTAL_MAXIMO)}. Corregí esos montos antes de impactar.`
          : 'Revisá las filas indicadas antes de impactar.';
        mostrarAlerta('Error en datos', mensajeErrores, 'error');
        return;
      }

      if (!registros.length) {
        mostrarAlerta('Sin datos', 'No hay registros válidos para impactar.', 'warning');
        return;
      }

      const descripcionNormalizada = (descripcionCredito.value ?? '').trim();
      if (!descripcionNormalizada) {
        await Swal.fire({
          title: 'Descripción vacía',
          text: 'No ingresaste una descripción. Se enviará vacía al impactar los créditos.',
          icon: 'warning',
          confirmButtonText: 'Continuar',
          allowOutsideClick: false,
        });
      }

      const periodoIngresado = (periodoProcesoSeleccionado.value ?? '').trim();
      if (!periodoIngresado) {
        mostrarAlerta('Período requerido', 'Ingresa el período en formato MMYYYY antes de impactar.', 'warning');
        return;
      }

      const codigoPeriodoSeleccionado = normalizarPeriodoCodigo(periodoIngresado);

      if (!esPeriodoCodigoValido(codigoPeriodoSeleccionado)) {
        mostrarAlerta(
          'Período inválido',
          'El período debe tener 6 dígitos en formato MMYYYY (ej: 082024) con un mes válido.',
          'error'
        );
        return;
      }
      const periodoSeleccionado =
        periodosImputacionOrdenados.find((p) => p.codigo === codigoPeriodoSeleccionado) ||
        (codigoPeriodoSeleccionado
          ? {
              codigo: codigoPeriodoSeleccionado,
              nombre: formatPeriodo(codigoPeriodoSeleccionado) || codigoPeriodoSeleccionado,
              cerrado: false,
              estado: 'Abierto',
              sortValue: parsePeriodoSortValue(codigoPeriodoSeleccionado),
            }
          : null);

      const periodoCerrado = await validarPeriodoCerradoRemoto(codigoPeriodoSeleccionado);
      if (periodoCerrado || periodoSeleccionado?.cerrado) {
        mostrarAlerta(
          'Período cerrado',
          'No se puede cargar en un período cerrado (archivo generado). Elegí un período abierto antes de impactar.',
          'error'
        );
        return;
      }

      if (
        periodoImputacionActualCodigo &&
        codigoPeriodoSeleccionado !== periodoImputacionActualCodigo &&
        periodoSeleccionado
      ) {
        const etiqueta = construirEtiquetaPeriodo(periodoSeleccionado, { incluirEstado: true, incluirActual: false });
        const esAnterior = compararPeriodos(codigoPeriodoSeleccionado, periodoImputacionActualCodigo) < 0;
        const { isConfirmed } = await Swal.fire({
          title: 'Confirmar período de imputación',
          text: `Los datos se cargarán en el período ${etiqueta}. ¿Es correcto?`,
          icon: esAnterior ? 'warning' : 'info',
          showCancelButton: true,
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'Cancelar',
          allowOutsideClick: false,
        });
        if (!isConfirmed) {
          return;
        }
      }

      const payloadImpacto = {
        descripcionCredito: descripcionNormalizada || '',
        periodoImputacion: codigoPeriodoSeleccionado,
        periodoProceso: codigoPeriodoSeleccionado,
        registros,
      };

      const response = await service.procesarSolicitudExcel(payloadImpacto);
      const data = response.content ?? {};
      const success = (data as AnyRecord)?.success ?? (data as AnyRecord)?.Success ?? response.success ?? false;
      const errorFlag = (data as AnyRecord)?.error ?? (data as AnyRecord)?.Error ?? false;
      const message = (data as AnyRecord)?.message ?? (data as AnyRecord)?.Message ?? 'Proceso completado con éxito.';
      const detalleRespuesta = (data as AnyRecord)?.data ?? null;

      if (errorFlag || !success) {
        let detalleTexto = '';

        if (Array.isArray(detalleRespuesta) && detalleRespuesta.length) {
          detalleTexto = detalleRespuesta
            .map((item) => (typeof item === 'string' ? item : JSON.stringify(item)))
            .join('; ');
        } else if (detalleRespuesta && typeof detalleRespuesta === 'object') {
          detalleTexto = JSON.stringify(detalleRespuesta);
        } else if (typeof detalleRespuesta === 'string') {
          detalleTexto = detalleRespuesta;
        }

        const mensajeFinal = [message, detalleTexto].filter(Boolean).join('\n\n');
        mostrarAlerta('Impacto fallido', mensajeFinal || 'El servicio devolvió una respuesta negativa.', 'error');

        return;
      }

      mostrarAlerta('Impacto completado', message, 'success');

      resetCargaMasiva();

      await buscarResumen(true /* esCasaCentral */);
    } catch (error) {
      console.error('Error al impactar créditos desde Excel', error);

      const mensajeError =
        // error?.customMessage ??
        // error?.response?.data?.message ??
        // error?.message ??
        'Ocurrió un error al impactar los créditos.';

      mostrarAlerta('Error', mensajeError, 'error');
    } finally {
      impactandoArchivoMasivo.value = false;
    }
  };

  const obtenerIdLoteDetalle = async (
    conceptoCodigo: number,
    periodoDesdeDatos?: string | null
  ): Promise<number> => {
    const periodoActual = (periodoDesdeDatos ?? (periodo.value ?? '')).trim();
    if (!periodoActual) {
      throw new Error('Debe ingresar el período de proceso para impactar créditos.');
    }
    const cacheKey = `${conceptoCodigo}__${periodoActual}`;
    const cached = cacheIdLoteDetalle.get(cacheKey);
    if (cached != null) {
      return cached;
    }
    console.info('Consultando IdLoteDetalle para concepto', conceptoCodigo, 'periodo', periodoActual);
    const response = await service.fetchIdLoteDetalle({
      codigoConcepto: conceptoCodigo,
      periodo: periodoActual,
    });
    const data = response.content as AnyRecord | undefined;
    if (!response.success || !data?.data?.idLoteDetalle) {
      throw new Error(`No se pudo obtener IdLoteDetalle para el concepto ${conceptoCodigo} y período ${periodoActual}.`);
    }
    cacheIdLoteDetalle.set(cacheKey, data.data.idLoteDetalle);
    return data.data.idLoteDetalle;
  };

  const obtenerIdAfiliadoPorNumero = async (numeroAfiliadoParam: string): Promise<number> => {
    const numeroLimpio = (numeroAfiliadoParam ?? '').trim();
    if (!numeroLimpio) {
      throw new Error('Número de afiliado vacío.');
    }
    console.info('Consultando idAfiliado para', numeroLimpio);
    const response = await service.fetchAfiliadoByNumero({ ANumero: numeroLimpio });
    const data = response.content as AnyRecord | undefined;
    if (!response.success || !Array.isArray(data?.data) || data.data.length === 0) {
      throw new Error(`No se encontró idAfiliado para el número ${numeroLimpio}.`);
    }
    const afiliado = data.data[0];
    const idAfiliado = normalizarId(afiliado?.idAfiliado);
    if (idAfiliado == null) {
      throw new Error(`Respuesta sin idAfiliado para el número ${numeroLimpio}.`);
    }
    return idAfiliado;
  };

  const validarNuevoCredito = () => {
    const n = nuevoCredito.value;
    if (!n.numeroAfiliado?.toString().trim()) return 'Falta Número Afiliado';
    const numeroCredito = Number.parseInt(n.numeroCredito, 10);
    if (!Number.isFinite(numeroCredito) || numeroCredito <= 0) return 'Falta Número de crédito';
    if (!n.subCod?.toString().trim()) return 'Falta SubCod';
    if (!n.codMov?.toString().trim()) return 'Falta Cod Mov';
    const cuotas = Number(n.cantCuotas);
    if (!Number.isFinite(cuotas) || cuotas <= 0) return 'Falta Cant Cuotas';
    const importeCuota = parseDecimal(n.importeCuota);
    if (!Number.isFinite(importeCuota) || importeCuota <= 0) return 'Falta Importe Cuota';
    if (!n.fechaPrimerVencimiento) return 'Falta Fecha Primer Vencimiento';
    return null;
  };

  const grabarNuevoCredito = async () => {
    if (!canManageCreditos.value) {
      return;
    }
    const loteSeleccionado = loteParaNuevoCredito.value;
    if (!loteSeleccionado) {
      alert('Debe seleccionar un lote para agregar un crédito.');
      return;
    }

    const err = validarNuevoCredito();
    if (err) {
      alert(err);
      return;
    }

    const numeroAfiliadoLocal = nuevoCredito.value.numeroAfiliado.trim();
    const cuotas = Number(nuevoCredito.value.cantCuotas || 1);
    const idAutoriza = Number.parseInt(nuevoCredito.value.numeroCredito, 10);
    const importeCuota = parseDecimal(nuevoCredito.value.importeCuota);
    if (!Number.isFinite(importeCuota) || importeCuota <= 0) {
      alert('El importe de cuota debe ser un número válido mayor a 0.');
      return;
    }
    const importeTotalManual = parseDecimal(nuevoCredito.value.importeTotalCredito);
    const importeTotalPrecalculado = parseDecimal(nuevoCredito.value.totalImpCuotas);
    let importeTotal = Number.isFinite(importeTotalManual) && importeTotalManual > 0
      ? importeTotalManual
      : Number.isFinite(importeTotalPrecalculado) && importeTotalPrecalculado > 0
        ? importeTotalPrecalculado
        : Number((importeCuota * cuotas).toFixed(2));
    if (!Number.isFinite(importeTotal) || importeTotal <= 0) {
      importeTotal = Number((importeCuota * cuotas).toFixed(2));
    }
    const importeCuotaNormalizado = Number(importeCuota.toFixed(2));
    const importeTotalNormalizado = Number(importeTotal.toFixed(2));
    const filaBase = {
      fecha: nuevoCredito.value.fechaPrimerVencimiento,
      cta: cuotas,
      impCta: importeCuotaNormalizado,
      total: importeTotalNormalizado,
      subCod: nuevoCredito.value.subCod,
      codMov: nuevoCredito.value.codMov,
    };
    const creditoMigracion = (nuevoCredito.value.creditoMigracion ?? '').trim();

    guardando.value = true;
    try {
      const conceptoCodigo = determinarConceptoCodigo(filaBase);
      const idAfiliado = await obtenerIdAfiliadoPorNumero(numeroAfiliadoLocal);
      const idLoteDestino = normalizarId(idLoteDetalleNuevoCredito.value);
      if (idLoteDestino == null) {
        alert('No se pudo determinar el Id Lote del paquete seleccionado.');
        guardando.value = false;
        return;
      }
      const payload = construirPayloadSolicitarCredito(
        idAfiliado,
        [filaBase],
        conceptoCodigo.toString(),
        idLoteDestino,
        creditoMigracion,
        idAutoriza
      );
      if (loteSeleccionado?.denomina) {
        payload.denomina = loteSeleccionado.denomina;
      }

      const response = await service.solicitarCredito(payload);
      const data = response.content as AnyRecord | undefined;
      if (!response.success || data?.error || data?.success === false) {
        throw new Error(data?.descripcionError ?? data?.message ?? 'No se pudo solicitar el crédito.');
      }

      await Swal.fire({
        title: 'Crédito creado',
        text: data?.message ?? 'El crédito fue solicitado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
      });

      cerrarModalNuevoCredito();

      if (normalizarId(loteSeleccionado?.idLote) != null) {
        setDetalleRegistros(loteSeleccionado, null);
        try {
          await cargarDetalleLote(loteSeleccionado, { omitLoadingState: true });
        } catch (detalleError) {
          console.error('No se pudo recargar el detalle del lote', detalleError);
        }
      }

      await buscarResumen( true /* esCasaCentral */ );
    } catch (error) {
      console.error('Error al solicitar crédito', error);
      const message =
        // error?.customMessage ??
        // error?.response?.data?.message ??
        // error?.response?.data?.title ??
        // error?.message ??
        'Ocurrió un error al solicitar el crédito.';
      await Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
      });
    } finally {
      guardando.value = false;
    }
  };

  const abrirModalNuevoCredito = async (lote: AnyRecord): Promise<void> => {
    if (!canManageCreditos.value) {
      return;
    }
    loteParaNuevoCredito.value = lote ?? null;
    resetNuevoCredito(lote ?? null);
    idLoteDetalleNuevoCredito.value = obtenerIdLoteDetalleDesdeLote(lote ?? null);
    const clave = getClaveLote(lote);
    if (clave) {
      loteExpandido.value = clave;
    }
    const idLoteDestino = lote?.idLote ?? null;
    if (idLoteDestino && !Array.isArray(getDetalleRegistros(lote))) {
      try {
        await cargarDetalleLote(lote);
      } catch (error) {
        console.error('No se pudo cargar el detalle del lote antes de crear el crédito', error);
      }
      if (idLoteDetalleNuevoCredito.value == null) {
        idLoteDetalleNuevoCredito.value = obtenerIdLoteDetalleDesdeLote(lote ?? null);
      }
    }
    mostrarModalNuevoCredito.value = true;
  };

  const cerrarModalNuevoCredito = () => {
    mostrarModalNuevoCredito.value = false;
    loteParaNuevoCredito.value = null;
    idLoteDetalleNuevoCredito.value = null;
    resetNuevoCredito();
  };

  const buscar = (texto: string): void => {
    coincidencias = [];
    indiceActual = -1;

    const textoBuscado = (texto ?? '').trim();
    if (!textoBuscado) return;

    const elementos = document.querySelectorAll('*');

    elementos.forEach((el) => {
      const contenido = el.textContent ?? '';
      if (el.children.length === 0 && contenido.includes(textoBuscado)) {
        coincidencias.push(el);
      }
    });

    irAlSiguiente();
  };

  const irAlSiguiente = () => {
    if (!coincidencias.length) return;

    indiceActual = (indiceActual + 1) % coincidencias.length;

    coincidencias[indiceActual].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const cargarPeriodosImputacion = async () => {
    if (cargandoPeriodosImputacion.value) {
      return;
    }
    cargandoPeriodosImputacion.value = true;
    try {
      const fallbackCodigo =
        normalizarPeriodoCodigo(periodo.value) ?? normalizarPeriodoCodigo(inferirPeriodoDesdeFilas(datosArchivoMasivo.value));
      if (fallbackCodigo) {
        periodosImputacion.value = [
          {
            codigo: fallbackCodigo,
            nombre: formatPeriodo(fallbackCodigo) || fallbackCodigo,
            estado: 'Abierto',
            cerrado: false,
            abierto: true,
            esActual: true,
            sortValue: parsePeriodoSortValue(fallbackCodigo),
          },
        ];
      } else {
        periodosImputacion.value = [];
      }
    } finally {
      cargandoPeriodosImputacion.value = false;
    }
  };

  const validarPeriodoCerradoRemoto = async (codigoPeriodo: string): Promise<boolean> => {
    if (!esPeriodoCodigoValido(codigoPeriodo)) {
      periodoProcesoCerrado.value = false;
      return false;
    }
    ultimaConsultaPeriodo.value = codigoPeriodo;
    try {
      const response = await service.fetchPeriodoCerrado({ periodo: codigoPeriodo });
      const responsePayload = unwrapResponse(response, {} as AnyRecord);
      const payload = (responsePayload as AnyRecord)?.data ?? responsePayload ?? {};
      const cerrado =
        payload?.resultado === true ||
        normalizarArchivoGenerado(
          payload?.archivoGenerado ?? payload?.ArchivoGenerado ?? payload?.archivo_generado ?? null
        ) ||
        payload?.cerrado === true ||
        (typeof payload?.estado === 'string' && payload.estado.toLowerCase().includes('cerrado'));
      if (ultimaConsultaPeriodo.value === codigoPeriodo) {
        periodoProcesoCerrado.value = Boolean(cerrado);
      }
      return periodoProcesoCerrado.value;
    } catch (error) {
      console.warn('No se pudo validar el estado del período', error);
      if (ultimaConsultaPeriodo.value === codigoPeriodo) {
        periodoProcesoCerrado.value = false;
      }
      return false;
    }
  };

  const obtenerUserRoles = () => getUserRoles();

  const puedeGestionarCreditos = (roles: unknown, procesoCerrado: boolean): boolean =>
    userHasRole(['Admin', 'Administrador', 'Supervisor de Creditos'], roles as any) && !procesoCerrado;

  const capitalize = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

  return {
    solicitudes,
    periodo,
    loading,
    loteExpandido,
    detalleLote,
    loteDetalleSeleccionadoKey,
    detalleLoading,
    mostrarModalDetalleCredito,
    mostrarModalEdicion,
    detalleModalFilas,
    detalleModalCargando,
    loteImprimiendo,
    imprimiendoResumen,
    numeroAfiliado,
    periodoAfiliado,
    creditosAfiliado,
    buscandoAfiliado,
    pageNumber,
    pageSize,
    totalRegistros,
    customPageSize,
    goToPageInput,
    numeroLoteObjetivo,
    loteResaltadoClave,
    archivoGenerado,
    mostrarBusquedaAfiliado,
    mostrarModalBusquedaCredito,
    numeroCreditoBusqueda,
    resultadosBusquedaCredito,
    buscandoCreditoPorNumero,
    errorBusquedaCredito,
    detalleBusquedaActivaId,
    mostrarModalAuditoria,
    auditoriaTabActiva,
    afiliadosFallecidos,
    cargandoAfiliadosFallecidos,
    errorAfiliadosFallecidos,
    ultimaConsultaFallecidos,
    periodoConsultaFallecidos,
    creditosAnulados,
    cargandoCreditosAnulados,
    errorCreditosAnulados,
    ultimaConsultaCreditosAnulados,
    periodoConsultaCreditosAnulados,
    mostrarModalNuevoCredito,
    archivoMasivoInput,
    archivoMasivoSeleccionado,
    nombreArchivoMasivo,
    mostrarModalCargaMasiva,
    datosArchivoMasivo,
    erroresArchivoMasivo,
    procesandoArchivoMasivo,
    impactandoArchivoMasivo,
    totalArchivoMasivo,
    periodosImputacion,
    periodoProcesoSeleccionado,
    cargandoPeriodosImputacion,
    delegaciones,
    descripcionCredito,
    delegacionSeleccionada,
    selectedCreditoId,
    selectedDetalleCreditoId,
    detalleSeleccionado,
    editLoading,
    anulandoCreditoId,
    nuevoCredito,
    loteParaNuevoCredito,
    idLoteDetalleNuevoCredito,
    periodoProcesoCerrado,
    ultimaConsultaPeriodo,
    guardando,
    canManageCreditos,
    editForm,
    pageSizeOptions,
    intlMontos,
    intlEnteros,
    fetchDelegaciones,
    setCanManageCreditos,
    setCustomPageSizeFromValue,
    setGoToPageInputFromValue,
    resetNuevoCredito,
    esLoteDestinoNuevoCredito,
    resolveUsuarioModificacion,
    getDetalleKey,
    getDetalleRegistros,
    setDetalleRegistros,
    obtenerLotePorClave,
    recargarLotePorClave,
    obtenerIdLoteDetalleDesdeLote,
    detalleModalAgrupado,
    groupDetalleLote,
    esDetalleSeleccionado,
    seleccionarDetalle,
    abrirModalDetalleCredito,
    cerrarModalDetalleCredito,
    handleRowDetalleClick,
    cancelarEdicionDetalle,
    guardarEdicionDetalle,
    confirmarAnulacion,
    esDetalleAnulando,
    limpiarBusquedaCredito,
    abrirModalBusquedaCredito,
    cerrarModalBusquedaCredito,
    buscarCreditoPorNumero,
    esDetalleCoincidenciaBusqueda,
    enfocarResultadoBusqueda,
    cargarCreditosAnulados,
    abrirModalAuditoria,
    cambiarTabAuditoria,
    cerrarModalAuditoria,
    abrirModalCreditosAnulados,
    cargarAfiliadosFallecidos,
    agruparResumenPorLote,
    buscarCreditosAfiliado,
    toggleBusquedaAfiliado,
    buscarResumen,
    resaltarLotePorNumero,
    handlePageSizeChange,
    applyCustomPageSize,
    changePage,
    goToFirstPage,
    goToLastPage,
    goToPage,
    cargarDetalleLote,
    toggleLote,
    imprimirResumenGeneral,
    imprimirLote,
    calcularTotalArchivo,
    mostrarAlerta,
    leerFilasDesdeArchivo,
    transformarFilasDesdeMatriz,
    procesarArchivoMasivo,
    resetCargaMasiva,
    abrirSelectorArchivoMasivo,
    manejarArchivoMasivo,
    cerrarModalCargaMasiva,
    impactarCreditosMasivos,
    obtenerIdLoteDetalle,
    obtenerIdAfiliadoPorNumero,
    validarNuevoCredito,
    grabarNuevoCredito,
    abrirModalNuevoCredito,
    cerrarModalNuevoCredito,
    buscar,
    irAlSiguiente,
    cargarPeriodosImputacion,
    validarPeriodoCerradoRemoto,
    obtenerUserRoles,
    puedeGestionarCreditos,
    obtenerTituloTipoCredito,
    capitalize,
    getClaveLote,
    getNumeroLoteListado,
    getEstilosCodigo,
    limpiarTextoPlano,
    normalizarNombreDelegacion,
    formatProcesoGrabacion,
    formatPeriodo,
    formatCurrency,
    formatPercentage,
    formatDateForPdf,
    formatCuotas,
    obtenerNumeroLoteCredito,
    obtenerValorVistaPrevia,
    CABECERAS_ARCHIVO,
    CABECERAS_ARCHIVO_DISPLAY,
    MAPEO_COLUMNAS_PREVIEW,
    MONTO_TOTAL_MAXIMO,
  };
});
