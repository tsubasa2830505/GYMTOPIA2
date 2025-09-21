import { useState, useEffect } from 'react'
import {
  getGymAdminStatistics,
  getTimeBasedPostDistribution,
  getFrequentPosters
} from '@/lib/supabase/admin-statistics'
import {
  getUserManagedGyms,
  updateGymBasicInfo,
  getGymEquipment,
  addGymEquipment,
  deleteGymEquipment,
  getGymReviews,
  replyToReview
} from '@/lib/supabase/admin'
import type { AdminPageState, Equipment, Review, GymBasicInfo } from '../types'

export function useAdminData(userId: string | undefined) {
  const [state, setState] = useState<Partial<AdminPageState>>({
    activeTab: 'basic',
    selectedGym: null,
    gyms: [],
    managedGyms: [],
    loading: true,
    stats: null,
    timeDistribution: [],
    frequentPosters: [],
    hasAccess: false,
    authUser: null,
    formData: {
      basicInfo: {
        name: '',
        area: '',
        address: '',
        hours: '',
        access: '',
        phone: '',
        description: '',
        imageUrl: ''
      }
    },
    newEquipment: {
      category: '',
      name: '',
      maker: '',
      count: 1
    },
    equipmentList: [],
    reviews: [],
    newReviewReply: '',
    selectedReviewId: null
  })

  // Load initial data
  useEffect(() => {
    if (userId) {
      loadInitialData()
    }
  }, [userId])

  const loadInitialData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }))

      // Load managed gyms
      const managedGyms = await getUserManagedGyms(userId!)

      if (managedGyms.length > 0) {
        const firstGym = managedGyms[0]

        // Load gym data
        const [equipment, reviews, stats, timeDistribution, frequentPosters] = await Promise.all([
          getGymEquipment(firstGym.id),
          getGymReviews(firstGym.id),
          getGymAdminStatistics(firstGym.id),
          getTimeBasedPostDistribution(firstGym.id),
          getFrequentPosters(firstGym.id)
        ])

        setState(prev => ({
          ...prev,
          managedGyms,
          selectedGym: firstGym,
          hasAccess: true,
          equipmentList: equipment || [],
          reviews: reviews || [],
          stats,
          timeDistribution: timeDistribution || [],
          frequentPosters: frequentPosters || [],
          formData: {
            basicInfo: {
              name: firstGym.name || '',
              area: firstGym.area || '',
              address: firstGym.address || '',
              hours: firstGym.hours || '',
              access: firstGym.access || '',
              phone: firstGym.phone || '',
              description: firstGym.description || '',
              imageUrl: firstGym.image_url || ''
            }
          },
          loading: false
        }))
      } else {
        setState(prev => ({
          ...prev,
          hasAccess: false,
          loading: false
        }))
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        hasAccess: false
      }))
    }
  }

  // Basic info handlers
  const handleInputChange = (field: keyof GymBasicInfo, value: string) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData!,
        basicInfo: {
          ...prev.formData!.basicInfo,
          [field]: value
        }
      }
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && state.selectedGym) {
      // Handle image upload logic here
      console.log('Image upload:', file)
    }
  }

  const handleSaveBasicInfo = async () => {
    if (!state.selectedGym || !state.formData) return

    try {
      await updateGymBasicInfo(state.selectedGym.id, state.formData.basicInfo)
      // Refresh data or show success message
    } catch (error) {
      console.error('Error saving basic info:', error)
    }
  }

  // Equipment handlers
  const handleEquipmentChange = (field: keyof Equipment, value: string | number) => {
    setState(prev => ({
      ...prev,
      newEquipment: {
        ...prev.newEquipment!,
        [field]: value
      }
    }))
  }

  const handleAddEquipment = async () => {
    if (!state.selectedGym || !state.newEquipment?.category || !state.newEquipment?.name) return

    try {
      await addGymEquipment(state.selectedGym.id, state.newEquipment as Equipment)
      // Refresh equipment list
      const equipment = await getGymEquipment(state.selectedGym.id)
      setState(prev => ({
        ...prev,
        equipmentList: equipment || [],
        newEquipment: {
          category: '',
          name: '',
          maker: '',
          count: 1
        }
      }))
    } catch (error) {
      console.error('Error adding equipment:', error)
    }
  }

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!state.selectedGym) return

    try {
      await deleteGymEquipment(equipmentId)
      // Refresh equipment list
      const equipment = await getGymEquipment(state.selectedGym.id)
      setState(prev => ({
        ...prev,
        equipmentList: equipment || []
      }))
    } catch (error) {
      console.error('Error deleting equipment:', error)
    }
  }

  // Review handlers
  const handleReplyChange = (value: string) => {
    setState(prev => ({ ...prev, newReviewReply: value }))
  }

  const handleReplyStart = (reviewId: string) => {
    setState(prev => ({
      ...prev,
      selectedReviewId: reviewId,
      newReviewReply: ''
    }))
  }

  const handleReplySubmit = async (reviewId: string) => {
    if (!state.newReviewReply.trim() || !state.selectedGym) return

    try {
      await replyToReview(reviewId, state.newReviewReply)
      // Refresh reviews
      const reviews = await getGymReviews(state.selectedGym.id)
      setState(prev => ({
        ...prev,
        reviews: reviews || [],
        selectedReviewId: null,
        newReviewReply: ''
      }))
    } catch (error) {
      console.error('Error submitting reply:', error)
    }
  }

  const handleReplyCancel = () => {
    setState(prev => ({
      ...prev,
      selectedReviewId: null,
      newReviewReply: ''
    }))
  }

  const setActiveTab = (tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }))
  }

  return {
    ...state,
    setActiveTab,
    handleInputChange,
    handleImageUpload,
    handleSaveBasicInfo,
    handleEquipmentChange,
    handleAddEquipment,
    handleDeleteEquipment,
    handleReplyChange,
    handleReplyStart,
    handleReplySubmit,
    handleReplyCancel,
    refreshData: loadInitialData
  }
}