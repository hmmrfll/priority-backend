SELECT COUNT(*) as total
FROM transactions t
WHERE ($1::action_type IS NULL OR t.action_type = $1::action_type);
