<script setup>
import { ref, computed, onMounted } from 'vue'

const time = ref(0)
const isRunning = ref(false)
const intervalId = ref(null)
const presetTimes = [2, 90, 120,180]
const customMinutes = ref('')
const showCustomInput = ref(false)
const audio = ref(null)
const selectedPreset = ref(null)

// 初始化音频
onMounted(() => {
  audio.value = new Audio()
  audio.value.src = '/notification.mp3'
})

// 计算属性：状态文本
const statusText = computed(() => {
  if (isRunning.value) return '正在计时...'
  if (time.value === 0) return '请选择休息时间'
  if (selectedPreset) return '已选择时间'
  return '准备开始'
})

// 计算属性：按钮文本
const buttonText = computed(() => {
  if (!isRunning.value) return '开始'
  return '暂停'
})

// 计算属性：时间显示样式
const timerClass = computed(() => ({
  'text-6xl font-mono mb-8': true,
  'text-primary': isRunning.value,
  'text-gray-400': !isRunning.value && time.value === 0,
  'text-primary-dark': !isRunning.value && time.value > 0,
  'animate-pulse': isRunning.value
}))

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const playEndSound = () => {
  if (audio.value) {
    audio.value.currentTime = 0
    audio.value.play().catch(error => {
      console.error('播放声音失败:', error)
    })
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200])
    }
  }
}

const startTimer = () => {
  if (time.value > 0) {
    isRunning.value = true
    intervalId.value = setInterval(() => {
      if (time.value > 0) {
        time.value--
        if (time.value === 0) {
          playEndSound()
          stopTimer()
          selectedPreset.value = null
        }
      }
    }, 1000)
  }
}

const stopTimer = () => {
  isRunning.value = false
  if (intervalId.value) {
    clearInterval(intervalId.value)
    intervalId.value = null
  }
}

const resetTimer = () => {
  if (time.value === 0) return
  
  stopTimer()
  time.value = 0
  customMinutes.value = ''
  showCustomInput.value = false
  selectedPreset.value = null
}

const setTime = (seconds) => {
  if (isRunning.value) return
  
  stopTimer()
  time.value = seconds
  showCustomInput.value = false
  selectedPreset.value = seconds
}

const setCustomTime = () => {
  if (isRunning.value) return
  
  const minutes = parseFloat(customMinutes.value)
  if (!isNaN(minutes) && minutes > 0 && minutes <= 60) {
    const seconds = Math.floor(minutes * 60)
    setTime(seconds)
    customMinutes.value = ''
    showCustomInput.value = false
    selectedPreset.value = null
  }
}

const toggleCustomInput = () => {
  if (!isRunning.value) {
    showCustomInput.value = !showCustomInput.value
    if (!showCustomInput.value) {
      customMinutes.value = ''
    }
  }
}

const handleMainButtonClick = () => {
  if (time.value === 0) return
  
  if (isRunning.value) {
    stopTimer()
  } else {
    startTimer()
  }
}

// 添加按钮状态计算属性
const mainButtonClass = computed(() => ({
  'flex-1 py-3 rounded-lg transition-all duration-200 font-medium': true,
  'bg-primary text-white hover:bg-primary-dark': !isRunning.value && time.value > 0,
  'bg-red-500 text-white hover:bg-red-600': isRunning.value,
  'bg-gray-100 text-gray-400 cursor-not-allowed': !isRunning.value && time.value === 0
}))

const resetButtonClass = computed(() => ({
  'flex-1 py-3 rounded-lg transition-all duration-200 font-medium': true,
  'bg-gray-100 text-gray-700 hover:bg-gray-200': time.value > 0,
  'bg-gray-50 text-gray-400 cursor-not-allowed': time.value === 0
}))
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold">休息计时器</h2>
        <span 
          class="text-sm transition-colors"
          :class="{
            'text-primary': isRunning.value,
            'text-gray-500': !isRunning.value
          }"
        >
          {{ statusText }}
        </span>
      </div>
      
      <div class="text-center mb-8">
        <!-- 计时器显示 -->
        <div :class="timerClass">
          {{ formatTime(time) }}
        </div>
        
        <!-- 预设时间按钮 -->
        <div class="grid grid-cols-2 gap-4 mb-8">
          <button 
            v-for="preset in presetTimes" 
            :key="preset"
            @click="setTime(preset)"
            class="relative py-3 px-4 border rounded-lg transition-all duration-200"
            :class="{
              'border-primary text-primary bg-primary/5': selectedPreset === preset,
              'border-gray-200 hover:border-primary/30': selectedPreset !== preset,
              'opacity-50 cursor-not-allowed': isRunning,
              'hover:shadow-sm': !isRunning && selectedPreset !== preset
            }"
            :disabled="isRunning"
          >
            <span class="text-base">{{ preset }}秒</span>
            <span 
              v-if="selectedPreset === preset" 
              class="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
            />
          </button>
          
          <!-- 自定义时间按钮和输入框 -->
          <div class="relative col-span-2">
            <button
              v-if="!showCustomInput"
              @click="toggleCustomInput"
              class="w-full py-3 px-4 border border-dashed rounded-lg transition-all duration-200"
              :class="{
                'border-gray-300 hover:border-primary/30 hover:shadow-sm': !isRunning,
                'border-gray-200 opacity-50 cursor-not-allowed': isRunning
              }"
              :disabled="isRunning"
            >
              自定义时间
            </button>
            <div v-else class="flex gap-2">
              <div class="flex-1 relative">
                <input
                  v-model="customMinutes"
                  type="number"
                  min="0"
                  max="60"
                  step="0.5"
                  placeholder="输入分钟"
                  class="w-full px-4 py-3 border rounded-lg transition-all duration-200"
                  :class="{
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary': !isRunning,
                    'bg-gray-50 cursor-not-allowed': isRunning
                  }"
                  @keyup.enter="setCustomTime"
                  :disabled="isRunning"
                />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">分钟</span>
              </div>
              <button
                @click="setCustomTime"
                class="px-4 py-2 rounded-lg transition-all duration-200"
                :class="{
                  'bg-primary text-white hover:bg-primary-dark hover:shadow-sm': !isRunning && customMinutes,
                  'bg-gray-100 text-gray-400 cursor-not-allowed': isRunning || !customMinutes || isNaN(parseFloat(customMinutes))
                }"
                :disabled="!customMinutes || isNaN(parseFloat(customMinutes)) || isRunning"
              >
                确定
              </button>
              <button
                @click="toggleCustomInput"
                class="px-4 py-2 rounded-lg transition-all duration-200"
                :class="{
                  'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm': !isRunning,
                  'bg-gray-50 text-gray-400 cursor-not-allowed': isRunning
                }"
                :disabled="isRunning"
              >
                取消
              </button>
            </div>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="flex space-x-4">
          <button 
            :class="mainButtonClass"
            @click="handleMainButtonClick"
            :disabled="!time"
          >
            {{ buttonText }}
          </button>
          <button 
            :class="resetButtonClass"
            @click="resetTimer"
            :disabled="!time"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}

/* 移除数字输入框的箭头 */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type="number"] {
  -moz-appearance: textfield;
}
</style> 