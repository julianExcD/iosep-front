<template>
  <div class="card shadow ml-2 mr-2 mb-2 border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
    <div class="shadow sm:rounded-md sm:overflow-hidden">
      <div class="grid grid-cols-6 gap-6 p-2">
        <div class="col-span-6 flex flex-col gap-2">
          <label for="nombre-name" class="block text-sm font-medium text-gray-700 dark:text-slate-200">
            Empresa o Afiliado Voluntario
          </label>
          <div class="flex items-center gap-2">
            <ToggleSwitch inputId="nombre-name" v-model="data.save.esEmpresa" @change="cleanCtaCte" />
            <span class="text-xs">{{ textEsEmpresa }}</span>
          </div>
        </div>

        <div class="col-span-6">
          <AutoComplete
            v-if="data.save.esEmpresa"
            v-model="empresa"
            class="w-full"
            :suggestions="empresasFiltradas"
            @complete="buscarEmpresa"
            @item-select="mostrarCtaCte"
            :dropdown="true"
            optionLabel="nombre"
            forceSelection
          >
          </AutoComplete>

          <TarjetaTitular v-else @devolverAfiliado="mostrarCtaCte"></TarjetaTitular>
        </div>

        <div class="col-span-6">
          <div class="relative flex items-center">
            <div class="flex-grow border-t border-gray-400 dark:border-slate-700"></div>
            <span class="flex-shrink mx-4 p-tag">Cuenta Corriente</span>
            <div class="flex-grow border-t border-gray-400 dark:border-slate-700"></div>
          </div>
        </div>

        <div class="col-span-6 xl:col-start-2 xl:col-span-2">
          <label for="desde">Desde</label>
          <DatePicker
            inputId="desde"
            v-model="data.desde"
            :showIcon="true"
            view="month"
            dateFormat="mm/yy"
            class="mt-1 w-full"
          />
        </div>

        <div class="col-span-6 xl:col-span-2">
          <label for="hasta">Hasta</label>
          <DatePicker
            inputId="hasta"
            v-model="data.hasta"
            :showIcon="true"
            view="month"
            dateFormat="mm/yy"
            class="mt-1 w-full"
          />
        </div>

        <LoadingOverlay :visible="loading" :full-screen="false"/>

        <div v-if="showCtaCte && !loading" class="card col-span-6">
          <Toolbar class="mb-4">
            <template #start>
              <Button
                label="Nuevo comprobante"
                icon="pi pi-plus"
                class="p-button-sm p-button-success mr-2"
                @click="setModal('movimiento', true)"
              />

              <Button
                label="Grupo Familiar"
                icon="pi pi-check"
                @click="setModal('grupoFamiliar', true)"
                class="p-button-sm mr-2"
              />

              <Button
                v-if="data.save.esEmpresa"
                label="Revisar Afiliados"
                icon="pi pi-list"
                @click="revisarAfiliados(data.idEmpresa)"
                class="p-button-sm p-button-secondary"
              />
            </template>
            <template #end>
              <Button label="Exportar" icon="pi pi-upload" class="p-button-sm p-button-help" @click="exportCSV" />
            </template>
          </Toolbar>
          <DataTable
            ref="dt"
            :value="dataModel"
            v-model:selection="selectedDatas"
            dataKey="id"
            :filters="filters"
            class="p-datatable-sm"
            showGridlines
            :loading="loading"
            responsiveLayout="stack"
            rowGroupMode="subheader"
            groupRowsBy="periodo"
            :paginator="true"
            :rows="10"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[10, 25, 50]"
            currentPageReportTemplate="Registro del {first} al {last} de {totalRecords} totales"
          >
            <template #header>
              <div class="flex justify-between">
                <div >
                  <IconField>
                      <InputIcon class="pi pi-search" />
                      <InputText v-model="filters['global'].value" placeholder="Buscar..." />
                  </IconField>
                </div>
                <div >
                  <Button
                    type="button"
                    label="Actualizar datos"
                    icon="pi pi-refresh"
                    class="p-button-text p-button-sm"
                    @click="mostrarCtaCte(data.save.esEmpresa ? data.idEmpresa : data.idAfiliado)"
                  />
                </div>
              </div>
            </template>

            <Column field="periodo" header="Periodo" :sortable="true" style="min-width: 8rem" />
            <Column field="numero" header="Comprobante" :sortable="true" style="min-width: 8rem" />
            <Column field="detalleFactura" header="Detalle" :sortable="true" style="min-width: 12rem" />
            <Column field="detalle" header="Observaciones" :sortable="true" style="min-width: 12rem" />
            <Column field="debe" header="Debe" :sortable="true" style="min-width: 8rem">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.debe) }}
              </template>
            </Column>
            <Column field="haber" header="Haber" :sortable="true" style="min-width: 8rem">
              <template #body="slotProps">
                {{ formatCurrency(slotProps.data.haber) }}
              </template>
            </Column>
            <Column field="saldo" header="Saldo" :sortable="true" style="min-width: 8rem">
              <template #body="slotProps">
                <span v-if="slotProps.data.idComprobante !== 0">
                  {{ formatCurrency(slotProps.data.saldo) }}
                </span>
                <span v-else>
                  <Tag class="mr-2" severity="warning" :value="formatCurrency(slotProps.data.saldo)"></Tag>
                </span>
              </template>
            </Column>

            <Column :exportable="false" style="min-width: 8rem">
              <template #body="slotProps">
                <Button
                  icon="pi pi-angle-down"
                  class="p-button-text"
                  type="button"
                  label="Opciones"
                  @click="toggleMenuGrid($event, slotProps.data)"
                  aria-haspopup="true"
                  :aria-controls="'overlay_submenu_' + slotProps.data.idComprobante"
                />
                <Menu
                  v-if="slotProps.data.idComprobante === 0"
                  :id="'overlay_submenu_' + slotProps.data.idComprobante"
                  :ref="(el) => functionRefs(el, slotProps.data.idComprobante)"
                  :model="itemsMenuViejo"
                  :popup="true"
                />

                <Menu
                  v-else-if="slotProps.data.idComprobante !== 0 && slotProps.data.Estado === 'P'"
                  :id="'overlay_submenu_' + slotProps.data.idComprobante"
                  :ref="(el) => functionRefs(el, slotProps.data.idComprobante)"
                  :model="itemsMenuPagado"
                  :popup="true"
                />

                <Menu
                  v-else
                  :id="'overlay_submenu_' + slotProps.data.idComprobante"
                  :ref="(el) => functionRefs(el, slotProps.data.idComprobante)"
                  :model="itemsMenu"
                  :popup="true"
                />
              </template>
            </Column>

            <ColumnGroup type="footer">
              <Row>
                <Column footer="Total:" :colspan="6" footerStyle="text-align:right" />
                <Column :footer="saldoTotal" />
              </Row>
            </ColumnGroup>

            <template #groupheader="slotProps">
              <div>
                Periodo:
                <Tag class="ml-2" severity="info">
                  {{ slotProps.data.periodo.substring(0, 4) }} - {{ slotProps.data.periodo.substring(4) }}
                </Tag>
              </div>
            </template>
          </DataTable>
          <br />
          <Dialog
            header="Cuenta Corriente"
            v-model:visible="data.modales.viejo"
            :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
            :style="{ width: '50vw' }"
            :modal="true"
          >
            <CtaCteViejo :idAfiliado="data.idAfiliado" />
            <template #footer>
              <Button label="Aceptar" icon="pi pi-check" @click="setModal('viejo', false)" class="p-button-sm" autofocus />
              <Button
                label="Nuevo Movimiento"
                icon="pi pi-check"
                @click="setModal('movimiento', true)"
                class="p-button-sm"
                autofocus
              />
            </template>
          </Dialog>
        </div>
      </div>
    </div>

    <Dialog
      header="Nuevo movimiento"
      v-model:visible="data.modales.movimiento"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '50vw' }"
      :modal="true"
    >
      <CtaCteMovimiento :idAfiliado="data.idAfiliado" :idEmpresa="data.idEmpresa" @click="graboMovimiento" />
    </Dialog>

    <Dialog
      header="Grupo Familiar"
      v-model:visible="data.modales.grupoFamiliar"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
      :style="{ width: '50vw' }"
      :modal="true"
    >
      <GrupoFamiliar :idAfiliado="data.idAfiliado" />
    </Dialog>

    <Dialog
      v-bind:header="nombreArchivo"
      v-model:visible="data.modales.imprimir"
      :breakpoints="{ '1000px': '75vw', '700px': '90vw' }"
      :style="{ width: '50vw' }"
      :modal="true"
    >
      <div class="flex flex-wrap shadow-xl">
        <div class="m-4">
          <Button label="Imprimir" icon="pi pi-print" class="p-button-outlined p-button-secondary" @click="openPDF('print')" />
        </div>
        <div class="m-4">
          <Button label="Descargar" icon="pi pi-download" class="p-button-outlined p-button-secondary" @click="openPDF('download')" />
        </div>
        <div class="m-4">
          <Button
            icon="pi pi-search-minus"
            class="p-button-rounded p-button-secondary p-button-outlined"
            @click="data.modales.zoom -= 100"
            :disabled="data.modales.zoom < 500"
          />
        </div>
        <div class="m-4">
          <Button
            icon="pi pi-search-plus"
            class="p-button-rounded p-button-secondary p-button-outlined"
            @click="data.modales.zoom += 100"
            :disabled="data.modales.zoom > 3000"
          />
        </div>
      </div>
      <div class="flex mt-4 justify-center">
        <vue-pdf-embed :source="pdfSource" :height="data.modales.zoom" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import Menu from 'primevue/menu';
