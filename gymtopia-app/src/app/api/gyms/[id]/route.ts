import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gymId } = await params

    // ジム基本情報を取得
    const { data: gym, error: gymError } = await supabase
      .from('gyms')
      .select('*')
      .eq('id', gymId)
      .single()

    if (gymError || !gym) {
      return NextResponse.json(
        { error: 'Gym not found' },
        { status: 404 }
      )
    }

    // ジム詳細情報を取得
    const { data: detailedInfo } = await supabase
      .from('gym_detailed_info')
      .select('*')
      .eq('gym_id', gymId)
      .single()

    // マシン情報を取得
    const { data: machines } = await supabase
      .from('gym_machines')
      .select('*')
      .eq('gym_id', gymId)

    // フリーウェイト情報を取得
    const { data: freeWeights } = await supabase
      .from('gym_free_weights')
      .select('*')
      .eq('gym_id', gymId)

    // お気に入り数を取得
    const { count: favoriteCount } = await supabase
      .from('favorite_gyms')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)

    // レスポンスデータを構築
    const response = {
      gym: {
        ...gym,
        detailedInfo,
        machines: machines || [],
        freeWeights: freeWeights || [],
        favoriteCount: favoriteCount || 0
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching gym:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gymId } = await params
    const body = await request.json()

    // ジム基本情報を更新
    if (body.basicInfo) {
      const { error: updateError } = await supabase
        .from('gyms')
        .update({
          name: body.basicInfo.name,
          address: body.basicInfo.address,
          business_hours: body.basicInfo.business_hours,
          phone: body.basicInfo.phone,
          website: body.basicInfo.website,
          facilities: body.basicInfo.facilities
        })
        .eq('id', gymId)

      if (updateError) {
        throw updateError
      }
    }

    // 詳細情報を更新
    if (body.detailedInfo) {
      const { error: detailError } = await supabase
        .from('gym_detailed_info')
        .upsert({
          gym_id: gymId,
          ...body.detailedInfo,
          updated_at: new Date().toISOString()
        })

      if (detailError) {
        throw detailError
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating gym:', error)
    return NextResponse.json(
      { error: 'Failed to update gym' },
      { status: 500 }
    )
  }
}