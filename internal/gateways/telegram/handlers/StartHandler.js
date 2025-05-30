const generateUserCode = require('../../../shared/utils/generateUserCode');

class StartHandler {
    constructor(bot, config, logger, db) {
        this.bot = bot;
        this.config = config;
        this.logger = logger;
        this.db = db;
    }

    async handle(msg) {
        try {
            const chatId = msg.chat.id;
            const user = msg.from;

            await this.saveOrUpdateUser(user);

            const firstName = user.first_name || 'Пользователь';
            const welcomeMessage = `Привет, ${firstName}!`;

            const keyboard = {
                inline_keyboard: [[
                    {
                        text: 'Открыть приложение',
                        web_app: {
                            url: this.config.miniAppUrl
                        }
                    }
                ]]
            };

            await this.bot.sendMessage(chatId, welcomeMessage, {
                reply_markup: keyboard
            });

            this.logger.info(`Start command handled for user ${user.id} (${firstName})`);
        } catch (error) {
            this.logger.error('Error handling /start command', error);
        }
    }

    async saveOrUpdateUser(telegramUser) {
        const client = this.db.getClient();

        try {
            await client.connect();

            const checkUserQuery = `
                SELECT * FROM users WHERE telegram_id = $1
            `;
            const existingUser = await client.query(checkUserQuery, [telegramUser.id]);

            const fullName = this.buildFullName(telegramUser);
            const avatarUrl = await this.getUserAvatarUrl(telegramUser.id);

            if (existingUser.rows.length > 0) {
                const user = existingUser.rows[0];
                const updateFields = ['updated_at = NOW()'];
                const updateValues = [];
                let paramIndex = 1;

                // Проверяем full_name - заполняем если пустое и есть данные из TG
                if ((!user.full_name || user.full_name.trim() === '') && fullName) {
                    updateFields.push(`full_name = $${paramIndex}`);
                    updateValues.push(fullName);
                    paramIndex++;
                }

                // Проверяем avatar_url - заполняем если пустое и получили из TG
                if ((!user.avatar_url || user.avatar_url.trim() === '') && avatarUrl) {
                    updateFields.push(`avatar_url = $${paramIndex}`);
                    updateValues.push(avatarUrl);
                    paramIndex++;
                }

                // Проверяем username - заполняем если пустое и есть в TG
                if ((!user.username || user.username.trim() === '') && telegramUser.username) {
                    updateFields.push(`username = $${paramIndex}`);
                    updateValues.push(telegramUser.username);
                    paramIndex++;
                }

                if (updateFields.length > 1) {
                    updateValues.push(telegramUser.id);

                    const updateQuery = `
                        UPDATE users
                        SET ${updateFields.join(', ')}
                        WHERE telegram_id = $${paramIndex}
                        RETURNING *
                    `;

                    const result = await client.query(updateQuery, updateValues);
                    this.logger.info(`Updated empty fields for user: ${telegramUser.id}`);
                    return result.rows[0];
                } else {
                    this.logger.info(`No empty fields to update for user: ${telegramUser.id}`);
                    return user;
                }
            } else {
                const userCode = generateUserCode(telegramUser.id);

                const insertFields = ['telegram_id', 'user_code'];
                const insertValues = [telegramUser.id, userCode];
                const insertPlaceholders = ['$1', '$2'];
                let paramIndex = 3;

                if (fullName) {
                    insertFields.push('full_name');
                    insertValues.push(fullName);
                    insertPlaceholders.push(`$${paramIndex}`);
                    paramIndex++;
                }

                if (telegramUser.username) {
                    insertFields.push('username');
                    insertValues.push(telegramUser.username);
                    insertPlaceholders.push(`$${paramIndex}`);
                    paramIndex++;
                }

                if (avatarUrl) {
                    insertFields.push('avatar_url');
                    insertValues.push(avatarUrl);
                    insertPlaceholders.push(`$${paramIndex}`);
                    paramIndex++;
                }

                const insertQuery = `
                    INSERT INTO users (${insertFields.join(', ')})
                    VALUES (${insertPlaceholders.join(', ')})
                    RETURNING *
                `;

                const result = await client.query(insertQuery, insertValues);
                this.logger.info(`Created new user: ${telegramUser.id}, assigned ID: ${result.rows[0].id}`);
                return result.rows[0];
            }
        } catch (error) {
            this.logger.error('Error saving/updating user', error);
            throw error;
        } finally {
            await client.end();
        }
    }

    async getUserAvatarUrl(userId) {
        try {
            const photos = await this.bot.getUserProfilePhotos(userId, { limit: 1 });

            if (photos.total_count > 0 && photos.photos.length > 0) {
                const photo = photos.photos[0];
                const largestPhoto = photo[photo.length - 1];
                const file = await this.bot.getFile(largestPhoto.file_id);
                return `https://api.telegram.org/file/bot${this.config.botToken}/${file.file_path}`;
            }

            return null;
        } catch (error) {
            this.logger.warn(`Could not get avatar for user ${userId}:`, error.message);
            return null;
        }
    }

    buildFullName(telegramUser) {
        const parts = [];

        if (telegramUser.first_name) {
            parts.push(telegramUser.first_name);
        }

        if (telegramUser.last_name) {
            parts.push(telegramUser.last_name);
        }

        return parts.length > 0 ? parts.join(' ') : null;
    }
}

module.exports = StartHandler;
