<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/auth'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMsg.value = '请输入用户名和密码'
    return
  }

  try {
    loading.value = true
    errorMsg.value = ''
    const res = await authApi.login({
      email: username.value,
      password: password.value
    })

    if (res.code === 200 && res.data?.access_token) {
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('tokenExpireTime', new Date().getTime() + 24 * 60 * 60 * 1000)
      const redirect = router.currentRoute.value.query.redirect || '/workout'
      window.location.href = redirect
    } else {
      errorMsg.value = res.message || '登录失败，请重试'
    }
  } catch (error) {
    console.error('登录错误:', error)
    errorMsg.value = error.message || '登录失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-primary/10 to-transparent rounded-full transform rotate-45"></div>
      <div class="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/10 to-transparent rounded-full transform -rotate-45"></div>
    </div>

    <div class="w-full max-w-md mx-4">
      <div class="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 space-y-6">
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">欢迎回来</h2>
          <p class="text-sm text-gray-500">请登录您的账号</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <input
                  v-model="username"
                  type="email"
                  required
                  class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="请输入邮箱"
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  v-model="password"
                  type="password"
                  required
                  class="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="请输入密码"
                >
              </div>
            </div>
          </div>

          <div v-if="errorMsg" class="p-3 rounded-lg bg-red-50 text-red-500 text-sm">
            {{ errorMsg }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors relative overflow-hidden"
          >
            <span v-if="loading" class="absolute inset-0 flex items-center justify-center bg-primary">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </span>
            <span :class="{ 'opacity-0': loading }">{{ loading ? '登录中...' : '登录' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-gradient-to-br {
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style> 