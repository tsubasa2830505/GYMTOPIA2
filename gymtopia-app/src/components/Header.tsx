'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex justify-between items-center h-16 px-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          ジムトピア
        </Link>

        <div className="flex items-center gap-4">
          {/* ヘッダー右側は空欄にする */}
        </div>
      </div>
    </header>
  )
}