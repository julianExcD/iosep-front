<script setup>
import { computed, nextTick } from 'vue';
import Dropdown from 'primevue/dropdown';
import sanJuanBg from '@/assets/logos-siscred/SanJUAN.png';
import { useExtrajudicialView } from '../composables/useExtrajudicialView';
import {
  CABECERAS_ARCHIVO_DISPLAY,
  MAPEO_COLUMNAS_PREVIEW,
  MONTO_TOTAL_MAXIMO,
  formatCurrency,
  formatDateForPdf,
  formatCuotas,
  formatPeriodo,
  formatPercentage,
  formatProcesoGrabacion,
  getClaveLote,
  getDetalleId,
  getEstilosCodigo,
  getNumeroLoteListado,
  limpiarTextoPlano,
  obtenerNumeroLoteCredito,
} from '../../application/use-cases/utils';

const {
  store,
  procesoGrabacionCerrado,
  canManageCreditos,
  totalPages,
  canGoPrev,
  canGoNext,
  pageStatusText,
  showCustomPageSizeOption,
  periodoPG,
  delegacionesConTodas,
  esCasaCentral,
  periodoAuditoriaActivo,
  pageRangeLabel,
  resumenTotalCuotas,
  resumenCantCreditos,
  resumenImporteTotal,
  promedioGeneral,
  periodosImputacionOrdenados,
  periodoImputacionActualCodigo,
  periodoProcesoNormalizado,
  periodoProcesoError,
  periodoProcesoSugerido,
  excedeMontoTotalArchivo,
} = useExtrajudicialView();

const {
  solicitudes,
  periodo,
  loading,
  loteExpandido,
  detalleLote,
  detalleLoading,
  loteImprimiendo,
  imprimiendoResumen,
  mostrarModalDetalleCredito,
  detalleModalCargando,
  mostrarModalEdicion,
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
  creditosAnulados,
  cargandoCreditosAnulados,
  errorCreditosAnulados,
  mostrarModalNuevoCredito,
  archivoMasivoInput,
  nombreArchivoMasivo,
  mostrarModalCargaMasiva,
  datosArchivoMasivo,
  erroresArchivoMasivo,
  procesandoArchivoMasivo,
  impactandoArchivoMasivo,
  totalArchivoMasivo,
  periodoProcesoSeleccionado,
  periodoProcesoCerrado,
  descripcionCredito,
  delegacionSeleccionada,
  editForm,
  nuevoCredito,
  guardando,
} = store;

const detalleModalAgrupado = computed(() => store.detalleModalAgrupado());

const toggleBusquedaAfiliado = store.toggleBusquedaAfiliado;
const toggleLote = store.toggleLote;
const abrirModalBusquedaCredito = store.abrirModalBusquedaCredito;
const abrirModalCreditosAnulados = store.abrirModalCreditosAnulados;
const abrirSelectorArchivoMasivo = store.abrirSelectorArchivoMasivo;
const manejarArchivoMasivo = store.manejarArchivoMasivo;
const buscarCreditosAfiliado = store.buscarCreditosAfiliado;
const abrirModalNuevoCredito = store.abrirModalNuevoCredito;
const cerrarModalNuevoCredito = store.cerrarModalNuevoCredito;
const seleccionarDetalle = store.seleccionarDetalle;
const confirmarAnulacion = store.confirmarAnulacion;
const esDetalleSeleccionado = store.esDetalleSeleccionado;
const esDetalleCoincidenciaBusqueda = store.esDetalleCoincidenciaBusqueda;
const esDetalleAnulando = store.esDetalleAnulando;
const imprimirLote = store.imprimirLote;
const cerrarModalCargaMasiva = store.cerrarModalCargaMasiva;
const limpiarBusquedaCredito = store.limpiarBusquedaCredito;
const cerrarModalAuditoria = store.cerrarModalAuditoria;
const cambiarTabAuditoria = store.cambiarTabAuditoria;
const cerrarModalBusquedaCredito = store.cerrarModalBusquedaCredito;
const cerrarModalDetalleCredito = store.cerrarModalDetalleCredito;
const cancelarEdicionDetalle = store.cancelarEdicionDetalle;
const guardarEdicionDetalle = store.guardarEdicionDetalle;
const handleRowDetalleClick = store.handleRowDetalleClick;
const esLoteDestinoNuevoCredito = store.esLoteDestinoNuevoCredito;
const grabarNuevoCredito = store.grabarNuevoCredito;
const getDetalleKey = store.getDetalleKey;
const obtenerTituloTipoCredito = store.obtenerTituloTipoCredito;
const buscarCreditoPorNumero = store.buscarCreditoPorNumero;
const enfocarResultadoBusqueda = store.enfocarResultadoBusqueda;
const obtenerValorVistaPrevia = (fila, key) =>
  store.obtenerValorVistaPrevia(fila, key, store.intlMontos, store.intlEnteros);

const buscarResumen = () => store.buscarResumen(esCasaCentral.value);
const handlePageSizeChange = () => store.handlePageSizeChange(buscarResumen);
const applyCustomPageSize = () => store.applyCustomPageSize(buscarResumen, nextTick);
const changePage = (step) => store.changePage(step, buscarResumen);
const goToFirstPage = () => store.goToFirstPage(buscarResumen);
const goToLastPage = () => store.goToLastPage(totalPages.value, buscarResumen);
const goToPage = () => store.goToPage(totalPages.value, buscarResumen);
const imprimirResumenGeneral = () =>
  store.imprimirResumenGeneral(
    periodoPG.value,
    resumenCantCreditos.value,
    resumenTotalCuotas.value,
    resumenImporteTotal.value,
    promedioGeneral.value
  );
const impactarCreditosMasivos = () =>
  store.impactarCreditosMasivos(periodoImputacionActualCodigo.value, periodosImputacionOrdenados.value);

const sanJuanBgVars = computed(() => ({
  '--sanjuan-url': `url(${sanJuanBg})`,
}));

const capitalize = store.capitalize;
</script>

