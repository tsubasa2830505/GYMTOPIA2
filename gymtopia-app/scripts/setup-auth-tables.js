const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQLCommands() {
  const commands = [
    // Enable UUID extension
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    
    // Create users table
    `CREATE TABLE IF NOT EXISTS public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE,
      display_name TEXT,
      avatar_url TEXT,
      bio TEXT,
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ,
      CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
      CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
      CONSTRAINT display_name_length CHECK (char_length(display_name) <= 50),
      CONSTRAINT bio_length CHECK (char_length(bio) <= 500)
    )`,
    
    // Create user_profiles table
    `CREATE TABLE IF NOT EXISTS public.user_profiles (
      user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
      gym_experience_years DECIMAL(3,1),
      training_frequency TEXT,
      training_goals TEXT[],
      preferred_training_time TEXT,
      height_cm INTEGER,
      weight_kg DECIMAL(5,2),
      body_fat_percentage DECIMAL(4,1),
      profile_visibility TEXT DEFAULT 'public',
      show_stats BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT experience_range CHECK (gym_experience_years >= 0 AND gym_experience_years <= 100),
      CONSTRAINT height_range CHECK (height_cm >= 50 AND height_cm <= 300),
      CONSTRAINT weight_range CHECK (weight_kg >= 20 AND weight_kg <= 500),
      CONSTRAINT body_fat_range CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
      CONSTRAINT valid_frequency CHECK (training_frequency IN ('daily', 'weekly_1-2', 'weekly_3-4', 'weekly_5+', 'occasional')),
      CONSTRAINT valid_training_time CHECK (preferred_training_time IN ('early_morning', 'morning', 'afternoon', 'evening', 'night', 'flexible')),
      CONSTRAINT valid_visibility CHECK (profile_visibility IN ('public', 'friends', 'private'))
    )`,
    
    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username)`,
    `CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active) WHERE is_active = true`,
    
    // Enable RLS
    `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY`,
    
    // Create handle_new_user function
    `CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO public.users (id, email, username, display_name)
        VALUES (
            NEW.id,
            NEW.email,
            LOWER(SPLIT_PART(NEW.email, '@', 1) || '_' || SUBSTRING(NEW.id::TEXT, 1, 4)),
            COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
        );
        
        INSERT INTO public.user_profiles (user_id)
        VALUES (NEW.id);
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER`,
    
    // Create update_updated_at function
    `CREATE OR REPLACE FUNCTION public.update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql`
  ]
  
  console.log('🚀 Starting database setup...\n')
  
  for (const command of commands) {
    const commandPreview = command.substring(0, 50).replace(/\n/g, ' ')
    try {
      // Since we can't execute SQL directly, let's check if tables exist
      if (command.includes('CREATE TABLE')) {
        const tableName = command.match(/CREATE TABLE IF NOT EXISTS public\.(\w+)/)?.[1]
        if (tableName) {
          const { error } = await supabase.from(tableName).select('*').limit(1)
          if (!error) {
            console.log(`✅ Table '${tableName}' already exists`)
            continue
          }
        }
      }
      console.log(`⏳ ${commandPreview}...`)
    } catch (err) {
      console.log(`⚠️  ${commandPreview}... (may already exist)`)
    }
  }
  
  // Save full migration SQL for manual execution
  const fs = require('fs')
  const fullSQL = commands.join(';\n\n') + ';'
  fs.writeFileSync('scripts/migration.sql', fullSQL)
  
  console.log('\n📝 Full migration SQL saved to: scripts/migration.sql')
  console.log('\n⚠️  Direct SQL execution is not available via Supabase client.')
  console.log('Please run the SQL manually at:')
  console.log('https://supabase.com/dashboard/project/htytewqvkgwyuvcsvjwm/sql/new')
  console.log('\n1. Copy the contents of scripts/migration.sql')
  console.log('2. Paste and run in the SQL Editor')
  console.log('3. Enable Email auth in Authentication settings')
}

async function checkTables() {
  console.log('\n📊 Checking existing tables...\n')
  
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(1)
  
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1)
  
  if (!usersError) {
    console.log('✅ users table exists')
  } else {
    console.log('❌ users table not found')
  }
  
  if (!profilesError) {
    console.log('✅ user_profiles table exists')
  } else {
    console.log('❌ user_profiles table not found')
  }
  
  return { usersExists: !usersError, profilesExists: !profilesError }
}

async function main() {
  const { usersExists, profilesExists } = await checkTables()
  
  if (usersExists && profilesExists) {
    console.log('\n✨ All tables are ready! You can now test the authentication.')
    console.log('\nMake sure Email auth is enabled at:')
    console.log('https://supabase.com/dashboard/project/htytewqvkgwyuvcsvjwm/auth/providers')
    console.log('\nTest signup at: http://localhost:3000/auth/signup')
  } else {
    await executeSQLCommands()
  }
}

main().catch(console.error)