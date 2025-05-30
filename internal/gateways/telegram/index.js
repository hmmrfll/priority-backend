const TelegramBot = require('node-telegram-bot-api');
const DatabaseManager = require('../../../cmd/db');
const config = require('../../../cmd/config');
const StartHandler = require('./handlers/StartHandler');

class TelegramService {
    constructor(telegramConfig, logger) {
        this.config = telegramConfig;
        this.logger = logger;
        this.bot = null;
        this.db = new DatabaseManager(config.database, logger);
        this.startHandler = null;
    }

    async init() {
        try {
            this.bot = new TelegramBot(this.config.botToken, {
                polling: true
            });

            this.startHandler = new StartHandler(this.bot, this.config, this.logger, this.db);

            this.setupHandlers();
            this.logger.info('Telegram bot initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize Telegram bot', error);
            throw error;
        }
    }

    setupHandlers() {
        this.bot.onText(/\/start/, (msg) => this.startHandler.handle(msg));

        this.bot.on('error', (error) => {
            this.logger.error('Telegram bot error', error);
        });
    }

    processUpdate(update) {
        if (this.bot) {
            this.bot.processUpdate(update);
        }
    }

    stop() {
        if (this.bot) {
            this.bot.stopPolling();
            this.logger.info('Telegram bot stopped');
        }
    }
}

module.exports = TelegramService;
