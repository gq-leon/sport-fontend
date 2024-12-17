<script setup>
import {ref, computed, onMounted, watch} from 'vue'
import {useRouter} from 'vue-router'
import {workoutApi, WORKOUT_TYPES, WORKOUT_STATUS} from '../api/workout'
import gsap from 'gsap' // 需要安装 gsap 包

const router = useRouter()

const workoutPlan = ref({
  date: new Date().toLocaleDateString(),
  exercises: []
})
const loading = ref(false)
const showAddForm = ref(false)
const editingExercise = ref(null)
const newExercise = ref({
  id: '',
  name: '',
  sets: 0,
  reps: 0,
  weight: 0,
  distance: 0,
  duration: 0,
  category: WORKOUT_TYPES.STRENGTH
})

// 训练类型选项
const categoryOptions = [
  {
    value: WORKOUT_TYPES.CARDIO,
    label: '有氧运动',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' // 时钟图标
  },
  {
    value: WORKOUT_TYPES.STRENGTH,
    label: '力量训练',
    icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' // 闪电图标
  },
]

// 计算总进度
const totalProgress = computed(() => {
  const exercises = workoutPlan.value.exercises
  if (exercises == null || exercises.length === 0) return 0

  const strengthExercises = exercises.filter(e => e.category === WORKOUT_TYPES.STRENGTH)
  const cardioExercises = exercises.filter(e => e.category === WORKOUT_TYPES.CARDIO)

  let totalCompleted = 0
  let totalTarget = 0

  // 计算力量训练进度
  if (strengthExercises.length > 0) {
    totalCompleted += strengthExercises.reduce((sum, ex) => sum + ex.completed, 0)
    totalTarget += strengthExercises.reduce((sum, ex) => sum + ex.sets, 0)
  }

  // 计算有氧运动进度
  if (cardioExercises.length > 0) {
    totalCompleted += cardioExercises.filter(ex => ex.completed).length
    totalTarget += cardioExercises.length
  }

  return Math.round((totalCompleted / totalTarget) * 100) || 0
})

// 获取今日训练计划
const fetchTodayWorkout = async () => {
  try {
    loading.value = true
    const res = await workoutApi.getTodayWorkout()
    if (res.code === 0 && res.data != null) {
      workoutPlan.value = res.data
    } else {
      console.error('获取训练计划失败:', res.message)
    }
  } catch (error) {
    console.error('获取训练计划错误:', error)
  } finally {
    loading.value = false
  }
}

// 完成一组
const completeSet = async (exercise) => {
  if (exercise.completed >= exercise.sets) return

  try {
    const newCompleted = exercise.completed + 1
    const res = await workoutApi.updateExerciseProgress(exercise.id, newCompleted)
    if (res.code === 0) {
      await fetchTodayWorkout()
    }
  } catch (error) {
    console.error('更新进度失败:', error)
  }
}

// 撤销一组
const undoSet = async (exercise) => {
  if (exercise.completed <= 0) return
  console.log("撤销一组", exercise.id, exercise.completed)
  try {
    const newCompleted = exercise.completed - 1
    const res = await workoutApi.updateExerciseProgress(exercise.id, newCompleted)
    if (res.code === 0) {
      await fetchTodayWorkout()
    }
  } catch (error) {
    console.error('更新进度失败:', error)
  }
}

// 添加训练
const addExercise = async () => {
  if (!newExercise.value.name.trim()) return

  try {
    const res = await workoutApi.addExercise(newExercise.value)
    if (res.code === 0) {
      await fetchTodayWorkout()
      resetNewExercise()
      showAddForm.value = false
    }
  } catch (error) {
    console.error('添加训练失败:', error)
  }
}

// 保存编辑
const saveEdit = async () => {
  if (!editingExercise.value) return

  try {
    const res = await workoutApi.updateExercise(editingExercise.value)
    if (res.code === 0) {
      const index = workoutPlan.value.exercises.findIndex(e => e.id === editingExercise.value.id)
      if (index !== -1) {
        workoutPlan.value.exercises[index] = res.data
      }
    }
  } catch (error) {
    console.error('更新训练失败:', error)
  } finally {
    editingExercise.value = null
  }
}

// 删除训练
const removeExercise = async (exerciseId) => {
  try {
    const res = await workoutApi.deleteExercise(exerciseId)
    if (res.code === 0) {
      workoutPlan.value.exercises = workoutPlan.value.exercises.filter(e => e.id !== exerciseId)
    }
  } catch (error) {
    console.error('删除训练失败:', error)
  }
}

// 其他辅助函数保持不变
const resetNewExercise = () => {
  newExercise.value = {
    name: '',
    sets: 0,
    reps: 0,
    weight: 0,
    distance: 0,
    duration: 0,
    category: WORKOUT_TYPES.STRENGTH
  }
}

