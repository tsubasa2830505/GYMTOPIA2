// Database connectivity test
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Service key exists:', !!supabaseServiceKey)

// Create admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...')
    const { data: healthData, error: healthError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })
    
    if (healthError) {
      console.error('Health check failed:', healthError)
    } else {
      console.log('✅ Basic connection working')
    }

    // Check if posts table exists
    console.log('\n2. Checking posts table...')
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('count', { count: 'exact', head: true })
    
    if (postsError) {
      console.error('❌ Posts table error:', postsError)
      
      // Try to create the posts table
      console.log('\n3. Attempting to create missing tables...')
      const schemaPath = join(__dirname, 'supabase', 'schema-complete.sql')
      const schema = readFileSync(schemaPath, 'utf8')
      
      console.log('Applying schema...')
      const { data: schemaData, error: schemaError } = await supabase.rpc('exec_sql', {
        sql: schema
      })
      
      if (schemaError) {
        console.error('❌ Schema application failed:', schemaError)
        console.log('Trying alternative approach...')
        
        // Apply basic posts table only
        const basicPostsSchema = `
          CREATE TABLE IF NOT EXISTS public.posts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            content TEXT,
            images JSONB,
            post_type TEXT NOT NULL DEFAULT 'normal',
            workout_session_id UUID,
            gym_id UUID,
            checkin_id UUID,
            achievement_type TEXT,
            achievement_data JSONB,
            visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
            likes_count INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Enable RLS
          ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
          
          -- Create policy for public viewing
          CREATE POLICY IF NOT EXISTS "Posts are viewable by everyone" ON public.posts
            FOR SELECT USING (visibility = 'public');
        `
        
        const { error: basicError } = await supabase.rpc('exec_sql', {
          sql: basicPostsSchema
        })
        
        if (basicError) {
          console.error('❌ Basic schema failed:', basicError)
        } else {
          console.log('✅ Basic posts table created')
        }
      } else {
        console.log('✅ Full schema applied')
      }
    } else {
      console.log('✅ Posts table exists, count:', postsData)
    }

    // Test posts query
    console.log('\n4. Testing posts query...')
    const { data: testPostsData, error: testPostsError } = await supabase
      .from('posts')
      .select('id, content, created_at')
      .limit(1)
    
    if (testPostsError) {
      console.error('❌ Posts query failed:', testPostsError)
    } else {
      console.log('✅ Posts query successful, found', testPostsData?.length || 0, 'posts')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Load environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

testConnection()