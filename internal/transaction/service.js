const ValidationUtils = require('../shared/utils/validation');

class TransactionService {
    constructor(storage, logger) {
        this.storage = storage;
        this.logger = logger;
    }

    async getUserBonusesHistory(userId, options = {}) {
        this.logger.info(`TransactionService.getUserBonusesHistory called`, { userId, options });

        if (!userId) {
            this.logger.error('User ID is required in TransactionService');
            throw new Error('User ID is required');
        }

        const { page = 1, limit = 10, actionType } = options;
        
        if (page < 1) {
            throw new Error('Page must be greater than 0');
        }

        if (limit < 1 || limit > 100) {
            throw new Error('Limit must be between 1 and 100');
        }

        if (actionType && !['addition', 'withdrawal'].includes(actionType)) {
            throw new Error('Invalid action type. Must be "addition" or "withdrawal"');
        }

        this.logger.info(`Getting bonuses history for user ${userId}`, {
            page: parseInt(page),
            limit: parseInt(limit),
            actionType
        });

        return await this.storage.getUserBonusesHistory(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            actionType
        });
    }

    async getTransactionHistory(options = {}) {
        const { page = 1, limit = 10, actionType } = options;

        if (page < 1) {
            throw new Error('Page must be greater than 0');
        }

        if (limit < 1 || limit > 100) {
            throw new Error('Limit must be between 1 and 100');
        }

        if (actionType && !['addition', 'withdrawal'].includes(actionType)) {
            throw new Error('Invalid action type. Must be "addition" or "withdrawal"');
        }

        this.logger.info(`Getting transaction history`, {
            page: parseInt(page),
            limit: parseInt(limit),
            actionType
        });

        return await this.storage.getTransactionHistory({
            page: parseInt(page),
            limit: parseInt(limit),
            actionType
        });
    }

    async createTransaction(transactionData) {
        if (!transactionData.senderId || !transactionData.recipientId) {
            throw new Error('Sender ID and Recipient ID are required');
        }

        if (!transactionData.actionType || !['addition', 'withdrawal'].includes(transactionData.actionType)) {
            throw new Error('Valid action type is required');
        }

        if (!transactionData.amount || transactionData.amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        return await this.storage.createTransaction(transactionData);
    }
}

module.exports = TransactionService;