const startEdit = (exercise) => {
  editingExercise.value = {...exercise}
}

const cancelEdit = () => {
  editingExercise.value = null
}

// 完成有氧运动
const completeExercise = async (exercise) => {
  try {
    const res = await workoutApi.updateExercise({
      ...exercise,
      completed: true
    })
    if (res.code === 0) {
      const index = workoutPlan.value.exercises.findIndex(e => e.id === exercise.id)
      if (index !== -1) {
        workoutPlan.value.exercises[index] = {
          ...res.data,
          completed: true
        }
      }
    }
  } catch (error) {
    console.error('完成运动失败:', error)
  }
}


// 判断项目是否完成
function isCompleted(exercise) {
  if (exercise.category === WORKOUT_TYPES.STRENGTH) {
    return exercise.completed >= exercise.sets
  }
  return !!exercise.completed
}

// 修改排序逻辑
const sortedExercises = computed(() => {
  const exercises = workoutPlan.value.exercises
  if (exercises == null || exercises.length === 0) return 0

  return [...workoutPlan.value.exercises].sort((a, b) => {
    // 首先判断该项目是否已经完成
    const completedA = isCompleted(a)
    const completedB = isCompleted(b)

    // 已完成的排在最后
    if (completedA !== completedB) {
      return completedA ? 1 : -1
    }

    // 如果都未完成，先按 category 排序（CARDIO 优先）
    if (!completedA && !completedB) {
      if (a.category !== b.category) {
        return a.category === WORKOUT_TYPES.CARDIO ? -1 : 1
      }
      // 同类型按 id 倒序
      return b.id - a.id
    }

    // 如果都已完成，仍按 id 倒序
    return b.id - a.id
  })
})

// 页面加载时获取数据
onMounted(() => {
  fetchTodayWorkout()
})

// 添加动画处理函数
const onBeforeEnter = (el) => {
  el.style.opacity = 0
  el.style.transform = 'translateY(30px)'
}

const onEnter = (el, done) => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.3,
    onComplete: done
  })
}

const onBeforeLeave = (el) => {
  const {top, height} = el.getBoundingClientRect()
  el.style.position = 'absolute'
  el.style.top = top + 'px'
  el.style.width = '100%'
  el.style.height = height + 'px'
}

const onLeave = (el, done) => {
  gsap.to(el, {
    opacity: 0,
    y: 30,
    duration: 0.3,
    onComplete: () => {
      el.style.position = ''
      el.style.top = ''
      el.style.width = ''
      el.style.height = ''
      done()
    }
  })
}

// 添加表单验证
const isValidNewExercise = computed(() => {
  if (!newExercise.value.name.trim()) return false

  if (newExercise.value.category === WORKOUT_TYPES.STRENGTH) {
    return (
        newExercise.value.weight > 0 &&
        newExercise.value.reps > 0 &&
        newExercise.value.sets > 0
    )
  } else {
    return (
        newExercise.value.distance > 0 &&
        newExercise.value.duration > 0
    )
  }
})
</script>

