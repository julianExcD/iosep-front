<template>
  <Panel
    header="Busqueda Afiliado"
    :toggleable="true"
    ref="panel"
    v-model:collapsed="isCollapsed"
    :pt="{
      root: { class: 'border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100' },
      header: { class: 'border-b border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100' },
      title: { class: 'text-slate-900 dark:text-slate-100' },
      content: { class: 'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100' },
      toggler: { class: 'text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white' }
    }"
  >
    <template #icons>
      <Tag class="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">({{ cuil }} | {{ nombre }})</Tag>
    </template>
    <div class="grid grid-cols-3 gap-2">
      <div class="col-span-3 hidden sm:block">
        <h5 class="flex items-center gap-1 text-slate-800 dark:text-slate-100">
          <i class="pi pi-credit-card text-slate-600 dark:text-slate-300"></i>
          Tarjeta
        </h5>
        <Textarea
          v-model="tarjeta"
          rows="2"
          cols="60"
          class="text-xs w-full tarjeta-masked dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
          @keyup.enter="callTarjeta"
          :disabled="bloquear"
        />
      </div>
      <div class="col-span-1">
        <div class="field">
          <label for="cuil" class="text-sm font-medium text-slate-700 dark:text-slate-200">CUIL</label>
          <AutoComplete
            name="cuil"
            v-model="datos"
            :suggestions="filteredCuil"
            @complete="getData"
            optionLabel="cuil"
            forceSelection
            :delay="1000"
            class="w-full rounded-md noboton"
            inputClass="w-full dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            ref="input_cuil"
            :dropdown="true"
            @item-select="completeInfo"
            :disabled="bloquear"
            :minLength="3"
          >
            <template #optiongroup="slotProps">
              <div class="flex flex-row">
                <div>
                  <span
                    :class="{
                      'bg-red-100': slotProps.option.idMotivoBaja !== 0,
                      'text-red-800': slotProps.option.idMotivoBaja !== 0,
                      'dark:bg-rose-500/20': slotProps.option.idMotivoBaja !== 0,
                      'dark:text-rose-200': slotProps.option.idMotivoBaja !== 0,
                      'bg-green-100': slotProps.option.idMotivoBaja === 0,
                      'text-green-800': slotProps.option.idMotivoBaja === 0,
                      'dark:bg-emerald-500/20': slotProps.option.idMotivoBaja === 0,
                      'dark:text-emerald-200': slotProps.option.idMotivoBaja === 0,
                    }"
                    class="text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                  >
                    <i v-if="slotProps.option.idMotivoBaja === 0" class="pi pi-check"></i>
                    <i v-else class="pi pi-times"></i>
                  </span>
                </div>
                <div>
                  <div v-if="slotProps.option.titular">
                    <Tag class="mr-2 dark:bg-slate-800 dark:text-slate-200" icon="pi pi-user" value="Titular"></Tag>
                  </div>
                </div>
                <div>
                  {{ slotProps.option.cuil }} -
                  {{ slotProps.option.nombre }} -
                  {{ slotProps.option.a_Numero }}
                </div>
              </div>
            </template>
          </AutoComplete>
        </div>
      </div>
      <div class="col-span-2">
        <div class="field">
          <label for="cuildata" class="text-sm font-medium text-slate-700 dark:text-slate-200">NOMBRE</label>
          <InputText
            v-model="nombre"
            class="w-full dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 disabled:dark:text-slate-300"
            id="cuildata"
            type="text"
            disabled
          />
        </div>
      </div>
      <div class="col-span-1">
        <div class="field">
          <label for="titular" class="text-sm font-medium text-slate-700 dark:text-slate-200">TITULAR</label>
          <InputText
            v-model="titular"
            class="w-full dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 disabled:dark:text-slate-300"
            id="titular"
            type="text"
            disabled
          />
        </div>
      </div>
      <div class="col-span-2">
        <div class="field">
          <label for="titulardata" class="text-sm font-medium text-slate-700 dark:text-slate-200">NOMBRE</label>
          <InputText
            v-model="nombre2"
            class="w-full dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 disabled:dark:text-slate-300"
            id="titulardata"
            type="text"
            disabled
          />
        </div>
      </div>
      <div class="col-span-1 grid grid-cols-2">
        <div class="col-span-2 sm:col-span-1">
          <Button
            v-show="idafiliado !== 0"
            label="Familia"
            class="p-button-sm p-button-outlined"
            @click.stop="aceptarEvent"
          />
        </div>
        <div class="col-span-2 sm:col-span-1">
          <Button v-show="idafiliado !== 0" label="Consumo" class="p-button-sm p-button-outlined" />
        </div>
      </div>
    </div>
  </Panel>
  <br />
  <div class="col-span-6 sm:col-span-1">
    <Button
      v-if="bloquear"
      @click="cancelarEvent"
      label="Cambiar de afiliado"
      icon="pi pi-replay"
      class="p-button-sm p-button-warning"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Panel from 'primevue/panel';
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import AutoComplete from 'primevue/autocomplete';
import Tag from 'primevue/tag';
import { useCtaCteStore } from '../../../features/iosepsalud/ctacte/store/ctacte.store';
import type { AfiliadoItem } from '@/shared/types/iosepsalud/ctacte.types';

