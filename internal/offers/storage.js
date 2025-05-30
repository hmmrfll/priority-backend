const fs = require('fs');
const path = require('path');
const PartnerOffer = require('./model');

class OfferStorage {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.queries = this.loadQueries();
        this.validateRequiredQueries();
    }

    loadQueries() {
        const queriesPath = path.join(__dirname, 'queries');
        const queries = {};

        if (!fs.existsSync(queriesPath)) {
            this.logger.warn(`Queries directory not found: ${queriesPath}`);
            return queries;
        }

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

        this.logger.info(`Loaded ${Object.keys(queries).length} SQL queries for offers`);
        return queries;
    }

    validateRequiredQueries() {
        const requiredQueries = [
            'getPartnerStocks',
            'getPartnerStocksCount',
            'createOffer',
            'getOfferById'
        ];

        const missingQueries = requiredQueries.filter(query => !this.queries[query]);

        if (missingQueries.length > 0) {
            throw new Error(`Missing required SQL queries: ${missingQueries.join(', ')}`);
        }

        this.logger.info('All required SQL queries loaded successfully for OfferStorage');
    }

    async getPartnerStocks(options = {}) {
        const { page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        const client = this.db.getClient();
        try {
            await client.connect();

            const countResult = await client.query(this.queries.getPartnerStocksCount);
            const total = parseInt(countResult.rows[0].total);

            const result = await client.query(
                this.queries.getPartnerStocks,
                [limit, offset]
            );

            const offers = result.rows.map(row => PartnerOffer.fromDatabase(row));

            return {
                data: offers.map(offer => offer.toJSON()),
                total,
                totalPages: Math.ceil(total / limit),
                page,
                limit
            };
        } catch (error) {
            this.logger.error('Error getting partner stocks', error);
            throw error;
        } finally {
            await client.end();
        }
    }

    async createOffer(offerData) {
        const client = this.db.getClient();
        try {
            await client.connect();

            const result = await client.query(this.queries.createOffer, [
                offerData.partnerId,
                offerData.imageUrl,
                offerData.title,
                offerData.startDate,
                offerData.endDate,
                offerData.isActive !== undefined ? offerData.isActive : true,
                offerData.type || 'one-time'
            ]);

            return PartnerOffer.fromDatabase(result.rows[0]);
        } catch (error) {
            this.logger.error('Error creating offer', error);
            throw error;
        } finally {
            await client.end();
        }
    }

    async getOfferById(id) {
        const client = this.db.getClient();
        try {
            await client.connect();

            const result = await client.query(this.queries.getOfferById, [id]);

            return PartnerOffer.fromDatabase(result.rows[0]);
        } catch (error) {
            this.logger.error('Error getting offer by id', error);
            throw error;
        } finally {
            await client.end();
        }
    }
}

module.exports = OfferStorage;
