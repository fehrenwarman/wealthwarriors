-- Wealth Warriors Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Families table
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_pin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kids table
CREATE TABLE kids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  avatar TEXT NOT NULL,
  total_xp INTEGER DEFAULT 0,
  warrior_rank INTEGER DEFAULT 1,
  weekly_allowance DECIMAL(10,2) DEFAULT 0,
  pending_allocation DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buckets table (save, spend, share balances per kid)
CREATE TABLE buckets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  save_balance DECIMAL(10,2) DEFAULT 0,
  save_interest_rate DECIMAL(5,2) DEFAULT 5,
  save_baseline DECIMAL(10,2) DEFAULT 0,
  spend_balance DECIMAL(10,2) DEFAULT 0,
  share_balance DECIMAL(10,2) DEFAULT 0,
  share_total_given DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kid_id)
);

-- Pets table (current pet per kid)
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('dragon', 'eagle', 'wolf', 'lion', 'turtle', 'owl')),
  name TEXT NOT NULL,
  level INTEGER DEFAULT 0 CHECK (level >= 0 AND level <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet Stable (elder pets that have been raised)
CREATE TABLE pet_stable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('dragon', 'eagle', 'wolf', 'lion', 'turtle', 'owl')),
  name TEXT NOT NULL,
  raised_to_elder_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spending Goals
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  current_amount DECIMAL(10,2) DEFAULT 0,
  visual TEXT,
  visual_type TEXT DEFAULT 'emoji' CHECK (visual_type IN ('emoji', 'image', 'gif')),
  image_url TEXT,
  link_url TEXT,
  completed BOOLEAN DEFAULT FALSE,
  purchased BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Causes (for Share bucket)
CREATE TABLE custom_causes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  emoji TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges earned
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(kid_id, type)
);

-- Transaction history
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('allocation', 'interest', 'goal_purchase', 'donation', 'grant')),
  amount DECIMAL(10,2) NOT NULL,
  bucket TEXT CHECK (bucket IN ('save', 'spend', 'share')),
  description TEXT,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_kids_family ON kids(family_id);
CREATE INDEX idx_buckets_kid ON buckets(kid_id);
CREATE INDEX idx_pets_kid ON pets(kid_id);
CREATE INDEX idx_pet_stable_kid ON pet_stable(kid_id);
CREATE INDEX idx_goals_kid ON goals(kid_id);
CREATE INDEX idx_custom_causes_kid ON custom_causes(kid_id);
CREATE INDEX idx_badges_kid ON badges(kid_id);
CREATE INDEX idx_transactions_kid ON transactions(kid_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- Row Level Security (RLS) policies
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_stable ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can tighten this with auth later)
CREATE POLICY "Allow all on families" ON families FOR ALL USING (true);
CREATE POLICY "Allow all on kids" ON kids FOR ALL USING (true);
CREATE POLICY "Allow all on buckets" ON buckets FOR ALL USING (true);
CREATE POLICY "Allow all on pets" ON pets FOR ALL USING (true);
CREATE POLICY "Allow all on pet_stable" ON pet_stable FOR ALL USING (true);
CREATE POLICY "Allow all on goals" ON goals FOR ALL USING (true);
CREATE POLICY "Allow all on custom_causes" ON custom_causes FOR ALL USING (true);
CREATE POLICY "Allow all on badges" ON badges FOR ALL USING (true);
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER families_updated_at BEFORE UPDATE ON families
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER kids_updated_at BEFORE UPDATE ON kids
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER buckets_updated_at BEFORE UPDATE ON buckets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER pets_updated_at BEFORE UPDATE ON pets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
