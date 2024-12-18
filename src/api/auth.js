import request from '../utils/request'

export const authApi = {
    // 登录
    async login(data) {
        return await request({
            url: '/v1/login', method: 'post', data, needToken: false
        })
    },

    // 退出登录
    async logout() {
        // 清除本地存储的认证信息
        localStorage.removeItem('token')
        localStorage.removeItem('tokenExpireTime')
        // 跳转到登录页
        window.location.href = '/login'
    }
}