<template>
  <div class="space-y-4 workout-container">
    <!-- 优化顶部操作栏样式 -->
    <div class="bg-white shadow-sm p-4 sm:p-5 sm:rounded-xl">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg sm:text-xl font-semibold text-gray-800">今日训练</h2>
          <p class="text-sm text-gray-500 mt-1">{{ workoutPlan.date }}</p>
        </div>

        <!-- 移除开始/结束训练按钮,只保留添加训练按钮 -->
        <button
            @click="showAddForm = true"
            class="inline-flex items-center px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-200 active:scale-98"
        >
          <svg class="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span class="font-medium">添加训练</span>
        </button>
      </div>
    </div>

    <!-- 进度条部分 -->
    <div class="bg-white shadow-sm p-3 sm:p-4 sm:rounded-xl">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-base font-medium text-gray-600">训练进度</h3>
        <span class="text-sm font-medium text-primary">{{ totalProgress }}%</span>
      </div>
      <div class="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        <div class="absolute h-full bg-primary transition-all duration-500" :style="{ width: `${totalProgress}%` }"/>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    </div>

    <!-- 训练列表 -->
    <TransitionGroup v-else tag="div" class="space-y-3" :css="false" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave" @before-leave="onBeforeLeave">
      <div
          v-for="(exercise, index) in sortedExercises"
          :key="exercise.id"
          :data-index="index"
          class="bg-white shadow-sm p-3 sm:p-4 sm:rounded-xl transition-all duration-500"
          :class="{
          'opacity-75': exercise.category === WORKOUT_TYPES.STRENGTH 
            ? exercise.completed === exercise.sets 
            : exercise.completed
        }"
      >
        <!-- 普通显示模式 -->
        <div v-if="editingExercise?.id !== exercise.id">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div
                  class="w-8 h-8 rounded-lg flex items-center justify-center"
                  :class="{
                  'bg-orange-100': exercise.category === WORKOUT_TYPES.STRENGTH,
                  'bg-blue-100': exercise.category === WORKOUT_TYPES.CARDIO
                }"
              >
                <svg
                    class="w-4 h-4"
                    :class="{
                    'text-orange-500': exercise.category === WORKOUT_TYPES.STRENGTH,
                    'text-blue-500': exercise.category === WORKOUT_TYPES.CARDIO
                  }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="exercise.category === WORKOUT_TYPES.STRENGTH ? 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' : 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'"/>
                </svg>
              </div>
              <h3 class="text-base sm:text-lg font-medium">{{ exercise.name }}</h3>
              <span
                  v-if="exercise.category === WORKOUT_TYPES.STRENGTH
                  ? exercise.completed === exercise.sets 
                  : exercise.completed"
                  class="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700"
              >
                已完成
              </span>
            </div>
            <div class="flex items-center space-x-1">
              <button @click="startEdit(exercise)" class="p-2 text-gray-400 hover:text-primary active:text-primary transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
              <button @click="removeExercise(exercise.id)" class="p-2 text-gray-400 hover:text-red-500 active:text-red-600 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 力量训练信息显示 -->
          <template v-if="exercise.category === WORKOUT_TYPES.STRENGTH">
            <div class="grid grid-cols-3 gap-2 sm:gap-4 mb-3">
              <div class="text-center p-2 bg-gray-50 rounded-lg">
                <div class="text-xs sm:text-sm text-gray-500">重量</div>
                <div class="text-sm sm:text-base font-medium">{{ exercise.weight }}kg</div>
              </div>
              <div class="text-center p-2 bg-gray-50 rounded-lg">
                <div class="text-xs sm:text-sm text-gray-500">次数</div>
                <div class="text-sm sm:text-base font-medium">{{ exercise.reps }}</div>
              </div>
              <div class="text-center p-2 bg-gray-50 rounded-lg">
                <div class="text-xs sm:text-sm text-gray-500">进度</div>
                <div class="text-sm sm:text-base font-medium">{{ exercise.completed }}/{{ exercise.sets }}</div>
              </div>
            </div>

            <div class="flex space-x-2">
              <button
                  @click="undoSet(exercise)"
                  class="flex-1 py-2.5 border rounded-lg text-sm transition-all duration-200 active:scale-98"
                  :class="{
                  'border-gray-200 text-gray-400': exercise.completed === 0,
                  'border-red-200 text-red-500 active:bg-red-50': exercise.completed > 0
                }"
                  :disabled="exercise.completed === 0"
              >
                撤销
              </button>
              <button
                  @click="completeSet(exercise)"
                  class="flex-1 py-2.5 rounded-lg text-sm transition-all duration-200 active:scale-98"
                  :class="{
                  'bg-primary text-white active:bg-primary-dark': exercise.completed < exercise.sets,
                  'bg-gray-100 text-gray-400': exercise.completed >= exercise.sets
                }"
                  :disabled="exercise.completed >= exercise.sets"
              >
                完成一组
              </button>
            </div>
          </template>

          <!-- 有氧运动信息显示 -->
          <template v-else>
            <div class="grid grid-cols-2 gap-2 sm:gap-4 mb-3">
              <div class="text-center p-2 bg-gray-50 rounded-lg">
                <div class="text-xs sm:text-sm text-gray-500">距离</div>
                <div class="text-sm sm:text-base font-medium">{{ exercise.distance }}km</div>
              </div>
              <div class="text-center p-2 bg-gray-50 rounded-lg">
                <div class="text-xs sm:text-sm text-gray-500">时长</div>
                <div class="text-sm sm:text-base font-medium">{{ exercise.duration }}分钟</div>
              </div>
            </div>

            <button
                class="w-full py-2.5 rounded-lg text-sm transition-all duration-200 active:scale-98"
                :class="{
                'bg-primary text-white hover:bg-primary-dark': !exercise.completed,
                'bg-green-500 text-white cursor-not-allowed': exercise.completed
              }"
                @click="completeExercise(exercise)"
                :disabled="exercise.completed"
            >
              {{ exercise.completed ? '已完成' : '完成运动' }}
            </button>
          </template>
        </div>

        <!-- 编辑模式也需要根据类型显示不同的表单 -->
        <div v-else class="space-y-3">
          <input v-model="editingExercise.name" type="text" class="w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                 :placeholder="editingExercise.category === WORKOUT_TYPES.STRENGTH ? '训练动作名称' : '运动项目名称'">

          <!-- 力量训练编辑表单 -->
          <div v-if="editingExercise.category === WORKOUT_TYPES.STRENGTH" class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-gray-500 mb-1">重量(kg)</label>
              <input v-model.number="editingExercise.weight" type="number" min="0" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">次数</label>
              <input v-model.number="editingExercise.reps" type="number" min="1" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">组数</label>
              <input v-model.number="editingExercise.sets" type="number" min="1" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            </div>
          </div>

          <!-- 有氧运动编辑表单 -->
          <div v-else class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-500 mb-1">距离(km)</label>
              <input v-model.number="editingExercise.distance" type="number" min="0" step="0.1" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            </div>
            <div>
              <label class="block text-sm text-gray-500 mb-1">时长(分钟)</label>
              <input v-model.number="editingExercise.duration" type="number" min="1" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
            </div>
          </div>

          <div class="flex space-x-2">
            <button @click="cancelEdit" class="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">取消</button>
            <button @click="saveEdit" class="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">保存</button>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <!-- 添加训练浮层 -->
    <Transition name="modal">
      <div v-if="showAddForm" class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showAddForm = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
          <div class="p-6">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold">添加训练项目</h3>
              <button @click="showAddForm = false" class="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="space-y-6">
              <!-- 训练类型选择 -->
              <div class="grid grid-cols-2 gap-4">
                <button v-for="option in categoryOptions" :key="option.value" class="flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200"
                        :class="{
                    'border-primary bg-primary/5 text-primary': newExercise.category === option.value,
                    'border-gray-200 hover:border-gray-300 text-gray-600': newExercise.category !== option.value}"
                        @click="newExercise.category = option.value">
                  <svg class="w-6 h-6 mb-2" :class="{
                      'text-primary': newExercise.category === option.value,
                      'text-gray-400': newExercise.category !== option.value
                    }"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="option.icon"/>
                  </svg>
                  <span class="font-medium">{{ option.label }}</span>
                </button>
              </div>

              <!-- 训练名称输入 -->
              <div>
                <label class="block text-sm text-gray-500 mb-1">训练名称</label>
                <input v-model="newExercise.name" type="text" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                       :placeholder="newExercise.category === WORKOUT_TYPES.STRENGTH ? '例如：深蹲、卧推' : '例如：跑步、游泳'">
              </div>

              <!-- 力量训练特有字段 -->
              <div v-if="newExercise.category === WORKOUT_TYPES.STRENGTH" class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm text-gray-500 mb-1">重量(kg)</label>
                  <input v-model.number="newExercise.weight" type="number" min="0" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                </div>
                <div>
                  <label class="block text-sm text-gray-500 mb-1">次数</label>
                  <input v-model.number="newExercise.reps" type="number" min="1" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                </div>
                <div>
                  <label class="block text-sm text-gray-500 mb-1">组数</label>
                  <input v-model.number="newExercise.sets" type="number" min="1" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                </div>
              </div>

              <!-- 有氧运动特有字段 -->
              <div v-else class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-500 mb-1">目标距离(km)</label>
                  <input v-model.number="newExercise.distance" type="number" min="0" step="0.1" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                </div>
                <div>
                  <label class="block text-sm text-gray-500 mb-1">预计时长(分钟)</label>
                  <input v-model.number="newExercise.duration" type="number" min="1" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                </div>
              </div>
            </div>

            <div class="flex space-x-3 mt-6">
              <button @click="showAddForm = false; resetNewExercise()" class="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">取消</button>
              <button @click="addExercise" class="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50" :disabled="!isValidNewExercise">添加</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 添加容器样式 */
