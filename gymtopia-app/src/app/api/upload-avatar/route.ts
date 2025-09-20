import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// 長期運用を考慮した堅牢な環境変数チェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 環境変数の存在チェック
function validateEnvironmentVariables(): { isValid: boolean; error?: string } {
  if (!supabaseUrl) {
    return { isValid: false, error: 'NEXT_PUBLIC_SUPABASE_URL environment variable is not configured' }
  }
  if (!supabaseServiceKey) {
    return { isValid: false, error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is not configured' }
  }
  return { isValid: true }
}

// 環境変数が有効な場合のみSupabaseクライアントを作成
function createSupabaseServiceClient() {
  const validation = validateEnvironmentVariables()
  if (!validation.isValid) {
    return null
  }
  return createClient(supabaseUrl!, supabaseServiceKey!)
}

export async function POST(request: NextRequest) {
  try {
    // 環境変数の検証（ビルド時エラー回避）
    const validation = validateEnvironmentVariables()
    if (!validation.isValid) {
      console.error('Environment configuration error:', validation.error)
      return NextResponse.json(
        {
          error: 'Avatar upload service is temporarily unavailable',
          details: 'Environment configuration required'
        },
        { status: 503 }
      )
    }

    // Supabaseクライアントの作成
    const supabaseService = createSupabaseServiceClient()
    if (!supabaseService) {
      return NextResponse.json(
        { error: 'Service initialization failed' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File and userId are required' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer()

    // Upload to Supabase Storage using service role
    const { data, error: uploadError } = await supabaseService.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      )
    }

    // Get the public URL
    const { data: urlData } = supabaseService.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}