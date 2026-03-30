import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const updateProductSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long').optional(),
  price: z.number().positive('Price must be positive').optional(),
  category: z.enum(['COMPUTER', 'MOBILE', 'ACCESSORIES', 'GAMING', 'AUDIO']).optional(),
  images: z.array(z.string().url('Invalid image URL')).max(10, 'Maximum 10 images').optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative').optional(),
  featured: z.boolean().optional(),
})

// Helper function to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.split(' ')[1]
  
  if (!token) return false
  
  const decoded = await verifyToken(token)
  return decoded?.role === 'ADMIN'
}

// GET /api/products/[productId] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Fetch product with additional details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: {
          take: 5,
          orderBy: { id: 'desc' },
          include: {
            order: {
              select: {
                id: true,
                createdAt: true,
                status: true,
              }
            }
          }
        },
        cartItems: {
          take: 5,
          include: {
            cart: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate product statistics
    const totalOrders = product.orderItems.length
    const totalRevenue = product.orderItems.reduce(
      (sum: number, item) => sum + (item.price * item.quantity),
      0
    )
    const averageRating = 4.5 // This would come from a reviews table in real implementation

    return NextResponse.json({
      ...product,
      stats: {
        totalOrders,
        totalRevenue,
        averageRating,
        inCart: product.cartItems.length,
      }
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

// PUT /api/products/[productId] - Update product (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Check admin authentication
    const adminCheck = await isAdmin(request)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { productId } = await params

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = updateProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    const updateData = validation.data

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        orderItems: {
          take: 5,
          orderBy: { id: 'desc' }
        }
      }
    })

    // Log the update (for audit trail)
    console.log(`Product ${productId} updated by admin`, {
      productId,
      changes: updateData,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error('Error updating product:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// DELETE /api/products/[productId] - Delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Check admin authentication
    const adminCheck = await isAdmin(request)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { productId } = await params

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists and get its details for audit
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        orderItems: {
          select: {
            id: true,
            orderId: true,
          }
        },
        cartItems: {
          select: {
            id: true,
            cartId: true,
          }
        }
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if product has any orders
    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete product with existing orders',
          orderCount: existingProduct.orderItems.length,
          message: 'Please archive the product instead of deleting it'
        },
        { status: 409 }
      )
    }

    // Delete product (will cascade delete cart items due to foreign key constraints)
    const deletedProduct = await prisma.product.delete({
      where: { id: productId }
    })

    // Log the deletion (for audit trail)
    console.log(`Product ${productId} deleted by admin`, {
      productId,
      productName: existingProduct.name,
      cartItemsRemoved: existingProduct.cartItems.length,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      product: {
        id: deletedProduct.id,
        name: deletedProduct.name,
      },
      message: 'Product deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    
    // Handle specific Prisma errors
    if (error instanceof Error && error.message.includes('Foreign key constraint')) {
      return NextResponse.json(
        { 
          error: 'Cannot delete product because it is referenced in orders or carts',
          message: 'Please remove all references before deleting'
        },
        { status: 409 }
      )
    }

    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}

// PATCH /api/products/[productId] - Partial update (Admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Check admin authentication
    const adminCheck = await isAdmin(request)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { productId } = await params

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Parse and validate request body (allow partial updates)
    const body = await request.json()
    
    // Only validate fields that are present
    const validation = updateProductSchema.partial().safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    const updateData = validation.data

    // Update product with partial data
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        images: true,
        stock: true,
        featured: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error('Error patching product:', error)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

// POST /api/products/[productId]/stock - Update stock quantity (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    // Check admin authentication
    const adminCheck = await isAdmin(request)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { productId } = await params
    const body = await request.json()
    const { quantity, operation } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (typeof quantity !== 'number' || isNaN(quantity)) {
      return NextResponse.json(
        { error: 'Valid quantity is required' },
        { status: 400 }
      )
    }

    // Get current product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    let newStock: number
    let operationType: string

    // Handle different operations
    if (operation === 'add') {
      newStock = product.stock + quantity
      operationType = 'added'
    } else if (operation === 'subtract') {
      newStock = product.stock - quantity
      operationType = 'removed'
      if (newStock < 0) {
        return NextResponse.json(
          { error: 'Insufficient stock', currentStock: product.stock },
          { status: 400 }
        )
      }
    } else if (operation === 'set') {
      newStock = quantity
      operationType = 'set to'
    } else {
      // Default: set directly
      newStock = quantity
      operationType = 'set to'
    }

    // Update stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
      select: {
        id: true,
        name: true,
        stock: true,
        updatedAt: true,
      }
    })

    // Log stock change
    console.log(`Stock ${operationType} for product ${productId}`, {
      productId,
      productName: product.name,
      oldStock: product.stock,
      newStock,
      change: quantity,
      operation,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: `Stock ${operationType} successfully. New stock: ${newStock}`
    })
  } catch (error) {
    console.error('Error updating stock:', error)
    return NextResponse.json(
      { error: 'Failed to update stock' },
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}