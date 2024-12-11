export const WORKOUT_TYPES = {
    STRENGTH: 'strength', CARDIO: 'cardio'
}

export const WORKOUT_STATUS = {
    STARTED: 'started', ENDED: 'ended'
}

// Mock 数据存储
let mockData = {
    // 训练记录历史 - 用于日历展示
    workoutHistory: [
        {
            date: '2024-12-07',
            exercises: [
                {id: 103, name: '深蹲', category: WORKOUT_TYPES.STRENGTH, sets: 4, reps: 10, weight: 60, completed: 3, type: '力量训练'},
                {id: 104, name: '跑步', category: WORKOUT_TYPES.CARDIO, distance: 5, duration: 60, completed: false, type: '有氧运动'},
            ],
            totalDuration: 120,
            summary: {strength: 1, cardio: 1}
        },
        {
            date: '2024-12-09',
            exercises: [
                {id: 103, name: '深蹲', category: WORKOUT_TYPES.STRENGTH, sets: 4, reps: 10, weight: 60, completed: 3, type: '力量训练'},
                {id: 104, name: '跑步', category: WORKOUT_TYPES.CARDIO, distance: 5, duration: 60, completed: false, type: '有氧运动'},
            ],
            totalDuration: 120,
            summary: {strength: 1, cardio: 1}
        },
        {
            date: '2024-12-11',
            exercises: [
                {id: 102, name: '热身快走', category: WORKOUT_TYPES.CARDIO, distance: 1, duration: 20, completed: false, type: '有氧运动'},
                {id: 101, name: '深蹲', category: WORKOUT_TYPES.STRENGTH, sets: 4, reps: 10, weight: 60, completed: 0, type: '力量训练'},
                {id: 104, name: '坐姿腿屈伸', category: WORKOUT_TYPES.STRENGTH, sets: 4, reps: 10, weight: 60, completed: 0, type: '力量训练'},
            ],
            totalDuration: 120,
            summary: {strength: 1, cardio: 1}
        },
    ],

    // 训练时间片段记录 - 用于记录tab展示
    timeRecords: [
        {
            id: 1,
            date: '2024-12-08',
            segments: [
                {id: 101, startTime: '08:30', endTime: '09:45', duration: 75, status: WORKOUT_STATUS.ENDED, note: '晨练 - 力量训练'},
                {id: 102, startTime: '10:30', endTime: '11:45', duration: 60, status: WORKOUT_STATUS.ENDED, note: '晨练 - 有氧训练'},
            ],
            totalDuration: 145
        }],

    // 添加今日训练计划
    todayWorkout: {
        date: new Date().toLocaleDateString(),
        exercises: [
            {id: 1, name: '哈克深蹲', sets: 4, reps: 10, weight: 120, completed: 4, category: WORKOUT_TYPES.STRENGTH, type: '力量训练'},
            {id: 2, name: '坐姿腿屈伸', sets: 4, reps: 10, weight: 60, completed: 0, category: WORKOUT_TYPES.STRENGTH, type: '力量训练'},
            {id: 3, name: '跑步', distance: 5, duration: 30, completed: 0, category: WORKOUT_TYPES.CARDIO, type: '有氧运动'},
        ]
    },

    // 打卡记录
    clockInRecords: [
        {
            id: 1,
            timestamp: new Date('2024-12-11 08:30:00').getTime(),
            date: '2024年12月11日 星期三',
            time: '08:30:00',
            type: '上午',
            location: '健身房'
        },
        {
            id: 2,
            timestamp: new Date('2024-12-11 17:30:00').getTime(),
            date: '2024年12月11日 星期三',
            time: '17:30:00',
            type: '下午',
            location: '健身房'
        },
        {
            id: 3,
            timestamp: new Date('2024-12-10 09:00:00').getTime(),
            date: '2024年12月10日 星期二',
            time: '09:00:00',
            type: '上午',
            location: '家'
        },
        {
            id: 4,
            timestamp: new Date('2024-12-10 18:00:00').getTime(),
            date: '2024年12月10日 星期二',
            time: '18:00:00',
            type: '下午',
            location: '公司'
        }
    ],

    // 添加统计数据
    stats: {
        total: {
            workouts: 156,
            duration: 8940
        },
        types: [
            { name: '力量训练', percentage: 45.5 },
            { name: '有氧运动', percentage: 30.3 },
            { name: '拉伸', percentage: 15.2 },
            { name: '其他', percentage: 9 }
        ]
    }
}

