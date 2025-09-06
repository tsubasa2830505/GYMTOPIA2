'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TestSupabasePage() {
  const [tableData, setTableData] = useState<Record<string, unknown>[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableName, setTableName] = useState('muscle_parts')

  const testTable = async (name: string) => {
    setLoading(true)
    setError(null)
    setTableName(name)
    
    try {
      const { data, error: fetchError } = await supabase
        .from(name)
        .select('*')
        .limit(5)

      if (fetchError) {
        setError(`テーブル "${name}" エラー: ${fetchError.message}`)
        setTableData(null)
      } else {
        setTableData(data)
        setError(null)
      }
    } catch (err) {
      setError(`予期しないエラー: ${err instanceof Error ? err.message : '不明なエラー'}`)
      setTableData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // ページロード時にIDが17328のテーブルを探す
    const findTable = async () => {
      const tableNames = [
        'muscle_parts',
        'body_parts', 
        'target_muscles',
        'muscle_groups',
        'muscles',
        'parts',
        'gym_parts',
        'equipment_parts'
      ]

      for (const name of tableNames) {
        await testTable(name)
        // 成功したら停止
        if (tableData) break
      }
    }

    findTable()
  }, [tableData])

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Supabase テーブル確認ツール</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <p className="text-sm text-slate-600 mb-4">
            テーブルID: 17328 の実際のテーブル名を確認中...
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              'muscle_parts',
              'body_parts',
              'target_muscles',
              'muscle_groups',
              'muscles',
              'parts'
            ].map(name => (
              <button
                key={name}
                onClick={() => testTable(name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tableName === name 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="border-t pt-4">
            <h2 className="font-semibold mb-2">現在のテーブル: {tableName}</h2>
            
            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {tableData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 font-medium mb-2">
                  ✅ テーブル &quot;{tableName}&quot; が見つかりました！
                </p>
                <pre className="bg-white p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(tableData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold mb-2">手動でテーブル名を入力</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="テーブル名を入力"
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={() => testTable(tableName)}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              テスト
            </button>
          </div>
          <p className="text-sm text-slate-600 mt-2">
            Supabaseダッシュボードで確認したテーブル名を入力してください
          </p>
        </div>
      </div>
    </div>
  )
}