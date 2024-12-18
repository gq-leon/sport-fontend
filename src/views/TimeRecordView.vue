<script setup>
import {ref, computed, onMounted, onUnmounted} from 'vue'
import {workoutApi} from '../api/workout'

const clockInRecords = ref([])
const loading = ref(false)
const showClockInModal = ref(false)
const currentDateTime = ref(new Date())

// 简化定位选项
const location = ref('')
const locationOptions = [
  {
    id: 'gym',
    name: '健身房',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600'
  },
  {
    id: 'home',
    name: '家',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600'
  },
  {
    id: 'company',
    name: '公司',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600'
  }
]

// 获取当前时间
const currentTime = computed(() => {
  const now = currentDateTime.value
  return {
    date: now.toLocaleDateString('zh-CN', {month: 'long', day: 'numeric', weekday: 'long'}),
    time: now.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit', second: '2-digit'}),
    hour: now.getHours(),
    minute: now.getMinutes(),
    second: now.getSeconds()
  }
})

// 更新时间的定时器
let timer = null
const startTimer = () => {
  timer = setInterval(() => {
    currentDateTime.value = new Date()
  }, 1000)
}

onMounted(() => {
  startTimer()
  fetchClockInRecords()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 判断是否可以打卡
const canClockIn = computed(() => {
  if (!clockInRecords.value) return true
  
  const today = new Date().toDateString()
  const todayRecords = clockInRecords.value.filter(record =>
    new Date(record.date).toDateString() === today
  )
  return todayRecords.length < 2
})

// 获取打卡记录
const fetchClockInRecords = async () => {
  try {
    loading.value = true
    const res = await workoutApi.getClockInRecords()
    if (res.code === 0) {
      clockInRecords.value = Array.isArray(res.data) ? res.data : []
    }
  } catch (error) {
    console.error('获取打卡记录失败:', error)
    clockInRecords.value = []
  } finally {
    loading.value = false
  }
}

// 打卡
const clockIn = async () => {
  if (!location.value) {
    alert('请选择打卡地点')
    return
  }

  try {
    const res = await workoutApi.clockIn(location.value)
    if (res.code === 0) {
      await fetchClockInRecords()
      showClockInModal.value = false
      location.value = ''
    }
  } catch (error) {
    console.error('打卡失败:', error)
  }
}

// 简化打卡状态，只显示上午/下午
const getStatusInfo = (record) => {
  const isMorning = record.type === '上午'

  return {
    text: record.type,
    bgColor: isMorning ? 'bg-blue-50' : 'bg-orange-50',
    textColor: isMorning ? 'text-blue-600' : 'text-orange-600',
    icon: isMorning
        ? 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'  // 太阳图标
        : 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'  // 月亮图标
  }
}

// 修改日期格式化函数，只返回年月日
const formatDate = (dateStr) => {
  try {
    // 检查是否已经是格式化后的字符串（包含"年"、"月"、"日"）
    if (typeof dateStr === 'string' && dateStr.includes('年')) {
      // 提取年月日部分（去掉星期）
      const dateParts = dateStr.split(' ')[0]
      return dateParts.replace(/年|月/g, '-').replace('日', '')
    }

    // 否则作为日期处理
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateStr)
      return dateStr // 如果转换失败，返回原始字符串
    }

    // 只返回年月日
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  } catch (error) {
    console.error('Date formatting error:', error)
    return dateStr // 发生错误时返回原始字符串
  }
}

// 星期格式化函数保持不变
const formatWeekday = (dateStr) => {
  try {
    if (typeof dateStr === 'string' && dateStr.includes('星期')) {
      const weekday = dateStr.split(' ').find(part => part.startsWith('星期'))
      return weekday || ''
    }

    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateStr)
      return ''
    }

    return date.toLocaleDateString('zh-CN', {weekday: 'long'})
  } catch (error) {
    console.error('Weekday formatting error:', error)
    return ''
  }
}
</script>

