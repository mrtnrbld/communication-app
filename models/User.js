// For now, using a simple in-memory store
const users = {
    admin: { password: '123456' },
    johndoe: { password: '123456' }
};

class User {
    static findByCredentials(username, password) {
        if (users[username] && users[username].password === password) {
            return { username };
        }
        return null;
    }
}

module.exports = User;