// 模拟延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API 响应
export const mockApi = {
    // 训练API
    // 获取今日训练计划
    async getTodayWorkout() {
        return {code: 0, data: mockData.todayWorkout, message: 'success'}
    },

    // 更新训练进度
    async updateExerciseProgress(exerciseId, completed) {
        const exercise = mockData.todayWorkout.exercises.find(e => e.id === exerciseId)
        if (!exercise) {
            return {code: -1, message: '未找到训练项目'}
        }

        // 更新完成进度
        exercise.completed = completed

        // 如果训练完成，添加到训练历史记录
        if ((exercise.category === WORKOUT_TYPES.STRENGTH && completed === exercise.sets) || (exercise.category === WORKOUT_TYPES.CARDIO && completed)) {
            const today = new Date().toISOString().split('T')[0]
            let historyRecord = mockData.workoutHistory.find(r => r.date === today)

            if (!historyRecord) {
                historyRecord = {
                    date: today,
                    exercises: [],
                    totalDuration: 0,
                    summary: {strength: 0, cardio: 0}
                }
                mockData.workoutHistory.push(historyRecord)
            }

            // 添加或更新历史记录
            const existingExercise = historyRecord.exercises.find(e => e.id === exercise.id)
            if (existingExercise) {
                Object.assign(existingExercise, exercise)
            } else {
                historyRecord.exercises.push({...exercise})
                historyRecord.summary[exercise.category === WORKOUT_TYPES.STRENGTH ? 'strength' : 'cardio']++
            }
        }

        // 返回更新后的完整训练计划
        return {
            code: 0,
            data: {
                ...mockData.todayWorkout,
                exercises: mockData.todayWorkout.exercises.map(e => ({...e}))  // 创建新的数组和对象
            },
            message: 'success'
        }
    },

    async updateExercise(exercise) {
        await delay(200)

        if (!exercise || !exercise.id) {
            return {code: -1, message: '无效的训练数据'}
        }

        // 查找并更新今日训练计划中的项目
        const index = mockData.todayWorkout.exercises.findIndex(e => e.id === exercise.id)
        if (index !== -1) {
            // 创建更新后的训练项目
            const updatedExercise = {
                ...mockData.todayWorkout.exercises[index],  // 保留原有数据
                ...exercise,  // 更新新的数据
                completed: exercise.completed ?? mockData.todayWorkout.exercises[index].completed  // 保留原有的完成状态
            }

            // 更新训练计划
            mockData.todayWorkout.exercises[index] = updatedExercise

            // 如果已经存在于历史记录中，也需要更新
            const today = new Date().toISOString().split('T')[0]
            const historyRecord = mockData.workoutHistory.find(r => r.date === today)
            if (historyRecord) {
                const historyIndex = historyRecord.exercises.findIndex(e => e.id === exercise.id)
                if (historyIndex !== -1) {
                    historyRecord.exercises[historyIndex] = {
                        ...updatedExercise
                    }
                }
            }

            return {
                code: 0,
                data: updatedExercise,
                message: 'success'
            }
        }

        return {code: -1, message: '未找到训练项目'}
    },

    // 添加训练项目
    async addExercise(exercise) {
        await delay(200)

        if (!exercise || !exercise.name) {
            return {code: -1, message: '无效的训练数据'}
        }

        const newExercise = {
            ...exercise,
            id: Date.now(),  // 生成唯一ID
            completed: 0     // 初始完成进度为0
        }
        mockData.todayWorkout.exercises.push(newExercise)

        return {
            code: 0,
            data: {
                ...mockData.todayWorkout,  // 返回完整的训练计划
            },
            message: 'success'
        }
    },

    // 删除训练项目
    async deleteExercise(exerciseId) {
        await delay(200)

        const index = mockData.todayWorkout.exercises.findIndex(e => e.id === exerciseId)
        if (index === -1) {
            return {code: -1, message: '未找到训练项目'}
        }

        // 从训练计划中移除
        mockData.todayWorkout.exercises.splice(index, 1)

        // 如果存在于今日历史记录中，也需要移除
        const today = new Date().toISOString().split('T')[0]
        const historyRecord = mockData.workoutHistory.find(r => r.date === today)
        if (historyRecord) {
            const historyIndex = historyRecord.exercises.findIndex(e => e.id === exerciseId)
            if (historyIndex !== -1) {
                historyRecord.exercises.splice(historyIndex, 1)
                // 更新统计数据
                const exercise = historyRecord.exercises[historyIndex]
                if (exercise) {
                    historyRecord.summary[exercise.category === WORKOUT_TYPES.STRENGTH ? 'strength' : 'cardio']--
                }
            }
        }

        return {
            code: 0,
            message: 'success'
        }
    },

    /* 计时 */

    // 打卡API
    // 获取打卡记录
    async getClockInRecords() {
        return {code: 0, data: mockData.clockInRecords, message: 'success'}
    },

    // 修改打卡方法
    async clockIn(location) {
        const now = new Date()
        const hour = now.getHours()

        const locationMap = {
            home: '家',
            gym: '健身房',
            company: '公司'
        }

        const record = {
            id: Date.now(),
            timestamp: now.getTime(),
            date: now.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            }).replace('星期', ' 星期'),
            time: now.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            type: hour < 12 ? '上午' : '下午',
            location: locationMap[location] || '未知地点'  // 确保始终有地点值
        }

        mockData.clockInRecords.unshift(record)
        return {code: 0, data: record, message: 'success'}
    },

    // 日历API
    // 获取月度训练记录
    async getMonthWorkouts(year, month) {
        await delay(200)
        const startDate = new Date(year, month, 1)
        const endDate = new Date(year, month + 1, 0)

        const records = mockData.workoutHistory.filter(record => {
            const recordDate = new Date(record.date)
            return recordDate >= startDate && recordDate <= endDate
        })

        return {code: 0, data: records, message: 'success'}
    },

    // 获取指定日期的训练记录
    async getWorkoutsByDate(date) {
        await delay(200)
        const targetDate = new Date(date).toDateString()
        const record = mockData.workoutHistory.find(r => new Date(r.date).toDateString() === targetDate)

        return {
            code: 0, data: record || {exercises: []}, message: 'success'
        }
    },

    // 获取总体统计数据
    async getWorkoutStats() {
        await delay(200)
        return {
            code: 0,
            data: mockData.stats,
            message: 'success'
        }
    },

    // 获取时段统计数据
    async getPeriodStats(period) {
        await delay(200)
        let data = []
        const now = new Date()

        switch (period) {
            case 'week':
                data = Array.from({ length: 7 }, (_, i) => ({
                    date: new Date(now - (6 - i) * 86400000),
                    workouts: Math.floor(Math.random() * 3),
                    duration: Math.floor(Math.random() * 120)
                }))
                break
            case 'month':
                data = Array.from({ length: 4 }, (_, i) => ({
                    week: i + 1,
                    workouts: Math.floor(Math.random() * 10 + 5),
                    duration: Math.floor(Math.random() * 500 + 200)
                }))
                break
            case 'year':
                data = Array.from({ length: 12 }, (_, i) => ({
                    month: i + 1,
                    workouts: Math.floor(Math.random() * 30 + 10),
                    duration: Math.floor(Math.random() * 1500 + 500)
                }))
                break
        }

        return {
            code: 0,
            data,
            message: 'success'
        }
    }
}