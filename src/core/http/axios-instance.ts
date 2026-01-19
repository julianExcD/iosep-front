import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'

// =========================
// Resolución de URLs desde .env
// =========================
const normalizeUrl = (url: string): string => {
  if (!url) return ''
  if (!/^https?:\/\//i.test(url)) {
    console.warn('[http] La baseURL no es absoluta. Defínela con http(s):// en .env:', url)
  }
  return url.replace(/\/$/, '')
}

export const apiBaseUrl = normalizeUrl(
  (import.meta.env.VITE_API_LOCAL as string | undefined) ?? // Desarrollo local
  (import.meta.env.VITE_API_PROD as string | undefined) ??  // Producción
  ''
)

// =========================
// Instancia backend
// =========================
const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    Accept: 'application/json'
  }
})

// =========================
// Interceptor de requests
// =========================
function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const token = localStorage.getItem('token')
  const isFormData = config.data instanceof FormData;
  
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (isFormData) {
    delete (config.headers as any)['Content-Type'];
  } else {
    (config.headers as any)['Content-Type'] = 'application/json';
  }

  return config
}

function handleAuthError(error: any) {
  if (error.response?.status === 401) {
    const currentToken = localStorage.getItem('token')
    const requestUrl = error.config?.url || ''
    const shouldLogout =
      currentToken &&
      !requestUrl.includes('/login') &&
      error.config?.headers?.Authorization

    if (shouldLogout) {
      setTimeout(() => {
        localStorage.removeItem('token')
        
        alert('Tu sesión ha expirado. Serás redirigido al login.')
        window.location.href = '/login'
      }, 500)
    }
  }
  return Promise.reject(error)
}

api.interceptors.request.use(authRequestInterceptor, (error) => Promise.reject(error))
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  handleAuthError
)

export { api }
