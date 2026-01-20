<template>
  <div class="card">
    <DataTable
      ref="dt"
      :value="datas"
      class="p-datatable-sm"
      responsiveLayout="scroll"
      removableSort
      showGridlines
      sortMode="single"
      sortField="periodo"
      :sortOrder="1"
      stripedRows
      :loading="loading"
      rowGroupMode="subheader"
      groupRowsBy="periodo"
      :filters="filters"
    >
      <template #header>
        <div class="table-header flex flex-column md:flex-row md:justiify-content-between">
          <h5 class="mb-2 md:m-0 p-as-md-center">Cuenta Corriente</h5>
          <span class="p-input-icon-left m-2">
            <i class="pi pi-search" />
            <InputText v-model="filters['global'].value" placeholder="Filtrar..." />
          </span>
          <div class="ml-2">
            <Button icon="pi pi-external-link" label="Export" @click="exportCSV" />
          </div>
        </div>
      </template>
      <Column field="periodo" header="Periodo" :sortable="true" />
      <Column field="numero" header="Comprobante" />
      <Column field="detalle" header="Detalle" />
      <Column field="cuotas" header="Cuotas" />
      <Column field="debe" header="Debe">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.debe) }}
        </template>
      </Column>
      <Column field="haber" header="Haber">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.haber) }}
        </template>
      </Column>
      <Column field="saldo" header="Saldo">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.saldo) }}
        </template>
      </Column>
      <template #groupheader="slotProps">
        <div>
          Periodo:
          <Tag class="ml-2" severity="info">
            {{ slotProps.data.periodo.substring(0, 4) }} - {{ slotProps.data.periodo.substring(4) }}
          </Tag>
        </div>
      </template>
      <template #groupfooter="slotProps">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>{{ sumSaldo }}</td>
        <td style="text-align: right" class="font-bold p-pr-6">Total: ${{ calculateTotal(slotProps.data) }}</td>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { FilterMatchMode } from '@primevue/core/api';
import { useCtaCteStore } from '../store/ctacte.store';
import type { CtaCteViejoItem } from '@/shared/types/iosepsalud/ctacte.types';

type Filters = Record<string, { value: string | null; matchMode: string }>;

const props = defineProps<{ idAfiliado: number }>();
const store = useCtaCteStore();

const loading = ref(true);
const dt = ref();
const datas = ref<CtaCteViejoItem[]>([]);
const filters = ref<Filters>({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

onMounted(async () => {
  loading.value = true;
  try {
    datas.value = await store.cargarCtaCteViejo(props.idAfiliado);
  } catch (error) {
    console.error('Error Mounted:', error);
  } finally {
    loading.value = false;
  }
});

const exportCSV = () => {
  dt.value?.exportCSV();
};

const formatCurrency = (value?: number) => {
  if (value === undefined || value === null) {
    return '';
  }
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const calculateTotal = (row: CtaCteViejoItem) => {
  let debe = 0;
  let haber = 0;

  for (const d of datas.value) {
    if (d.periodo === row.periodo) {
      debe += Number(d.debe);
      haber += Number(d.haber);
    }
  }
  return debe - haber;
};

const sumSaldo = computed(() => '');
</script>
