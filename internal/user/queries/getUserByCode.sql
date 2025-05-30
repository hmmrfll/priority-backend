SELECT
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
    updated_at
FROM users
WHERE user_code = $1;
