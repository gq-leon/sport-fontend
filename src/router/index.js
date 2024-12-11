import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from '../views/CalendarView.vue'
import WorkoutView from '../views/WorkoutView.vue'
import TimerView from '../views/TimerView.vue'
import StatsView from '../views/StatsView.vue'
import TimeRecordView from '../views/TimeRecordView.vue'

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
    }
  ]
})

export default router
