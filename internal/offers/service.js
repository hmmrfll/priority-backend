const ValidationUtils = require('../shared/utils/validation');

class OfferService {
    constructor(storage, logger) {
        this.storage = storage;
        this.logger = logger;
    }

    async getPartnerStocks(options = {}) {
        const { page = 1, limit = 10 } = options;

        // Валидация параметров
        if (page < 1) {
            throw new Error('Page must be greater than 0');
        }

        if (limit < 1 || limit > 100) {
            throw new Error('Limit must be between 1 and 100');
        }

        return await this.storage.getPartnerStocks({
            page: parseInt(page),
            limit: parseInt(limit)
        });
    }

    async createOffer(offerData) {
        // Валидация данных предложения
        if (!offerData.partnerId) {
            throw new Error('Partner ID is required');
        }

        if (!offerData.title) {
            throw new Error('Title is required');
        }

        if (offerData.startDate && !ValidationUtils.isValidDate(offerData.startDate)) {
            throw new Error('Invalid start date format');
        }

        if (offerData.endDate && !ValidationUtils.isValidDate(offerData.endDate)) {
            throw new Error('Invalid end date format');
        }

        if (offerData.imageUrl && !ValidationUtils.isValidUrl(offerData.imageUrl)) {
            throw new Error('Invalid image URL format');
        }

        return await this.storage.createOffer(offerData);
    }

    async getOfferById(id) {
        if (!id) {
            throw new Error('Offer ID is required');
        }

        const offer = await this.storage.getOfferById(id);
        if (!offer) {
            throw new Error('Offer not found');
        }

        return offer.toJSON();
    }
}

module.exports = OfferService;
