INSERT INTO transactions (
    sender_id,
    recipient_id,
    action_type,
    amount,
    description,
    date
) VALUES ($1, $2, $3, $4, $5, $6)
RETURNING
    id,
    sender_id,
    recipient_id,
    action_type,
    amount,
    date,
    description,
    created_at,
    updated_at;