<template>
  <main
    class="main-extrajudicial flex flex-col items-center justify-center w-full px-4 py-6 text-slate-900 transition-colors duration-300 dark:text-slate-100"
    :style="sanJuanBgVars"
  >
    <section class="extrajudicial-shell w-full max-w-5xl">
      <header class="extrajudicial-header flex flex-col gap-4 border-b border-slate-200/70 px-6 py-4 dark:border-slate-700/70">
        <div class="flex flex-wrap gap-3 items-center">
          <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">Periodo Proceso</span>
          <input
            v-model="periodo"
            placeholder="MMYYYY"
            maxlength="6"
            @keyup.enter="buscarResumen"
            class="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white shadow-sm focus:outline-none focus:ring focus:ring-blue-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500"
          />
          <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">Seleccione Delegacion</span>
          <Dropdown
            v-model="delegacionSeleccionada"
            :options="delegacionesConTodas"
            optionLabel="nombre"
            optionValue="idDelegacion"
            placeholder="Seleccione delegacion"
            :filter="true"
            filterPlaceholder="Buscar..."
            :resetFilterOnHide="true"
            showClear
            appendTo="body"
            :virtualScrollerOptions="{ itemSize: 36 }"
            class="w-72"
          />
          <button
            @click="buscarResumen"
            class="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 text-sm"
          >
            Buscar
          </button>
        </div>
      </header>
      <div class="extrajudicial-content px-6 py-4">
        <div
          v-if="procesoGrabacionCerrado"
          class="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/70 dark:bg-amber-900/40 dark:text-amber-50"
        >
          Modificaciones deshabilitadas: el archivo del periodo ya fue generado y el proceso esta cerrado.
        </div>
<!-- BUSQUEDA POR AFILIADO -->
<!-- ACCIONES PRINCIPALES -->
<div class="w-full mt-6 grid gap-4 lg:grid-cols-[minmax(0,3fr),minmax(0,2fr)]">
  <section class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm flex flex-col gap-3 dark:border-slate-700 dark:bg-slate-900/60">
    <div>
      <h3 class="text-sm font-semibold text-slate-700 uppercase tracking-wide dark:text-slate-200">Acciones rápidas</h3>
      <p class="text-xs text-slate-500 dark:text-slate-400">Buscá afiliados o créditos específicos del periodo en curso.</p>
    </div>
    <div class="flex flex-wrap gap-2">
      <button
        @click="toggleBusquedaAfiliado"
        class="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 text-sm"
      >
        {{ mostrarBusquedaAfiliado ? 'Ocultar busqueda por afiliado' : 'Buscar por Nro Afiliado' }}
      </button>
      <button
        type="button"
        @click="abrirModalBusquedaCredito"
        class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm shadow-sm flex items-center gap-2"
      >
        Buscar por N&deg; Credito
      </button>
      
      <button
        type="button"
        @click="abrirModalCreditosAnulados"
        class="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 text-sm shadow-sm flex items-center gap-2"
      >
        Auditor&iacute;a cr&eacute;ditos
      </button>
      
       
    </div>
  </section>
  <section
    v-if="canManageCreditos"
    class="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm flex flex-col gap-3 dark:border-slate-700 dark:bg-slate-900/60"
  >
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 class="text-sm font-semibold text-slate-700 uppercase tracking-wide dark:text-slate-200">Carga masiva</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">Subí archivos Excel/CSV para impactar créditos.</p>
      </div>
      <button
        type="button"
        @click="abrirSelectorArchivoMasivo"
        class="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 text-sm shadow-sm flex items-center gap-2"
      >
        Subir Excel/CSV
      </button>
    </div>
    <div class="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-300">
      <span
        v-if="procesandoArchivoMasivo"
        class="flex items-center gap-2 font-medium text-blue-600 dark:text-blue-300"
      >
        <span class="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
        Procesando archivo...
      </span>
      <span
        v-if="nombreArchivoMasivo"
        :title="nombreArchivoMasivo"
        class="max-w-full truncate"
      >
        Archivo seleccionado: {{ nombreArchivoMasivo }}
      </span>
    </div>
    <input
      ref="archivoMasivoInput"
      type="file"
      accept=".xlsx,.xls,.csv"
      class="hidden"
      @change="manejarArchivoMasivo"
    />
  </section>
</div>

<!-- FORMULARIO DE BUSQUEDA COLAPSABLE -->
<transition name="fade">
  <section
    v-if="mostrarBusquedaAfiliado"
    class="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4"
  >
    <div class="flex gap-2 items-center">
      Nro Afiliado
      <input
        v-model="numeroAfiliado"
        placeholder="Ej: 123456"
        maxlength="10"
        @keyup.enter="buscarCreditosAfiliado"
        class="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white shadow-sm focus:outline-none focus:ring focus:ring-blue-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500"
      />
      Periodo
      <input
        v-model="periodoAfiliado"
        placeholder="MMYYYY"
        maxlength="6"
        @keyup.enter="buscarCreditosAfiliado"
        class="border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white shadow-sm focus:outline-none focus:ring focus:ring-blue-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500"
      />
      <button
        @click="buscarCreditosAfiliado"
        :disabled="buscandoAfiliado"
        class="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 text-sm disabled:cursor-not-allowed disabled:opacity-60 flex items-center gap-2"
      >
        <span
          v-if="buscandoAfiliado"
          class="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"
        />
        <span>{{ buscandoAfiliado ? 'Buscando...' : 'Buscar Afiliado' }}</span>
      </button>
    </div>
  </section>
</transition>
<div v-if="mostrarBusquedaAfiliado && buscandoAfiliado" class="text-center text-sm text-blue-700 py-4">
  <span class="animate-spin inline-block h-5 w-5 border-2 border-current border-t-transparent rounded-full mr-2"></span>
  Buscando creditos del afiliado...
</div>

<div v-else-if="mostrarBusquedaAfiliado && creditosAfiliado.length > 0" class="mt-4 rounded-lg bg-white p-4 shadow-md dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-black/30">
  <p class="font-semibold mb-2">Resultados para el afiliado {{ numeroAfiliado }}:</p>
  <table class="w-full text-sm text-left border-collapse text-slate-800 dark:text-slate-100">
    <thead>
      <tr class="border-b font-semibold dark:border-slate-700">
        <th>Nombre</th>
        <th>CUIL</th>
        <th>Fecha Cobro</th>
        <th>Lote</th>
        <th>Tipo Credito</th>
        <th>Cuotas</th>
        <th>Importe Cuota</th>
        <th>Importe Total</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(cred, index) in creditosAfiliado"
        :key="index"
        class="border-b transition-colors hover:bg-blue-100 dark:border-slate-700 dark:hover:bg-slate-800/60"
      >
        <td>{{ limpiarTextoPlano(cred.nombre) || '-' }}</td>
        <td>{{ limpiarTextoPlano(cred.cuil) || '-' }}</td>
        <td>{{ formatDateForPdf(cred.fechaCobro ?? cred.fecha) || '-' }}</td>
        <td>{{ obtenerNumeroLoteCredito(cred) }}</td>
        <td>{{ limpiarTextoPlano(cred.tipoCredito ?? cred.concepto) || '-' }}</td>
        <td>{{ formatCuotas(cred.cuotas ?? cred.cantidadCuotas) }}</td>
        <td>${{ formatCurrency(cred.importeCuota) }}</td>
        <td>${{ formatCurrency(cred.importeTotal) }}</td>
      </tr>
    </tbody>
  </table>