const emit = defineEmits<{ devolverAfiliado: [number] }>();
const store = useCtaCteStore();

const tarjeta = ref('');
const datos = ref<AfiliadoItem | null>(null);
const input_cuil = ref();
const panel = ref();
const cuil = ref('');
const nombre = ref('');
const titular = ref('');
const nombre2 = ref('');
const idafiliado = ref(0);
const bandera = ref(0);
const loading = ref(false);
const bloquear = ref(false);
const filteredCuil = ref<AfiliadoItem[]>([]);
const isCollapsed = ref(false);

const getData = (event: { query: string }) => {
  if (loading.value) {
    return;
  }

  loading.value = true;
  setTimeout(async () => {
    if (event.query.length > 4 || event.query.length === 0) {
      try {
        const info = await store.buscarAfiliados(event.query);
        filteredCuil.value = info.filter((fila) => fila.titular === true);
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    } else {
      loading.value = false;
    }
  }, 250);
};

const completeInfo = (event: { value: AfiliadoItem }) => {
  const data = event.value;
  if (data.titular) {
    titular.value = data.cuil;
    nombre2.value = data.nombre;
  } else {
    titular.value = data.cTitular ?? '';
    nombre2.value = data.nTitular ?? '';
  }
  idafiliado.value = data.idAfiliado;
  cuil.value = data.cuil;
  nombre.value = data.nombre;
  aceptarEvent();
};

const callTarjeta = () => {
  if (tarjeta.value.trim() === '') {
    input_cuil.value?.$el?.focus();
  } else {
    bandera.value += 1;
    if (bandera.value >= 2) {
      bandera.value = 0;
    }
  }
};

const aceptarEvent = (event?: Event) => {
  bloquear.value = true;
  event?.preventDefault();
  llamarEmit();
};

const llamarEmit = () => {
  panel.value?.toggle();
  emit('devolverAfiliado', idafiliado.value);
};

const cancelarEvent = () => {
  bloquear.value = false;
  input_cuil.value?.$el?.focus();
  cuil.value = '';
  tarjeta.value = '';
  nombre.value = '';
  titular.value = '';
  nombre2.value = '';
  idafiliado.value = 0;
  bandera.value = 0;
  filteredCuil.value = [];
  datos.value = null;
  isCollapsed.value = false;
};

watch(tarjeta, (newValue) => {
  const canAmp = newValue.split('&').length - 1;
  if (canAmp === 5) {
    const lastAmp = newValue.lastIndexOf('&');
    const findEne = newValue.indexOf('_�', lastAmp);
    if (findEne !== -1) {
      const canQues = newValue.split('�').length - 1;
      if (canQues >= 12) {
        const lastChar = newValue.substring(newValue.length - 1);
        if (lastChar === '_') {
          getData({ query: '' });
        }
      }
    }
  }
});
</script>

<style scoped>
.tarjeta-masked {
  color: transparent;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
}

:global(.dark) .tarjeta-masked {
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
}
</style>
