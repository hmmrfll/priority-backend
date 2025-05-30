const fs = require('fs');
const path = require('path');
const Transaction = require('./model');
const AdminTransaction = require('./model_admin');

class TransactionStorage {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.queries = this.loadQueries();
        this.validateRequiredQueries();
    }

    loadQueries() {
        const queriesPath = path.join(__dirname, 'queries');
        const queries = {};

        if (!fs.existsSync(queriesPath)) {
            this.logger.warn(`Queries directory not found: ${queriesPath}`);
            return queries;
        }

        const files = fs.readdirSync(queriesPath);
        files.forEach(file => {
            if (file.endsWith('.sql')) {
                const queryName = file.replace('.sql', '');
                queries[queryName] = fs.readFileSync(
                    path.join(queriesPath, file),
                    'utf8'
                );
            }
        });

        this.logger.info(`Loaded ${Object.keys(queries).length} SQL queries for transactions`);
        return queries;
    }

    validateRequiredQueries() {
        const requiredQueries = [
            'getUserBonusesHistory',
            'getUserBonusesHistoryCount',
            'createTransaction',
            'getTransactionHistory',
            'getTransactionHistoryCount'
        ];

        const missingQueries = requiredQueries.filter(query => !this.queries[query]);

        if (missingQueries.length > 0) {
            throw new Error(`Missing required SQL queries: ${missingQueries.join(', ')}`);
        }

        this.logger.info('All required SQL queries loaded successfully for TransactionStorage');
    }

    async getUserBonusesHistory(userId, options = {}) {
        const { page = 1, limit = 10, actionType = null } = options;
        const offset = (page - 1) * limit;

        const client = this.db.getClient();
        try {
            await client.connect();

            const countResult = await client.query(
                this.queries.getUserBonusesHistoryCount,
                [userId, actionType]
            );
            const total = parseInt(countResult.rows[0].total);

            const result = await client.query(
                this.queries.getUserBonusesHistory,
                [userId, actionType, limit, offset]
            );

            const transactions = result.rows.map(row => Transaction.fromDatabase(row));

            return {
                data: transactions.map(t => t.toJSON()),
                total,
                totalPages: Math.ceil(total / limit),
                page,
                limit
            };
        } catch (error) {
            this.logger.error('Error getting user bonuses history', error);
            throw error;
        } finally {
            await client.end();
        }
    }

    async getTransactionHistory(options = {}) {
        const { page = 1, limit = 10, actionType = null } = options;
        const offset = (page - 1) * limit;

        const client = this.db.getClient();
        try {
            await client.connect();

            const countResult = await client.query(
                this.queries.getTransactionHistoryCount,
                [actionType]
            );
            const total = parseInt(countResult.rows[0].total);

            const result = await client.query(
                this.queries.getTransactionHistory,
                [actionType, limit, offset]
            );

            const transactions = result.rows.map(row => AdminTransaction.fromDatabase(row));

            return {
                data: transactions.map(t => t.toJSON()),
                total,
                totalPages: Math.ceil(total / limit),
                page,
                limit
            };
        } catch (error) {
            this.logger.error('Error getting transaction history', error);
            throw error;
        } finally {
            await client.end();
        }
    }

    async createTransaction(transactionData) {
        const client = this.db.getClient();
        try {
            await client.connect();

            const result = await client.query(this.queries.createTransaction, [
                transactionData.senderId,
                transactionData.recipientId,
                transactionData.actionType,
                transactionData.amount,
                transactionData.description,
                transactionData.date || new Date()
            ]);

            return Transaction.fromDatabase(result.rows[0]);
        } catch (error) {
            this.logger.error('Error creating transaction', error);
            throw error;
        } finally {
            await client.end();
        }
    }
}

module.exports = TransactionStorage;