</div>

<div v-else-if="mostrarBusquedaAfiliado && numeroAfiliado && !buscandoAfiliado" class="text-center text-sm text-gray-500 py-4 dark:text-slate-400">
  No se encontraron creditos para el afiliado ingresado.
</div>

      <section class="mt-4 flex flex-col gap-4">
        <div v-if="loading" class="py-10 text-center text-slate-700 dark:text-slate-300">Cargando datos...</div>
        <div v-else-if="solicitudes.length === 0" class="py-10 text-center text-slate-700 dark:text-slate-300">No se encontraron registros.</div>

        <div
          v-for="(item, index) in solicitudes"
          :key="index"
          :data-lote-key="getClaveLote(item) || ''"
          :data-lote-numero="getNumeroLoteListado(item) ?? ''"
              :class="[
                'flex flex-col border border-slate-200 dark:border-slate-700 border-l-4 px-6 py-4 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/30 transition-all duration-300 dark:bg-slate-900/70 dark:text-slate-100',
                getEstilosCodigo(item.codigo).border,
                getEstilosCodigo(item.codigo).bg,
                getEstilosCodigo(item.codigo).hover,
                loteResaltadoClave === getClaveLote(item) ? 'lote-resaltado' : '',
              ]"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xl font-bold text-gray-900 dark:text-white">
                {{ obtenerTituloTipoCredito(item) }}
              </p>
              <p class="text-lg font-semibold text-gray-800 dark:text-slate-100">
                Lote Nro
                <span
                  :class="[
                    'ml-1 inline-flex items-center rounded-md px-2 py-0.5',
                    loteResaltadoClave === getClaveLote(item) ? 'numero-resaltado' : '',
                  ]"
                >
                  {{ item.nropaq }}
                </span>
              </p>
              <p class="text-sm flex flex-wrap items-center gap-2 text-slate-700 dark:text-slate-300">
                Codigo:
                <span :class="['inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide', getEstilosCodigo(item.codigo).badge]">
                  {{ item.codigo ?? '-' }}
                </span>
                || FG: {{ capitalize(formatProcesoGrabacion(item.procesoGrabacion)) }} || PG: {{ capitalize(periodoPG) }} ||
              </p>
              <p class="text-sm text-slate-700 dark:text-slate-200">Cant. Creditos: {{ item.cantidadCreditos }}</p> 
              <p class="text-sm text-slate-700 dark:text-slate-200">Importe Cuota: ${{ item.importePromedioCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">Total Cuotas: {{ item.totalCuotas }}</p>
              <p class="text-sm text-slate-700 dark:text-slate-200">Importe Total: ${{ item.totalImporte.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</p>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
              <button
                @click="toggleLote(item)"
                class="rounded-md border border-blue-500 px-3 py-1.5 text-sm font-medium text-blue-600 bg-white transition-colors duration-200 hover:bg-blue-50 shadow-sm dark:border-blue-300 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-slate-800"
              >
                {{ loteExpandido === getClaveLote(item) ? 'Ocultar detalle' : 'Ver detalle' }}
              </button> 
              <button
                type="button"
                v-if="canManageCreditos"
                @click="abrirModalNuevoCredito(item)"
                class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 shadow-sm"
              >
                Anadir credito
              </button>
              <button
                @click="imprimirLote(item)"
                :disabled="loteImprimiendo === item.idLote"
                class="rounded-md border border-blue-700 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors duration-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {{ loteImprimiendo === item.idLote ? 'Generando...' : 'Imprimir PDF' }}
              </button>
            </div>
            </div>

            <!-- Detalle expandido: separado del encabezado -->
            <div v-if="loteExpandido === getClaveLote(item)" class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100">
              <div v-if="detalleLoading === getDetalleKey(item)" class="text-center py-4 text-sm text-blue-700 dark:text-blue-300">
                <span class="animate-spin inline-block h-5 w-5 border-2 border-current border-t-transparent rounded-full mr-2"></span>
                Cargando detalle del lote...
              </div>

              <div v-else-if="detalleLote[getDetalleKey(item)]?.length">
                <table class="w-full border-collapse text-left text-sm text-slate-700 dark:text-slate-100">
                  <thead>
                    <tr class="border-b font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-200">
                      <th>CUIL</th>
                      <th>Nombre</th>
                      <th>A. Numero</th>
                      <th>Sub</th>
                      <th>NroCredito</th>
                      <th>CM</th>
                      <th>Fecha Cobro</th>
                      <th>Cuotas</th>
                      <th>Importe Cuota</th>
                      <th>Importe Total</th>
                      <th>Tipo Credito</th>
                      <th v-if="canManageCreditos" class="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(detalle, i) in detalleLote[getDetalleKey(item)]"
                      :key="getDetalleId(detalle) ?? i"
                      :class="[
                        'cursor-pointer border-b transition-colors border-slate-100 dark:border-slate-700',
                        !esDetalleSeleccionado(detalle) && esDetalleCoincidenciaBusqueda(detalle)
                          ? 'ring-2 ring-amber-400/70 bg-amber-50 dark:bg-amber-900/30 dark:ring-amber-300/60'
                          : '',
                        esDetalleSeleccionado(detalle)
                          ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60'
                          : 'hover:bg-blue-100 dark:hover:bg-slate-800/70'
                      ]"
                      @click="handleRowDetalleClick(detalle, item, $event)"
                    >
                      <td>{{ (detalle.cuil ?? '').trim() }}</td>
                      <td>{{ detalle.nombre }}</td>
                      <td>{{ (detalle.aNumero ?? '').trim() }}</td>
                      <td>{{ detalle.subCodigo }}</td>
                      <td>{{ detalle.nroCredito }}</td>
                      <td>{{ detalle.cMovimiento }}</td>
                      <td>{{ detalle.fechaCobro ? new Date(detalle.fechaCobro).toLocaleDateString('es-AR') : '-' }}</td>
                      <td>{{ detalle.cuotas }}</td>
                      <td>${{ (detalle.importeCuota ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</td>
                      <td>${{ (detalle.importeTotal ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</td>
                      <td>{{ detalle.tipoCredito }}</td>
                      <td v-if="canManageCreditos" class="py-2 text-right" data-acciones-detalle>
                        <div class="flex items-center justify-end gap-2" data-acciones-detalle>
                          <button
                            type="button"
                            @click.stop="seleccionarDetalle(detalle)"
                            class="rounded border border-blue-600 px-3 py-1 text-xs font-medium text-blue-600 transition-colors duration-200 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-300 dark:hover:bg-blue-900/30"
                          >
                            {{ esDetalleSeleccionado(detalle) ? 'Seleccionado' : 'Modificar' }}
                          </button>
                          <button
                            type="button"
                            @click.stop="confirmarAnulacion(item, detalle)"
                            :disabled="esDetalleAnulando(detalle)"
                            class="rounded border border-red-600 px-3 py-1 text-xs font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-400 dark:text-red-300 dark:hover:bg-red-900/30"
                          >
                            {{ esDetalleAnulando(detalle) ? 'Anulando...' : 'Anular' }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <form
                  v-if="canManageCreditos && esLoteDestinoNuevoCredito(item)"
                  @submit.prevent="grabarNuevoCredito"
                  class="mt-4 rounded-lg border border-emerald-200 bg-white p-4 text-sm text-slate-700 shadow-sm dark:border-emerald-300/50 dark:bg-slate-900/70 dark:text-slate-100"
                >
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 class="text-base font-semibold text-emerald-700 dark:text-emerald-300">
                        Nuevo credito en lote {{ item.nropaq ?? '-' }}
                      </h4>
                      <p class="text-xs text-slate-500 dark:text-slate-300">
                        Codigo: {{ item.codigo ?? '-' }} ? Cantidad actual: {{ item.cantidadCreditos ?? '-' }}
                      </p>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        @click="cerrarModalNuevoCredito"
                        class="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400 dark:hover:text-white"
                        :disabled="guardando"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        class="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="guardando"
                      >
                        {{ guardando ? 'Guardando...' : 'Guardar credito' }}
                      </button>
                    </div>
                  </div>
                  <div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                      <span class="tracking-wide uppercase">Numero Afiliado</span>
                      <input
                        v-model="nuevoCredito.numeroAfiliado"
                        type="text"
                        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                      <span class="tracking-wide uppercase">Numero de Credito </span>
                      <input
                        v-model="nuevoCredito.numeroCredito"
                        type="number"
                        min="1"
                        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                      <span class="tracking-wide uppercase">SubCod</span>
                      <input
                        v-model="nuevoCredito.subCod"
                        type="text"
                        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                      <span class="tracking-wide uppercase">Cod Mov</span>
                      <input
                        v-model="nuevoCredito.codMov"
                        type="text"
                        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                      <span class="tracking-wide uppercase">Cant Cuotas</span>
                      <input
                        v-model.number="nuevoCredito.cantCuotas"
                        type="number"
                        min="1"
                        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus-ring-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                      <span class="tracking-wide uppercase">Importe Cuota</span>
                      <input
                        v-model="nuevoCredito.importeCuota"
                        type="number"
                        step="0.01"
                        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus-ring-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                      <span class="tracking-wide uppercase">Fecha 1er Vencimiento</span>
                      <input
                        v-model="nuevoCredito.fechaPrimerVencimiento"
                        type="date"
                        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus-ring-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </label>
                  </div>
                  <div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                      <span class="tracking-wide uppercase">Importe Total</span>
                      <input
                        v-model="nuevoCredito.importeTotalCredito"
                        type="number"
                        step="0.01"
                        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus-ring-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                      <span class="tracking-wide uppercase">Detalle tipo credito (opcional)</span>
                      <input
                        v-model="nuevoCredito.creditoMigracion"
                        type="text"
                        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus-ring-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </label>
                    <label class="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-slate-300">
                      <span class="tracking-wide uppercase">Observaciones</span>
                      <textarea
                        v-model="nuevoCredito.observaciones"
                        rows="1"
                        class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus-ring-emerald-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                      ></textarea>
                    </label>
                  </div>
                </form>
              </div>

              <div v-else class="py-2 text-sm text-gray-500 dark:text-slate-400">No hay detalles disponibles para este lote.</div>
            </div>
        </div>

        

        <!-- Resumen Total -->
        <div
          v-if="solicitudes.length"
          class="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
        >
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="space-y-1 text-sm text-slate-600 dark:text-slate-300 md:max-w-xs">
              <p class="text-lg font-semibold uppercase tracking-wide text-slate-900 dark:text-white">TOTAL GENERAL</p>
              <p>Total Creditos: {{ resumenCantCreditos }}</p>
              <p>Total Cuotas: {{ resumenTotalCuotas }}</p>
              <p>Importe Total Cuotas: ${{ promedioGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</p>
              <p>Importe Total: ${{ resumenImporteTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 }) }}</p>
            </div>
            <button
              type="button"
              @click="imprimirResumenGeneral"
              :disabled="imprimiendoResumen"
              class="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                v-if="imprimiendoResumen"
                class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              />
              {{ imprimiendoResumen ? 'Generando...' : 'Imprimir resumen' }}
            </button>
          </div>
          <div
            class="flex w-full flex-wrap items-center justify-center gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300 md:justify-between"
          >
              <span class="font-medium text-slate-900 dark:text-white">{{ pageStatusText }}</span>
              <span v-if="pageRangeLabel">{{ pageRangeLabel }}</span>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  Filas por pagina
                </span>
                <select
                  v-model.number="pageSize"
                  @change="handlePageSizeChange"
                  class="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500"
                >
                  <option v-if="showCustomPageSizeOption" :value="pageSize">
                    Personalizado ({{ pageSize }})
                  </option>
                  <option
                    v-for="option in pageSizeOptions"
                    :key="`page-size-${option}`"
                    :value="option"
                  >
                    {{ option }}
                  </option>
                </select>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  Otra cantidad
                </span>
                <input
                  v-model="customPageSize"
                  @keyup.enter="applyCustomPageSize"
                  type="number"
                  min="1"
                  class="w-24 rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500"
                />
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  Lote a ubicar
                </span>
                <input
                  v-model="numeroLoteObjetivo"
                  @keyup.enter="applyCustomPageSize"
                  type="number"
                  min="1"
                  placeholder="Ej: 120"
                  class="w-28 rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500"
                />
                <button
                  type="button"
                  class="rounded-lg bg-slate-700 px-3 py-1 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-100"
                  :disabled="loading"
                  @click="applyCustomPageSize"
                >
                  Aplicar
                </button>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:border-blue-400"
                  :disabled="!canGoPrev || loading"
                  @click="goToFirstPage"
                >
                  Primera
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:border-blue-400"
                  :disabled="!canGoPrev || loading"
                  @click="changePage(-1)"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:border-blue-400"
                  :disabled="!canGoNext || loading"
                  @click="changePage(1)"
                >
                  Siguiente
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:border-blue-400"
                  :disabled="!totalPages || pageNumber >= totalPages || loading"
                  @click="goToLastPage"
                >
                  Ultima
                </button>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                  Ir a pagina
                </span>
                <input
                  id="pagina-input"
                  v-model="goToPageInput"
                  @keyup.enter="goToPage"
                  type="number"
                  min="1"
                  class="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-blue-500"
                />
                <button
                  type="button"
                  class="rounded-lg bg-blue-600 px-3 py-1 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="loading"
                  @click="goToPage"
                >
                  Ir
                </button>
              </div>
          </div>
        </div>
      </section>
      </div>
    </section>
    <div
      v-if="canManageCreditos && mostrarModalCargaMasiva"
      class="fixed inset-0 z-50 bg-slate-900/60 px-4 py-8 flex items-center justify-center"
      @click.self="cerrarModalCargaMasiva"
    >
      <div class="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[85vh] dark:bg-slate-950">
        <header class="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Vista previa de la carga masiva</h2>
            <p class="text-sm text-slate-500 dark:text-slate-300">
              Archivo: <span class="font-medium text-slate-700 dark:text-slate-100">{{ nombreArchivoMasivo }}</span>
            </p>
          </div>
          <button
            type="button"
            class="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="cerrarModalCargaMasiva"
            aria-label="Cerrar vista previa"
          >
            &times;
          </button>
        </header>
        <section class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <label class="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-200">
                Periodo de Imputacion o Proceso de Grabacion <span class="text-red-600">*</span>
              </label>
              <input
                v-model="periodoProcesoSeleccionado"
                type="text"
                inputmode="numeric"
                maxlength="7"
                placeholder="MMYYYY (ej: 082024)"
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <p v-if="periodoProcesoError" class="mt-2 text-xs text-red-600 dark:text-red-400">
                {{ periodoProcesoError }}
              </p>
              <p v-else-if="periodoProcesoNormalizado" class="mt-2 text-xs text-slate-600 dark:text-slate-300">
                Periodo ingresado: {{ formatPeriodo(periodoProcesoNormalizado) || periodoProcesoNormalizado }}
              </p>
              <p v-if="periodoProcesoCerrado" class="mt-1 text-xs text-red-600 dark:text-red-400">
                El periodo ingresado esta cerrado (archivo generado). No se pueden cargar creditos en ese periodo.
              </p>
              <p v-if="periodoImputacionActualCodigo" class="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                Periodo sugerido: {{ periodoProcesoSugerido }}
              </p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
              <label for="descripcion-credito" class="block text-sm font-semibold text-slate-700 mb-2 dark:text-slate-200">
                Descripcion del credito (opcional)
              </label>
              <textarea
                id="descripcion-credito"
                v-model="descripcionCredito"
                rows="2"
                placeholder="Ej: Provision..."
                class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <p
                v-if="!(descripcionCredito && descripcionCredito.trim())"
                class="mt-2 text-xs text-amber-600 dark:text-amber-400"
              >
                Si dejas este campo vacio, la descripcion se enviara en blanco al impactar los creditos.
              </p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/60">
              <p class="font-semibold text-slate-700 dark:text-slate-100">Totales del archivo</p>
              <p class="mt-1 text-slate-600 dark:text-slate-300">
                Monto total: <span class="font-semibold">{{ intlMontos.format(totalArchivoMasivo || 0) }}</span>
              </p>
              <p class="text-slate-600 dark:text-slate-300">
                Limite permitido: <span class="font-semibold">{{ intlMontos.format(MONTO_TOTAL_MAXIMO) }}</span>
              </p>
              <p v-if="excedeMontoTotalArchivo" class="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
                El monto total supera el limite. Ajusta el archivo antes de impactar.
              </p>
            </div>
          </div>
          <div v-if="erroresArchivoMasivo.length" class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/70 dark:bg-amber-950/30 dark:text-amber-200">
            <p class="font-semibold">Filas omitidas por validaci&oacute;n:</p>
            <ul class="mt-2 space-y-1">
              <li v-for="error in erroresArchivoMasivo" :key="`error-${error.fila}-${error.mensaje}`">
                Fila {{ error.fila }}: {{ error.mensaje }}
              </li>
            </ul>
          </div>
          <div v-if="datosArchivoMasivo.length" class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table class="min-w-full text-left text-xs text-slate-700 dark:text-slate-200">
              <thead class="bg-slate-100 uppercase text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th
                    v-for="columna in MAPEO_COLUMNAS_PREVIEW"
                    :key="`header-${columna.key}`"
                    class="px-4 py-3 whitespace-nowrap"
                  >
                    {{ columna.header }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(fila, index) in datosArchivoMasivo"
                  :key="`preview-${fila.nroAfiliado}-${fila.cupon}-${index}`"
                  class="border-t border-slate-100 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
                >
                  <td
                    v-for="columna in MAPEO_COLUMNAS_PREVIEW"
                    :key="`cell-${columna.key}-${index}`"
                    class="whitespace-nowrap px-4 py-2"
                  >
                    {{ obtenerValorVistaPrevia(fila, columna.key) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-sm text-slate-500">No hay filas v&aacute;lidas para mostrar.</p>
        </section>
        <footer class="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-lg border border-blue-600 px-5 py-2 text-sm font-semibold text-blue-600 transition-colors duration-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="impactandoArchivoMasivo || !datosArchivoMasivo.length || excedeMontoTotalArchivo || periodoProcesoCerrado"
            @click="impactarCreditosMasivos"
          >
            {{ impactandoArchivoMasivo ? 'Impactando...' : 'Impactar Creditos' }}
          </button>
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            @click="cerrarModalCargaMasiva"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
    <div
      v-if="mostrarModalAuditoria"
      class="fixed inset-0 z-50 bg-slate-900/60 px-4 py-8 flex items-center justify-center"
      @click.self="cerrarModalAuditoria"
    >
      <div class="w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[85vh] dark:bg-slate-950">
        <header class="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Auditor&iacute;a del periodo</h2>
            <p class="text-sm text-slate-500 dark:text-slate-300">
              <span v-if="auditoriaTabActiva === 'creditos'">Periodo consultado:</span>
              <span v-else>Periodo aplicado (mes anterior):</span>
              <span class="font-semibold text-slate-900 dark:text-white"> {{ periodoAuditoriaActivo }}</span>
            </p>
          </div>
          <button
            type="button"
            class="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="cerrarModalAuditoria"
            aria-label="Cerrar auditoria"
          >
            &times;
          </button>
        </header>
        <div class="px-6 pt-3 border-b border-slate-200 flex gap-2 dark:border-slate-700">
          <button
            type="button"
            @click="cambiarTabAuditoria('creditos')"
            :class="[
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-200',
              auditoriaTabActiva === 'creditos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            ]"
          >
            Auditor&iacute;a cr&eacute;ditos
          </button>
          <button
            type="button"
            @click="cambiarTabAuditoria('suspendidos')"
            :class="[
              'rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-200',
              auditoriaTabActiva === 'suspendidos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            ]"
          >
            Afiliados suspendidos
          </button>
        </div>
        <section class="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm text-slate-700 dark:text-slate-200">
          <template v-if="auditoriaTabActiva === 'creditos'">
            <div class="text-xs text-slate-500 dark:text-slate-400">
              Se muestran los cr&eacute;ditos anulados del periodo que est&aacute;s consultando.
            </div>
            <div
              v-if="cargandoCreditosAnulados"
              class="flex items-center gap-2 text-blue-700 dark:text-blue-300"
            >
              <span class="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              Consultando cr&eacute;ditos anulados...
            </div>
            <div
              v-else-if="errorCreditosAnulados"
              class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/50 dark:bg-red-900/30 dark:text-red-200"
            >
              {{ errorCreditosAnulados }}
            </div>
            <div
              v-else-if="creditosAnulados.length"
              class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <table class="min-w-full text-left text-xs text-slate-700 dark:text-slate-200">
                <thead class="bg-slate-100 text-[11px] font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-200">
                  <tr>
                    <th class="px-4 py-3">Paq.</th>
                    <th class="px-4 py-3">Nro Afiliado</th>
                    <th class="px-4 py-3">Nombre</th>
                    <th class="px-4 py-3">CUIL</th>
                    <th class="px-4 py-3">N&deg; Cr&eacute;dito</th>
                    <th class="px-4 py-3">Tipo Cr&eacute;dito</th>
                    <th class="px-4 py-3">Cuotas</th>
                    <th class="px-4 py-3">Imp. Total</th>
                    <th class="px-4 py-3">Observaci&oacute;n</th>
                    <th class="px-4 py-3">Usuario</th>
                    <th class="px-4 py-3">Fecha anulaci&oacute;n</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="credito in creditosAnulados"
                    :key="credito.id"
                    class="border-b border-slate-100 text-slate-700 dark:border-slate-700 dark:text-slate-100"
                  >
                    <td class="px-4 py-3">{{ credito.paquete || '-' }}</td>
                    <td class="px-4 py-3">{{ credito.numeroAfiliado || '-' }}</td>
                    <td class="px-4 py-3">{{ credito.nombreAfiliado || '-' }}</td>
                    <td class="px-4 py-3">{{ credito.cuil || '-' }}</td>
                    <td class="px-4 py-3">{{ credito.idAutoriza || '-' }}</td>
                    <td class="px-4 py-3">{{ credito.nroCreditoMigracion || '-' }}</td>
                    <td class="px-4 py-3">{{ credito.cuotas || '-' }}</td>
                    <td class="px-4 py-3">${{ formatCurrency(credito.importeTotal) }}</td>
                    <td class="px-4 py-3">{{ credito.observacion || '-' }}</td>
                    <td class="px-4 py-3">{{ credito.usuarioCrea || '-' }}</td>
                    <td class="px-4 py-3">{{ formatDateForPdf(credito.fechaAnula) || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div
              v-else
              class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
            >
              No se encontraron cr&eacute;ditos anulados para el periodo indicado.
            </div>
          </template>
          <template v-else>
            <div class="text-xs text-slate-500 dark:text-slate-400">
              Visualiz&aacute; los afiliados suspendidos con cr&eacute;ditos activos (se toma el mes anterior al periodo).
            </div>
            <div
              v-if="cargandoAfiliadosFallecidos"
              class="flex items-center gap-2 text-blue-700 dark:text-blue-300"
            >
              <span class="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              Consultando afiliados suspendidos...
            </div>
            <div
              v-else-if="errorAfiliadosFallecidos"
              class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/50 dark:bg-red-900/30 dark:text-red-200"
            >
              {{ errorAfiliadosFallecidos }}
            </div>
            <div
              v-else-if="afiliadosFallecidos.length"
              class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <table class="min-w-full text-left text-xs text-slate-700 dark:text-slate-200">
                <thead class="bg-slate-100 text-[11px] font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-200">
                  <tr>
                    <th class="px-4 py-3">Nro Afiliado</th>
                    <th class="px-4 py-3">Nombre</th>
                    <th class="px-4 py-3">CUIL</th>
                    <th class="px-4 py-3">Fecha Cobro</th>
                    <th class="px-4 py-3">Tipo Cr&eacute;dito</th>
                    <th class="px-4 py-3">N&deg; Cr&eacute;dito</th>
                    <th class="px-4 py-3">Cuotas</th>
                    <th class="px-4 py-3">Imp. Total</th>
                    <th class="px-4 py-3">Motivo baja</th>
                    <th class="px-4 py-3">Fecha baja</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="afiliado in afiliadosFallecidos"
                    :key="afiliado.id"
                    class="border-b border-slate-100 text-slate-700 dark:border-slate-700 dark:text-slate-100"
                  >
                    <td class="px-4 py-3">{{ afiliado.numeroAfiliado || '-' }}</td>
                    <td class="px-4 py-3">{{ afiliado.nombre || '-' }}</td>
                    <td class="px-4 py-3">{{ afiliado.cuil || '-' }}</td>
                    <td class="px-4 py-3">{{ formatDateForPdf(afiliado.fechaCobro) || '-' }}</td>
                    <td class="px-4 py-3">{{ afiliado.tipoCredito || '-' }}</td>
                    <td class="px-4 py-3">{{ afiliado.numeroCredito || '-' }}</td>
                    <td class="px-4 py-3">{{ afiliado.cuotas || '-' }}</td>
                    <td class="px-4 py-3">${{ formatCurrency(afiliado.importeTotal) }}</td>
                    <td class="px-4 py-3">{{ afiliado.motivoBaja || '-' }}</td>
                    <td class="px-4 py-3">{{ formatDateForPdf(afiliado.fechaBaja) || '-'}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
              No se encontraron afiliados suspendidos con cr&eacute;ditos activos para el periodo indicado.
            </div>
          </template>
        </section>
        <footer class="border-t border-slate-200 px-6 py-4 flex justify-end dark:border-slate-700">
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            @click="cerrarModalAuditoria"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
    <div
      v-if="mostrarModalBusquedaCredito"
      class="fixed inset-0 z-50 bg-slate-900/60 px-4 py-8 flex items-center justify-center"
      @click.self="cerrarModalBusquedaCredito"
    >
      <div class="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[85vh] dark:bg-slate-950">
        <header class="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Buscar cr&eacute;dito por N&deg;</h2>
            <p class="text-sm text-slate-500 dark:text-slate-300">
              Ingres&aacute; el n&uacute;mero exacto del cr&eacute;dito y te mostraremos en qu&eacute; lote se encuentra.
            </p>
          </div>
          <button
            type="button"
            class="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="cerrarModalBusquedaCredito"
            aria-label="Cerrar busqueda de cr&eacute;dito"
          >
            &times;
          </button>
        </header>
        <section class="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm text-slate-700 dark:text-slate-200">
          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">N&uacute;mero de cr&eacute;dito</label>
            <div class="flex flex-wrap items-center gap-3">
              <input
                v-model.trim="numeroCreditoBusqueda"
                type="text"
                inputmode="numeric"
                maxlength="20"
                placeholder="Ej: 123456"
                @keyup.enter="buscarCreditoPorNumero"
                class="flex-1 min-w-[220px] rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                @click="buscarCreditoPorNumero"
                :disabled="buscandoCreditoPorNumero || !numeroCreditoBusqueda"
                class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span v-if="buscandoCreditoPorNumero" class="inline-flex items-center gap-2">
                  <span class="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  Buscando...
                </span>
                <span v-else>Buscar</span>
              </button>
              <button
                type="button"
                @click="limpiarBusquedaCredito"
                :disabled="buscandoCreditoPorNumero"
                class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400 dark:hover:text-white"
              >
                Limpiar
              </button>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              La b&uacute;squeda analiza los detalles ya consultados de los lotes del periodo actual.
            </p>
            <p
              v-if="!solicitudes.length"
              class="text-xs text-amber-600 dark:text-amber-400"
            >
              Primero deb&eacute;s consultar un periodo para disponer del listado de lotes.
            </p>
          </div>
          <div v-if="buscandoCreditoPorNumero" class="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <span class="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            Buscando cr&eacute;dito...
          </div>
          <div
            v-else-if="resultadosBusquedaCredito.length"
            class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <table class="min-w-full text-left text-xs text-slate-700 dark:text-slate-200">
              <thead class="bg-slate-100 text-[11px] font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th class="px-4 py-3">Lote</th>
                  <th class="px-4 py-3">C&oacute;digo</th>
                  <th class="px-4 py-3">Tipo</th>
                  <th class="px-4 py-3">Afiliado</th>
                  <th class="px-4 py-3">Nombre</th>
                  <th class="px-4 py-3">N&deg; cr&eacute;dito</th>
                  <th class="px-4 py-3">Cuotas</th>
                  <th class="px-4 py-3">Imp. cuota</th>
                  <th class="px-4 py-3">Imp. total</th>
                  <th class="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="resultado in resultadosBusquedaCredito"
                  :key="resultado.id"
                  class="border-b border-slate-100 text-slate-700 dark:border-slate-700 dark:text-slate-100"
                >
                  <td class="px-4 py-3">{{ resultado.numeroLote }}</td>
                  <td class="px-4 py-3">{{ resultado.codigo || '-' }}</td>
                  <td class="px-4 py-3">{{ resultado.tipoCredito }}</td>
                  <td class="px-4 py-3">{{ resultado.afiliado || '-' }}</td>
                  <td class="px-4 py-3">{{ resultado.nombre || '-' }}</td>
                  <td class="px-4 py-3">{{ resultado.numeroCredito || '-' }}</td>
                  <td class="px-4 py-3">{{ resultado.cuotas || '-' }}</td>
                  <td class="px-4 py-3">${{ formatCurrency(resultado.importeCuota) }}</td>
                  <td class="px-4 py-3">${{ formatCurrency(resultado.importeTotal) }}</td>
                  <td class="px-4 py-3 text-right">
                    <button
                      type="button"
                      class="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                      @click="enfocarResultadoBusqueda(resultado)"
                    >
                      Ver en lote
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            v-else-if="errorBusquedaCredito"
            class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-500/50 dark:bg-red-900/30 dark:text-red-200"
          >
            {{ errorBusquedaCredito }}
          </div>
          <div v-else class="text-xs text-slate-500 dark:text-slate-400">
            Ingres&aacute; un n&uacute;mero y presion&aacute; buscar para localizar un cr&eacute;dito dentro de los lotes listados.
          </div>
        </section>
        <footer class="border-t border-slate-200 px-6 py-4 flex justify-end dark:border-slate-700">
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            @click="cerrarModalBusquedaCredito"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
    <div
      v-if="mostrarModalDetalleCredito"
      class="fixed inset-0 z-50 bg-slate-900/60 px-4 py-8 flex items-center justify-center"
      @click.self="cerrarModalDetalleCredito"
    >
      <div class="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[85vh] dark:bg-slate-950">
        <header class="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Detalle del Crédito</h2>
            <p class="text-sm text-slate-500 dark:text-slate-300">Listado de movimientos asociados al cr�dito seleccionado.</p>
          </div>
          <button
            type="button"
            class="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="cerrarModalDetalleCredito"
            aria-label="Cerrar detalle de crédito"
          >
            &times;
          </button>
        </header>
        <section class="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm text-slate-700 dark:text-slate-200">
          <div v-if="detalleModalCargando" class="py-10 text-center text-slate-500 dark:text-slate-300">
            Consultando informacion del credito...
          </div>
          <div v-else-if="detalleModalAgrupado.length" class="space-y-3">
            <div class="max-h-[400px] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table class="min-w-full text-left text-sm text-slate-700 dark:text-slate-100">
                <thead class="bg-slate-100 text-slate-700 text-xs font-semibold uppercase dark:bg-slate-800 dark:text-slate-200">
                  <tr>
                    <th class="px-4 py-3 font-semibold">Práctica</th>
                    <th class="px-4 py-3 font-semibold">Honorarios</th>
                    <th class="px-4 py-3 font-semibold">Gastos</th>
                    <th class="px-4 py-3 font-semibold">Coseguro ($)</th>
                    <th class="px-4 py-3 font-semibold">Reconoce (%)</th>
                    <th class="px-4 py-3 font-semibold">Cant. Solicitada</th>
                    <th class="px-4 py-3 font-semibold">Cant. Autorizada</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(grupo, grupoIndex) in detalleModalAgrupado" :key="`detalle-grupo-${grupo.numeroBono}-${grupoIndex}`">
                    <tr class="bg-slate-50/70 dark:bg-slate-900/60">
                      <td class="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300" colspan="7">
                        N° Bono: <span class="text-slate-900 dark:text-white">{{ grupo.numeroBono || '-' }}</span>
                      </td>
                    </tr>
                    <tr
                      v-for="(fila, index) in grupo.practicas"
                      :key="`detalle-modal-${grupo.numeroBono}-${fila.nombrePractica}-${index}`"
                      class="border-b last:border-0 dark:border-slate-700"
                    >
                      <td class="px-4 py-3 font-medium text-slate-900 dark:text-white">{{ fila.nombrePractica || '-' }}</td>
                      <td class="px-4 py-3">${{ formatCurrency(fila.honorarios) }}</td>
                      <td class="px-4 py-3">${{ formatCurrency(fila.gastos) }}</td>
                      <td class="px-4 py-3">${{ formatCurrency(fila.coseguro) }}</td>
                      <td class="px-4 py-3">{{ formatPercentage(fila.reconocePorcentaje) }}</td>
                      <td class="px-4 py-3">{{ fila.cantSolicitada }}</td>
                      <td class="px-4 py-3">{{ fila.cantAutorizada }}</td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="py-10 text-center text-slate-500 dark:text-slate-300">
            No se encontraron detalles para este crédito.
          </div>
        </section>
        <footer class="border-t border-slate-200 px-6 py-4 flex justify-end dark:border-slate-700">
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            @click="cerrarModalDetalleCredito"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
    <div
      v-if="canManageCreditos && mostrarModalEdicion"
      class="fixed inset-0 z-50 bg-slate-900/60 px-4 py-8 flex items-center justify-center"
      @click.self="cancelarEdicionDetalle"
    >
      <div class="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh] dark:bg-slate-950">
        <header class="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <h2 class="text-lg font-semibold text-slate-800">Modificar Crédito</h2>
            <p class="text-sm text-slate-500 dark:text-slate-300">
              Actualizá los datos del crédito seleccionado y guardá los cambios.
            </p>
          </div>
          <button
            type="button"
            class="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            @click="cancelarEdicionDetalle"
            aria-label="Cerrar edición de crédito"
          >
            &times;
          </button>
        </header>
        <section class="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm text-slate-700 dark:text-slate-200">
          <form @submit.prevent="guardarEdicionDetalle" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Número afiliado</span>
                <input
                  v-model="editForm.numeroAfiliado"
                  type="text"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Nombre</span>
                <input
                  v-model="editForm.nombre"
                  type="text"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">CUIL</span>
                <input
                  v-model="editForm.cuil"
                  type="text"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Sub código</span>
                <input
                  v-model="editForm.subCodigo"
                  type="number"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">N° crédito</span>
                <input
                  v-model="editForm.nroCredito"
                  type="number"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Código movimiento</span>
                <input
                  v-model="editForm.cMovimiento"
                  type="number"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Fecha cobro</span>
                <input
                  v-model="editForm.fechaCobro"
                  type="date"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Cantidad de cuotas</span>
                <input
                  v-model.number="editForm.cuotas"
                  type="number"
                  min="1"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Tipo crédito</span>
                <input
                  v-model="editForm.tipoCredito"
                  type="text"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Importe cuota</span>
                <input
                  v-model="editForm.nuevoImporteCuota"
                  type="number"
                  step="0.01"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Importe total</span>
                <input
                  v-model="editForm.nuevoImporteTotal"
                  type="number"
                  step="0.01"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </label>
            </div>
            <div>
              <label class="flex flex-col gap-1">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Observaciones</span>
                <textarea
                  v-model="editForm.observacion"
                  rows="3"
                  placeholder="Ingrese las observaciones de la modificacion"
                  class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                ></textarea>
              </label>
            </div>
            <div class="flex flex-wrap justify-end gap-3">
              <button
                type="submit"
                :disabled="editLoading"
                class="rounded bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ editLoading ? 'Guardando...' : 'Guardar cambios' }}
              </button>
              <button
                type="button"
                :disabled="editLoading"
                @click="cancelarEdicionDetalle"
                class="rounded border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition-colors duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  </main>
</template>
<style scoped>
.main-extrajudicial {
  background-image: linear-gradient(rgba(248, 250, 252, 0.94), rgba(248, 250, 252, 0.94)), var(--sanjuan-url);
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center top;
  background-attachment: fixed;
}

.extrajudicial-shell {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.9) 100%);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 1rem;
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(12px);
}

.extrajudicial-header {
  background: rgba(255, 255, 255, 0.7);
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
}

.extrajudicial-content {
  background: rgba(226, 232, 240, 0.55);
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  min-height: 20rem;
}

:global(.dark) .main-extrajudicial {
  background-image: linear-gradient(rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.92)), var(--sanjuan-url);
}

:global(.dark) .extrajudicial-shell {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.85) 100%);
  border-color: rgba(51, 65, 85, 0.8);
  box-shadow: 0 24px 50px rgba(2, 6, 23, 0.5);
}

:global(.dark) .extrajudicial-header {
  background: rgba(15, 23, 42, 0.7);
}

:global(.dark) .extrajudicial-content {
  background: rgba(15, 23, 42, 0.6);
}

.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
  max-height: 100px;
}

.lote-resaltado {
  box-shadow: 0 12px 28px rgba(59, 130, 246, 0.22), 0 0 0 3px rgba(59, 130, 246, 0.35);
  transform: translateY(-2px);
}

.numero-resaltado {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05));
  color: #1d4ed8;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
  animation: resaltar-numero 1.6s ease-in-out 0s 2;
}

@keyframes resaltar-numero {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style> 
