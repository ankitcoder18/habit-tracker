import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';
import { FaFire, FaTrophy, FaChartLine, FaCalendarCheck } from 'react-icons/fa';

const HabitAnalytics = ({ habits, selectedDate }) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() - 1)).toISOString().split("T")[0];
    
    // Helper function to normalize date for comparison
    const normalizeDate = (dateStr) => {
        if (!dateStr) return '';
        const normalized = dateStr.split('T')[0];
        // Validate date format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return '';
        return normalized;
    };
    
    const completedToday = habits.filter((habit) =>
        habit.logs?.some((log) => normalizeDate(log.date) === normalizeDate(selectedDate) && log.completed)).length;
    const completedYesterDay = habits.filter((habit) =>
        habit.logs?.some((log) => normalizeDate(log.date) === yesterday && log.completed)).length;
    const totalhabits = habits.length;
    const progressToday = totalhabits ? (completedToday / totalhabits) * 100 : 0;

    // Calculate streaks for each habit
    const calculateStreak = (habit) => {
        if (!habit || !habit.logs || habit.logs.length === 0) return 0;
        let streak = 0;
        const sortedLogs = [...habit.logs]
            .filter(log => log.completed && log.date)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (sortedLogs.length === 0) return 0;
        
        // Check if most recent completion is today or yesterday
        const mostRecentDate = normalizeDate(sortedLogs[0].date);
        if (!mostRecentDate) return 0;
        
        const daysDiff = Math.floor((new Date(today) - new Date(mostRecentDate)) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) return 0; // Streak broken
        
        for (let i = 0; i < sortedLogs.length; i++) {
            const normalizedDate = normalizeDate(sortedLogs[i].date);
            if (!normalizedDate) continue;
            
            const currentDate = new Date(normalizedDate);
            if (isNaN(currentDate.getTime())) continue;
            
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i - daysDiff);
            
            if (normalizeDate(currentDate.toISOString()) === normalizeDate(expectedDate.toISOString())) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    // Get maximum streak
    const maxStreak = habits.reduce((max, habit) => {
        const currentStreak = calculateStreak(habit);
        return currentStreak > max ? currentStreak : max;
    }, 0);

    // Calculate weekly stats (last 7 days)
    const calculateWeeklyStats = () => {
        const weekDates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            weekDates.push(date.toISOString().split("T")[0]);
        }

        const weeklyCompletion = weekDates.map(date => {
            const completed = habits.filter(habit =>
                habit.logs?.some(log => normalizeDate(log.date) === date && log.completed)
            ).length;
            return { date, completed, total: totalhabits };
        });

        const totalCompleted = weeklyCompletion.reduce((sum, day) => sum + day.completed, 0);
        const totalPossible = totalhabits * 7;
        const weeklyPercentage = totalPossible ? (totalCompleted / totalPossible) * 100 : 0;

        return { weeklyCompletion, weeklyPercentage, totalCompleted };
    };

    const { weeklyPercentage, totalCompleted } = calculateWeeklyStats();

    // Calculate total completions all time
    const totalCompletions = habits.reduce((sum, habit) => {
        return sum + (habit.logs?.filter(log => log.completed && log.date).length || 0);
    }, 0);

    // Calculate consistency percentage (days with at least one habit completed)
    const calculateConsistency = () => {
        const allDates = new Set();
        habits.forEach(habit => {
            habit.logs.forEach(log => {
                if (log.completed && log.date) {
                    const normalized = normalizeDate(log.date);
                    if (normalized) {
                        allDates.add(normalized);
                    }
                }
            });
        });

        const daysActive = allDates.size;
        const daysSinceStart = 30; // You can calculate this based on first habit date
        return daysSinceStart ? (daysActive / daysSinceStart) * 100 : 0;
    };

    const consistencyPercentage = calculateConsistency();

    return (
        <div className="bg-gradient-to-br from-white to-purple-50 p-4 md:p-6 rounded-3xl shadow-2xl border border-purple-100 transition-all duration-300 hover:shadow-purple-200">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-purple-600">
                📊 Analytics Dashboard
            </h2>

            {/* Main Progress Circle */}
            <div className="mb-6 flex items-center justify-center">
                <div style={{ width: '180px', height: '180px' }} className="relative">
                    <CircularProgressbar
                        value={progressToday}
                        text={`${Math.round(progressToday)}%`}
                        styles={buildStyles({
                            pathColor: progressToday === 100 ? '#10b981' : '#140746',
                            textColor: '#140746',
                            trailColor: '#e9d5ff',
                            textSize: '16px',
                            pathTransition: 'stroke-dashoffset 0.8s ease-in-out',
                            strokeLinecap: 'round'
                        })}
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-purple-900 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        {selectedDate === today ? "Today" : selectedDate}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-4 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-2">
                        <FaTrophy className="text-yellow-300 text-2xl" />
                        <span className="text-xs text-purple-200 font-medium">Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{completedToday}</p>
                    <p className="text-xs text-purple-200 mt-1">of {totalhabits} habits</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-2">
                        <FaFire className="text-yellow-200 text-2xl animate-pulse" />
                        <span className="text-xs text-orange-100 font-medium">Max Streak</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{maxStreak}</p>
                    <p className="text-xs text-orange-100 mt-1">days in a row</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-2">
                        <FaChartLine className="text-green-100 text-2xl" />
                        <span className="text-xs text-green-100 font-medium">Weekly</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{Math.round(weeklyPercentage)}%</p>
                    <p className="text-xs text-green-100 mt-1">{totalCompleted} completed</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-2">
                        <FaCalendarCheck className="text-blue-100 text-2xl" />
                        <span className="text-xs text-blue-100 font-medium">Consistency</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{Math.round(consistencyPercentage)}%</p>
                    <p className="text-xs text-blue-100 mt-1">active days</p>
                </div>
            </div>

            {/* Total Stats */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-2xl mb-4 border border-purple-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-purple-700 font-medium">Total Habits</p>
                        <p className="text-2xl font-bold text-purple-900">{totalhabits}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-purple-700 font-medium">All-Time Completions</p>
                        <p className="text-2xl font-bold text-purple-900">{totalCompletions}</p>
                    </div>
                </div>
            </div>

            {/* Yesterday's Performance */}
            {selectedDate === today && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Yesterday's Progress</p>
                    <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-gray-800">
                            {completedYesterDay} / {totalhabits}
                        </p>
                        <div className="text-right">
                            <span className={`text-sm font-semibold ${completedYesterDay > completedToday ? 'text-red-600' :
                                completedYesterDay < completedToday ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                {completedYesterDay > completedToday ? '📉 ' :
                                    completedYesterDay < completedToday ? '📈 ' : '➡️ '}
                                {completedYesterDay === completedToday ? 'Same' :
                                    Math.abs(completedToday - completedYesterDay)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Motivational Message */}
            {progressToday === 100 && (
                <div className="mt-4 bg-gradient-to-r from-green-400 to-emerald-500 p-4 rounded-2xl text-center animate-bounce">
                    <p className="text-white font-bold text-lg">🎉 Perfect Day! 🎉</p>
                    <p className="text-green-50 text-sm">All habits completed!</p>
                </div>
            )}

            {progressToday === 0 && totalhabits > 0 && (
                <div className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl text-center">
                    <p className="text-white font-bold">💪 Let's get started!</p>
                    <p className="text-purple-50 text-sm">Your journey begins today</p>
                </div>
            )}
        </div>
    );
}

export default HabitAnalytics;