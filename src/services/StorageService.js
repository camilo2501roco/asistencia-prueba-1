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

    findUserByCredentialId(credentialId) {
        const users = this.getUsers();
        // Simplified matching: in real world, credentialId comparison needs base64 conversion handling
        // We will store credentialId as base64url string
        return users.find(u => u.credentialId === credentialId);
    }
};