<template>
  <div class="space-y-4 time-record-container">
    <!-- 重新设计的顶部打卡区域 -->
    <div class="bg-white shadow-sm rounded-xl overflow-hidden">
      <!-- 顶部信息区域 -->
      <div class="relative p-6 bg-white">
        <!-- 背景装饰 -->
        <div class="absolute top-0 left-0 w-full h-full">
          <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"/>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12"/>
        </div>

        <!-- 时间信息 -->
        <div class="relative">
          <div class="flex items-baseline mb-1">
            <h2 class="text-2xl font-bold text-gray-900">{{ currentTime.date }}</h2>
            <span class="ml-2 text-sm text-gray-500">{{ new Date().getFullYear() }}年</span>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-4xl font-bold text-primary tracking-wider font-mono">
              {{ currentTime.time }}
            </div>
            <div
                class="px-3 py-1 rounded-full text-sm"
                :class="[
                currentTime.hour < 12 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'bg-orange-50 text-orange-600'
              ]"
            >
              {{ currentTime.hour < 12 ? '上午' : '下午' }}
            </div>
          </div>
        </div>
      </div>

      <!-- 打卡按钮区域 -->
      <div class="p-6 flex justify-center bg-gray-50">
        <button
            @click="showClockInModal = true"
            :disabled="!canClockIn"
            class="relative group"
        >
          <!-- 外圈动画 -->
          <div class="absolute -inset-4 bg-primary/20 rounded-full scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500"/>

          <!-- 主按钮 -->
          <div
              class="relative w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300"
              :class="[
              canClockIn 
                ? 'bg-primary text-white hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            ]"
          >
            <!-- 动态波纹效果 -->
            <div v-if="canClockIn" class="absolute inset-0">
              <div class="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"/>
              <div class="absolute inset-0 rounded-full animate-ping bg-primary/30"/>
            </div>

            <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-sm font-medium">
              {{ canClockIn ? '打卡' : '已完成' }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- 优化打卡记录列表 -->
    <div class="bg-white shadow-sm rounded-xl p-4 records-list">
      <h3 class="text-lg font-semibold mb-4">打卡记录</h3>

      <div v-if="!loading" class="space-y-3">
        <div
            v-for="record in clockInRecords"
            :key="record.id"
            class="p-4 bg-gray-50 hover:bg-gray-100/80 rounded-lg transition-all duration-200"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-3">
              <!-- 地点图标 -->
              <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center"
                  :class="{
                  'bg-orange-100': record.location === '健身房',
                  'bg-blue-100': record.location === '家',
                  'bg-purple-100': record.location === '公司'
                }"
              >
                <svg
                    class="w-6 h-6"
                    :class="{
                    'text-orange-600': record.location === '健身房',
                    'text-blue-600': record.location === '家',
                    'text-purple-600': record.location === '公司'
                  }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="locationOptions.find(opt => opt.name === record.location)?.icon"
                  />
                </svg>
              </div>

              <!-- 优化日期时间显示 -->
              <div class="flex flex-col">
                <div class="flex items-baseline space-x-2">
                  <span class="font-medium text-gray-900">{{ formatDate(record.date) }}</span>
                  <span class="text-sm text-gray-500">{{ formatWeekday(record.date) }}</span>
                </div>
                <div class="flex items-center space-x-2 mt-0.5">
                  <span class="text-sm text-gray-500 font-mono">{{ record.time }}</span>
                  <span
                      class="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-200"
                      :class="[
                      getStatusInfo(record).bgColor, 
                      getStatusInfo(record).textColor,
                    ]"
                  >
                    <svg
                        class="w-3 h-3 mr-1 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          :d="getStatusInfo(record).icon"
                      />
                    </svg>
                    {{ record.type }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 优化地点显示 -->
          <div class="ml-13 pl-3 border-l-2 border-gray-100">
            <div class="flex items-center text-sm text-gray-500">
              <svg class="w-4 h-4 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="truncate">打卡地点：{{ record.location }}</span>
            </div>
          </div>
        </div>

        <!-- 无记录状态 -->
        <div v-if="clockInRecords.length === 0" class="text-center py-8">
          <svg class="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-gray-500">暂无打卡记录</p>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    </div>

    <!-- 打卡确认弹窗 -->
    <Transition name="modal">
      <div
          v-if="showClockInModal"
          class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          @click.self="showClockInModal = false"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
          <div class="text-center">
            <h3 class="text-xl font-bold mb-2">确认打卡</h3>
            <p class="text-gray-500">{{ currentTime.date }}</p>
            <p class="text-3xl font-bold text-primary mt-4">{{ currentTime.time }}</p>
          </div>

          <!-- 添加定位选择 -->
          <div class="mt-6">
            <h4 class="text-sm font-medium text-gray-500 mb-3">选择打卡地点</h4>
            <div class="grid grid-cols-3 gap-3 mb-4">
              <button
                  v-for="option in locationOptions"
                  :key="option.id"
                  class="flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200"
                  :class="{
                  'border-primary bg-primary/5': location === option.id,
                  'border-gray-200 hover:border-gray-300': location !== option.id
                }"
                  @click="location = option.id"
              >
                <svg
                    class="w-6 h-6 mb-2"
                    :class="{
                    'text-primary': location === option.id,
                    'text-gray-400': location !== option.id
                  }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="option.icon"/>
                </svg>
                <span
                    class="text-sm"
                    :class="{
                    'text-primary font-medium': location === option.id,
                    'text-gray-600': location !== option.id
                  }"
                >
                  {{ option.name }}
                </span>
              </button>
            </div>
          </div>

          <div class="flex space-x-3 mt-8">
            <button
                @click="showClockInModal = false; location = ''"
                class="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
                @click="clockIn"
                :disabled="!location"
                class="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              确认打卡
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 添加新的动画效果 */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* 添加渐变背景动画 */
@keyframes gradientBG {
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

.bg-gradient-animate {
  background-size: 200% 200%;
  animation: gradientBG 15s ease infinite;
}

/* 添加新的动画效果 */
@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* 优化过渡效果 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* 移除状态相关的动画 */
.text-orange-600 svg,
.text-blue-600 svg {
  animation: none;
}

/* 添加状态标签的悬浮效果 */
.hover\:shadow-sm:hover {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.hover\:-translate-y-0\.5:hover {
  transform: translateY(-0.125rem);
}

/* 优化状态标签的过渡效果 */
.transition-all {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 确保图标大小一致 */
.flex-shrink-0 {
  flex-shrink: 0;
}

/* 优化状态标签的颜色 */
.bg-blue-50 {
  background-color: rgba(239, 246, 255, 0.8);
}

.bg-orange-50 {
  background-color: rgba(255, 247, 237, 0.8);
}

/* 添加状态标签的微妙阴影 */
.rounded-full {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

/* 优化日期显示的字体 */
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* 优化状态标签的样式 */
.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

/* 优化间距 */
.space-x-2 > * + * {
  margin-left: 0.5rem;
}

.mt-0\.5 {
  margin-top: 0.125rem;
}

/* 容器样式 */
.time-record-container {
  height: 100vh;
  overflow: hidden;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

/* 记录列表样式 */
.records-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 #f8fafc;
}

/* 自定义滚动条样式 */
.records-list::-webkit-scrollbar {
  width: 6px;
}

.records-list::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

.records-list::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 3px;
}

.records-list::-webkit-scrollbar-thumb:hover {
  background-color: #cbd5e1;
}
</style> 