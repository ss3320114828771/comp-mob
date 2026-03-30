import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

// Validation schemas
const createProductSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  price: z.number()
    .positive('Price must be positive')
    .max(100000, 'Price cannot exceed $100,000'),
  category: z.enum(['COMPUTER', 'MOBILE', 'ACCESSORIES', 'GAMING', 'AUDIO']),
  images: z.array(z.string().url('Invalid image URL'))
    .max(10, 'Maximum 10 images allowed')
    .optional()
    .default([]),
  stock: z.number()
    .int('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .default(0),
  featured: z.boolean().default(false),
})

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().optional(),
  category: z.enum(['COMPUTER', 'MOBILE', 'ACCESSORIES', 'GAMING', 'AUDIO']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  featured: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'price', 'name', 'stock']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Helper function to check if user is admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.split(' ')[1]
  
  if (!token) return false
  
  const decoded = await verifyToken(token)
  return decoded?.role === 'ADMIN'
}

// GET /api/products - Get all products with filtering, pagination, and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate query parameters
    const query = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      featured: searchParams.get('featured'),
      inStock: searchParams.get('inStock'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    }

    const validation = querySchema.safeParse(query)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      )
    }

    const {
      page,
      limit,
      search,
      category,
      minPrice,
      maxPrice,
      featured,
      inStock,
      sortBy,
      sortOrder,
    } = validation.data

    // Build where clause
    const where: Prisma.ProductWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (featured !== undefined) {
      where.featured = featured
    }

    if (inStock !== undefined) {
      where.stock = inStock ? { gt: 0 } : 0
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const take = limit

    // Execute parallel queries for data and count
    const [products, totalCount, categoryStats, priceRange] = await Promise.all([
      // Get products with pagination
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          orderItems: {
            select: {
              quantity: true,
              price: true,
            }
          },
          cartItems: {
            select: {
              quantity: true,
            }
          }
        }
      }),
      
      // Get total count for pagination
      prisma.product.count({ where }),
      
      // Get category statistics
      prisma.product.groupBy({
        by: ['category'],
        where,
        _count: {
          id: true,
        },
        _sum: {
          stock: true,
        },
      }),
      
      // Get price range for filters
      prisma.product.aggregate({
        where,
        _min: {
          price: true,
        },
        _max: {
          price: true,
        },
      }),
    ])

    // Enhance products with computed fields
    const enhancedProducts = products.map(product => ({
      ...product,
      totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      inCart: product.cartItems.reduce((sum, item) => sum + item.quantity, 0),
      orderItems: undefined, // Remove orderItems from response
      cartItems: undefined, // Remove cartItems from response
    }))

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      success: true,
      data: enhancedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        categories: categoryStats.map(stat => ({
          name: stat.category,
          count: stat._count.id,
          totalStock: stat._sum.stock || 0,
        })),
        priceRange: {
          min: priceRange._min.price || 0,
          max: priceRange._max.price || 0,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create new product (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await isAdmin(request)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = createProductSchema.safeParse(body)

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

    const { name, description, price, category, images, stock, featured } = validation.data

    // Check if product with same name already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this name already exists' },
        { status: 409 }
      )
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        images,
        stock,
        featured,
      },
      include: {
        orderItems: {
          take: 0,
        },
        cartItems: {
          take: 0,
        },
      },
    })

    // Log product creation
    console.log(`Product created: ${product.id} - ${product.name}`, {
      productId: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      product,
      message: 'Product created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Product name must be unique' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

// PUT /api/products - Bulk update products (Admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await isAdmin(request)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, products } = body

    if (!action || !products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Invalid request. Action and products array required.' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'bulk-delete':
        // Bulk delete products (only if no orders exist)
        const productsToDelete = await prisma.product.findMany({
          where: {
            id: { in: products },
            orderItems: { none: {} },
          },
          select: { id: true, name: true },
        })

        const deletedIds = productsToDelete.map(p => p.id)
        
        if (deletedIds.length === 0) {
          return NextResponse.json(
            { error: 'No products available for deletion (products may have orders)' },
            { status: 400 }
          )
        }

        result = await prisma.product.deleteMany({
          where: {
            id: { in: deletedIds },
          },
        })

        return NextResponse.json({
          success: true,
          deletedCount: result.count,
          deletedProducts: productsToDelete,
          message: `Successfully deleted ${result.count} products`,
        })

      case 'bulk-update-stock':
        // Bulk update stock
        const updates = products.map(({ id, stock }) =>
          prisma.product.update({
            where: { id },
            data: { stock },
            select: { id: true, name: true, stock: true },
          })
        )
        
        const updatedProducts = await Promise.all(updates)
        
        return NextResponse.json({
          success: true,
          updatedCount: updatedProducts.length,
          products: updatedProducts,
          message: `Updated stock for ${updatedProducts.length} products`,
        })

      case 'bulk-featured':
        // Bulk update featured status
        result = await prisma.product.updateMany({
          where: {
            id: { in: products },
          },
          data: {
            featured: body.featured || false,
          },
        })

        return NextResponse.json({
          success: true,
          updatedCount: result.count,
          message: `Updated featured status for ${result.count} products`,
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: bulk-delete, bulk-update-stock, bulk-featured' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in bulk operation:', error)
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}

// DELETE /api/products - Delete all products (Admin only - careful!)
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await isAdmin(request)
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const confirm = searchParams.get('confirm')

    // Safety check - require confirmation
    if (confirm !== 'yes-i-really-want-to-delete-all-products') {
      return NextResponse.json(
        { 
          error: 'This action is destructive. Please provide confirmation parameter.',
          required: 'confirm=yes-i-really-want-to-delete-all-products'
        },
        { status: 400 }
      )
    }

    // Check if there are any products with orders
    const productsWithOrders = await prisma.product.findMany({
      where: {
        orderItems: {
          some: {},
        },
      },
      select: { id: true, name: true },
    })

    if (productsWithOrders.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete products that have orders',
          productsWithOrders,
          count: productsWithOrders.length,
          suggestion: 'Delete orders first or archive products instead',
        },
        { status: 409 }
      )
    }

    // Delete all products
    const result = await prisma.product.deleteMany({})

    // Log the mass deletion
    console.warn('MASS PRODUCT DELETION', {
      count: result.count,
      timestamp: new Date().toISOString(),
      adminAction: true,
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Successfully deleted ${result.count} products`,
    })
  } catch (error) {
    console.error('Error deleting all products:', error)
    return NextResponse.json(
      { error: 'Failed to delete products' },
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}