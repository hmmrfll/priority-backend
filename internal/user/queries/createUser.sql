INSERT INTO users (
    full_name,
    username,
    avatar_url,
    date_birth,
    phone,
    company,
    user_code
) VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING
    id,
    full_name,
    username,
    avatar_url,
    date_birth,
    phone,
    bonus_count,
    company,
    role,
    user_code,
    telegram_id,
    created_at,
    updated_at;
