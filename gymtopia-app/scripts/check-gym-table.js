const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkGymsTable() {
  // まず、gymsテーブルのデータを取得して構造を確認
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching gyms:', error)
    return
  }

  if (data && data.length > 0) {
    console.log('Gyms table columns:', Object.keys(data[0]))
    console.log('\nSample record:', data[0])
  } else {
    console.log('No data in gyms table')
  }
}

checkGymsTable()