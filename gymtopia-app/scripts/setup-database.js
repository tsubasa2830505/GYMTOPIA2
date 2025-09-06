const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTables() {
  try {
    console.log('Checking database tables...\n')
    
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (usersError) {
      console.log('❌ users table: Not found or error:', usersError.message)
      console.log('   Please run the SQL migration in Supabase dashboard')
    } else {
      console.log('✅ users table: Ready')
    }
    
    // Check user_profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1)
    
    if (profilesError) {
      console.log('❌ user_profiles table: Not found or error:', profilesError.message)
      console.log('   Please run the SQL migration in Supabase dashboard')
    } else {
      console.log('✅ user_profiles table: Ready')
    }
    
    console.log('\n=================================')
    console.log('Next steps:')
    console.log('1. If tables are missing, go to:')
    console.log('   https://supabase.com/dashboard/project/onfqhnhdfbovgcnksatu/sql/new')
    console.log('2. Copy and run the SQL from docs/execute-migration.md')
    console.log('3. Enable Email auth in Authentication settings')
    console.log('=================================\n')
    
  } catch (error) {
    console.error('Error checking database:', error)
  }
}

checkTables()