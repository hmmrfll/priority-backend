class UserService {
    constructor(storage, logger) {
        this.storage = storage;
        this.logger = logger;
    }

    async getUserById(id) {
        if (!id) {
            throw new Error('User ID is required');
        }

        const user = await this.storage.getUserById(id);
        if (!user) {
            throw new Error('User not found');
        }

        return user.toJSON();
    }
}

module.exports = UserService;
