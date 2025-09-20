'use client'

interface Tab {
  id: string
  label: string
  count?: number
}

interface ProfileTabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function ProfileTabs({
  tabs,
  activeTab,
  onTabChange
}: ProfileTabsProps) {
  return (
    <div className="border-b border-[rgba(231,103,76,0.2)]">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === tab.id
                ? 'border-[color:var(--gt-primary)] text-[color:var(--gt-primary)]'
                : 'border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--foreground)] hover:border-[rgba(231,103,76,0.3)]'
              }
            `}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`
                ml-2 py-0.5 px-2 rounded-full text-xs
                ${activeTab === tab.id
                  ? 'bg-[color:var(--gt-primary)] text-white'
                  : 'bg-[rgba(231,103,76,0.1)] text-[color:var(--text-muted)]'
                }
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}