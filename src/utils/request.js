import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: 'http://192.168.44.10/api',  // API 的基础URL
  timeout: 5000  // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 这里可以添加token等通用请求头
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