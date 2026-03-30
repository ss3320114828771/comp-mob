/* eslint-disable @typescript-eslint/no-empty-object-type */
'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

export interface Product {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  averageRating(averageRating: any): import("react").ReactNode
  id: string
  name: string
  description: string | null
  price: number
  category: 'COMPUTER' | 'MOBILE' | 'ACCESSORIES' | 'GAMING' | 'AUDIO'
  images: string[]
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  totalSold?: number
  totalRevenue?: number
  inCart?: number
}

export interface ProductFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  inStock?: boolean
  sortBy?: 'createdAt' | 'price' | 'name' | 'stock'
  sortOrder?: 'asc' | 'desc'
}

export interface ProductsResponse {
  success: boolean
  data: Product[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters: {
    categories: Array<{
      name: string
      count: number
      totalStock: number
    }>
    priceRange: {
      min: number
      max: number
    }
  }
}

export interface ApiErrorResponse {
  error: string
  details?: Array<{
    field: string
    message: string
  }>
}

export interface CreateProductInput {
  name: string
  description?: string
  price: number
  category: Product['category']
  images?: string[]
  stock?: number
  featured?: boolean
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface StockUpdateResponse {
  success: boolean
  product: Product
  message: string
}

export interface BulkDeleteResponse {
  success: boolean
  deletedCount: number
  deletedProducts: Array<{ id: string; name: string }>
  message: string
}

export interface BulkStockUpdateResponse {
  success: boolean
  updatedCount: number
  products: Array<{ id: string; name: string; stock: number }>
  message: string
}

export interface ProductAnalytics {
  productId: string
  productName: string
  totalOrders: number
  totalQuantitySold: number
  totalRevenue: number
  averageOrderValue: number
  currentStock: number
  createdAt: Date
  lastUpdated: Date
}

export function useProducts(initialFilters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProductFilters>(initialFilters)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [filtersInfo, setFiltersInfo] = useState({
    categories: [] as Array<{ name: string; count: number; totalStock: number }>,
    priceRange: { min: 0, max: 1000 },
  })

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Build query string
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
      
      const response = await fetch(`/api/products?${params.toString()}`)
      const data: ProductsResponse = await response.json()
      
      if (!response.ok) {
        const errorData = data as unknown as ApiErrorResponse
        throw new Error(errorData.error || 'Failed to fetch products')
      }
      
      setProducts(data.data)
      setPagination(data.pagination)
      setFiltersInfo(data.filters)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const createProduct = useCallback(async (productData: CreateProductInput) => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      toast.error('Please login to add products')
      return null
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        const errorData = data as ApiErrorResponse
        throw new Error(errorData.error || 'Failed to create product')
      }
      
      toast.success('Product created successfully')
      await fetchProducts()
      return data.product
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product'
      toast.error(errorMessage)
      return null
      
    } finally {
      setLoading(false)
    }
  }, [fetchProducts])

  const updateProduct = useCallback(async (id: string, productData: UpdateProductInput) => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      toast.error('Please login to update products')
      return null
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        const errorData = data as ApiErrorResponse
        throw new Error(errorData.error || 'Failed to update product')
      }
      
      toast.success('Product updated successfully')
      await fetchProducts()
      return data.product
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product'
      toast.error(errorMessage)
      return null
      
    } finally {
      setLoading(false)
    }
  }, [fetchProducts])

  const deleteProduct = useCallback(async (id: string) => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      toast.error('Please login to delete products')
      return false
    }
    
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return false
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        const errorData = data as ApiErrorResponse
        throw new Error(errorData.error || 'Failed to delete product')
      }
      
      toast.success('Product deleted successfully')
      await fetchProducts()
      return true
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      toast.error(errorMessage)
      return false
      
    } finally {
      setLoading(false)
    }
  }, [fetchProducts])

  const updateStock = useCallback(async (id: string, quantity: number, operation: 'add' | 'subtract' | 'set') => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      toast.error('Please login to update stock')
      return null
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/products/${id}/stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity, operation }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        const errorData = data as ApiErrorResponse
        throw new Error(errorData.error || 'Failed to update stock')
      }
      
      toast.success(data.message)
      await fetchProducts()
      return data.product
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stock'
      toast.error(errorMessage)
      return null
      
    } finally {
      setLoading(false)
    }
  }, [fetchProducts])

  const bulkDeleteProducts = useCallback(async (productIds: string[]) => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      toast.error('Please login to delete products')
      return false
    }
    
    if (!confirm(`Are you sure you want to delete ${productIds.length} products? This action cannot be undone.`)) {
      return false
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'bulk-delete',
          products: productIds,
        }),
      })
      
      const data = await response.json() as BulkDeleteResponse
      
      if (!response.ok) {
        const errorData = data as unknown as ApiErrorResponse
        throw new Error(errorData.error || 'Failed to delete products')
      }
      
      toast.success(`Successfully deleted ${data.deletedCount} products`)
      await fetchProducts()
      return true
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete products'
      toast.error(errorMessage)
      return false
      
    } finally {
      setLoading(false)
    }
  }, [fetchProducts])

  const bulkUpdateStock = useCallback(async (updates: Array<{ id: string; stock: number }>) => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      toast.error('Please login to update stock')
      return false
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'bulk-update-stock',
          products: updates,
        }),
      })
      
      const data = await response.json() as BulkStockUpdateResponse
      
      if (!response.ok) {
        const errorData = data as unknown as ApiErrorResponse
        throw new Error(errorData.error || 'Failed to update stock')
      }
      
      toast.success(data.message)
      await fetchProducts()
      return true
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update stock'
      toast.error(errorMessage)
      return false
      
    } finally {
      setLoading(false)
    }
  }, [fetchProducts])

  const toggleFeatured = useCallback(async (id: string, featured: boolean) => {
    const token = localStorage.getItem('token')
    
    if (!token) {
      toast.error('Please login to update products')
      return false
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ featured }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        const errorData = data as ApiErrorResponse
        throw new Error(errorData.error || 'Failed to update product')
      }
      
      toast.success(featured ? 'Product marked as featured' : 'Product removed from featured')
      await fetchProducts()
      return true
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product'
      toast.error(errorMessage)
      return false
      
    } finally {
      setLoading(false)
    }
  }, [fetchProducts])

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    filters,
    setFilters,
    pagination,
    filtersInfo,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    bulkDeleteProducts,
    bulkUpdateStock,
    toggleFeatured,
  }
}

