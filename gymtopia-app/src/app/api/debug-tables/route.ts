import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  // 本番/プレビューでは利用不可にする（開発専用）
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in this environment' }, { status: 403 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  try {
    // information_schema から public スキーマのテーブル一覧を取得
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%muscle%')
      .or('table_name.ilike.%part%')
      .or('table_name.ilike.%body%')
      .or('table_name.ilike.%target%')

    if (error) {
      // 別の方法を試す - 直接SQLクエリ
      const { data: sqlData, error: sqlError } = await supabase.rpc('get_public_tables', {})
      
      if (sqlError) {
        return NextResponse.json({ 
          message: 'テーブル一覧を取得できませんでした。Supabaseダッシュボードで確認してください。',
          hint: 'Table ID 17328 を確認してください'
        })
      }
      
      return NextResponse.json({ tables: sqlData })
    }

    return NextResponse.json({ tables: data })
  } catch (error) {
    return NextResponse.json({ 
      error: 'エラーが発生しました',
      details: error
    }, { status: 500 })
  }
}
