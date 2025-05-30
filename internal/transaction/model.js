class Transaction {
    constructor(data) {
        this.id = data.id;
        this.senderId = data.sender_id || data.senderId;
        this.recipientId = data.recipient_id || data.recipientId;
        this.actionType = data.action_type || data.actionType;
        this.amount = data.amount;
        this.date = data.date;
        this.description = data.description;
        this.partnerName = data.partner_name || data.partnerName;
        this.partnerLogo = data.partner_logo || data.partnerLogo;
        this.createdAt = data.created_at || data.createdAt;
        this.updatedAt = data.updated_at || data.updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            partnerName: this.partnerName,
            bonusName: this.description,
            amount: this.amount,
            actionType: this.actionType,
            date: this.date,
            imgPath: this.partnerLogo
        };
    }

    static fromDatabase(dbTransaction) {
        if (!dbTransaction) return null;
        return new Transaction(dbTransaction);
    }
}

module.exports = Transaction;
