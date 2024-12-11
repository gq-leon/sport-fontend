import {mockApi, WORKOUT_TYPES, WORKOUT_STATUS} from '../mock/workout'
import request from '../utils/request'

// 判断是否使用mock数据
const USE_MOCK = true  // 可以通过环境变量来控制

// 实际的API实现
const realApi = {
    // 获取今日训练计划
    async getTodayWorkout() {
        try {
            const res = await request.get('/api/todayWorkout')
            return {code: 0, data: res.data, message: res.message}
        } catch (error) {
            console.error('获取今日训练计划失败:', error)
            return {code: -1, message: error.message || '获取今日训练计划失败'}
        }
    },


    // 获取打卡记录
    async getClockInRecords() {
        try {
            const res = await request.get('/api/clockRecords')
            return {code: 0, data: res.data, message: res.message}
        } catch (error) {
            console.error('获取打卡记录失败:', error)
            return {code: -1, message: error.message || '获取打卡记录失败'}
        }
    },
}

// 根据环境选择使用mock还是真实API
const api = USE_MOCK ? mockApi : realApi

// 导出训练类型枚举和状态
export {WORKOUT_TYPES, WORKOUT_STATUS}

export const workoutApi = {
    // 获取今日训练计划
    getTodayWorkout() {
        return api.getTodayWorkout()
    },

    // 更新训练进度
    updateExerciseProgress(exerciseId, completed) {
        return api.updateExerciseProgress(exerciseId, completed)
    },

    // 添加新的训练项目
    addExercise(exercise) {
        return api.addExercise(exercise)
    },

    // 更新训练项目
    updateExercise(exercise) {
        return api.updateExercise(exercise)
    },

    // 删除训练项目
    deleteExercise(exerciseId) {
        return api.deleteExercise(exerciseId)
    },

    // 获取指定日期的训练记录
    getWorkoutsByDate(date) {
        return api.getWorkoutsByDate(date)
    },

    // 获取月度训练记录
    getMonthWorkouts(year, month) {
        return api.getMonthWorkouts(year, month)
    },


    // 获取打卡记录
    getClockInRecords() {
        return api.getClockInRecords()
    },

    // 打卡
    clockIn(location) {
        return api.clockIn(location)
    },


    // 添加获取统计数据的方法
    getWorkoutStats(type) {
        return api.getWorkoutStats(type)
    },

    getPeriodStats(period) {
        return api.getPeriodStats(period)
    },
}