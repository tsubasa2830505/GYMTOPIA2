import { memo } from 'react'
import { MapPin, Navigation, Clock, Trophy, Check, Shield, Award, Loader2 } from 'lucide-react'
import Image from 'next/image'
import type { GymCardProps } from '../types'

const GymCard = memo(function GymCard({
  gym,
  onCheckin,
  isCheckingIn,
  isCheckedIn
}: GymCardProps) {
  const getRarityColor = (level?: string) => {
    switch (level) {
      case 'legendary': return 'text-yellow-500'
      case 'mythical': return 'text-purple-500'
      case 'rare': return 'text-blue-500'
      default: return 'text-gray-500'
    }
  }

  const getRarityIcon = (level?: string) => {
    switch (level) {
      case 'legendary': return <Trophy className="w-4 h-4" />
      case 'mythical': return <Award className="w-4 h-4" />
      case 'rare': return <Shield className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  return (
    <div className="gt-card p-4 sm:p-6 hover:-translate-y-1 transition-all">
      <div className="flex gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
          {gym.image_url ? (
            <Image
              src={gym.image_url}
              alt={gym.name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-bold text-base sm:text-lg text-[color:var(--foreground)] truncate">
                {gym.name}
              </h3>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-[color:var(--text-muted)] mt-1">
                <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{gym.distance ? gym.distance.toFixed(0) : '---'}m</span>
              </div>
              <p className="text-xs text-[color:var(--text-subtle)] mt-1 line-clamp-2">
                {gym.address}
              </p>

              {gym.rarity_level && (
                <div className={`flex items-center gap-1 mt-2 ${getRarityColor(gym.rarity_level)}`}>
                  {getRarityIcon(gym.rarity_level)}
                  <span className="text-xs font-medium capitalize">
                    {gym.rarity_level}
                  </span>
                </div>
              )}

              {gym.lastCheckIn && (
                <div className="flex items-center gap-1 text-xs text-[color:var(--text-muted)] mt-1">
                  <Clock className="w-3 h-3" />
                  <span>前回: {new Date(gym.lastCheckIn).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => onCheckin(gym.id)}
              disabled={isCheckingIn || isCheckedIn}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isCheckedIn
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : isCheckingIn
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-[var(--gt-primary)] text-white hover:bg-[var(--gt-primary-strong)] hover:-translate-y-0.5 shadow-lg'
              }`}
            >
              {isCheckingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  チェックイン中...
                </>
              ) : isCheckedIn ? (
                <>
                  <Check className="w-4 h-4" />
                  チェックイン済み
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  チェックイン
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default GymCard