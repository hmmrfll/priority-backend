-- Migration: Initial schema creation
-- Created: 2025-01-01
-- Updated: 2025-05-30
-- Description: Create all tables and initial structure

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
-- Created: 2025-01-01
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE action_type AS ENUM ('addition', 'withdrawal');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE offer_type AS ENUM ('one-time', 'recurring');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create update trigger function
-- Created: 2025-01-01
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create partners table FIRST (так как на него ссылается users)
-- Created: 2025-01-01
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    partner_name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    details TEXT,
    website VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create partners update trigger
-- Created: 2025-01-01
DROP TRIGGER IF EXISTS update_partners_updated_at ON partners;
CREATE TRIGGER update_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create users table
-- Created: 2025-01-01
-- Updated: 2025-05-30 (добавлен referrer_partner_id с внешним ключом)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    username VARCHAR(100),
    avatar_url TEXT,
    date_birth DATE,
    phone VARCHAR(20),
    bonus_count INTEGER DEFAULT 0,
    company VARCHAR(255),
    role user_role NOT NULL DEFAULT 'user',
    user_code VARCHAR(50) NOT NULL UNIQUE,
    telegram_id BIGINT UNIQUE,
    referrer_partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for users
-- Created: 2025-01-01
-- Updated: 2025-05-30 (добавлен индекс для referrer_partner_id)
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_user_code ON users(user_code);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_referrer_partner_id ON users(referrer_partner_id);

-- Create users update trigger
-- Created: 2025-01-01
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create partner_contacts table
-- Created: 2025-01-01
CREATE TABLE IF NOT EXISTS partner_contacts (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    value VARCHAR(255) NOT NULL,
    label VARCHAR(255),
    icon VARCHAR(500),
    link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for partner_contacts
-- Created: 2025-01-01
CREATE INDEX IF NOT EXISTS idx_partner_contacts_partner_id ON partner_contacts(partner_id);

-- Create partner_contacts update trigger
-- Created: 2025-01-01
DROP TRIGGER IF EXISTS update_partner_contacts_updated_at ON partner_contacts;
CREATE TRIGGER update_partner_contacts_updated_at
    BEFORE UPDATE ON partner_contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create partner_offers table
-- Created: 2025-01-01
CREATE TABLE IF NOT EXISTS partner_offers (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    image_url VARCHAR(500),
    title VARCHAR(500) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    type offer_type NOT NULL DEFAULT 'one-time',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for partner_offers
-- Created: 2025-01-01
CREATE INDEX IF NOT EXISTS idx_partner_offers_partner_id ON partner_offers(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_offers_is_active ON partner_offers(is_active);

-- Create partner_offers update trigger
-- Created: 2025-01-01
DROP TRIGGER IF EXISTS update_partner_offers_updated_at ON partner_offers;
CREATE TRIGGER update_partner_offers_updated_at
    BEFORE UPDATE ON partner_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create transactions table
-- Created: 2025-01-01
-- Fixed: 2025-05-30 (исправлен тип данных для sender_id и recipient_id)
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type action_type NOT NULL,
    amount INTEGER NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    description VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for transactions
-- Created: 2025-01-01
CREATE INDEX IF NOT EXISTS idx_transactions_sender_id ON transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_id ON transactions(recipient_id);
CREATE INDEX IF NOT EXISTS idx_transactions_action_type ON transactions(action_type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

-- Create transactions update trigger
-- Created: 2025-01-01
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
