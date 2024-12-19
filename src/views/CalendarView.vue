<script setup>
import {ref, computed, watch, onMounted, defineComponent} from 'vue'
import {workoutApi, WORKOUT_TYPES, WORKOUT_STATUS} from '../api/workout'
import PageHeader from "@/components/PageHeader.vue";

const currentDate = ref(new Date())
const selectedDate = ref(new Date())
const workouts = ref([])
const selectedDateWorkouts = ref({
  timeSegments: [],
  exercises: []
})
const loading = ref(false)
const loadingWorkouts = ref(false)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const currentMonth = computed(() => {
  return currentDate.value.toLocaleString('zh-CN', {month: 'long'})
})

const currentYear = computed(() => {
  return currentDate.value.getFullYear()
})

// 计算当月的天数数组
const daysInMonth = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days = []

  // 添加上个月的天数
  const firstDayWeek = firstDay.getDay()
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({
      date,
      isCurrentMonth: false,
      hasWorkout: workouts.value.some(w => new Date(w.date).toDateString() === date.toDateString())
    })
  }

  // 添加当月的天数
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({
      date,
      isCurrentMonth: true,
      hasWorkout: workouts.value.some(w => new Date(w.date).toDateString() === date.toDateString()),
      isToday: new Date().toDateString() === date.toDateString()
    })
  }

  // 添加下个月的天数以填满6行
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push({
      date,
      isCurrentMonth: false,
      hasWorkout: workouts.value.some(w => new Date(w.date).toDateString() === date.toDateString())
    })
  }

  return days
})

const changeMonth = (delta) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + delta)
  currentDate.value = newDate
}

const formatDate = (date) => {
  return date.toLocaleDateString('zh-CN', {month: 'long', day: 'numeric'})
}

// 计算单日总训练时长
const getTotalDurationForDate = (date) => {
  const dayWorkouts = workouts.value.filter(w =>
      new Date(w.date).toDateString() === date.toDateString()
  )
  return dayWorkouts.reduce((sum, workout) => sum + workout.duration, 0)
}

// 获取单日训练类型统计
const getWorkoutTypesForDate = (date) => {
  const dayWorkouts = workouts.value.filter(w =>
      new Date(w.date).toDateString() === date.toDateString()
  )
  return dayWorkouts.map(w => w.type).join('、')
}

// 修改原有的 getWorkoutForDate 方法
const getWorkoutForDate = (date) => {
  const dayWorkouts = workouts.value.filter(w =>
      new Date(w.date).toDateString() === date.toDateString()
  )
  if (dayWorkouts.length === 0) return null

  return {
    types: getWorkoutTypesForDate(date),
    totalDuration: getTotalDurationForDate(date),
    count: dayWorkouts.length
  }
}

const isSelectedDate = (day) => {
  return selectedDate.value?.toDateString() === day.date.toDateString()
}

const isSelectedWorkout = (workout) => {
  return selectedDate.value?.toDateString() === new Date(workout.date).toDateString()
}

