<template>
  <section class="iosephome relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-6 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:p-10">
    <div class="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-sky-300/60 via-cyan-200/60 to-emerald-200/60 blur-3xl dark:from-sky-500/30 dark:via-cyan-400/30 dark:to-emerald-400/30"></div>
    <div class="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-200/70 via-slate-200/60 to-amber-200/60 blur-3xl dark:from-indigo-500/20 dark:via-slate-500/20 dark:to-amber-500/20"></div>

    <div class="relative">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">IOSEP</p>
      <h1 class="mt-3 text-3xl font-semibold leading-tight text-slate-900 dark:text-white md:text-4xl">
        Instituto Obra Social del Empleado Provincial
      </h1>
      <p class="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300">
        Plataforma unificada para gestionar la obra social y el sistema de creditos. Este frontend organiza los
        modulos por feature para asegurar crecimiento ordenado y una experiencia consistente para afiliados,
        prestadores y administracion.
      </p>

      <div class="mt-6 flex flex-wrap gap-3">
        <router-link
          to="/iosepsalud/ctacte"
          class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Ir a Cuenta Corriente
          <i class="pi pi-arrow-right text-xs"></i>
        </router-link>
        <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-300">
          Sistema de Creditos en migracion
        </span>
      </div>
    </div>

    <div class="relative mt-10 grid gap-6 md:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Iosep Salud</h2>
          <span class="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">Activo</span>
        </div>
        <p class="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Gestion de afiliados, cuentas corrientes, movimientos y consultas operativas del dominio salud.
        </p>
        <div class="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span class="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">Afiliados</span>
          <span class="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">Comprobantes</span>
          <span class="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">Facturación</span>
        </div>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Sistema de Creditos</h2>
          <span class="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">En avance</span>
        </div>
        <p class="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Modulo de creditos y convenios integrados al ecosistema IOSEP. Preparado para migracion y nuevas vistas.
        </p>
        <div class="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span class="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">Convenios</span>
          <span class="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">Cobranzas</span>
          <span class="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">Planificacion</span>
        </div>
      </div>
    </div>

    <div class="relative mt-10 grid gap-4 md:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Objetivo</p>
        <p class="mt-2">Unificar procesos con trazabilidad, performance y mantenibilidad.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Beneficio</p>
        <p class="mt-2">Mejor experiencia para afiliados, empresas y operadores internos.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Estado</p>
        <p class="mt-2">Refactorizacion activa con enfoque feature-first.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;600;700&display=swap');

.iosephome {
  font-family: 'IBM Plex Sans', 'Segoe UI', sans-serif;
  animation: rise 700ms ease-out;
}

@keyframes rise {
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
