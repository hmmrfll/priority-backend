class User {
    constructor(data) {
        this.id = data.id;
        this.fullName = data.full_name || data.fullName;
        this.username = data.username;
        this.avatarUrl = data.avatar_url || data.avatarUrl;
        this.dateBirth = data.date_birth || data.dateBirth;
        this.phone = data.phone;
        this.bonusCount = data.bonus_count || data.bonusCount || 0;
        this.company = data.company;
        this.role = data.role || 'user';
        this.userCode = data.user_code || data.userCode;
        this.telegramId = data.telegram_id || data.telegramId;
        this.createdAt = data.created_at || data.createdAt;
        this.updatedAt = data.updated_at || data.updatedAt;
    }

    toJSON() {
        return {
            id: this.id.toString(),
            fullName: this.fullName,
            avatarUrl: this.avatarUrl,
            dateBirth: this.dateBirth,
            phone: this.phone,
            bonusCount: this.bonusCount,
            company: this.company,
            role: this.role,
            userCode: this.userCode
        };
    }

    static fromDatabase(dbUser) {
        if (!dbUser) return null;
        return new User(dbUser);
    }
}

module.exports = User;