const formattedDate = (date) => {
  const year = date.value.getFullYear();
  const month = String(date.value.getMonth() + 1).padStart(2, '0');
  const day = String(date.value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取月度训练记录
const fetchMonthWorkouts = async () => {
  try {
    const date = formattedDate(currentDate);
    const res = await workoutApi.getMonthWorkouts(date)
    if (res.code === 0) {
      // 直接使用训练历史记录
      workouts.value = res.data.map(record => ({
        date: record.date,
        hasWorkout: true,
        exercises: record.exercises,
        totalDuration: record.totalDuration,
        summary: record.summary
      }))
    }
  } catch (error) {
    console.error('获取月度训练记录失败:', error)
  }
}

// 选择日期
const selectDate = async (day) => {
  selectedDate.value = day.date
  try {
    const date = formattedDate(selectedDate)
    const res = await workoutApi.getWorkoutsByDate(date)
    if (res.code === 0) {
      selectedDateWorkouts.value = {
        timeSegments: res.data.timeSegments || [],
        exercises: res.data.exercises || []
      }
    }
  } catch (error) {
    console.error('获取日期训练记录失败:', error)
    // 发生错误时重置为空数组
    selectedDateWorkouts.value = {
      timeSegments: [],
      exercises: []
    }
  }
}

// 监听月份变化
watch(
    () => currentDate.value,
    () => {
      fetchMonthWorkouts()
    }
)

// 页面加载时获取数据
onMounted(async () => {
  await fetchMonthWorkouts()
  // 获取当前日期的训练记录
  const today = new Date()
  selectDate({date: today, isCurrentMonth: true})
})

// 获取训练类型的图标和颜色
const getWorkoutTypeInfo = (category) => {
  switch (category) {
    case WORKOUT_TYPES.STRENGTH:
      return {
        icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z', // 闪电图标
        color: 'text-orange-500',
        bgColor: 'bg-orange-500',
        label: '力量'
      }
    case WORKOUT_TYPES.CARDIO:
      return {
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', // 时钟图标
        color: 'text-blue-500',
        bgColor: 'bg-blue-500',
        label: '有氧'
      }
    default:
      return {
        icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        color: 'text-gray-500',
        bgColor: 'bg-gray-500',
        label: '其他'
      }
  }
}

// 获取日期的训练类型统计
const getDateWorkoutTypes = (date) => {
  const dayWorkouts = workouts.value.filter(w =>
      new Date(w.date).toDateString() === date.toDateString()
  )
  return {
    strength: dayWorkouts.filter(w => w.category === WORKOUT_TYPES.STRENGTH).length,
    cardio: dayWorkouts.filter(w => w.category === WORKOUT_TYPES.CARDIO).length
  }
}

// 重置到今天
const resetToToday = () => {
  currentDate.value = new Date()
  selectedDate.value = new Date()
  fetchMonthWorkouts()
}

// 提取日期单元格为独立组件
const DayCell = defineComponent({
  name: 'DayCell',
  props: {
    day: Object,
    isSelected: Boolean,
    workoutTypes: Object,
    workoutInfo: Object
  },
  setup(props) {
    const classes = computed(() => ({
      'cursor-pointer hover:bg-gray-50': props.day.isCurrentMonth,
      'bg-gray-50/80': !props.day.isCurrentMonth && !props.day.hasWorkout,
      'bg-primary/5 ring-1 ring-primary': props.day.isToday && !props.isSelected,
      'bg-gradient-to-br from-primary to-primary-dark shadow-lg': props.isSelected,
      'opacity-60': !props.day.isCurrentMonth,
      'bg-primary/5 hover:bg-primary/10': props.day.hasWorkout && !props.isSelected && props.day.isCurrentMonth,
      'transform hover:scale-105 transition-transform': props.day.isCurrentMonth || props.day.hasWorkout
    }))

    const textClasses = computed(() => ({
      'text-white': props.isSelected,
      'text-primary font-bold': props.day.isToday && !props.isSelected,
      'text-gray-900': props.day.isCurrentMonth && !props.isSelected && !props.day.isToday,
      'text-gray-400': !props.day.isCurrentMonth
    }))

    return {
      classes,
      textClasses
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <PageHeader title="日历" :show-back="true"/>
    <div class="space-y-4">
      <!-- 日历容器 -->
      <div class="bg-white shadow-sm p-4 sm:p-6 sm:rounded-2xl">
        <!-- 月份选择器 -->
        <div class="flex items-center justify-between mb-8">
          <button
              class="group p-2 hover:bg-gray-100 rounded-lg transition-colors"
              @click="changeMonth(-1)"
          >
            <svg class="w-5 h-5 text-gray-500 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <div
              class="flex flex-col items-center group cursor-pointer"
              @click="resetToToday"
              title="回到今天"
          >
            <h2 class="text-xl font-bold text-gray-900 group-hover:text-primary">
              {{ currentMonth }}
            </h2>
            <span class="text-sm text-gray-500 mt-1 group-hover:text-primary-dark">
            {{ currentYear }}年
          </span>
          </div>

          <button
              class="group p-2 hover:bg-gray-100 rounded-lg transition-colors"
              @click="changeMonth(1)"
          >
            <svg class="w-5 h-5 text-gray-500 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>

        <!-- 星期表头 -->
        <div class="grid grid-cols-7 mb-4">
          <div
              v-for="day in weekDays"
              :key="day"
              class="text-center text-sm font-medium text-gray-600"
          >
            {{ day }}
          </div>
        </div>

        <!-- 日历格子 -->
        <div class="grid grid-cols-7 gap-2">
          <div
              v-for="day in daysInMonth"
              :key="day.date"
              class="relative group"
              @click="selectDate(day)"
          >
            <div
                :class="[
              'aspect-square flex flex-col items-center justify-center rounded-xl transition-all duration-300',
              {
                'cursor-pointer hover:bg-gray-50': day.isCurrentMonth,
                'bg-gray-50/80': !day.isCurrentMonth && !day.hasWorkout,
                'bg-primary/5 ring-1 ring-primary': day.isToday && !isSelectedDate(day),
                'bg-gradient-to-br from-primary to-primary-dark': isSelectedDate(day),
                'opacity-60': !day.isCurrentMonth && !day.hasWorkout,
                'hover:shadow-sm': day.hasWorkout && !isSelectedDate(day) && day.isCurrentMonth,
                'bg-primary/5': day.hasWorkout && !isSelectedDate(day)
              }
            ]"
            >
              <!-- 日期数字容器 -->
              <div class="absolute inset-0 flex items-center justify-center">
              <span
                  :class="[
                  'text-sm transition-colors',
                  {
                    'text-white font-bold': isSelectedDate(day),
                    'text-primary font-bold': day.isToday && !isSelectedDate(day),
                    'text-gray-900 font-medium': day.isCurrentMonth && !isSelectedDate(day) && !day.isToday,
                    'text-gray-400': !day.isCurrentMonth && !day.hasWorkout,
                    'font-semibold text-primary-dark': day.hasWorkout && !isSelectedDate(day)
                  }
                ]"
              >
                {{ day.date.getDate() }}
              </span>
              </div>

              <!-- 悬浮提示 -->
              <div
                  v-if="day.hasWorkout && !isSelectedDate(day)"
                  class="absolute -top-16 left-1/2 -translate-x-1/2 hidden group-hover:block z-20"
              >
                <div class="bg-gray-900/95 backdrop-blur-sm text-white rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
                  <div class="flex items-center gap-2 text-xs">
                  <span v-if="getDateWorkoutTypes(day.date).strength" class="flex items-center">
                    <span class="w-2 h-2 rounded-full bg-orange-500 mr-1"/>
                    力量 {{ getDateWorkoutTypes(day.date).strength }}项
                  </span>
                    <span v-if="getDateWorkoutTypes(day.date).cardio" class="flex items-center">
                    <span class="w-2 h-2 rounded-full bg-blue-500 mr-1"/>
                    有氧 {{ getDateWorkoutTypes(day.date).cardio }}项
                  </span>
                  </div>
                </div>
                <div class="w-2 h-2 bg-gray-900/95 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 选中日期的训练记录 -->
      <div
          v-if="selectedDate"
          class="bg-white shadow-sm p-4 sm:p-6 sm:rounded-2xl"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-bold text-gray-900 flex items-center">
              {{ formatDate(selectedDate) }}
              <span
                  v-if="selectedDateWorkouts.exercises?.length > 0"
                  class="ml-3 text-sm px-2.5 py-0.5 rounded-full bg-primary/10 text-primary"
              >
              {{ selectedDateWorkouts.exercises.length }}个训练项目
            </span>
            </h3>
            <p class="text-sm text-gray-500 mt-1">训练内容记录</p>
          </div>
        </div>

        <!-- 训练记录列表 -->
        <div v-if="selectedDateWorkouts.exercises?.length > 0" class="space-y-3">
          <div
              v-for="exercise in selectedDateWorkouts.exercises"
              :key="exercise.id"
              class="p-4 bg-gray-50 hover:bg-gray-100/80 rounded-xl transition-all duration-200"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
                    :class="{
                  'bg-orange-100 group-hover:bg-orange-200': exercise.category === WORKOUT_TYPES.STRENGTH,
                  'bg-blue-100 group-hover:bg-blue-200': exercise.category === WORKOUT_TYPES.CARDIO
                }"
                >
                  <svg
                      class="w-6 h-6"
                      :class="{
                    'text-orange-500': exercise.category === WORKOUT_TYPES.STRENGTH,
                    'text-blue-500': exercise.category === WORKOUT_TYPES.CARDIO
                  }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        :d="exercise.category === WORKOUT_TYPES.STRENGTH
                      ? 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'
                      : 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'"
                    />
                  </svg>
                </div>
                <div>
                  <div class="font-medium text-gray-900">{{ exercise.name }}</div>
                  <div class="text-sm text-gray-500 mt-0.5">
                    <template v-if="exercise.category === WORKOUT_TYPES.STRENGTH">
                    <span class="inline-flex items-center">
                      <svg class="w-4 h-4 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                      </svg>
                      {{ exercise.weight }}kg
                    </span>
                      <span class="mx-2">·</span>
                      <span>{{ exercise.sets }}组 × {{ exercise.reps }}次</span>
                    </template>
                    <template v-else>
                    <span class="inline-flex items-center">
                      <svg class="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                      </svg>
                      {{ exercise.distance }}km
                    </span>
                      <span class="mx-2">·</span>
                      <span class="inline-flex items-center">
                      <svg class="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      {{ exercise.duration }}分钟
                    </span>
                    </template>
                  </div>
                </div>
              </div>
              <div
                  class="px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200"
                  :class="{
                'bg-orange-50 text-orange-600 hover:bg-orange-100': exercise.category === WORKOUT_TYPES.STRENGTH,
                'bg-blue-50 text-blue-600 hover:bg-blue-100': exercise.category === WORKOUT_TYPES.CARDIO
              }"
              >
                {{ exercise.type }}
              </div>
            </div>
            <template v-if="exercise.category === WORKOUT_TYPES.STRENGTH">
              <div class="mt-3 flex items-center">
                <div class="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                      class="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      :style="{ width: `${(exercise.completed / exercise.sets) * 100}%` }"
                  />
                </div>
                <span class="ml-3 text-sm text-gray-500">
                {{ exercise.completed }}/{{ exercise.sets }}组
              </span>
              </div>
            </template>
            <template v-else>
              <div class="mt-3">
              <span
                  class="text-sm px-2 py-0.5 rounded-full"
                  :class="exercise.completed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'"
              >
                {{ exercise.completed ? '已完成' : '未完成' }}
              </span>
              </div>
            </template>
          </div>
        </div>

        <!-- 无记录状态 -->
        <div
            v-else
            class="py-12 text-center"
        >
          <div class="bg-gray-50 rounded-2xl p-8 max-w-sm mx-auto">
            <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="font-medium text-gray-600">当日暂无训练记录</p>
            <p class="text-sm text-gray-500 mt-1">{{ formatDate(selectedDate) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aspect-square {
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
}

/* 确保所有日期格子高度一致 */
.grid-cols-7 > * {
  height: 0;
  padding-bottom: 100%;
  position: relative;
}

.grid-cols-7 > * > div {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

/* 修改内容定位样式 */
.absolute.inset-0 {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 确保日期数字容器占满剩余空间 */
.flex-1 {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 优化渐变动画 */
.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradient 4s ease infinite;
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

/* 添加阴影过渡 */
.shadow-sm {
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

/* 添加悬浮动画 */
.group:hover .group-hover\:block {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px) translateX(-50%);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(-50%);
  }
}
</style> 