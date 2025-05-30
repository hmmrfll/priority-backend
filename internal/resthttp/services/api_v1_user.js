class UserRestService {
    constructor(userService, authMiddleware, logger) {
        this.userService = userService;
        this.authMiddleware = authMiddleware;
        this.logger = logger;
    }

    async getUser(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userService.getUserById(id);

            res.json(user);
        } catch (error) {
            this.logger.error('Error in getUser REST', error);

            if (error.message === 'User not found') {
                return res.status(404).json({ error: error.message });
            }

            res.status(400).json({ error: error.message });
        }
    }

    async getUserByCode(req, res) {
        try {
            const { userCode } = req.params;
            const user = await this.userService.getUserByCode(userCode);

            res.json(user);
        } catch (error) {
            this.logger.error('Error in getUserByCode REST', error);

            if (error.message === 'User not found') {
                return res.status(404).json({ error: error.message });
            }

            res.status(400).json({ error: error.message });
        }
    }

    async createUser(req, res) {
        try {
            const userData = req.body;
            const user = await this.userService.createUser(userData);

            res.status(201).json(user);
        } catch (error) {
            this.logger.error('Error in createUser REST', error);
            res.status(400).json({ error: error.message });
        }
    }

    getRoutes() {
        const auth = this.authMiddleware.validateTelegramAuth();

        return [
            { method: 'GET', path: '/user/:id', handler: this.getUser.bind(this), middleware: auth },
            { method: 'GET', path: '/user-by-code/:userCode', handler: this.getUserByCode.bind(this) },
            { method: 'POST', path: '/user', handler: this.createUser.bind(this) }
        ];
    }
}

module.exports = UserRestService;
