const USERS_KEY = 'attendance_users';
const LOGS_KEY = 'attendance_logs';

export const StorageService = {
    getUsers() {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    },

    saveUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    },

    getLogs() {
        return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]');
    },

    saveLog(log) {
        const logs = this.getLogs();
        logs.unshift(log); // Add to beginning
        localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    },

    findUserByFace(faceDescriptor) {
        const users = this.getUsers();
        let bestMatch = null;
        let minDistance = 0.6; // Threshold for face matching

        users.forEach(user => {
            if (user.faceDescriptor) {
                // Euclidean distance calculation
                const distance = Math.sqrt(
                    user.faceDescriptor.reduce((sum, val, i) => sum + Math.pow(val - faceDescriptor[i], 2), 0)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    bestMatch = user;
                }
            }
        });

        return bestMatch;
    },

    deleteUser(userId) {
        let users = this.getUsers();
        users = users.filter(u => u.id !== userId);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    },

    clearAllUsers() {
        localStorage.removeItem(USERS_KEY);
    },

    // Check if face exists without returning full user, useful for boolean checks
    isFaceRegistered(faceDescriptor) {
        return !!this.findUserByFace(faceDescriptor);
    },

    // Logs mgmt
    deleteLog(timestamp) {
        let logs = this.getLogs();
        logs = logs.filter(l => l.timestamp !== timestamp);
        localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    },

    clearLogs() {
        localStorage.removeItem(LOGS_KEY);
    }
};
