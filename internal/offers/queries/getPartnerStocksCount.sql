SELECT COUNT(*) as total
FROM partner_offers po
INNER JOIN partners p ON po.partner_id = p.id
WHERE po.is_active = true
    AND (po.end_date IS NULL OR po.end_date >= CURRENT_DATE)
    AND (po.start_date IS NULL OR po.start_date <= CURRENT_DATE);
