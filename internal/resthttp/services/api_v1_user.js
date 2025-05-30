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

    getRoutes() {
        const auth = this.authMiddleware.validateTelegramAuth();

        return [
            { method: 'GET', path: '/user/:id', handler: this.getUser.bind(this), middleware: auth },
        ];
    }
}

module.exports = UserRestService;
