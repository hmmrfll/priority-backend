class PartnerOffer {
    constructor(data) {
        this.id = data.id;
        this.partnerId = data.partner_id || data.partnerId;
        this.partnerName = data.partner_name || data.partnerName;
        this.imageUrl = data.image_url || data.imageUrl;
        this.logoUrl = data.logo_url || data.logoUrl;
        this.title = data.title;
        this.description = data.description;
        this.startDate = data.start_date || data.startDate;
        this.endDate = data.end_date || data.endDate;
        this.isActive = data.is_active !== undefined ? data.is_active : data.isActive;
        this.type = data.type;
        this.count = data.count || 0;
        this.createdAt = data.created_at || data.createdAt;
        this.updatedAt = data.updated_at || data.updatedAt;
    }

    toJSON() {
        return {
            id: this.id,
            partnerName: this.partnerName,
            description: this.description,
            count: this.count,
            logoUrl: this.logoUrl || this.imageUrl
        };
    }

    static fromDatabase(dbOffer) {
        if (!dbOffer) return null;
        return new PartnerOffer(dbOffer);
    }
}

module.exports = PartnerOffer;
