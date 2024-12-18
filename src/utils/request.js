import axios from 'axios'
import router from '../router'  // 直接导入 router 实例

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://192.168.15.91:8080/api',  // API 的基础URL
  timeout: 5000  // 请求超时时间
})

// Mock token 常量
const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoibGVvbiIsImlkIjoiNjc1YTdjZjFkOTVmMzcxNjNlOTk3MzY2IiwiZXhwIjoxNzM0NTA1NTc0fQ.F8l5zX30EzGWr6YMwUzBq52Yd5Ee7FWD9wrMXqv7LBQ'

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token，如果没有则使用 mock token
      const token = localStorage.getItem('token') || MOCK_TOKEN
    
    // 如果配置中需要token，则添加到请求头
    if (config.needToken !== false) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res
    }

    // token 过期或无效
    if (res.code === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpireTime')
      if (router.currentRoute.value.name !== 'login') {
        window.location.href = '/login'  // 使用 window.location.href 进行跳转
      }
      return Promise.reject(new Error(res.message || '认证失败，请重新登录'))
    }
    
    console.error('接口返回错误:', res.message)
    return Promise.reject(new Error(res.message || '接口错误'))
  },
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpireTime')
      if (router.currentRoute.value.name !== 'login') {
        window.location.href = '/login'  // 使用 window.location.href 进行跳转
      }
    }
    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

export default request 