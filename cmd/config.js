require('dotenv').config();

const config = {
  // Database
  database: {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    username: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    database: process.env.PG_DATABASE || 'priority_dev',
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  },

  // Server
  server: {
    port: process.env.BACKEND_PORT || 3000,
    host: process.env.BACKEND_HOST || 'localhost'
  },

  // Telegram
  telegram: {
    botToken: process.env.BOT_TOKEN,
    miniAppUrl: process.env.MINI_APP_URL,
    webhookUrl: process.env.SERVER_URL ? `${process.env.SERVER_URL}/webhook/telegram` : null
  },
  // Validation
  validate() {
    const errors = [];

    if (!this.telegram.botToken) {
      errors.push('BOT_TOKEN is required');
    }

    if (!this.telegram.miniAppUrl) {
      errors.push('MINI_APP_URL is required');
    }

    if (!this.database.username) {
      errors.push('PG_USER is required');
    }

    if (!this.database.password) {
      errors.push('PG_PASSWORD is required');
    }

    if (!this.database.database) {
      errors.push('PG_DATABASE is required');
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }

    return true;
  }
};

module.exports = config;
