const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testFeedPosts() {
  try {
    console.log('Testing getFeedPosts...')

    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('gym_posts')
      .select('id')
      .limit(1)

    console.log('Basic connection test:', { testData, testError })

    if (testError) {
      console.error('Basic connection failed:', testError)
      return
    }

    // Test full query with joins
    const { data, error } = await supabase
      .from('gym_posts')
      .select(`
        *,
        users:user_id (
          id,
          display_name,
          username,
          avatar_url
        ),
        gyms:gym_id (
          name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.error('Query error:', error)
      return
    }

    console.log('Query successful, data length:', data?.length || 0)
    console.log('Sample data:', JSON.stringify(data?.[0], null, 2))

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testFeedPosts()