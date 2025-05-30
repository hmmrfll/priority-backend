const ValidationUtils = require('../shared/utils/validation');

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

    async getUserByCode(userCode) {
        if (!userCode) {
            throw new Error('User code is required');
        }

        const user = await this.storage.getUserByCode(userCode);
        if (!user) {
            throw new Error('User not found');
        }

        return user.toJSON();
    }

    async createUser(userData) {
        if (!userData.fullName && !userData.phone) {
            throw new Error('Either full name or phone is required');
        }

        if (userData.phone && !ValidationUtils.isValidPhone(userData.phone)) {
            throw new Error('Invalid phone format');
        }

        if (userData.dateBirth && !ValidationUtils.isValidDate(userData.dateBirth)) {
            throw new Error('Invalid date format');
        }

        if (userData.telegramId && !ValidationUtils.isValidTelegramId(userData.telegramId)) {
            throw new Error('Invalid telegram ID');
        }

        if (userData.referrerPartnerId && !ValidationUtils.isValidPartnerId(userData.referrerPartnerId)) {
            throw new Error('Invalid partner ID');
        }

        if (userData.avatarUrl && !ValidationUtils.isValidUrl(userData.avatarUrl)) {
            throw new Error('Invalid avatar URL format');
        }

        const user = await this.storage.createUser(userData);
        return user.toJSON();
    }

    async updateUser(id, userData) {
        if (!id) {
            throw new Error('User ID is required');
        }

        if (userData.phone && !ValidationUtils.isValidPhone(userData.phone)) {
            throw new Error('Invalid phone format');
        }

        if (userData.dateBirth && !ValidationUtils.isValidDate(userData.dateBirth)) {
            throw new Error('Invalid date format');
        }

        if (userData.referrerPartnerId && !ValidationUtils.isValidPartnerId(userData.referrerPartnerId)) {
            throw new Error('Invalid partner ID');
        }

        if (userData.avatarUrl && !ValidationUtils.isValidUrl(userData.avatarUrl)) {
            throw new Error('Invalid avatar URL format');
        }

        const user = await this.storage.updateUser(id, userData);
        if (!user) {
            throw new Error('User not found');
        }

        return user.toJSON();
    }
}

module.exports = UserService;
