import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import axios from "axios";

const app = createApp(App)

// 设置 CSP 头
app.config.globalProperties.$http = axios.create({
    headers: {
        'Content-Security-Policy': "upgrade-insecure-requests; default-src 'self' http:;"
    }
})

app.use(router)


app.config.devtools = false
app.config.productionTip = false

app.mount('#app')
