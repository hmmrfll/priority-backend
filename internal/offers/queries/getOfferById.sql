SELECT
    po.id,
    po.partner_id,
    p.partner_name,
    po.image_url,
    p.logo_url,
    po.title,
    po.start_date,
    po.end_date,
    po.is_active,
    po.type,
    (10 + (po.id * 3) % 20) as count,
    po.created_at,
    po.updated_at
FROM partner_offers po
INNER JOIN partners p ON po.partner_id = p.id
WHERE po.id = $1;
