INSERT INTO partner_offers (
    partner_id,
    image_url,
    title,
    start_date,
    end_date,
    is_active,
    type
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING
    id,
    partner_id,
    image_url,
    title,
    start_date,
    end_date,
    is_active,
    type,
    created_at,
    updated_at;