import AutoComplete from 'primevue/autocomplete';
import ToggleSwitch  from 'primevue/toggleswitch';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import DataTable from 'primevue/datatable';
import Toolbar from 'primevue/toolbar';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import { FilterMatchMode } from '@primevue/core/api';
import Tag from 'primevue/tag';
import BlockUI from 'primevue/blockui';
import VuePdfEmbed from 'vue-pdf-embed';
import printJS from 'print-js';
import { useRouter } from 'vue-router';
import { format, subYears } from 'date-fns';
import { storeToRefs } from 'pinia';
import CtaCteViejo from './components/CtaCteViejo.vue';
import CtaCteMovimiento from './components/CtaCteMovimiento.vue';
import GrupoFamiliar from '@/shared/ui/afiliado/GrupoFamiliar.vue';
import TarjetaTitular from '@/shared/ui/afiliado/TarjetaTitular.vue';
import { useCtaCteStore } from './store/ctacte.store';
import { useCtaCte } from './composables/useCtaCte';
import type { CtaCteItem, Empresa } from '@/shared/types/iosepsalud/ctacte.types';
import LoadingOverlay from '@/shared/ui/LoadingOverlay.vue';

type Filters = Record<string, { value: string | null; matchMode: string }>;

defineProps<{ info?: Record<string, unknown> }>();

