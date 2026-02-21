// Request notification permission
export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notifications");
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }

    return false;
};

// Show notification
export const showNotification = (title, options = {}) => {
    if (Notification.permission === "granted") {
        const notification = new Notification(title, {
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            ...options,
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    }
};

// Check if notification should be shown
export const shouldShowReminder = (habit, currentTime) => {
    if (!habit.reminderTime) return false;

    const [hours, minutes] = habit.reminderTime.split(':').map(Number);
    const reminderDate = new Date();
    reminderDate.setHours(hours, minutes, 0, 0);

    // Calculate reminder time (subtract reminderMinutes)
    const notificationTime = new Date(reminderDate.getTime() - (habit.reminderMinutes || 10) * 60000);

    // Check if current time matches notification time (within 1 minute window)
    const timeDiff = Math.abs(currentTime - notificationTime);
    return timeDiff < 60000; // Within 1 minute
};

// Format time for display
export const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

// Check and show reminders for all habits
export const checkAndShowReminders = (habits) => {
    if (!habits || !Array.isArray(habits) || habits.length === 0) return;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    habits.forEach(habit => {
        // Only remind for incomplete habits today
        const todayLog = habit.logs?.find(log => log.date.split('T')[0] === today);
        if (todayLog?.completed) return;

        if (shouldShowReminder(habit, now)) {
            const timeDisplay = formatTime(habit.reminderTime);
            showNotification(`🎯 Habit Reminder: ${habit.name}`, {
                body: `${habit.description}\nScheduled for ${timeDisplay}`,
                tag: `habit-${habit._id}`, // Prevents duplicate notifications
                requireInteraction: true,
                vibrate: [200, 100, 200],
            });
        }
    });
};
