<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white px-4 py-4 flex items-center justify-center shadow-sm sticky top-0 z-10">
      <h1 class="text-lg font-medium text-gray-900">我的</h1>
    </header>
    
    <!-- 用户信息卡片 -->
    <div class="bg-white mt-3 px-4 py-6 shadow-sm">
      <div 
        class="flex items-center active:bg-gray-50 transition-colors duration-200 rounded-lg p-2 cursor-pointer"
        @click="handleEditProfile"
      >
        <div class="relative">
          <img 
            class="w-16 h-16 rounded-full border-2 border-primary/20 object-cover"
            src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg" 
            alt="avatar"
          />
          <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
            <PencilIcon class="w-3 h-3 text-white" />
          </div>
        </div>
        <div class="ml-4 flex-1">
          <h2 class="text-lg font-semibold text-gray-900">用户名</h2>
          <p class="text-sm text-gray-500 mt-1">继续加油运动吧！</p>
        </div>
        <ChevronRightIcon class="w-5 h-5 text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
      </div>
      
      <!-- 数据概览 -->
      <div class="grid grid-cols-3 gap-4 mt-6">
        <div 
          v-for="(stat, index) in stats" 
          :key="index"
          class="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
          @click="handleStatClick(stat)"
        >
          <div class="text-xl font-semibold text-primary">{{ stat.value }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 功能菜单 -->
    <div class="mt-3 bg-white shadow-sm">
      <router-link 
        v-for="(item, index) in menuItems" 
        :key="index"
        :to="item.path"
        class="flex items-center px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 group"
        :class="{'border-t border-gray-100': index > 0}"
      >
        <component 
          :is="item.icon" 
          class="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors duration-200"
        />
        <span class="ml-3 text-gray-700 group-hover:text-gray-900">{{ item.title }}</span>
        <ChevronRightIcon class="w-5 h-5 text-gray-400 ml-auto transition-transform duration-200 group-hover:translate-x-1" />
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { 
  CalendarIcon, 
  ChartBarIcon, 
  Cog6ToothIcon as CogIcon,
  ChevronRightIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'

const stats = [
  { label: '运动天数', value: '12', type: 'days' },
  { label: '累计时长(h)', value: '36', type: 'hours' },
  { label: '连续天数', value: '3', type: 'streak' }
]

const menuItems = [
  {
    title: '日历',
    path: '/calendar',
    icon: CalendarIcon
  },
  {
    title: '数据分析',
    path: '/stats',
    icon: ChartBarIcon
  },
  {
    title: '设置',
    path: '/settings',
    icon: CogIcon
  }
]

const handleEditProfile = () => {
  // 处理编辑个人信息
  console.log('编辑个人信息')
}

const handleStatClick = (stat) => {
  // 处理统计数据点击
  console.log('查看详细统计:', stat.type)
}
</script>

<style scoped>
/* 添加触摸反馈效果 */
@media (hover: none) {
  .active\:bg-gray-50:active {
    background-color: rgba(249, 250, 251, var(--tw-bg-opacity));
  }
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 添加阴影过渡效果 */
.shadow-sm {
  transition: box-shadow 0.2s ease;
}

.shadow-sm:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style> 