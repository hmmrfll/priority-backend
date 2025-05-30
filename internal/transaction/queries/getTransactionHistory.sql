SELECT
    t.id,
    t.sender_id,
    t.recipient_id,
    t.action_type,
    t.amount,
    t.date,
    t.description,
    CASE
        WHEN t.action_type = 'addition' THEN recipient_user.full_name
        WHEN t.action_type = 'withdrawal' THEN sender_user.full_name
    END as user_name,
    CASE
        WHEN t.action_type = 'addition' THEN sender_user.full_name
        WHEN t.action_type = 'withdrawal' THEN recipient_user.full_name
    END as admin_name,
    t.created_at,
    t.updated_at
FROM transactions t
LEFT JOIN users sender_user ON t.sender_id = sender_user.id
LEFT JOIN users recipient_user ON t.recipient_id = recipient_user.id
WHERE ($1::action_type IS NULL OR t.action_type = $1::action_type)
ORDER BY t.date DESC, t.id DESC
LIMIT $2 OFFSET $3;
