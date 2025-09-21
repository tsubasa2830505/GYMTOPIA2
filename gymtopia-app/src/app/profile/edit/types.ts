export interface PersonalRecord {
  id: string
  exercise: string
  weight: string
  reps: string
}

export interface ProfileEditState {
  // Basic Info
  name: string
  username: string
  bio: string
  avatarUrl: string
  previewImage: string | null
  isLoading: boolean
  uploadedFile: File | null
  dataLoaded: boolean

  // Home Gym Settings
  primaryGymId: string
  primaryGymName: string
  gymSearchQuery: string
  gymSearchResults: any[]
  isSearchingGym: boolean

  // Privacy Settings
  gymActivityPrivate: boolean
  showStatsPublic: boolean
  showAchievementsPublic: boolean
  showFavoriteGymsPublic: boolean

  // Personal Records
  personalRecords: PersonalRecord[]
  currentRecord: PersonalRecord
  showAddRecord: boolean
}

export interface BasicInfoProps {
  name: string
  username: string
  bio: string
  avatarUrl: string
  previewImage: string | null
  onNameChange: (value: string) => void
  onUsernameChange: (value: string) => void
  onBioChange: (value: string) => void
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImageRemove: () => void
}

export interface HomeGymSettingsProps {
  primaryGymId: string
  primaryGymName: string
  gymSearchQuery: string
  gymSearchResults: any[]
  isSearchingGym: boolean
  onGymSearchChange: (value: string) => void
  onGymSelect: (gym: any) => void
}

export interface PrivacySettingsProps {
  gymActivityPrivate: boolean
  showStatsPublic: boolean
  showAchievementsPublic: boolean
  showFavoriteGymsPublic: boolean
  onGymActivityPrivateChange: (value: boolean) => void
  onShowStatsPublicChange: (value: boolean) => void
  onShowAchievementsPublicChange: (value: boolean) => void
  onShowFavoriteGymsPublicChange: (value: boolean) => void
}

export interface PersonalRecordsProps {
  records: PersonalRecord[]
  currentRecord: PersonalRecord
  showAddRecord: boolean
  onAddRecord: () => void
  onRecordChange: (field: keyof PersonalRecord, value: string) => void
  onSaveRecord: () => void
  onCancelAdd: () => void
  onDeleteRecord: (id: string) => void
}