class OfferRestService {
    constructor(offerService, authMiddleware, logger) {
        this.offerService = offerService;
        this.authMiddleware = authMiddleware;
        this.logger = logger;
    }

    async getPartnerStocks(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;

            this.logger.info('Getting partner stocks', {
                page: parseInt(page),
                limit: parseInt(limit)
            });

            const result = await this.offerService.getPartnerStocks({
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.json(result);
        } catch (error) {
            this.logger.error('Error in getPartnerStocks REST', error);
            res.status(400).json({ error: error.message });
        }
    }

    async createOffer(req, res) {
        try {
            const offerData = req.body;
            const offer = await this.offerService.createOffer(offerData);

            res.status(201).json(offer.toJSON());
        } catch (error) {
            this.logger.error('Error in createOffer REST', error);
            res.status(400).json({ error: error.message });
        }
    }

    async getOffer(req, res) {
        try {
            const { id } = req.params;
            const offer = await this.offerService.getOfferById(id);

            res.json(offer);
        } catch (error) {
            this.logger.error('Error in getOffer REST', error);

            if (error.message === 'Offer not found') {
                return res.status(404).json({ error: error.message });
            }

            res.status(400).json({ error: error.message });
        }
    }

    getRoutes() {
        const auth = this.authMiddleware.validateTelegramAuth();

        return [
            {
                method: 'GET',
                path: '/partner-stocks',
                handler: this.getPartnerStocks.bind(this)
            },
            {
                method: 'GET',
                path: '/offer/:id',
                handler: this.getOffer.bind(this)
            },
            {
                method: 'POST',
                path: '/offer',
                handler: this.createOffer.bind(this),
                middleware: auth
            }
        ];
    }
}

module.exports = OfferRestService;
