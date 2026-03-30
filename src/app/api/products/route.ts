import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// Validation schemas
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const skip = (page - 1) * limit
    const take = limit

    const [products, totalCount, categoryStats, priceRange] = await Promise.all([
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
      prisma.product.count({ where }),
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

    const enhancedProducts = products.map(product => ({
      ...product,
      totalSold: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      totalRevenue: product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      inCart: product.cartItems.reduce((sum, item) => sum + item.quantity, 0),
      orderItems: undefined,
      cartItems: undefined,
    }))

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

// POST, PUT, DELETE functions continue...