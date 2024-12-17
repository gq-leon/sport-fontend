import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://127.0.0.1:8080/api',  // API 的基础URL
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
    // 这里可以统一处理响应
    if (res.code === 200) {
      return res
    }
    // 处理错误响应
    console.error('接口返回错误:', res.message)
    return Promise.reject(new Error(res.message || '接口错误'))
  },
  error => {
    console.error('响应错误:', error)
    return Promise.reject(error)
  }
)

export default request 