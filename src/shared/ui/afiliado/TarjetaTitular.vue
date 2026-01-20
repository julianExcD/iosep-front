<template>
  <Panel header="Busqueda Afiliado" :toggleable="true" ref="panel" v-model:collapsed="isCollapsed">
    <template #icons>
      <Tag> ({{ cuil }} | {{ nombre }})</Tag>
    </template>
    <div class="grid grid-cols-3 gap-2">
      <div class="col-span-3 hidden sm:block">
        <h5 class="flex items-center gap-1"><i class="pi pi-credit-card"></i>Tarjeta</h5>
        <Textarea
          v-model="tarjeta"
          rows="2"
          cols="60"
          class="text-xs w-full"
          style="color: transparent; text-shadow: 0 0 8px rgba(0,0,0,0.5);"
          @keyup.enter="callTarjeta"
          :disabled="bloquear"
        />
      </div>
      <div class="col-span-1">
        <div class="field">
          <label for="cuil">CUIL</label>
          <AutoComplete
            name="cuil"
            v-model="datos"
            :suggestions="filteredCuil"
            @complete="getData"
            optionLabel="cuil"
            forceSelection
            :delay="1000"
            class="w-full rounded-md noboton"
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
                      'bg-green-100': slotProps.option.idMotivoBaja === 0,
                      'text-green-800': slotProps.option.idMotivoBaja === 0,
                    }"
                    class="text-xs font-semibold mr-2 px-2.5 py-0.5 rounded"
                  >
                    <i v-if="slotProps.option.idMotivoBaja === 0" class="pi pi-check"></i>
                    <i v-else class="pi pi-times"></i>
                  </span>
                </div>
                <div>
                  <div v-if="slotProps.option.titular">
                    <Tag class="mr-2" icon="pi pi-user" value="Titular"></Tag>
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
          <label for="cuildata">NOMBRE</label>
          <InputText v-model="nombre" class="w-full" id="cuildata" type="text" disabled />
        </div>
      </div>
      <div class="col-span-1">
        <div class="field">
          <label for="titular">TITULAR</label>
          <InputText v-model="titular" class="w-full" id="titular" type="text" disabled />
        </div>
      </div>
      <div class="col-span-2">
        <div class="field">
          <label for="titulardata">NOMBRE</label>
          <InputText v-model="nombre2" class="w-full" id="titulardata" type="text" disabled />
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
