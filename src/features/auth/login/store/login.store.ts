import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AuthService, type LoginPayload } from '../services/auth.service'

const TOKEN_KEY = 'token'
const REMEMBER_KEY = 'rememberedUser'
const USER_KEY = 'user'

const authService = new AuthService()

export const useLoginStore = defineStore('login', () => {
  const username = ref('')
  const password = ref('')
  const rememberMe = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hydrate = () => {
    const remembered = localStorage.getItem(REMEMBER_KEY)
    if (remembered) {
      username.value = remembered
      rememberMe.value = true
    }
  }

  const login = async () => {
    loading.value = true
    error.value = null
    try {
      const payload: LoginPayload = { user: username.value, password: password.value }
      const response = await authService.login(payload)
      if (!response.success || !response.content?.token) {
        throw new Error(response.message ?? response.error ?? 'Credenciales invalidas')
      }

      localStorage.setItem(USER_KEY, response.content.email)
      localStorage.setItem(TOKEN_KEY, response.content.token)
      if (rememberMe.value) {
        localStorage.setItem(REMEMBER_KEY, username.value)
      } else {
        localStorage.removeItem(REMEMBER_KEY)
      }
      
      return response.content.token
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo iniciar sesion'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
  }

  return {
    username,
    password,
    rememberMe,
    loading,
    error,
    hydrate,
    login,
    logout,
  }
})
