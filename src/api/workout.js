import {mockApi, WORKOUT_TYPES, WORKOUT_STATUS} from '../mock/workout'
import request from '../utils/request'

// 判断是否使用mock数据
const USE_MOCK = false  // 可以通过环境变量来控制

const locationMap = {
    home: '家', gym: '健身房', company: '公司'
}

// 实际的API实现
const realApi = {
    // 获取今日训练计划
    async getTodayWorkout() {
        try {
            const res = await request.get('/v1/train-plan/today-workout')
            return {code: 0, data: res.data, message: res.message}
        } catch (error) {
            console.error('获取今日训练计划失败:', error)
            return {code: -1, message: error.message || '获取今日训练计划失败'}
        }
    },


    // 添加训练计划
    async addExercise(exercise) {
        try {
            const res = await request.post('/v1/train-plan', exercise)
            return {code: 0, data: res.data, message: res.message}
        } catch (error) {
            return {code: -1, message: error.message || '添加今日训练计划失败'}
        }
    },


    // 编辑训练计划
    async updateExercise(exercise) {
        try {
            const res = await request.post('/v1/train-plan/update', exercise)
            return {code: 0, data: exercise, message: res.message}
        } catch (error) {
            return {code: -1, message: error.message || '编辑训练计划失败'}
        }
    },

    // 更新训练进度
    async updateExerciseProgress(exerciseId, completed) {
        try {
            const res = await request.post('v1/train-plan/complete', {
                id: exerciseId, completed: completed,
            })
            return {code: 0, data: res.data, message: res.message}
        } catch (error) {
            return {code: -1, message: error.message || '添加今日训练计划失败'}
        }
    },


    // 删除训练计划
    async deleteExercise(exerciseId) {
        try {
            const res = await request.post('v1/train-plan/del', {id: exerciseId})
            return {code: 0, data: res.data, message: res.message}
        } catch (error) {
            return {code: -1, message: error.message || '删除训练计划失败'}
        }
    },

    // 获取打卡记录
    async getClockInRecords() {
        try {
            const res = await request.get('/v1/attendance')
            return {code: 0, data: res.data, message: res.message}
        } catch (error) {
            console.error('获取打卡记录失败:', error)
            return {code: -1, message: error.message || '获取打卡记录失败'}
        }
    },

    // 打卡
    async clockIn(location) {
        const now = new Date()
        const hour = now.getHours()

        const record = {
            date: now.toLocaleDateString('zh-CN', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            }).replace('星期', ' 星期'),
            time: now.toLocaleTimeString('zh-CN', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }),
            type: hour < 12 ? '上午' : '下午',
            location: locationMap[location] || '未知地点'  // 确保始终有地点值
        }

        try {
            const res = await request.post('/v1/attendance',record)
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