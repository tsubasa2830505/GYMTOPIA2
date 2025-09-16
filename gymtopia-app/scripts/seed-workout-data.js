const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function seedWorkoutData() {
  try {
    // Get a test user (using the mock user ID from development)
    const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

    // Get some gyms to use for workouts
    const { data: gyms, error: gymsError } = await supabase
      .from('gyms')
      .select('id, name')
      .limit(5)

    if (gymsError) {
      console.error('Error fetching gyms:', gymsError)
      return
    }

    if (!gyms || gyms.length === 0) {
      console.error('No gyms found in database')
      return
    }

    console.log(`Found ${gyms.length} gyms to use for workout sessions`)

    // Create workout sessions for the past 3 months
    const sessions = []
    const exercises = []
    const now = new Date()

    for (let i = 0; i < 30; i++) {
      const daysAgo = Math.floor(Math.random() * 90) // Random day in past 90 days
      const sessionDate = new Date(now)
      sessionDate.setDate(sessionDate.getDate() - daysAgo)

      // Random time of day (6 AM to 10 PM)
      const hour = 6 + Math.floor(Math.random() * 16)
      const minute = Math.floor(Math.random() * 60)
      sessionDate.setHours(hour, minute, 0, 0)

      // Random gym
      const gym = gyms[Math.floor(Math.random() * gyms.length)]

      // Random duration (30 to 120 minutes)
      const duration = 30 + Math.floor(Math.random() * 90)
      const endTime = new Date(sessionDate)
      endTime.setMinutes(endTime.getMinutes() + duration)

      // Random mood
      const moods = ['great', 'good', 'normal', 'tired']
      const mood = moods[Math.floor(Math.random() * moods.length)]

      sessions.push({
        user_id: userId,
        gym_id: gym.id,
        started_at: sessionDate.toISOString(),
        ended_at: endTime.toISOString(),
        mood: mood,
        notes: `Workout at ${gym.name}`
      })
    }

    // Insert sessions
    const { data: insertedSessions, error: sessionsError } = await supabase
      .from('workout_sessions')
      .insert(sessions)
      .select()

    if (sessionsError) {
      console.error('Error inserting sessions:', sessionsError)
      return
    }

    console.log(`Created ${insertedSessions.length} workout sessions`)

    // Create exercises for each session
    const exerciseTypes = [
      { name: 'ベンチプレス', muscle_group: '胸', equipment_type: 'バーベル' },
      { name: 'スクワット', muscle_group: '脚', equipment_type: 'バーベル' },
      { name: 'デッドリフト', muscle_group: '背中', equipment_type: 'バーベル' },
      { name: 'ダンベルカール', muscle_group: '腕', equipment_type: 'ダンベル' },
      { name: 'ショルダープレス', muscle_group: '肩', equipment_type: 'ダンベル' },
      { name: 'ラットプルダウン', muscle_group: '背中', equipment_type: 'マシン' },
      { name: 'レッグプレス', muscle_group: '脚', equipment_type: 'マシン' },
      { name: 'チェストフライ', muscle_group: '胸', equipment_type: 'マシン' }
    ]

    for (const session of insertedSessions) {
      // Random number of exercises (3 to 6)
      const numExercises = 3 + Math.floor(Math.random() * 4)
      const sessionExercises = []

      for (let i = 0; i < numExercises; i++) {
        const exercise = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)]

        // Create sets data
        const numSets = 3 + Math.floor(Math.random() * 3) // 3 to 5 sets
        const sets = []

        for (let j = 0; j < numSets; j++) {
          sets.push({
            weight: 20 + Math.floor(Math.random() * 80), // 20 to 100 kg
            reps: 8 + Math.floor(Math.random() * 8), // 8 to 15 reps
            rest: 60 + Math.floor(Math.random() * 120) // 60 to 180 seconds rest
          })
        }

        sessionExercises.push({
          session_id: session.id,
          exercise_name: exercise.name,
          muscle_group: exercise.muscle_group,
          equipment_type: exercise.equipment_type,
          sets: sets,
          order_index: i + 1
        })
      }

      exercises.push(...sessionExercises)
    }

    // Insert exercises
    const { data: insertedExercises, error: exercisesError } = await supabase
      .from('workout_exercises')
      .insert(exercises)

    if (exercisesError) {
      console.error('Error inserting exercises:', exercisesError)
      return
    }

    console.log(`Created ${exercises.length} workout exercises`)

    // Create some gym posts for the sessions
    const posts = []
    for (let i = 0; i < 10; i++) {
      const session = insertedSessions[i]
      if (!session) break

      const gym = gyms.find(g => g.id === session.gym_id)
      const crowdStatuses = ['empty', 'few', 'normal', 'crowded']

      posts.push({
        user_id: userId,
        gym_id: session.gym_id,
        content: `${gym?.name}でトレーニング完了！💪`,
        workout_type: 'strength',
        muscle_groups_trained: ['胸', '背中', '脚'],
        duration_minutes: Math.floor((new Date(session.ended_at) - new Date(session.started_at)) / 60000),
        crowd_status: crowdStatuses[Math.floor(Math.random() * crowdStatuses.length)],
        created_at: session.started_at
      })
    }

    const { data: insertedPosts, error: postsError } = await supabase
      .from('gym_posts')
      .insert(posts)

    if (postsError) {
      console.error('Error inserting posts:', postsError)
      return
    }

    console.log(`Created ${posts.length} gym posts`)
    console.log('✅ Workout data seeding completed successfully!')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

seedWorkoutData()