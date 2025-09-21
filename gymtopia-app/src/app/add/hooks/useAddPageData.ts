import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getGyms } from '@/lib/supabase/gyms'
import { createPost } from '@/lib/supabase/posts'
import { scheduleDelayedPost } from '@/lib/supabase/delayed-posts'
import { upsertGymFacilities } from '@/lib/supabase/facilities'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { AddPageState, Exercise } from '../types'
import type { FacilityFormData } from '@/types/facilities'

const initialExercise: Exercise = {
  id: '',
  name: '',
  weight: '',
  sets: '',
  reps: ''
}

export function useAddPageData() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [state, setState] = useState<AddPageState>({
    activeTab: 'post',
    isSubmitting: false,
    gymName: '',
    content: '',
    checkInId: null,
    checkInGymName: null,
    crowdStatus: 'normal',
    workoutStartTime: '',
    workoutEndTime: '',
    exercises: [],
    showExerciseForm: false,
    currentExercise: initialExercise,
    selectedImages: [],
    uploadingImages: false,
    gymList: [],
    isDelayedPost: false,
    delayMinutes: 5,
    shareLevel: 'gym_name',
    audience: 'public',
    equipmentGymName: '',
    facilityFormData: {} as FacilityFormData,
    showEquipmentConfirmation: false
  })

  const [gymData, setGymData] = useState<any[]>([])

  // Load gym data and handle URL parameters
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const gyms = await getGyms()
        setGymData(gyms)

        const gymNames = Array.from(new Set([
          'エニタイムフィットネス',
          'ゴールドジム',
          'ティップネス',
          'セントラルフィットネス',
          'ルネサンス',
          'コナミスポーツクラブ',
          'ジョイフィット',
          'カーブス',
          'スポーツクラブNAS',
          'メガロス',
          ...gyms.map(gym => gym.name)
        ]))

        setState(prev => ({ ...prev, gymList: gymNames }))

        // Handle check-in parameters
        const checkinId = searchParams.get('checkin_id')
        const gymName = searchParams.get('gym_name')

        if (checkinId && gymName) {
          setState(prev => ({
            ...prev,
            checkInId: checkinId,
            checkInGymName: decodeURIComponent(gymName),
            gymName: decodeURIComponent(gymName)
          }))
        }
      } catch (error) {
        console.error('Failed to load gym data:', error)
      }
    }

    loadInitialData()
  }, [searchParams])

  const updateState = (updates: Partial<AddPageState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const handleAddExercise = () => {
    if (
      state.currentExercise.name.trim() &&
      state.currentExercise.weight.trim() &&
      state.currentExercise.sets.trim() &&
      state.currentExercise.reps.trim()
    ) {
      const newExercise = { ...state.currentExercise, id: Date.now().toString() }
      setState(prev => ({
        ...prev,
        exercises: [...prev.exercises, newExercise],
        currentExercise: initialExercise,
        showExerciseForm: false
      }))
    } else {
      alert('すべての項目を入力してください')
    }
  }

  const handleEditExercise = (exercise: Exercise, index: number) => {
    setState(prev => ({
      ...prev,
      currentExercise: exercise,
      showExerciseForm: true
    }))
    // Remove the exercise being edited from the list
    handleRemoveExercise(exercise.id)
  }

  const handleRemoveExercise = (id: string) => {
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== id)
    }))
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check file size and type
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} はファイルサイズが大きすぎます（10MB以下にしてください）`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} は画像ファイルではありません`)
        return false
      }
      return true
    })

    setState(prev => ({
      ...prev,
      selectedImages: [...prev.selectedImages, ...validFiles].slice(0, 5)
    }))
  }

  const handleRemoveImage = (index: number) => {
    setState(prev => ({
      ...prev,
      selectedImages: prev.selectedImages.filter((_, i) => i !== index)
    }))
  }

  const uploadImagesToSupabase = async (images: File[]): Promise<string[]> => {
    setState(prev => ({ ...prev, uploadingImages: true }))

    try {
      const supabase = getSupabaseClient()
      const uploadPromises = images.map(async (image, index) => {
        const fileExt = image.name.split('.').pop()
        const fileName = `${user?.id}_${Date.now()}_${index}.${fileExt}`

        const { data, error } = await supabase.storage
          .from('post-images')
          .upload(fileName, image)

        if (error) throw error

        const { data: urlData } = supabase.storage
          .from('post-images')
          .getPublicUrl(fileName)

        return urlData.publicUrl
      })

      return await Promise.all(uploadPromises)
    } catch (error) {
      console.error('Error uploading images:', error)
      throw error
    } finally {
      setState(prev => ({ ...prev, uploadingImages: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!state.content.trim()) {
      alert('投稿内容を入力してください')
      return
    }

    setState(prev => ({ ...prev, isSubmitting: true }))

    try {
      // Upload images
      let imageUrls: string[] = []
      if (state.selectedImages.length > 0) {
        imageUrls = await uploadImagesToSupabase(state.selectedImages)
      }

      // Get selected gym
      const selectedGym = gymData.find(gym => gym.name === state.gymName)

      // Create post data
      const postData = {
        content: state.content.trim(),
        post_type: state.exercises.length > 0 ? 'workout' as const : 'normal' as const,
        gym_id: selectedGym?.id,
        checkin_id: state.checkInId || undefined,
        images: imageUrls,
        workout_started_at: state.workoutStartTime || undefined,
        workout_ended_at: state.workoutEndTime || undefined,
        training_details: state.exercises.length > 0 ? {
          exercises: state.exercises.map(ex => ({
            name: ex.name,
            weight: parseFloat(ex.weight) || 0,
            sets: parseInt(ex.sets) || 1,
            reps: parseInt(ex.reps) || 1
          })),
          gym_name: state.gymName,
          crowd_status: state.crowdStatus
        } : null,
        visibility: 'public' as const
      }

      if (state.isDelayedPost) {
        // Handle delayed post
        const gymInfo = {
          id: selectedGym?.id || '',
          name: state.gymName,
          area: selectedGym?.prefecture || undefined
        }

        const badges = state.exercises.length > 0 ? [
          { badge_name: 'ワークアウト完了', badge_icon: '💪', rarity: 'common' }
        ] : []

        const delayedPostId = await scheduleDelayedPost(
          user.id,
          state.checkInId || 'direct_post',
          gymInfo,
          badges,
          {
            shareLevel: state.shareLevel,
            delayMinutes: state.delayMinutes,
            audience: state.audience
          }
        )

        if (delayedPostId) {
          alert(`${state.delayMinutes}分後に自動投稿されます！`)
          router.push('/feed')
        } else {
          throw new Error('遅延投稿のスケジュールに失敗しました')
        }
      } else {
        // Immediate post
        await createPost(postData)
        alert('投稿が完了しました！')
        router.push('/feed')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      alert('投稿の作成に失敗しました。もう一度お試しください。')
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleEquipmentSubmit = async () => {
    try {
      setState(prev => ({ ...prev, isSubmitting: true }))
      await upsertGymFacilities(state.equipmentGymName, state.facilityFormData)
      setState(prev => ({ ...prev, showEquipmentConfirmation: true }))
    } catch (error) {
      console.error('Error saving equipment:', error)
      alert('機器情報の保存に失敗しました')
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  return {
    state,
    updateState,
    handleAddExercise,
    handleEditExercise,
    handleRemoveExercise,
    handleImageSelect,
    handleRemoveImage,
    handleSubmit,
    handleEquipmentSubmit
  }
}