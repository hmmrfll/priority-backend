class TransactionRestService {
    constructor(transactionService, authMiddleware, logger) {
        this.transactionService = transactionService;
        this.authMiddleware = authMiddleware;
        this.logger = logger;
    }

    async getUserBonusesHistory(req, res) {
        try {
            const userId = req.telegramUser?.userId;

            if (!userId) {
                this.logger.error('User not authenticated in getUserBonusesHistory');
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { page = 1, limit = 10, actionType } = req.query;

            this.logger.info(`Getting bonuses history for user ${userId}`, {
                page: parseInt(page),
                limit: parseInt(limit),
                actionType
            });

            const result = await this.transactionService.getUserBonusesHistory(userId, {
                page: parseInt(page),
                limit: parseInt(limit),
                actionType
            });

            res.json(result);
        } catch (error) {
            this.logger.error('Error in getUserBonusesHistory REST', error);
            res.status(400).json({ error: error.message });
        }
    }

    async getTransactionHistory(req, res) {
        try {
            const { page = 1, limit = 10, actionType } = req.query;

            this.logger.info('Getting transaction history', {
                page: parseInt(page),
                limit: parseInt(limit),
                actionType
            });

            const result = await this.transactionService.getTransactionHistory({
                page: parseInt(page),
                limit: parseInt(limit),
                actionType
            });

            res.json(result);
        } catch (error) {
            this.logger.error('Error in getTransactionHistory REST', error);
            res.status(400).json({ error: error.message });
        }
    }

    async createTransaction(req, res) {
        try {
            const transactionData = req.body;
            const transaction = await this.transactionService.createTransaction(transactionData);

            res.status(201).json(transaction.toJSON());
        } catch (error) {
            this.logger.error('Error in createTransaction REST', error);
            res.status(400).json({ error: error.message });
        }
    }

    getRoutes() {
        const auth = this.authMiddleware.validateTelegramAuth();

        return [
            {
                method: 'GET',
                path: '/user-bonuses-history',
                handler: this.getUserBonusesHistory.bind(this),
                middleware: auth
            },
            {
                method: 'GET',
                path: '/transaction-history',
                handler: this.getTransactionHistory.bind(this),
                middleware: auth
            },
            {
                method: 'POST',
                path: '/transaction',
                handler: this.createTransaction.bind(this),
                middleware: auth
            }
        ];
    }
}

module.exports = TransactionRestService;