.workout-container {
  max-height: calc(100vh - 4rem); /* 留出上下边距 */
  overflow-y: auto;
  padding: 1rem;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: #e2e8f0 #f8fafc; /* Firefox */
}

/* 自定义滚动条样式 (Webkit浏览器) */
.workout-container::-webkit-scrollbar {
  width: 6px;
}

.workout-container::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 3px;
}

.workout-container::-webkit-scrollbar-thumb {
  background-color: #e2e8f0;
  border-radius: 3px;

  &:hover {
    background-color: #cbd5e1;
  }
}

/* 移除原有的过渡动画样式 */
.space-y-3 {
  position: relative;
}

/* 添加项目的基础样式 */
.space-y-3 > * {
  margin-bottom: 0.75rem; /* 等同于 space-y-3 */
}

/* 最后一个项目不需要下边距 */
.space-y-3 > *:last-child {
  margin-bottom: 0;
}

/* 添加鼠标悬浮效果 */
.space-y-3 > *:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

/* 添加点击效果 */
.space-y-3 > *:active {
  transform: scale(0.98);
}

/* 优化过渡效果 */
.space-y-3 > * {
  margin-bottom: 0.75rem;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 添加模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white {
  transform: scale(0.95);
}

.modal-leave-to .bg-white {
  transform: scale(0.95);
}

/* 添加模糊效果 */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
}
</style> 