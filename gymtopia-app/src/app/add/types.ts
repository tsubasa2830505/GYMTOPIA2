export interface Exercise {
  id: string
  name: string
  weight: string
  sets: string
  reps: string
}

export interface AddPageState {
  activeTab: 'post' | 'equipment'
  isSubmitting: boolean
  gymName: string
  content: string
  checkInId: string | null
  checkInGymName: string | null
  crowdStatus: 'empty' | 'normal' | 'crowded'
  workoutStartTime: string
  workoutEndTime: string
  exercises: Exercise[]
  showExerciseForm: boolean
  currentExercise: Exercise
  selectedImages: File[]
  uploadingImages: boolean
  gymList: string[]
  isDelayedPost: boolean
  delayMinutes: number
  shareLevel: 'badge_only' | 'gym_name' | 'gym_with_area' | 'none'
  audience: 'public' | 'friends' | 'private'

  // Equipment tab state
  equipmentGymName: string
  facilityFormData: any
  showEquipmentConfirmation: boolean
}

export interface PostFormProps {
  state: AddPageState
  onStateChange: (updates: Partial<AddPageState>) => void
  onSubmit: (e: React.FormEvent) => void
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: (index: number) => void
  onExerciseAdd: () => void
  onExerciseEdit: (exercise: Exercise, index: number) => void
  onExerciseRemove: (index: number) => void
  currentDate: string
  currentTime: string
}

export interface EquipmentFormProps {
  state: AddPageState
  onStateChange: (updates: Partial<AddPageState>) => void
  onSubmit: () => void
}

export interface ExerciseFormProps {
  exercise: Exercise
  onExerciseChange: (exercise: Exercise) => void
  onSave: () => void
  onCancel: () => void
}

export interface WorkoutTimeProps {
  workoutStartTime: string
  workoutEndTime: string
  onStartTimeChange: (time: string) => void
  onEndTimeChange: (time: string) => void
  currentDate: string
  currentTime: string
}