defineEmits<{ closeModal: [] }>();

const toast = useToast();
const confirm = useConfirm();
const router = useRouter();
const store = useCtaCteStore();
const { dataModel, loading, empresasFiltradas, showCtaCte } = storeToRefs(store);
const { formatCurrency } = useCtaCte();

const dt = ref();
const selectedDatas = ref<CtaCteItem[]>([]);
const dataOnly = ref<CtaCteItem | null>(null);
const menu = ref<Record<string, unknown>>({});
const filters = ref<Filters>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const nombreArchivo = ref('');
const empresa = ref<Empresa | null>(null);
const pdfSource = ref('');
const data = reactive({
  desde: null as Date | null,
  hasta: null as Date | null,
  save: {
    esEmpresa: false,
  },
  modales: {
    viejo: false,
    movimiento: false,
    grupoFamiliar: false,
    imprimir: false,
    zoom: 900,
  },
  idAfiliado: 0,
  idEmpresa: 0,
  urlImprimir: '',
});

onMounted(() => {
  initialLoad();
});

const itemsMenu = ref([
  {
    label: 'Opciones',
    items: [
      {
        label: 'Imprimir',
        icon: 'pi pi-print',
        command: () => {
          const idCom = dataOnly.value?.idComprobante ?? 0;
          imprimirComprobante(idCom);
        },
      },
      {
        label: 'Anular',
        icon: 'pi pi-ban',
        command: () => {
          alertAnular();
        },
      },
    ],
  },
]);

const itemsMenuPagado = ref([
  {
    label: 'Opciones',
    items: [
      {
        label: 'Imprimir',
        icon: 'pi pi-print',
        command: () => {
          const idCom = dataOnly.value?.idComprobante ?? 0;
          imprimirComprobante(idCom);
        },
      },
    ],
  },
]);

const itemsMenuViejo = ref([
  {
    label: 'Cuenta Corriente',
    items: [
      {
        label: 'Ver Cuenta Antigua',
        icon: 'pi pi-database',
        command: () => {
          data.modales.viejo = true;
        },
      },
    ],
  },
]);

const initialLoad = () => {
  data.hasta = new Date();
  data.desde = subYears(data.hasta, 1);
};

const functionRefs = (el: unknown, id: number) => {
  const key = id === 0 ? 'Viejo' : String(id);
  menu.value[key] = el;
};

const textEsEmpresa = computed(() => (data.save.esEmpresa ? 'es Empresa' : 'es Afiliado'));

const exportCSV = () => {
  dt.value?.exportCSV();
};

const saldoTotal = computed(() => {
  let total = 0;
  if (dataModel.value.length > 0) {
    for (const item of dataModel.value) {
      total = item.saldo;
    }
  }
  return formatCurrency(total);
});

