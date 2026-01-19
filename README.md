# IOSEP - FRONTEND - VUE

Este proyecto unifica los modulos de IOSEP existentes (Iosep Salud y Sistema de Creditos), con escalabilidad para futuras implementaciones.
Esta estructurado con una **arquitectura por capas / feature-first** explicado en este README si se quiere implementar nuevos modulos.

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
npm run dev
npm run build
npm run preview
```

## Estructura por capas

```text
src/
├─ app/              # Composición y configuración de la aplicación
├─ core/             # Infraestructura técnica transversal
├─ features/         # Funcionalidades organizadas por dominio
├─ shared/           # Reutilizables y contratos comunes
├─ assets/           # Recursos estáticos
├─ App.vue           # Shell principal
└─ main.ts           # Bootstrap de la aplicación
```

### Capa `app/`

Responsable de **configurar y orquestar** la aplicación. *NO debe contener lógica de negocio*

- `app/config/`: configuraciones (ej. PrimeVue, temas, locale, etc.).
- `app/router/`: router raíz y guards globales.
- `app/styles/`: estilos globales.
- `app/mappers/`: mapeos transversales (ej. normalización de errores).

**Ejemplo**: el router principal se define en `app/router/index.ts` y consume rutas definidas en `features/<feature>/routes.ts`.

### Capa `core/`

Infraestructura técnica reutilizable y agnóstica del dominio.

- `core/http/axios-instance.ts`: instancia de Axios con configuración base.
- `core/base/`: servicios base para estandarizar respuestas, errores y logging.
  - `base.service.ts` define métodos `get`, `post`, `put`, `delete` con tipado homogéneo.
  - `error-handler.service.ts` y `response-handler.service.ts` normalizan errores/respuestas.

### Capa `features/`

Organiza el **dominio por funcionalidades**. Cada feature puede agrupar vistas, componentes, stores,
servicios y rutas propias.

- Ejemplo actual: `features/home/views/Home.vue` representa la vista de Home.

**Sugerencia de convención (por feature):**

```text
features/
└─ home/
   ├─ views/        # Vistas asociadas a rutas
   ├─ components/   # Componentes propios del feature
   ├─ store/        # Store Pinia del feature
   ├─ api/          # Servicios HTTP del dominio
   └─ routes.ts     # Rutas del feature
```

**Responsabilidades:**

- `views`: orquestan UI, stores y componentes
- `components`: UI específica del feature
- `store`: estado y lógica de aplicación (Pinia)
- `api`: integración HTTP del dominio
- `routes.ts`: definición de rutas del feature

### Capa `shared/`

Elementos **reutilizables** y contratos comunes.

- `shared/ui/`: componentes UI compartidos.
- `shared/types/`: tipos y contratos comunes.
- `shared/composables/`: lógica reutilizable basada en Composition API.
- `shared/utils/`: funciones puras reutilizables, sin dependencias de Vue.

### Otros archivos clave

- `main.ts`: bootstrap general (Pinia, Router, PrimeVue, servicios globales).
- `App.vue`: contenedor principal con `<router-view />`.

## Convenciones de estructura
- views no llaman a servicios
- composables (funciones con vue) y utils (funciones puras, sin vue)
- api/store por feature

## Convenciones de importación

Se utiliza el alias `@` para apuntar a `src/`. Ejemplo:

```ts
import DefaultLayout from '@/shared/ui/layouts/Default.vue'
```

## Reglas y Recomendaciones

- No llamar APIs directamente desde componentes o vistas.
- Centralizar la integración HTTP en **core** y **features/<x>/api**
- Mantener UI reutilizable en **shared/ui**
- Agrupar lógica de negocio y estado por feature
- Usar **utils** solo para funciones puras
- Usar **composables** solo cuando haya reactividad de Vue

## Objetivo de la arquitectura
- Código predecible y mantenible
- Features autocontenidos
- Escalabilidad sin acoplamiento
- Onboarding simple para nuevos desarrolladores
