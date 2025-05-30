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
    -- Для мока используем случайное число или можно добавить поле в таблицу
    (10 + (po.id * 3) % 20) as count,
    po.created_at,
    po.updated_at
FROM partner_offers po
INNER JOIN partners p ON po.partner_id = p.id
WHERE po.is_active = true
    AND (po.end_date IS NULL OR po.end_date >= CURRENT_DATE)
    AND (po.start_date IS NULL OR po.start_date <= CURRENT_DATE)
ORDER BY po.created_at DESC, po.id DESC
LIMIT $1 OFFSET $2;