const toggleMenuGrid = (event: Event, row: CtaCteItem) => {
  const newID = row.idComprobante === 0 ? 'Viejo' : String(row.idComprobante);
  (menu.value as Record<string, { toggle: (e: Event) => void }>)[newID]?.toggle(event);
  dataOnly.value = row;
};

const setModal = (modal: 'viejo' | 'movimiento' | 'grupoFamiliar' | 'imprimir', open: boolean) => {
  data.modales[modal] = open;
};

const graboMovimiento = (info: CtaCteItem[]) => {
  dataModel.value = info;
  setModal('movimiento', false);
};

const imprimirComprobante = async (idComp: number) => {
  if (!idComp) {
    return;
  }

  loading.value = true;
  try {
    const pdfBuffer = await store.obtenerPdf(idComp);
    nombreArchivo.value = 'Archivo CtaCte';
    const newBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(newBlob);
    data.urlImprimir = url;
    pdfSource.value = url;
    setModal('imprimir', true);
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const openPDF = (type: 'print' | 'download') => {
  switch (type) {
    case 'print':
      printJS(data.urlImprimir);
      break;
    case 'download':
      window.open(data.urlImprimir);
      break;
  }
};

const buscarEmpresa = (event: { query: string }) => {
  setTimeout(async () => {
    if (event.query.length > 2 || event.query.length === 0) {
      try {
        await store.buscarEmpresas(event.query);
      } catch (error) {
        console.error(error);
      }
    }
  }, 250);
};

const mostrarCtaCte = async (id: number | { value?: { idEmpresa?: number } } | { idEmpresa?: number }) => {
  if (id === 0 || id === null || id === undefined) {
    return;
  }

  let idBuscar = 0;
  let esEmpresa = false;

  if (typeof id === 'number') {
    idBuscar = id;
    data.idAfiliado = idBuscar;
    data.idEmpresa = 0;
  } else if ('value' in id && id.value?.idEmpresa) {
    idBuscar = id.value.idEmpresa;
    esEmpresa = true;
    data.idEmpresa = idBuscar;
    data.idAfiliado = 0;
  } else if ('idEmpresa' in id && id.idEmpresa) {
    idBuscar = id.idEmpresa;
    esEmpresa = true;
    data.idEmpresa = idBuscar;
    data.idAfiliado = 0;
  }

  const desdeFormat = data.desde ? format(data.desde, 'yyyyMM') : '';
  const hastaFormat = data.hasta ? format(data.hasta, 'yyyyMM') : '';

  try {
    await store.cargarCtaCte({
      idAfiliado: esEmpresa ? undefined : idBuscar,
      idEmpresa: esEmpresa ? idBuscar : undefined,
      desde: desdeFormat,
      hasta: hastaFormat,
    });
  } catch (error) {
    console.error(error);
  }
};

const confirmAnular = () => {
  if (!dataOnly.value) {
    return;
  }

  if (data.save.esEmpresa) {
    confirm.require({
      message: `Desea anular el comprobante ${dataOnly.value.numero}?`,
      header: 'Anular',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await store.anularComprobante({
            idComprobante: dataOnly.value?.idComprobante ?? 0,
            idAfiliado: dataOnly.value?.idAfiliado,
            periodo: dataOnly.value?.periodo,
            esEmpresa: true,
          });
        } catch (error) {
          console.error('Error en la solicitud:', error);
        }
      },
    });
  } else {
    confirm.require({
      message: `Desea anular el comprobante ${dataOnly.value.numero}?`,
      header: 'Anular',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await store.anularComprobante({
            idComprobante: dataOnly.value?.idComprobante ?? 0,
            esEmpresa: false,
          });
        } catch (error) {
          console.error(error);
        }
      },
    });
  }
};

const alertAnular = () => {
  if (!dataOnly.value) {
    return;
  }

  const arrayNumPago = dataModel.value.map((el) => el.numeroPago).filter((el) => el != null);
  const numPagoOnly = dataOnly.value.numeroPago;
  const numFactOnly = dataOnly.value.numero;
  const numPagoEachFact = dataModel.value.find((el) => el.numeroPago === numFactOnly);

  if (numPagoOnly != null) {
    confirmAnular();
  } else if (arrayNumPago.some((el) => el === numFactOnly)) {
    toast.add({
      severity: 'warn',
      summary: 'Anular',
      detail: `Para poder anular este comprobante primero debe anular el comprobante ${numPagoEachFact?.numero}`,
      life: 10000,
    });
  } else {
    confirmAnular();
  }
};

const cleanCtaCte = () => {
  store.resetCtaCte();
};

const revisarAfiliados = async (idEmpresa: number) => {
  router.push({ name: 'Revisar Afiliados', params: { idEmpresa } });
};
</script>