// Helper hook for single product
export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/products/${id}`)
        const data = await response.json()
        
        if (!response.ok) {
          const errorData = data as ApiErrorResponse
          throw new Error(errorData.error || 'Failed to fetch product')
        }
        
        setProduct(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [id])

  return { product, loading, error }
}

// Helper hook for featured products
export function useFeaturedProducts(limit: number = 6) {
  const { products, loading, error } = useProducts({ featured: true, limit })
  return { featuredProducts: products, loading, error }
}

// Helper hook for product categories
export function useCategories() {
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products?limit=1')
        const data = await response.json() as ProductsResponse
        
        if (data.filters?.categories) {
          setCategories(data.filters.categories)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  return { categories, loading }
}

// Helper hook for product search
export function useProductSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  
  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=10`)
      const data = await response.json() as ProductsResponse
      
      if (response.ok) {
        setResults(data.data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery) {
        searchProducts(searchQuery)
      } else {
        setResults([])
      }
    }, 300)
    
    return () => clearTimeout(delayDebounce)
  }, [searchQuery, searchProducts])
  
  return {
    searchQuery,
    setSearchQuery,
    results,
    loading,
  }
}

// Helper hook for product analytics (admin only)
export function useProductAnalytics(productId: string) {
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!productId) return
    
    const fetchAnalytics = async () => {
      const token = localStorage.getItem('token')
      
      try {
        const response = await fetch(`/api/products/${productId}/analytics`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        
        const data = await response.json() as ProductAnalytics | ApiErrorResponse
        
        if (response.ok) {
          setAnalytics(data as ProductAnalytics)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAnalytics()
  }, [productId])
  
  return { analytics, loading }
}