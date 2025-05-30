SELECT COUNT(*) as total
FROM transactions t
WHERE (t.sender_id = $1 OR t.recipient_id = $1)
    AND ($2::action_type IS NULL OR t.action_type = $2::action_type);
