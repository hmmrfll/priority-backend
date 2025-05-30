const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

class DatabaseManager {
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }

    async init() {
        try {
            await this.createDatabaseIfNotExists();
            await this.runMigrations();
            this.logger.info('Database initialization completed successfully');
        } catch (error) {
            this.logger.error('Database initialization failed', error);
            throw error;
        }
    }

    async createDatabaseIfNotExists() {
        const adminClient = new Client({
            host: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: 'postgres'
        });

        try {
            await adminClient.connect();
            this.logger.info('Connected to PostgreSQL server');

            const dbExistsQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
            const result = await adminClient.query(dbExistsQuery, [this.config.database]);

            if (result.rows.length === 0) {
                this.logger.info(`Creating database: ${this.config.database}`);
                await adminClient.query(`CREATE DATABASE "${this.config.database}"`);
                this.logger.info(`Database ${this.config.database} created successfully`);
            } else {
                this.logger.info(`Database ${this.config.database} already exists`);
            }
        } catch (error) {
            this.logger.error('Error creating database', error);
            throw error;
        } finally {
            await adminClient.end();
        }
    }

    async runMigrations() {
        const client = new Client({
            host: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });

        try {
            await client.connect();
            this.logger.info('Connected to application database');

            const migrationPath = path.join(__dirname, '../migration/migrate.sql');
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

            this.logger.info('Running database migrations...');
            await client.query(migrationSQL);
            this.logger.info('Database migrations completed successfully');

        } catch (error) {
            this.logger.error('Error running migrations', error);
            throw error;
        } finally {
            await client.end();
        }
    }

    async testConnection() {
        const client = new Client({
            host: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });

        try {
            await client.connect();
            await client.query('SELECT 1');
            this.logger.info('Database connection test successful');
            return true;
        } catch (error) {
            this.logger.error('Database connection test failed', error);
            return false;
        } finally {
            await client.end();
        }
    }

    getClient() {
        return new Client({
            host: this.config.host,
            port: this.config.port,
            user: this.config.username,
            password: this.config.password,
            database: this.config.database
        });
    }
}

module.exports = DatabaseManager;
