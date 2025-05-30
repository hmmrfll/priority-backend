class AdminTransaction {
    constructor(data) {
        this.id = data.id;
        this.senderId = data.sender_id || data.senderId;
        this.recipientId = data.recipient_id || data.recipientId;
        this.actionType = data.action_type || data.actionType;
        this.amount = data.amount;
        this.date = data.date;
        this.description = data.description;
        this.userName = data.user_name || data.userName;
        this.adminName = data.admin_name || data.adminName;
        this.createdAt = data.created_at || data.createdAt;
        this.updatedAt = data.updated_at || data.updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            userName: this.userName,
            adminName: this.adminName,
            actionType: this.actionType,
            amount: this.amount,
            date: this.date
        };
    }

    static fromDatabase(dbTransaction) {
        if (!dbTransaction) return null;
        return new AdminTransaction(dbTransaction);
    }
}

module.exports = AdminTransaction;
