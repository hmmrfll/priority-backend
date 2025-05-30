const crypto = require('crypto');

function generateUserCode(telegramId) {
    const prefix = 'prtmtn_';
    if (telegramId) {
        const hash = crypto.createHash('sha256').update(telegramId.toString()).digest('hex');
        const hashPart = hash.substring(0, 8);
        const timestamp = Date.now();
        const hashNumber = parseInt(hashPart, 16);
        const timeBasedNumber = hashNumber % timestamp;
        const finalNumber = Math.abs(timeBasedNumber) % 1000000;
        const paddedNumber = finalNumber.toString().padStart(6, '0');
        return `${prefix}${paddedNumber}`;
    } else {
        const randomNumber = Math.floor(Math.random() * 1000000);
        const paddedNumber = randomNumber.toString().padStart(6, '0');
        return `${prefix}${paddedNumber}`;
    }
}

module.exports = generateUserCode;
