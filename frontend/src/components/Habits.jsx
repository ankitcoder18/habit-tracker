import { useContext, useState, useEffect } from "react"
import { HabitContext } from "../context/HabitContext"
import { MdOutlineDeleteOutline, MdCategory } from "react-icons/md";
import { FaEdit, FaPlus, FaCalendarAlt, FaCheckCircle, FaFire, FaFilter, FaBell } from "react-icons/fa"
import HabitAnalytics from "./HabitAnalytics"
import { toast } from "react-toastify";
import { requestNotificationPermission, checkAndShowReminders, formatTime } from "../utils/notificationHelper";

const Habits = () => {
    const { habitData, markComplete, addHabit, deleteHabit, fetchHabits } = useContext(HabitContext)
    const [showModel, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [completingId, setCompletingId] = useState(null)
    const [filterCategory, setFilterCategory] = useState("All")
    const today = new Date().toISOString().split("T")[0]
    const [selectedDate, setSelectedDate] = useState(today)
    const [newHabit, setNewHabit] = useState({
        name: "",
        description: "",
        frequency: "",
        category: "Health",
        reminderTime: "",
        reminderMinutes: 10,
        logs: []
    })

    const categories = ["All", "Health", "Work", "Learning", "Fitness", "Mindfulness", "Personal", "Other"]
    const categoryColors = {
        "Health": "from-green-500 to-emerald-600",
        "Work": "from-blue-500 to-indigo-600",
        "Learning": "from-purple-500 to-pink-600",
        "Fitness": "from-orange-500 to-red-600",
        "Mindfulness": "from-teal-500 to-cyan-600",
        "Personal": "from-yellow-500 to-orange-500",
        "Other": "from-gray-500 to-slate-600"
    }

    const categoryIcons = {
        "Health": "🏥",
        "Work": "💼",
        "Learning": "📚",
        "Fitness": "💪",
        "Mindfulness": "🧘",
        "Personal": "👤",
        "Other": "📌"
    }

    const handleCompleteClick = async (id) => {
        setCompletingId(id)
        try {
            await markComplete(id, selectedDate)
            // Force re-fetch to ensure data is up to date
            await fetchHabits()
            toast.success("Habit marked as complete! 🎉")
        } catch (error) {
            console.log("Error completing habit:", error);
            toast.error("Failed to mark habit")
        } finally {
            setCompletingId(null)
        }
    }

    const addHabitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await addHabit(
                newHabit.name, 
                newHabit.description, 
                newHabit.frequency, 
                newHabit.category,
                newHabit.reminderTime || null,
                newHabit.reminderMinutes
            )
            setNewHabit({ 
                name: "", 
                description: "", 
                frequency: "", 
                category: "Health",
                reminderTime: "",
                reminderMinutes: 10
            })
            setShowModal(false)
            toast.success("Habit added successfully! 🎯")
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.message || "Failed to add habit")
            } else {
                toast.error("An unexpected error occurred")
            }
        } finally {
            setLoading(false)
        }
    }

    const handlerDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this habit?")) {
            try {
                await deleteHabit(id)
                toast.success("Habit deleted successfully")
            } catch (error) {
                toast.error("Failed to delete habit")
            }
        }
    }

    // Calculate streak for a habit
    const calculateStreak = (habit) => {
        if (!habit || !habit.logs || habit.logs.length === 0) return 0
        
        const normalizeDate = (dateStr) => {
            if (!dateStr) return '';
            const normalized = dateStr.split('T')[0];
            // Validate date format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return '';
            return normalized;
        };
        
        const completedLogs = habit.logs
            .filter(log => log.completed && log.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (completedLogs.length === 0) return 0;
        
        let streak = 0;
        const todayDate = today;
        
        // Check if most recent completion is today or yesterday
        const mostRecentDate = normalizeDate(completedLogs[0].date);
        if (!mostRecentDate) return 0;
        
        const daysDiff = Math.floor((new Date(todayDate) - new Date(mostRecentDate)) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) return 0; // Streak broken
        
        // Count consecutive days
        for (let i = 0; i < completedLogs.length; i++) {
            const normalizedDate = normalizeDate(completedLogs[i].date);
            if (!normalizedDate) continue;
            
            const currentDate = new Date(normalizedDate);
            if (isNaN(currentDate.getTime())) continue;
            
            const expectedDate = new Date(todayDate);
            expectedDate.setDate(expectedDate.getDate() - i - daysDiff);
            
            if (normalizeDate(currentDate.toISOString()) === normalizeDate(expectedDate.toISOString())) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    // Filter habits by category
    const filteredHabits = filterCategory === "All" 
        ? (habitData || [])
        : (habitData || []).filter(habit => habit.category === filterCategory)

    // Request notification permission on mount
    useEffect(() => {
        requestNotificationPermission();
    }, []);

    // Check for reminders every minute
    useEffect(() => {
        if (!habitData || habitData.length === 0) return;

        const checkReminders = () => {
            checkAndShowReminders(habitData);
        };

        // Check immediately
        checkReminders();

        // Then check every minute
        const interval = setInterval(checkReminders, 60000);

        return () => clearInterval(interval);
    }, [habitData]);

    return (
        <div className="container mx-auto p-2 md:p-6 space-y-6 min-h-screen">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 p-6 rounded-3xl shadow-2xl">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center lg:justify-start gap-3">
                            <span className="text-4xl">🎯</span>
                            Habit Tracker
                        </h1>
                        <p className="text-purple-200 text-sm md:text-base">Build better habits, one day at a time</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                            <label className="text-xs md:text-sm text-purple-100 font-medium flex items-center gap-2" htmlFor="date">
                                <FaCalendarAlt /> Select Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="border-2 border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg bg-white text-gray-800 font-medium transition-all"
                            />
                        </div>

                        <button 
                            onClick={() => setShowModal(true)} 
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-6 py-3 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2 whitespace-nowrap"
                        >
                            <FaPlus /> Add Habit
                        </button>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="mt-6 flex items-center gap-3 overflow-x-auto pb-2">
                    <FaFilter className="text-purple-200 flex-shrink-0" />
                    <div className="flex gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                                    filterCategory === cat
                                        ? 'bg-white text-purple-900 shadow-lg scale-105'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                {cat !== "All" && categoryIcons[cat]} {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add Habit Modal */}
            {showModel && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-4 animate-fadeIn">
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all animate-slideUp">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-pink-600">
                            Create New Habit
                        </h2>
                        <form onSubmit={addHabitHandler} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Habit Name</label>
                                <input
                                    type="text"
                                    value={newHabit.name}
                                    onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="e.g., Morning Exercise"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                                <textarea
                                    value={newHabit.description}
                                    onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                    rows="3"
                                    placeholder="Describe your habit..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Category</label>
                                <select 
                                    onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                                    value={newHabit.category} 
                                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    required
                                >
                                    {categories.slice(1).map(cat => (
                                        <option key={cat} value={cat}>{categoryIcons[cat]} {cat}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2">Frequency</label>
                                <select 
                                    onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                                    value={newHabit.frequency} 
                                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    required
                                >
                                    <option value="">Select Frequency</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                </select>
                            </div>

                            {/* Reminder Section */}
                            <div className="border-2 border-purple-200 rounded-xl p-4 bg-purple-50">
                                <div className="flex items-center gap-2 mb-3">
                                    <FaBell className="text-purple-600 text-xl" />
                                    <label className="block text-gray-700 font-semibold">Set Reminder (Optional)</label>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-gray-600 text-sm mb-2">Time</label>
                                        <input
                                            type="time"
                                            value={newHabit.reminderTime}
                                            onChange={(e) => setNewHabit({ ...newHabit, reminderTime: e.target.value })}
                                            className="w-full border-2 border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-gray-600 text-sm mb-2">Remind Before</label>
                                        <select
                                            value={newHabit.reminderMinutes}
                                            onChange={(e) => setNewHabit({ ...newHabit, reminderMinutes: parseInt(e.target.value) })}
                                            className="w-full border-2 border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm"
                                        >
                                            <option value={5}>5 minutes</option>
                                            <option value={10}>10 minutes</option>
                                            <option value={15}>15 minutes</option>
                                            <option value={30}>30 minutes</option>
                                            <option value={60}>1 hour</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {newHabit.reminderTime && (
                                    <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                                        ✓ You'll get a notification {newHabit.reminderMinutes} min before {newHabit.reminderTime}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button 
                                    onClick={() => setShowModal(false)} 
                                    type="button" 
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? "Adding..." : "Add Habit"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Habits List */}
                <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50 p-4 md:p-6 rounded-3xl shadow-2xl border border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Your Habits</h2>
                        <div className="bg-purple-100 px-4 py-2 rounded-full">
                            <span className="text-purple-900 font-bold">{filteredHabits.length} habits</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                        {filteredHabits.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📝</div>
                                <p className="text-gray-500 text-lg">No habits found. Start building your routine!</p>
                            </div>
                        ) : (
                            filteredHabits.map((habit) => {
                                // Normalize date for comparison
                                const normalizeDate = (dateStr) => dateStr ? dateStr.split('T')[0] : '';
                                const isCompleted = habit.logs?.find(log => normalizeDate(log.date) === normalizeDate(selectedDate))?.completed || false
                                const streak = calculateStreak(habit)
                                const gradientClass = categoryColors[habit.category] || categoryColors["Other"]
                                
                                return (
                                    <div 
                                        key={habit._id} 
                                        className={`p-4 md:p-5 rounded-2xl shadow-lg border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                                            isCompleted 
                                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                                                : 'bg-white border-gray-200 hover:shadow-xl'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3 mb-2">
                                                    <div className={`bg-gradient-to-br ${gradientClass} p-2 rounded-lg`}>
                                                        <span className="text-2xl">{categoryIcons[habit.category]}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={`font-bold text-lg md:text-xl text-gray-800 ${isCompleted ? 'line-through text-green-700' : ""}`}>
                                                            {habit.name}
                                                        </h3>
                                                        <p className={`text-sm md:text-base text-gray-600 mt-1 ${isCompleted ? 'line-through' : ""}`}>
                                                            {habit.description}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                                            <span className={`text-xs px-3 py-1 rounded-full font-semibold bg-gradient-to-r ${gradientClass} text-white`}>
                                                                {habit.category}
                                                            </span>
                                                            <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                                                                {habit.frequency}
                                                            </span>
                                                            {streak > 0 && (
                                                                <span className="text-xs bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                                                                    <FaFire className="animate-pulse" /> {streak} day streak
                                                                </span>
                                                            )}
                                                            {habit.reminderTime && (
                                                                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                                                                    <FaBell /> {formatTime(habit.reminderTime)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex sm:flex-col gap-2 justify-end">
                                                {selectedDate === today && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleCompleteClick(habit._id)} 
                                                            disabled={completingId === habit._id}
                                                            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center gap-2 justify-center whitespace-nowrap ${
                                                                isCompleted 
                                                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                                                                    : 'bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-white shadow-md'
                                                            } disabled:opacity-50`}
                                                        >
                                                            {completingId === habit._id ? (
                                                                <span className="animate-spin">⏳</span>
                                                            ) : isCompleted ? (
                                                                <><FaCheckCircle /> Done</>
                                                            ) : (
                                                                "Mark Complete"
                                                            )}
                                                        </button>
                                                        
                                                        <div className="flex gap-2">
                                                            <button className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all">
                                                                <FaEdit className="text-xl text-blue-600" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handlerDelete(habit._id)}
                                                                className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-all"
                                                            >
                                                                <MdOutlineDeleteOutline className="text-xl text-red-600" />
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>

                {/* Analytics Section */}
                <HabitAnalytics habits={habitData} selectedDate={selectedDate} />
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}

export default Habits