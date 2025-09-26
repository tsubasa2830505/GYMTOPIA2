'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { LOGO_FILTER, GRADIENT_CLASSES, ICON_SIZES, LOGO_SIZES, DEFAULT_SUBTITLE } from '@/constants/styles'

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showMenu?: boolean;
}

export default function Header({ title, subtitle, showMenu = false }: HeaderProps = {}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-[rgba(231,103,76,0.18)] bg-[rgba(254,255,250,0.9)] backdrop-blur-xl shadow-[0_20px_46px_-28px_rgba(189,101,78,0.42)]">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
          {/* モバイルのみ表示 */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-secondary rounded-full flex items-center justify-center shadow-[0_16px_34px_-20px_rgba(189,101,78,0.46)]">
              <MapPin className="w-5 h-5 text-[color:var(--gt-on-primary)]" />
            </div>
            <div>
              <Image
                src="/images/gymtopia.png"
                alt="ジムトピア"
                width={LOGO_SIZES.mobile.width}
                height={LOGO_SIZES.mobile.height}
                className={LOGO_SIZES.mobile.className}
                style={{
                  filter: LOGO_FILTER
                }}
              />
              <p className="text-xs text-[color:var(--text-muted)]">
                {subtitle || DEFAULT_SUBTITLE}
              </p>
            </div>
          </div>

          {/* デスクトップ版でもロゴを表示 */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-secondary rounded-full flex items-center justify-center shadow-[0_16px_34px_-20px_rgba(189,101,78,0.46)]">
              <MapPin className="w-6 h-6 text-[color:var(--gt-on-primary)]" />
            </div>
            <div>
              <Image
                src="/images/gymtopia.png"
                alt="ジムトピア"
                width={LOGO_SIZES.desktop.width}
                height={LOGO_SIZES.desktop.height}
                className={LOGO_SIZES.desktop.className}
                style={{
                  filter: LOGO_FILTER
                }}
              />
              <p className="text-sm text-[color:var(--text-muted)]">
                {subtitle || DEFAULT_SUBTITLE}
              </p>
            </div>
          </div>

          {/* Hamburger Menu Button - Only show when showMenu prop is true */}
          {showMenu && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-xl bg-[rgba(254,255,250,0.9)] border border-[rgba(231,103,76,0.18)] hover:bg-[rgba(254,255,250,1)] transition-colors"
              >
                <svg className="w-6 h-6 text-[color:var(--gt-primary-strong)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/20 z-30"
                  onClick={() => setMenuOpen(false)}
                />

                {/* Menu Content */}
                <div className="absolute top-full right-0 mt-2 w-64 gt-card z-50 overflow-hidden">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        router.push('/admin')
                        setMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-[rgba(254,255,250,0.92)]"
                    >
                      <svg className="w-5 h-5 text-[color:var(--gt-primary-strong)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                      </svg>
                      <span className="text-sm font-medium text-[color:var(--foreground)]">施設管理者</span>
                    </button>

                    <div className="border-t border-[rgba(231,103,76,0.18)]" />

                    <button
                      onClick={() => {
                        router.push('/auth/login')
                        setMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-[rgba(254,255,250,0.92)]"
                    >
                      <svg className="w-5 h-5 text-[color:var(--gt-primary-strong)]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      <span className="text-sm font-medium text-[color:var(--foreground)]">ログイン</span>
                    </button>
                  </div>
                </div>
              </>
              )}
            </div>
          )}
        </div>
      </header>
    </>
  )
}
