<template>
  <DataTable :value="familia" responsiveLayout="scroll">
    <Column field="afiliadoID" header="ID" />
    <Column field="familiar" header="Familiar" />
    <Column field="cuil" header="CUIL" />
    <Column field="nombre" header="Nombre" />
    <Column field="estado" header="Estado" />
    <Column field="getFechaNacimiento" header="Fec. Nac." />
    <Column field="edad" header="Edad" />
  </DataTable>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useCtaCteStore } from '../../../features/iosepsalud/ctacte/store/ctacte.store';
import type { GrupoFamiliarItem } from '@/shared/types/iosepsalud/ctacte.types';

const props = defineProps<{ idAfiliado: number }>();
const store = useCtaCteStore();

const familia = ref<GrupoFamiliarItem[]>([]);

onMounted(async () => {
  try {
    familia.value = await store.cargarGrupoFamiliar(props.idAfiliado);
  } catch (error) {
    console.error(error);
  }
});
</script>
