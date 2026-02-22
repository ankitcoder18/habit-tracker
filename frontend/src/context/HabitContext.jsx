import { useState } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import cookie from 'js-cookie';
import { toast } from "react-toastify";
import axios from "axios";
import { useEffect } from "react";

export const HabitContext = createContext()

const HabitContextProvider = ({ children }) => {
    const navigate = useNavigate()
    const [token, setToken] = useState(cookie.get("token") || "")
    const [habitData, setHabitData] = useState([])

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
    const getAuthToken = () => token || cookie.get("token")

    const fetchHabits = async () => {
        try {
            const authToken = getAuthToken()
            console.log("🔍 Fetching habits with token:", authToken ? "✅ Present" : "❌ Missing");
            
            if (!authToken) {
                console.log("⚠️ No auth token, skipping fetch");
                return;
            }
            
            const { data } = await axios.get(`${backendUrl}/api/user/habits`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
                withCredentials: true
            })
            
            console.log("📦 Fetched habits:", data.data?.length || 0, "habits");
            
            if (data.success) {
                setHabitData(data.data)
            }
        } catch (error) {
            console.log("❌ Error fetching habits:", error.response?.data || error.message);
            toast.error("failed to fetch habits")
        }
    }

    const handleRegister = async (name, email, password) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/register`, { name, email, password }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            })
            if (data.success) {
                cookie.set("token", data.token, { expires: 7 })
                setToken(data.token)
                toast.success(data.message || "Register successfully")
                navigate("/Habits")
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "register failed")
        }
    }

    const handleLogin = async (email, password) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/user/login`, { email, password }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            })
            if (data.success) {
                cookie.set("token", data.token, { expires: 7 })
                setToken(data.token)
                toast.success(data.message || "Login successfully")
                navigate("/Habits")
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "login failed")
        }
    }

    const addHabit = async (name, description, frequency, category = "Other", reminderTime = null, reminderMinutes = 10) => {
        try {
            const token = getAuthToken()
            const { data } = await axios.post(`${backendUrl}/api/user/add-habits`, { 
                name, 
                description, 
                frequency, 
                category,
                reminderTime,
                reminderMinutes
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                withCredentials: true
            })
            if (data.success) {
                await fetchHabits()
                toast.success(data.message || "Habit added successfully")
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "failed to add habit")
        }
    }

    const deleteHabit = async (id) => {
        try {
            const authToken = getAuthToken()
            const { data } = await axios.delete(`${backendUrl}/api/user/habits/${id}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                },
                withCredentials: true
            })
            if (data.success) {
                toast.success(data.message || "deleted successfully")
                fetchHabits()
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "failed to delete habit")
        }
    }

    const markComplete = async (id, date) => {
        try {
            const authToken = getAuthToken()
            const selectedDate = date || new Date().toISOString().split('T')[0]
            
            const { data } = await axios.put(`${backendUrl}/api/user/habits/completed/${id}`, 
                { date: selectedDate }, 
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json"
                    },
                    withCredentials: true
                }
            )
            if (data.success) {
                await fetchHabits()
                return data
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "failed to mark habit")
            throw error
        }
    }

    // Calculate streak for a specific habit
    const calculateStreak = (habit) => {
        if (!habit || !habit.logs || habit.logs.length === 0) return 0
        
        let streak = 0
        const sortedLogs = [...habit.logs]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        
        for (let log of sortedLogs) {
            if (log.completed) {
                streak++
            } else {
                break
            }
        }
        return streak
    }

    // Calculate weekly stats for all habits
    const calculateWeeklyStats = () => {
        const weekDates = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            weekDates.push(date.toISOString().split("T")[0])
        }

        const totalHabits = habitData.length
        const weeklyCompletion = weekDates.map(date => {
            const completed = habitData.filter(habit =>
                habit.logs.some(log => log.date === date && log.completed)
            ).length
            return { date, completed, total: totalHabits }
        })

        const totalCompleted = weeklyCompletion.reduce((sum, day) => sum + day.completed, 0)
        const totalPossible = totalHabits * 7
        const weeklyPercentage = totalPossible ? (totalCompleted / totalPossible) * 100 : 0

        return { weeklyCompletion, weeklyPercentage, totalCompleted, totalPossible }
    }

    // Get comprehensive habit statistics
    const getHabitStats = () => {
        const totalHabits = habitData.length
        
        // Total completions across all habits
        const totalCompletions = habitData.reduce((sum, habit) => {
            return sum + habit.logs.filter(log => log.completed).length
        }, 0)

        // Get all unique dates with completions
        const allCompletedDates = new Set()
        habitData.forEach(habit => {
            habit.logs.forEach(log => {
                if (log.completed) {
                    allCompletedDates.add(log.date)
                }
            })
        })

        // Calculate consistency (unique days with at least one completion)
        const daysActive = allCompletedDates.size

        // Find longest streak across all habits
        const maxStreak = habitData.reduce((max, habit) => {
            const currentStreak = calculateStreak(habit)
            return currentStreak > max ? currentStreak : max
        }, 0)

        // Calculate average completion rate
        const totalLogs = habitData.reduce((sum, habit) => sum + habit.logs.length, 0)
        const completionRate = totalLogs ? (totalCompletions / totalLogs) * 100 : 0

        // Today's stats
        const today = new Date().toISOString().split('T')[0]
        const completedToday = habitData.filter(habit =>
            habit.logs.some(log => log.date === today && log.completed)
        ).length

        // Category distribution
        const categoryStats = {}
        habitData.forEach(habit => {
            const category = habit.category || 'Other'
            if (!categoryStats[category]) {
                categoryStats[category] = { total: 0, completed: 0 }
            }
            categoryStats[category].total++
            const completedCount = habit.logs.filter(log => log.completed).length
            categoryStats[category].completed += completedCount
        })

        return {
            totalHabits,
            totalCompletions,
            daysActive,
            maxStreak,
            completionRate,
            completedToday,
            categoryStats,
            weeklyStats: calculateWeeklyStats()
        }
    }

    // Get habit by ID
    const getHabitById = (id) => {
        return habitData.find(habit => habit._id === id)
    }

    // Check if habit is completed on a specific date
    const isHabitCompleted = (habitId, date) => {
        const habit = getHabitById(habitId)
        if (!habit) return false
        return habit.logs.some(log => log.date === date && log.completed)
    }

    useEffect(() => {
        if (token) {
            fetchHabits()
        }
    }, [token])

    const values = {
        fetchHabits,
        backendUrl,
        habitData,
        setHabitData,
        handleRegister,
        handleLogin,
        addHabit,
        deleteHabit,
        markComplete,
        token,
        setToken,
        calculateStreak,
        calculateWeeklyStats,
        getHabitStats,
        getHabitById,
        isHabitCompleted
    }

    return (
        <HabitContext.Provider value={values}>
            {children}
        </HabitContext.Provider>
    )
}

export default HabitContextProvider