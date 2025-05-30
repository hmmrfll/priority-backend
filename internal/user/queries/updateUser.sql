UPDATE users
SET
    full_name = COALESCE($2, full_name),
    username = COALESCE($3, username),
    avatar_url = COALESCE($4, avatar_url),
    date_birth = COALESCE($5, date_birth),
    phone = COALESCE($6, phone),
    company = COALESCE($7, company),
    referrer_partner_id = COALESCE($8, referrer_partner_id),
    updated_at = NOW()
WHERE id = $1
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
    referrer_partner_id,
    created_at,
    updated_at;
