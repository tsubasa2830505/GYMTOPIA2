import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    const supabase = getSupabaseClient()

    let query = supabase
      .from('gyms')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true })

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Gyms API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch gyms', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      gyms: data || [],
      total: data?.length || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('Gyms API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, address, city, prefecture, latitude, longitude } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Gym name is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('gyms')
      .insert({
        name,
        address,
        city,
        prefecture,
        latitude,
        longitude,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Gym creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create gym', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      gym: data,
      success: true
    })
  } catch (error) {
    console.error('Gyms API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}