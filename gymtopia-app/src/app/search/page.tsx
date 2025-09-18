'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to search results page
    router.replace('/search/results')
  }, [router])

  return (
    <div className="min-h-screen bg-[rgba(254,255,250,0.96)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[color:var(--gt-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[color:var(--text-subtle)]">検索ページにリダイレクト中...</p>
      </div>
    </div>
  )
}
