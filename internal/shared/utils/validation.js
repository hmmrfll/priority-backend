class ValidationUtils {

    static isValidPhone(phone) {
        if (!phone || typeof phone !== 'string') {
            return false;
        }

        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }


    static isValidDate(dateString) {
        if (!dateString || typeof dateString !== 'string') {
            return false;
        }

        if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return false;
        }

        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }


    static isValidEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    static isValidUrl(url) {
        if (!url || typeof url !== 'string') {
            return false;
        }

        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }


    static isEmpty(value) {
        if (value == null) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }


    static isValidTelegramId(telegramId) {
        if (!telegramId) return false;

        const id = parseInt(telegramId);
        return !isNaN(id) && id > 0;
    }


    static isValidPartnerId(partnerId) {
        if (!partnerId) return false;

        const id = parseInt(partnerId);
        return !isNaN(id) && id > 0;
    }
}

module.exports = ValidationUtils;
