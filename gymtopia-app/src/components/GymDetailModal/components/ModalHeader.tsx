import { memo } from 'react'
import { X, Share2, MapPin, Eye, Users } from 'lucide-react'
import type { HeaderProps } from '../types'

const ModalHeader = memo(function ModalHeader({ gymData, onClose }: HeaderProps) {
  return (
    <div className="relative h-64 sm:h-72 bg-gradient-to-br from-[var(--gt-primary)] to-[var(--gt-secondary)] overflow-hidden">
      {/* Hero Image */}
      {gymData.images && gymData.images.length > 0 && (
        <img
          src={gymData.images[0]}
          alt={gymData.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg z-10 hover:bg-white transition-colors"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6 text-[color:var(--foreground)]" />
      </button>

      <button className="absolute top-4 left-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg z-10">
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-[color:var(--foreground)]" />
      </button>
    </div>
  )
})

export default ModalHeader