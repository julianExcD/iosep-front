# Frontend Vue

Proyecto frontend basado en:

- Vue 3 + TypeScript
- Vite
- Pinia
- Vue Router
- PrimeVue

## Requisitos

- Node.js 20+
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

## Arquitectura

El proyecto usa una estructura por capas con enfoque feature-first:

```text
src/
├─ app/          # Shell de la aplicación (composición global)
├─ core/         # Infra transversal (cross-feature)
├─ features/     # Features-first (por dominio)
├─ shared/       # Reutilizables cross-feature
└─ assets/       # Recursos estáticos
```

### Capa `app/`

`src/app` contiene el wiring global (sin lógica de negocio):

```text
src/app/
├─ bootstrap/    # init: plugins, config global (PrimeVue, Pinia, etc.)
├─ layout/       # layout global (header/sidebar/footer)
├─ router/       # router raíz y guards globales
├─ providers/    # providers globales (toast, confirm, dialog, etc.)
├─ styles/       # css global
└─ index.ts      # exports del shell
```

Puntos clave:

- `src/main.ts` delega en `createApplication()`.
- La config de PrimeVue vive en `src/app/bootstrap/primevue`.
- Los servicios globales (Toast/Confirm) se registran en `src/app/providers`.

### Capa `core/`

Infraestructura transversal (cross-feature), agnóstica del dominio:

```text
src/core/
├─ http/      # cliente HTTP + interceptors + typing base
├─ auth/      # manejo de sesión/token/guards (si aplica)
├─ storage/   # wrapper localStorage/sessionStorage
├─ config/    # env, endpoints, feature flags
├─ logging/   # logger (opcional)
└─ errors/    # errores comunes y mapeos (ApiError, etc.)
```

Ejemplos actuales:

- `src/core/http/axios-instance.ts`: instancia de Axios.
- `src/core/http/base.service.ts`: helpers base para servicios HTTP.
- `src/core/errors/error-handler.service.ts`: normaliza errores.

### Capa `features/`

Cada feature es autocontenida y se organiza por capas:

```text
src/features/
└─ <feature>/
   ├─ index.ts              # barrel opcional del feature (exports)
   ├─ domain/                # Núcleo del feature: reglas y modelos de negocio
   │  ├─ models/             # tipos del dominio
   │  └─ contracts/          # puertos/interfaces (repositories, gateways)
   ├─ application/           # Casos de uso (orquestación)
   │  ├─ use-cases/          # acciones: listar, crear, editar, etc.
   │  └─ dtos/               # shapes request/response (si aplica)
   ├─ infrastructure/        # Adaptadores: API/repos concretos, mappers hacia dominio
   │  ├─ api/                # llamadas HTTP específicas del feature
   │  ├─ repositories/       # implementaciones de contracts (ej. ProviderRepoApi)
   │  └─ mappers/            # transformaciones API <-> dominio
   └─ presentation/          # UI + routing del feature
      ├─ views/              # vistas asociadas a rutas
      ├─ components/         # componentes propios del feature
      ├─ store/              # store Pinia del feature
      ├─ composables/        # hooks específicos del feature (opcional)
      └─ routes.ts           # rutas del feature
```

Notas:

- `domain/` no depende de Vue ni de HTTP.
- `application/` usa `domain/` y define los casos de uso.
- `infrastructure/` implementa contratos (ej. repositorios HTTP).
- `presentation/` contiene lo UI (router, views, components, store).

### Capa `shared/`

Reutilizables cross-feature (sin acoplar dominios):

```text
src/shared/
├─ ui/          # componentes tontos (sin negocio, sin API)
├─ components/  # componentes reutilizables de composición (mínima lógica)
├─ composables/ # hooks genéricos (no específicos de un feature)
├─ utils/       # helpers puros (formatters, validators simples, etc.)
├─ constants/   # constantes globales (rutas, keys, etc.)
└─ types/       # tipos compartidos NO-dominio (Paginated<T>, Option, etc.)
```

## Convenciones de importación

Se utiliza el alias `@` para apuntar a `src`.

```ts
import DefaultLayout from '@/app/layout/Default.vue'
```

## Reglas y recomendaciones

- No llamar APIs directamente desde componentes o vistas.
- Centralizar la integración HTTP en `core` y `features/<feature>/infrastructure/api`.
- Mantener UI reutilizable en `shared/ui`.
