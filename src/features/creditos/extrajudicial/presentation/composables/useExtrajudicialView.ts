import { computed, onMounted, watch } from 'vue';
import {
  formatPeriodo,
  normalizarNombreDelegacion,
  limpiarTextoPlano,
  normalizarPeriodoProcesoItem,
  normalizarPeriodoCodigo,
  inferirPeriodoDesdeFilas,
  parsePeriodoSortValue,
  esPeriodoCodigoValido,
  MONTO_TOTAL_MAXIMO,
} from '../../application/use-cases/utils';
import { useExtrajudicialStore } from '../stores/useExtrajudicialStore';
import type { DelegacionItem, PeriodoProcesoItem } from '../../domain/models/types';

export const useExtrajudicialView = () => {
  const store = useExtrajudicialStore();

  const userRoles = computed(() => store.obtenerUserRoles());
  const procesoGrabacionCerrado = computed(() => Boolean(store.archivoGenerado));
  const canManageCreditos = computed(() =>
    store.puedeGestionarCreditos(userRoles.value, procesoGrabacionCerrado.value)
  );

  const totalPages = computed(() => {
    const total = Number(store.totalRegistros ? store.totalRegistros : 0);
    const size = Number(store.pageSize ?? 0);
    if (!total || !size) {
      return null;
    }
    return Math.max(1, Math.ceil(total / size));
  });

  const canGoPrev = computed(() => store.pageNumber > 1);
  const canGoNext = computed(() => {
    if (totalPages.value) {
      return store.pageNumber < totalPages.value;
    }
    return store.solicitudes.length === store.pageSize;
  });

  const pageStatusText = computed(() => {
    const current = store.pageNumber;
    const total = totalPages.value;
    if (total) {
      return `Pagina ${current} de ${total}`;
    }
    return `Pagina ${current}`;
  });

  const showCustomPageSizeOption = computed(() => {
    const size = Number(store.pageSize ?? 0);
    return Number.isFinite(size) && size > 0 && !store.pageSizeOptions.includes(size);
  });

  const periodoPG = computed(() => formatPeriodo(store.periodo));

  const delegacionesConTodas = computed(() => [
    { idDelegacion: null, nombre: 'Todas' },
    ...(((store.delegaciones ?? []) as DelegacionItem[]) || []),
  ] as DelegacionItem[]);

  const nombreDelegacionSeleccionada = computed(() => {
    const selectedId = store.delegacionSeleccionada?.value;
    if (selectedId == null || String(selectedId).trim() === '') {
      return '';
    }
    const selectedKey = String(selectedId).trim();
    const delegacion = (((store.delegaciones ?? []) as DelegacionItem[]) || []).find((item) => {
      const itemId = item?.idDelegacion ?? item?.id ?? item?.codigo;
      if (itemId == null) {
        return false;
      }
      return String(itemId).trim() === selectedKey;
    });
    return limpiarTextoPlano(delegacion?.nombre);
  });

  const esCasaCentral = computed(
    () => normalizarNombreDelegacion(nombreDelegacionSeleccionada.value) === 'CASA CENTRAL'
  );

  const periodoAuditoriaActivo = computed(() =>
    store.auditoriaTabActiva === 'creditos'
      ? formatPeriodo(store.periodoConsultaCreditosAnulados) ||
        store.periodoConsultaCreditosAnulados ||
        'Sin periodo'
      : formatPeriodo(store.periodoConsultaFallecidos) ||
        store.periodoConsultaFallecidos ||
        'Sin periodo'
  );

  const pageRangeLabel = computed(() => {
    if (!store.solicitudes.length) {
      return '';
    }
    const size = Number(store.pageSize ?? 0);
    const current = Number(store.pageNumber ?? 1);
    if (!size || !current) {
      return '';
    }
    const startIndex = (current - 1) * size + 1;
    const endIndex = startIndex + store.solicitudes.length - 1;
    const total = Number(store.totalRegistros ?? 0);
    if (total) {
      return `Mostrando ${startIndex}-${Math.min(endIndex, total)} de ${total} registros`;
    }
    return `Mostrando ${startIndex}-${endIndex} registros`;
  });

  const resumenTotalCuotas = computed(() =>
    store.solicitudes.reduce((sum, item) => sum + Number(item.totalCuotas ?? 0), 0)
  );
  const resumenCantCreditos = computed(() =>
    store.solicitudes.reduce((sum, item) => sum + Number(item.cantidadCreditos ?? 0), 0)
  );
  const resumenImporteTotal = computed(() =>
    store.solicitudes.reduce((sum, item) => sum + Number(item.totalImporte ?? 0), 0)
  );
  const promedioGeneral = computed(() =>
    store.solicitudes.reduce((sum, item) => sum + Number(item.importePromedioCuota ?? 0), 0)
  );

  const periodosImputacionOrdenados = computed<PeriodoProcesoItem[]>(() =>
    (store.periodosImputacion ?? [])
      .map((item) => normalizarPeriodoProcesoItem(item))
      .filter((item): item is PeriodoProcesoItem => Boolean(item))
      .sort((a, b) => (b.sortValue ?? 0) - (a.sortValue ?? 0))
  );

  const periodoImputacionActualCodigo = computed(() => {
    const periodoFormulario = normalizarPeriodoCodigo(store.periodo);
    if (periodoFormulario) return periodoFormulario;
    const inferido = normalizarPeriodoCodigo(inferirPeriodoDesdeFilas(store.datosArchivoMasivo));
    if (inferido) return inferido;
    return periodosImputacionOrdenados.value[0]?.codigo ?? null;
  });

  const periodoImputacionSeleccionadoData = computed(
    () =>
      periodosImputacionOrdenados.value.find(
        (item) => item.codigo === normalizarPeriodoCodigo(store.periodoProcesoSeleccionado)
      ) || null
  );

  const periodoProcesoNormalizado = computed(() =>
    normalizarPeriodoCodigo(store.periodoProcesoSeleccionado)
  );
  const periodoProcesoValido = computed(() => esPeriodoCodigoValido(periodoProcesoNormalizado.value));
  const periodoProcesoError = computed(() => {
    const texto = (store.periodoProcesoSeleccionado ?? '').trim();
    if (!texto) {
      return 'Ingresa el periodo en formato MMYYYY para impactar los datos.';
    }
    if (!periodoProcesoValido.value) {
      return 'Formato invalido. Usa MMYYYY (ej: 082024) con un mes entre 01 y 12.';
    }
    return '';
  });
  const periodoProcesoSugerido = computed(() => {
    const codigo = periodoImputacionActualCodigo.value;
    if (!codigo) return '';
    return formatPeriodo(codigo) || codigo;
  });

  const excedeMontoTotalArchivo = computed(
    () => Number.isFinite(store.totalArchivoMasivo) && store.totalArchivoMasivo > MONTO_TOTAL_MAXIMO
  );

  const syncPeriodoOnChange = () => {
    store.ultimaConsultaFallecidos = null;
    store.afiliadosFallecidos = [];
    store.errorAfiliadosFallecidos = '';
    store.periodoConsultaFallecidos = '';
  };

  const syncProcesoGrabacionCerrado = (isClosed: boolean): void => {
    if (!isClosed) {
      return;
    }
    store.mostrarModalNuevoCredito = false;
    store.mostrarModalEdicion = false;
    store.mostrarModalCargaMasiva = false;
    store.selectedCreditoId ? store.selectedCreditoId : null;
    store.selectedDetalleCreditoId ? store.selectedDetalleCreditoId : null;
    store.detalleSeleccionado ? store.detalleSeleccionado : null;
    store.loteParaNuevoCredito ? store.loteParaNuevoCredito : null;
    store.idLoteDetalleNuevoCredito ? store.idLoteDetalleNuevoCredito : null;
  };

  onMounted(() => {
    store.fetchDelegaciones();
  });

  watch(canManageCreditos, (value) => {
    store.setCanManageCreditos(value);
  }, { immediate: true });

  watch(store.pageNumber, (value) => {
    store.setGoToPageInputFromValue(value);
  });

  watch(store.pageSize, (value) => {
    store.setCustomPageSizeFromValue(value);
  });

  watch(store.periodo, () => {
    syncPeriodoOnChange();
  });

  watch(procesoGrabacionCerrado, (value) => {
    syncProcesoGrabacionCerrado(value);
  });

  watch(periodoProcesoNormalizado, async (codigo) => {
    store.periodoProcesoCerrado = false;
    if (!codigo) {
      return;
    }
    await store.validarPeriodoCerradoRemoto(codigo);
  });

  const periodoProcesoSortValue = computed(() => parsePeriodoSortValue(periodoProcesoNormalizado.value));

  return {
    store,
    userRoles,
    procesoGrabacionCerrado,
    canManageCreditos,
    totalPages,
    canGoPrev,
    canGoNext,
    pageStatusText,
    showCustomPageSizeOption,
    periodoPG,
    delegacionesConTodas,
    nombreDelegacionSeleccionada,
    esCasaCentral,
    periodoAuditoriaActivo,
    pageRangeLabel,
    resumenTotalCuotas,
    resumenCantCreditos,
    resumenImporteTotal,
    promedioGeneral,
    periodosImputacionOrdenados,
    periodoImputacionActualCodigo,
    periodoImputacionSeleccionadoData,
    periodoProcesoNormalizado,
    periodoProcesoValido,
    periodoProcesoError,
    periodoProcesoSugerido,
    excedeMontoTotalArchivo,
    periodoProcesoSortValue,
  };
};
