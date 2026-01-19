# Plantilla Vue 3 + TypeScript + Vite (Arquitectura por capas)

Plantilla base para proyectos Vue 3 con TypeScript, Vite, Pinia, Vue Router y PrimeVue.
La estructura está organizada por capas para separar responsabilidades y facilitar la escalabilidad.

## Requisitos

- Node 20+
- npm

## Inicio rápido

```bash
npm install
npm run dev
```

## Scripts útiles

```bash
npx degit tu-org/vue-clean-template mi-proyecto (crear repo con este template)
npm run dev
npm run build
npm run preview
```

## Estructura por capas

```text
src/
├─ app/              # Capa de composición de la aplicación
├─ core/             # Infraestructura transversal (HTTP, logging, etc.)
├─ features/         # Funcionalidades por dominio
├─ shared/           # Reutilizables y contratos comunes
├─ assets/           # Recursos estáticos
├─ App.vue           # Shell principal
└─ main.ts           # Bootstrap de la aplicación
```

### Capa `app/`

Responsable de **configurar y orquestar** la aplicación.

- `app/config/`: configuración de PrimeVue (tema y locale).
- `app/router/`: definición de rutas y guards globales.
- `app/styles/`: estilos globales de la app.
- `app/mappers/`: mapeos transversales (ej. `error-status.mapper.ts`).

**Ejemplo**: el router principal se compone en `app/router/index.ts` y consume rutas definidas en `app/router/routes.ts`.

### Capa `core/`

Infraestructura técnica reutilizable y agnóstica del dominio.

- `core/http/axios-instance.ts`: instancia de Axios con configuración base.
- `core/http/base/`: servicios base para estandarizar respuestas, errores y logging.
  - `base.service.ts` define métodos `get`, `post`, `put`, `delete` con tipado homogéneo.
  - `error-handler.service.ts` y `response-handler.service.ts` normalizan errores/respuestas.

### Capa `features/`

Organiza el **dominio por funcionalidades**. Cada feature puede agrupar vistas, componentes, stores,
servicios y rutas propias.

- Ejemplo actual: `features/views/home/Home.vue` representa la vista de Home.

**Sugerencia de convención (por feature):**

```text
features/
└─ home/
   ├─ views/
   ├─ components/
   ├─ store/
   ├─ app/
   └─ routes.ts
```

### Capa `shared/`

Elementos **reutilizables** y contratos comunes.

- `shared/ui/`: componentes UI compartidos (ej. layouts).
- `shared/types/`: tipos y contratos (ej. `service-response.ts`).

### Otros archivos clave

- `main.ts`: bootstrap general (Pinia, Router, PrimeVue, servicios globales).
- `App.vue`: contenedor principal con `<router-view />`.

## Convenciones de importación

Se utiliza el alias `@` para apuntar a `src/`. Ejemplo:

```ts
import DefaultLayout from '@/shared/ui/layouts/Default.vue'
```

## Recomendaciones de extensión

- Mantener las dependencias de infraestructura en `core`.
- Evitar lógica de red en componentes; encapsularla en servicios.
- Centralizar UI reutilizable en `shared/ui`.
- Agrupar lógica de negocio por feature en `features/`.
