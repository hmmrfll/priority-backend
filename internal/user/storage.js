const fs = require('fs');
const path = require('path');
const User = require('./model');

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
}

module.exports = UserStorage;
