import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from '../views/CalendarView.vue'
import WorkoutView from '../views/WorkoutView.vue'
import TimerView from '../views/TimerView.vue'
import StatsView from '../views/StatsView.vue'
import TimeRecordView from '../views/TimeRecordView.vue'
import { authApi } from '../api/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/workout'
    },
    {
      path: '/workout',
      name: 'workout',
      component: WorkoutView
    },
    {
      path: '/timer',
      name: 'timer',
      component: TimerView
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: CalendarView
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView
    },
    {
      path: '/time-record',
      name: 'time-record',
      component: TimeRecordView
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    }
  ]
})

// 修改路由守卫
router.beforeEach(async (to, from, next) => {
  // 不需要认证的页面直接通过
  if (to.meta.requiresAuth === false) {
    next()
    return
  }

  // 检查 token 是否存在且未过期
  const token = localStorage.getItem('token')
  const tokenExpireTime = localStorage.getItem('tokenExpireTime')
  const isTokenExpired = !tokenExpireTime || new Date().getTime() > parseInt(tokenExpireTime)

  if (!token || isTokenExpired) {
    // token 不存在或已过期，清除旧数据并跳转到登录页
    localStorage.removeItem('token')
    localStorage.removeItem('tokenExpireTime')
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // 移除 token 验证的 API 调用，因为每次路由跳转都验证会导致不必要的请求
  // 我们已经在响应拦截器中处理了 token 失效的情况
  next()
})

export default router
