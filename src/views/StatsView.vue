<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <PageHeader title="数据分析" :show-back="true" />
    
    <div class="p-4 space-y-4">
      <!-- 总览数据 -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">训练总览</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-primary/5 rounded-lg p-4">
            <div class="text-2xl font-bold text-primary">{{ totalStats.workouts }}</div>
            <div class="text-sm text-gray-500 mt-1">总训练次数</div>
          </div>
          <div class="bg-primary/5 rounded-lg p-4">
            <div class="text-2xl font-bold text-primary">{{ formatDuration(totalStats.duration) }}</div>
            <div class="text-sm text-gray-500 mt-1">总训练时长</div>
          </div>
        </div>
      </div>

      <!-- 时间范围选择 -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex space-x-4 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
            :class="[
              activeTab === tab.value 
                ? 'bg-primary text-white shadow-sm' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
            @click="changeTab(tab.value)"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 时段统计数据 -->
        <div class="space-y-4">
          <div 
            v-for="(item, index) in periodStats" 
            :key="index"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div>
              <div class="font-medium text-gray-900">{{ formatPeriodLabel(item) }}</div>
              <div class="text-sm text-gray-500 mt-1">训练 {{ item.workouts }} 次</div>
            </div>
            <div class="text-right">
              <div class="font-medium text-primary">{{ formatDuration(item.duration) }}</div>
              <div class="text-xs text-gray-500 mt-1">
                平均 {{ formatAvgDuration(item.duration, item.workouts) }}/次
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 训练类型分布 -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">训练类型分布</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 饼图 -->
          <div ref="pieChartRef" class="h-[300px]"></div>
          <!-- 图例和数据 -->
          <div class="space-y-3 py-4">
            <div 
              v-for="(type, index) in workoutTypes" 
              :key="index"
              class="flex items-center"
            >
              <div class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: typeColors[index] }"></div>
              <div class="flex-1">
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">{{ type.name }}</span>
                  <span class="text-sm text-gray-500">{{ type.percentage }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="rounded-full h-2 transition-all duration-500"
                    :style="{ 
                      width: `${type.percentage}%`,
                      backgroundColor: typeColors[index]
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { mockApi } from '@/mock/workout'
import * as echarts from 'echarts'
import {workoutApi} from "@/api/workout.js";

const activeTab = ref('week')
const tabs = [
  { label: '周统计', value: 'week' },
  { label: '月统计', value: 'month' },
  { label: '年统计', value: 'year' }
]

const totalStats = ref({
  workouts: 0,
  duration: 0
})
const periodStats = ref([])
const workoutTypes = ref([])

// 格式化数字，保留2位小数
const formatNumber = (num) => {
  return Number.isInteger(num) ? num : Number(num).toFixed(2)
}

// 格式化时长显示
const formatDuration = (minutes) => {
  if (!minutes) return '0分钟'
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`
}

// 格式化平均时长
const formatAvgDuration = (total, count) => {
  if (!count) return '0分钟'
  const avg = total / count
  return formatDuration(Number(avg.toFixed(2)))
}

// 格式化时间段标签
const formatPeriodLabel = (item) => {
  if (item.date) {
    return new Date(item.date).toLocaleDateString('zh-CN', { weekday: 'long' })
  } else if (item.week) {
    return `第${item.week}周`
  } else {
    return `${item.month}月`
  }
}

// 获取总体统计数据
const fetchTotalStats = async () => {
  try {
    const res = await workoutApi.getWorkoutStats()
    if (res.code === 0) {
      totalStats.value = res.data.total
      workoutTypes.value = res.data.types.map(type => ({
        ...type,
        percentage: formatNumber(type.percentage)
      }))
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取时段统计数据
const fetchPeriodStats = async (period) => {
  try {
    const res = await workoutApi.getPeriodStats(period)
    if (res.code === 0) {
      periodStats.value = res.data
    }
  } catch (error) {
    console.error('获取时段统计失败:', error)
  }
}

// 切换时间范围
const changeTab = async (tab) => {
  activeTab.value = tab
  await fetchPeriodStats(tab)
}

// 图表颜色
const typeColors = [
  '#3B82F6', // 蓝色
  '#10B981', // 绿色
  '#F59E0B', // 橙色
  '#6366F1'  // 靛蓝色
]

// 饼图引用
const pieChartRef = ref(null)
let pieChart = null

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  updatePieChart()
}

// 更新饼图数据
const updatePieChart = () => {
  if (!pieChart) return

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: workoutTypes.value.map((type, index) => ({
          value: type.percentage,
          name: type.name,
          itemStyle: {
            color: typeColors[index]
          }
        }))
      }
    ]
  }

  pieChart.setOption(option)
}

// 监听窗口大小变化
const handleResize = () => {
  pieChart?.resize()
}

// 监听数据变化更新图表
watch(workoutTypes, () => {
  updatePieChart()
}, { deep: true })

onMounted(() => {
  // 获取数据
  fetchTotalStats()
  changeTab('week')
  
  // 初始化图表
  initPieChart()
  window.addEventListener('resize', handleResize)
})

// 清理事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
})
</script>

<style scoped>
/* 添加图表动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stats-container {
  animation: fadeIn 0.5s ease-out;
}

/* 添加进度条动画 */
.rounded-full {
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}
</style> 