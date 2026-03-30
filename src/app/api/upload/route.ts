import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Helper function to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.split(' ')[1]
  
  if (!token) return false
  
  const decoded = await verifyToken(token)
  return decoded?.role === 'ADMIN'
}

// Generate unique filename
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${random}.${extension}`
}

// Validate file type
function isValidImageType(mimeType: string): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(mimeType.toLowerCase())
}

// GET /api/upload - Get upload configuration
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const adminCheck = await isAdmin(request)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      config: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        uploadEndpoint: '/api/upload',
        maxFiles: 10,
      }
    })
  } catch (error) {
    console.error('Error getting upload config:', error)
    return NextResponse.json(
      { error: 'Failed to get upload configuration' },
      { status: 500 }
    )
  }
}

// POST /api/upload - Upload image
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const adminCheck = await isAdmin(request)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    if (!isValidImageType(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type',
          allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        },
        { status: 400 }
      )
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` },
        { status: 400 }
      )
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    
    // In production with Vercel, we have several options:
    // 1. Upload to Vercel Blob Storage (recommended)
    // 2. Upload to external service like Cloudinary, AWS S3, etc.
    // 3. Save to /public/uploads (not recommended for Vercel serverless)
    
    // For Vercel deployment, we'll use Vercel Blob Storage
    // If you don't have Vercel Blob configured, we'll return a placeholder
    
    let imageUrl = ''
    
    // Option 1: Vercel Blob Storage (requires @vercel/blob package)
    if (process.env.VERCEL_BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob')
        const blob = await put(`products/${filename}`, file, {
          access: 'public',
          token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
        })
        imageUrl = blob.url
      } catch (blobError) {
        console.error('Vercel Blob upload failed:', blobError)
        // Fallback to local storage
        imageUrl = await saveToLocalStorage(file, filename)
      }
    } else {
      // Option 2: Local storage (for development)
      imageUrl = await saveToLocalStorage(file, filename)
    }

    // Log upload
    console.log(`Image uploaded: ${filename}`, {
      filename,
      size: file.size,
      type: file.type,
      url: imageUrl,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      url: imageUrl,
      filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      message: 'Image uploaded successfully',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

// Helper function to save to local storage
async function saveToLocalStorage(file: File, filename: string): Promise<string> {
  // In a real implementation, you would save this to a cloud storage service
  // For development, we'll simulate a local URL
  
  // Note: In Vercel serverless, you cannot write to the filesystem
  // So this is only for development with a proper storage solution
  
  // For production with Vercel, you should use:
  // - Vercel Blob Storage
  // - Cloudinary
  // - AWS S3
  // - Supabase Storage
  // - etc.
  
  // Return a placeholder URL (in production, use actual cloud storage)
  return `/uploads/${filename}`
}

// DELETE /api/upload - Delete uploaded image
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const adminCheck = await isAdmin(request)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const filename = searchParams.get('filename')

    if (!url && !filename) {
      return NextResponse.json(
        { error: 'URL or filename is required' },
        { status: 400 }
      )
    }

    // Delete from storage
    if (process.env.VERCEL_BLOB_READ_WRITE_TOKEN && url) {
      try {
        const { del } = await import('@vercel/blob')
        await del(url)
      } catch (blobError) {
        console.error('Failed to delete from Vercel Blob:', blobError)
      }
    }

    // Log deletion
    console.log(`Image deleted: ${filename || url}`, {
      url,
      filename,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}

// OPTIONS - Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}