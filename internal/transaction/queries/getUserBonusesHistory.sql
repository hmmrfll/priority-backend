SELECT
    t.id,
    t.sender_id,
    t.recipient_id,
    t.action_type,
    t.amount,
    t.date,
    t.description,
    p.partner_name,
    p.logo_url as partner_logo,
    t.created_at,
    t.updated_at
FROM transactions t
LEFT JOIN users sender ON t.sender_id = sender.id
LEFT JOIN users recipient ON t.recipient_id = recipient.id
LEFT JOIN partners p ON (
    CASE
        WHEN t.action_type = 'addition' THEN sender.referrer_partner_id
        ELSE recipient.referrer_partner_id
    END = p.id
)
WHERE (t.sender_id = $1 OR t.recipient_id = $1)
    AND ($2::action_type IS NULL OR t.action_type = $2::action_type)
ORDER BY t.date DESC, t.id DESC
LIMIT $3 OFFSET $4;
