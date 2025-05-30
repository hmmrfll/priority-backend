const fs = require('fs');
const path = require('path');
const User = require('./model');
const generateUserCode = require('../shared/utils/generateUserCode');

class UserStorage {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.queries = this.loadQueries();
    }

    loadQueries() {
        const queriesPath = path.join(__dirname, 'queries');
        const queries = {};

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

        return queries;
    }

    async getUserById(id) {
        const client = this.db.getClient();
        try {
            await client.connect();
            const result = await client.query(this.queries.getUserById, [id]);
            return User.fromDatabase(result.rows[0]);
        } catch (error) {
            this.logger.error('Error getting user by id', error);
            throw error;
        } finally {
            await client.end();
        }
    }

    async getUserByCode(userCode) {
        const client = this.db.getClient();
        try {
            await client.connect();
            const result = await client.query(this.queries.getUserByCode, [userCode]);
            return User.fromDatabase(result.rows[0]);
        } catch (error) {
            this.logger.error('Error getting user by code', error);
            throw error;
        } finally {
            await client.end();
        }
    }

    async createUser(userData) {
        const client = this.db.getClient();
        try {
            await client.connect();

            const userCode = userData.userCode || generateUserCode(userData.telegramId || userData.id);

            const result = await client.query(this.queries.createUser, [
                userData.fullName || null,
                userData.username || null,
                userData.avatarUrl || null,
                userData.dateBirth || null,
                userData.phone || null,
                userData.company || null,
                userCode,
                userData.referrerPartnerId || null
            ]);
            return User.fromDatabase(result.rows[0]);
        } catch (error) {
            this.logger.error('Error creating user', error);
            throw error;
        } finally {
            await client.end();
        }
    }

    async updateUser(id, userData) {
        const client = this.db.getClient();
        try {
            await client.connect();

            const result = await client.query(this.queries.updateUser, [
                id,
                userData.fullName || null,
                userData.username || null,
                userData.avatarUrl || null,
                userData.dateBirth || null,
                userData.phone || null,
                userData.company || null,
                userData.referrerPartnerId || null
            ]);

            if (result.rows.length === 0) {
                return null;
            }

            return User.fromDatabase(result.rows[0]);
        } catch (error) {
            this.logger.error('Error updating user', error);
            throw error;
        } finally {
            await client.end();
        }
    }
}

module.exports = UserStorage;
