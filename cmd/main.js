const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const Logger = require('../internal/shared/logger');
const TelegramService = require('../internal/gateways/telegram');
const DatabaseManager = require('./db');

const UserStorage = require('../internal/user/storage');
const UserService = require('../internal/user/service');

const UserRestService = require('../internal/resthttp/services/api_v1_user');

const logger = new Logger();

async function startApplication() {
    try {
        config.validate();
        logger.info('Configuration validated successfully');

        const db = new DatabaseManager(config.database, logger);
        await db.init();

        const userStorage = new UserStorage(db, logger);
        const userService = new UserService(userStorage, logger);

        const userRestService = new UserRestService(userService, logger);

        const app = express();

        app.use(cors());
        app.use(express.json());

        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100
        });
        app.use(limiter);

        app.get('/health', async (req, res) => {
            const dbStatus = await db.testConnection();
            res.json({
                status: dbStatus ? 'OK' : 'ERROR',
                database: dbStatus ? 'connected' : 'disconnected',
                timestamp: new Date().toISOString()
            });
        });

        const userRoutes = userRestService.getRoutes();
        userRoutes.forEach(route => {
            app[route.method.toLowerCase()](route.path, route.handler);
        });

        app.post('/webhook/telegram', (req, res) => {
            telegramService.processUpdate(req.body);
            res.sendStatus(200);
        });

        const telegramService = new TelegramService(config.telegram, logger);
        await telegramService.init();

        const server = app.listen(config.server.port, config.server.host, () => {
            logger.info(`Server running on ${config.server.host}:${config.server.port}`);
        });

        process.on('SIGTERM', async () => {
            logger.info('SIGTERM received, shutting down gracefully');
            server.close(() => {
                telegramService.stop();
                process.exit(0);
            });
        });

        process.on('SIGINT', async () => {
            logger.info('SIGINT received, shutting down gracefully');
            server.close(() => {
                telegramService.stop();
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Failed to start application', error);
        process.exit(1);
    }
}

startApplication();
