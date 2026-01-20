<template>
  <div class="card">
    <div class="grid grid-cols-6 gap-4">
      <div class="col-span-6">
        <label for="mov-name" class="block text-sm font-medium text-gray-700 dark:text-slate-200">Movimiento</label>
        <Select
          inputId="mov-name"
          v-model="idDetalle"
          :options="movementOptions"
          optionLabel="nombre"
          @change="completeInfo"
          optionValue="idDetalle"
          placeholder="Seleccione una opcion"
          optionGroupLabel="nombre"
          optionGroupChildren="detalle"
          class="w-full"
        >
          <template #optiongroup="slotProps">
            <div class="flex align-items-center">
              <i class="pi pi-folder mr-2"></i>
              <div>{{ slotProps.option.nombre }}</div>
            </div>
          </template>
        </Select>
      </div>

      <div class="col-span-6" v-show="idDetalle">
        <div class="grid grid-cols-6 gap-4">
          <div class="col-span-6 sm:col-span-3">
            <label for="monthpicker" class="block text-sm font-medium text-gray-700 dark:text-slate-200">Periodo</label>
            <DatePicker inputId="monthpicker" v-model="periodo" view="month" dateFormat="yy-mm" />
          </div>
        </div>
        <br />
        <div class="grid grid-cols-6 gap-4">
          <div class="col-span-6 sm:col-span-3">
            <label for="ven1" class="block text-sm font-medium text-gray-700 dark:text-slate-200">Fecha Vencimiento 1</label>
            <DatePicker inputId="ven1" :v-model="new Date(fechaVencimiento1)" @blur="handleManualChange" />
            <p v-if="mensajeAdvertencia1" style="color: #F59E0B;">Ha modificado la fecha de vencimiento 1</p>
          </div>

          <div class="col-span-6 sm:col-span-3">
            <label for="ven2" class="block text-sm font-medium text-gray-700 dark:text-slate-200">Fecha Vencimiento 2</label>
            <DatePicker inputId="ven2" :v-model="new Date(fechaVencimiento2)" @blur="handleManualChange" />
            <p v-if="mensajeAdvertencia2" style="color: #F59E0B;">Ha modificado la fecha de vencimiento 2</p>
          </div>
        </div>
        <br />
        <div class="col-span-6 sm:col-span-3">
          <div class="col-span-6 sm:col-span-8" v-show="ocularImporte">
            <label for="importe-ar" class="block text-sm font-medium text-gray-700 dark:text-slate-200">Importe</label>
            <InputNumber inputId="importe-ar" v-model="importe" mode="currency" currency="ARS" locale="es-AR" :min="0" />
            <Message v-if="!!errors.importe">{{ errors.importe }}</Message>
          </div>
          <br />
          <div class="col-span-6 sm:col-span-3" v-show="ocultarCuotas">
            <label for="Cuotas" class="text-sm font-medium text-gray-700 dark:text-slate-200">Cuotas</label>
            <InputNumber
              inputId="Cuotas"
              v-model="cuotas"
              showButtons
              buttonLayout="horizontal"
              :step="1"
              :min="1"
              :max="24"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              v-show="!usuarioValido"
            />
            <InputNumber
              v-model="cuotas"
              showButtons
              buttonLayout="horizontal"
              :step="1"
              :min="1"
              :max="99"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
              v-show="usuarioValido"
            />
            <label for="calcularCoutas" class="text-sm font-medium text-gray-700 dark:text-slate-200">Calcular Coutas:</label>
            <div class="sm:inline-flex text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" id="calcularCoutas">
              $ {{ (importe / cuotas).toFixed(2) }}
            </div>
            <br />
            <br />
            <h4>Habilitar mas de 24 cuotas</h4>
            <ToggleButton
              v-model="masOcho"
              onLabel="Si"
              offLabel="No"
              onIcon="pi pi-check"
              offIcon="pi pi-times"
              class="p-button-sm"
              aria-label="Confirmation"
              @change="habilitarMasCuotas"
            />
          </div>
        </div>
        <br />
        <div v-show="habilitarCoutas">
          <div class="col-span-6 sm:col-span-3">
            <label for="Usuario" class="text-sm font-medium text-gray-700 dark:text-slate-200">Usuario:</label>
            <InputText inputId="Usuario" type="text" v-model="usuario" />
            <label for="Contrasena" class="text-sm font-medium text-gray-700 dark:text-slate-200">Contrasena:</label>
            <Password v-model="contrasena" toggleMask :feedback="false"></Password>
            <Button label="Validar" icon="pi pi-check" class="p-button-sm" @click="validarUsuario" />
          </div>
        </div>
        <div class="col-span-6 sm:col-span-3">
          <div class="col-span-6 sm:col-span-3">
            <label for="Observaciones" class="block text-sm font-medium text-gray-700 dark:text-slate-200">Observaciones</label>
            <InputText inputId="Observaciones" type="text" v-model="obs" class="w-full" />
          </div>
          <div class="col-span-6">
            <div class="w-full text-gray-900 bg-white border border-gray-200 rounded-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <div
                class="sm:flex sm:items-center sm:justify-between w-full px-4 py-2 text-sm border-b border-gray-200 rounded-t-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-sky-200"
              >
                <div class="font-bold">Subtotal:</div>
                <div class="sm:flex">$ {{ (importe / cuotas).toFixed(2) }}</div>
              </div>
              <div
                class="sm:flex sm:items-center sm:justify-between w-full px-4 py-2 text-sm border-b border-gray-200 rounded-t-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-sky-200"
              >
                <div class="font-bold">Cuotas:</div>
                <div class="sm:flex">{{ cuotas.toFixed(2) }}</div>
              </div>
              <div
                class="sm:flex sm:items-center sm:justify-between w-full px-4 py-2 text-sm bg-indigo-100 border-b border-indigo-500 rounded-t-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:hover:text-sky-200"
              >
                <div class="font-bold">TOTAL:</div>
                <div class="sm:flex">$ {{ importe.toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <div class="col-span-6 justify-self-end">
            <Button label="Grabar" icon="pi pi-check" class="p-button-sm" @click="save" />
          </div>
        </div>
      </div>
    </div>
    <LoadingOverlay :visible="loading"/>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import ToggleButton from 'primevue/togglebutton';
import Password from 'primevue/password';
import { useToast } from 'primevue/usetoast';
import { format, parse, parseISO } from 'date-fns';
import { object, number } from 'yup';
import type { ComprobantePayload, MovimientoDetalle, MovimientoGrupo } from '@/shared/types/iosepsalud/ctacte.types';
import { useCtaCteStore } from '../store/ctacte.store';
import LoadingOverlay from '@/shared/ui/LoadingOverlay.vue';

const props = defineProps<{ idAfiliado: number; idEmpresa: number }>();
const emit = defineEmits<{ save: [unknown] }>();

const toast = useToast();
const store = useCtaCteStore();
const idDetalle = ref<number | null>(null);
const errors = ref<Record<string, string>>({});
const detalle = reactive<MovimientoDetalle>({
  idDetalle: 0,
  cuotas: false,
  consultaValorCuota: false,
  ordenesOnline: false,
  nombre: '',
});
const date = new Date();
const periodo = ref<Date>(date);
const importe = ref(0);
const cuotas = ref(1);
const obs = ref('');
const ocularImporte = ref(false);
const ocultarCuotas = ref(false);
const habilitarCoutas = ref(false);
const usuario = ref('');
const contrasena = ref('');
const usuarioValido = ref(false);
const masOcho = ref(false);
const movimientos = ref<MovimientoGrupo[]>([]);
const movementOptions = computed(() => {
  const list = Array.isArray(movimientos.value) ? movimientos.value : [];
  return list.map((mov) => ({
    ...mov,
    detalle: Array.isArray(mov.detalle) ? mov.detalle : [],
  }));
});
const fechaVencimiento1 = ref('');
const fechaVencimiento2 = ref('');
const mensajeAdvertencia1 = ref(false);
const mensajeAdvertencia2 = ref(false);
const cambioManual = ref(false);
const loading = ref(true);

const schemaSave = object().shape({
  importe: number().required('Debe ingresar un importe').positive('El importe debe ser positivo'),
});

const obtenerFechaVencimiento = async () => {
  try {
    const per = format(periodo.value, 'yyyyMM');
    return await store.cargarFechasVencimiento(per);
  } catch (error) {
    console.error('Error al obtener la fecha de vencimiento:', error);
    return null;
  }
};

onMounted(async () => {
  const fechas = await obtenerFechaVencimiento();
  if (fechas) {
    fechaVencimiento1.value = format(parseISO(fechas.vencimiento_1_Original), 'dd/MM/yyyy');
    fechaVencimiento2.value = format(parseISO(fechas.vencimiento_2_Original), 'dd/MM/yyyy');
  }

  try {
    const fetched = await store.cargarMovimientos(props.idEmpresa !== 0);
    movimientos.value = Array.isArray(fetched) ? fetched : [];
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
});

const completeInfo = () => {
  const encontro = buscarMovimiento();
  Object.assign(detalle, encontro);

  if (detalle.consultaValorCuota) {
    getImporte(periodo.value);
  }

  const firstGroup = movementOptions.value[0];
  const matches = firstGroup?.detalle?.filter((a) => a.idDetalle === idDetalle.value) ?? [];
  if (matches.length !== 0) {
    if (matches[0].consultaValorCuota) {
      ocularImporte.value = true;
      ocultarCuotas.value = false;
    } else if (matches[0].ordenesOnline) {
      ocularImporte.value = false;
      ocultarCuotas.value = false;
    } else if (matches[0].cuotas) {
      ocularImporte.value = true;
      ocultarCuotas.value = true;
    } else {
      ocularImporte.value = true;
      ocultarCuotas.value = false;
    }
  } else {
    ocularImporte.value = true;
    ocultarCuotas.value = false;
  }
};

const getImporte = async (woPeriodo: Date) => {
  loading.value = true;
  try {
    const periodoF = format(woPeriodo, 'yyyyMM');
    if (props.idEmpresa === 0) {
      const info = await store.cargarCuotaAfiliado(props.idAfiliado, periodoF);
      importe.value = info[0]?.valorCuota ?? 0;
    } else {
      const info = await store.cargarCuotaEmpresa(props.idEmpresa, periodoF);
      importe.value = info[0]?.valorCuota ?? 0;
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const buscarMovimiento = () => {
  for (const mov of movementOptions.value) {
    for (const det of mov.detalle) {
      if (det.idDetalle === idDetalle.value) {
        return det;
      }
    }
  }
  
  return {} as MovimientoDetalle;
};

const habilitarMasCuotas = () => {
  if (habilitarCoutas.value) {
    habilitarCoutas.value = false;
    usuarioValido.value = false;
  } else {
    habilitarCoutas.value = true;
    cuotas.value = 1;
  }
};

const validarUsuario = async () => {
  try {
    const info = await store.autenticarUsuario(usuario.value, contrasena.value);
    if (info === 'Ok') {
      habilitarCoutas.value = true;
      usuarioValido.value = true;
      toast.add({ severity: 'success', summary: 'Mensaje exitoso', detail: 'Cuotas habilitadas', life: 3000 });
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Error al habilitar', life: 3000 });
    }
  } catch (error) {
    console.error(error);
    loading.value = false;
  }
};

const buildPayload = (): ComprobantePayload => ({
  idComprobante: 0,
  idAfiliado: props.idAfiliado,
  idCajaTipoOrigen: 0,
  numero: '',
  cuotas: cuotas.value,
  importe: importe.value,
  codigoBarra: '',
  idTipoMovimiento: 1,
  idDetalle: idDetalle.value ?? 0,
  detalle: obs.value,
  idEmpresa: props.idEmpresa === 0 ? null : props.idEmpresa,
  periodo: format(periodo.value, 'yyyyMM'),
  anulado: false,
  Vencimiento_1_Original: format(parse(fechaVencimiento1.value, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd'),
  Vencimiento_2_Original: format(parse(fechaVencimiento2.value, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd'),
});

const save = () => {
  loading.value = true;
  errors.value = {};
  schemaSave
    .validate({ importe: importe.value }, { abortEarly: false })
    .then(async () => {
      const comprobante = buildPayload();
      try {
        const info =
          props.idEmpresa === 0
            ? await store.crearComprobanteAfiliado(comprobante)
            : await store.crearComprobanteEmpresa({ ...comprobante, idEmpresa: props.idEmpresa });
        emit('save', info);
      } catch (error) {
        console.error(error);
      } finally {
        loading.value = false;
      }
    })
    .catch((err: any) => {
      loading.value = false;
      err.inner.forEach((error: { path: string; message: string }) => {
        errors.value[error.path] = error.message;
      });
    });
};

const handleManualChange = () => {
  cambioManual.value = true;
  obtenerFechaVencimiento()
    .then((fechas) => {
      if (!fechas) {
        return;
      }
      const oldFechaVencimiento1 = format(parse(fechaVencimiento1.value, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd');
      const oldFechaVencimiento2 = format(parse(fechaVencimiento2.value, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd');

      if (oldFechaVencimiento1 === format(parseISO(fechas.vencimiento_1_Original), 'yyyy-MM-dd')) {
        cambioManual.value = false;
        mensajeAdvertencia1.value = false;
      }
      if (oldFechaVencimiento2 === format(parseISO(fechas.vencimiento_2_Original), 'yyyy-MM-dd')) {
        cambioManual.value = false;
        mensajeAdvertencia2.value = false;
      }
    })
    .catch((error) => {
      console.error('Error al obtener las fechas de vencimiento:', error);
    });
};

watch(fechaVencimiento1, () => {
  if (cambioManual.value) {
    mensajeAdvertencia1.value = true;
    cambioManual.value = false;
  } else {
    mensajeAdvertencia1.value = false;
  }
});

watch(fechaVencimiento2, () => {
  if (cambioManual.value) {
    mensajeAdvertencia2.value = true;
    cambioManual.value = false;
  } else {
    mensajeAdvertencia2.value = false;
  }
});

watch(periodo, async (newValue, oldValue) => {
  getImporte(newValue);
  if (newValue !== oldValue) {
    const fechas = await obtenerFechaVencimiento();
    if (!fechas) {
      return;
    }
    cambioManual.value = false;
    fechaVencimiento1.value = format(parseISO(fechas.vencimiento_1_Original), 'dd/MM/yyyy');
    fechaVencimiento2.value = format(parseISO(fechas.vencimiento_2_Original), 'dd/MM/yyyy');
  }
});
</script>
