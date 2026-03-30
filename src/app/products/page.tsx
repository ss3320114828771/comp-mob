/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GradientText } from '@/components/animations/gradient-text'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AnimatedSection } from '@/components/animations/animated-section'
import { 
  FaSearch, 
  FaShoppingCart, 
  FaHeart, 
  FaEye, 
  FaStar, 
  FaStarHalfAlt,
  FaRegStar,
  FaFilter,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaBox,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaList,
  FaThLarge
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { formatCurrency } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  images: string[]
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  totalSold?: number
  averageRating?: number
  reviewCount?: number
}

export default function ProductsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addItem } = useCart()
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'createdAt' | 'price' | 'name' | 'stock'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 })
  const [selectedCategory, setSelectedCategory] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState<Array<{ name: string; count: number }>>([])
  const [priceRangeInfo, setPriceRangeInfo] = useState({ min: 0, max: 1000 })
  const itemsPerPage = 12

  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const page = searchParams.get('page')
    
    if (category) setSelectedCategory(category)
    if (search) setSearchTerm(search)
    if (featured === 'true') setFeaturedOnly(true)
    if (page) setCurrentPage(parseInt(page))
  }, [searchParams])

  // Fetch products
  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [sortBy, sortOrder, priceRange, selectedCategory, inStockOnly, featuredOnly, currentPage, searchTerm])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', itemsPerPage.toString())
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      if (priceRange.min > 0) params.append('minPrice', priceRange.min.toString())
      if (priceRange.max < 1000) params.append('maxPrice', priceRange.max.toString())
      if (selectedCategory) params.append('category', selectedCategory)
      if (inStockOnly) params.append('inStock', 'true')
      if (featuredOnly) params.append('featured', 'true')
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/products?${params.toString()}`)
      const data = await response.json()
      
      if (response.ok) {
        setProducts(data.data)
        setTotalPages(data.pagination.totalPages)
        setPriceRangeInfo(data.filters.priceRange)
        setPriceRange({
          min: data.filters.priceRange.min,
          max: data.filters.priceRange.max,
        })
      } else {
        toast.error(data.error || 'Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products?limit=1')
      const data = await response.json()
      if (response.ok && data.filters?.categories) {
        setCategories(data.filters.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast.error('Product is out of stock')
      return
    }
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.jpg',
      stock: product.stock,
      quantity: 1,
    })
  }

  const renderStars = (rating: number = 4.5) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400 w-4 h-4" />)
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400 w-4 h-4" />)
    }
    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-gray-300 w-4 h-4" />)
    }
    return stars
  }

  const applyFilters = () => {
    setCurrentPage(1)
    fetchProducts()
    setShowFilters(false)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setPriceRange({ min: priceRangeInfo.min, max: priceRangeInfo.max })
    setSelectedCategory('')
    setInStockOnly(false)
    setFeaturedOnly(false)
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }

  const features = [
    { icon: FaTruck, title: 'Free Shipping', description: 'On orders over $50' },
    { icon: FaShieldAlt, title: 'Secure Payment', description: '100% secure checkout' },
    { icon: FaUndo, title: 'Easy Returns', description: '30-day return policy' },
    { icon: FaBox, title: 'Quality Products', description: 'Premium quality guaranteed' },
  ]

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">All Products</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Discover our premium collection of computer and mobile accessories
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bismillah Section */}
      <div className="container mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg">
            <h2 className="text-lg font-arabic text-white">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h2>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Features Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg p-4 text-center shadow-md">
              <feature.icon className="text-2xl text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">{feature.title}</h3>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search Input */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setSortBy(newSortBy as any)
                setSortOrder(newSortOrder as 'asc' | 'desc')
                applyFilters()
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>

            {/* Filter Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
              className="gap-2"
            >
              <FaFilter /> Filters
            </Button>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition ${
                  viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'
                }`}
              >
                <FaThLarge />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 transition ${
                  viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600'
                }`}
              >
                <FaList />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
            <Button onClick={resetFilters}>Clear Filters</Button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={viewMode === 'grid'
                    ? 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition group'
                    : 'bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition flex'
                  }
                >
                  {/* Image */}
                  <div className={viewMode === 'grid' ? 'relative h-48' : 'relative w-48 h-48 flex-shrink-0'}>
                    <Image
                      src={product.images[0] || '/placeholder.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-bold px-3 py-1 bg-red-600 rounded-full text-sm">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {product.featured && product.stock > 0 && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-lg hover:text-purple-600 transition line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center space-x-1 mt-1">
                      {renderStars(product.averageRating)}
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xl font-bold text-purple-600">
                        {formatCurrency(product.price)}
                      </span>
                      {product.totalSold && (
                        <span className="text-xs text-gray-500">{product.totalSold} sold</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="flex-1"
                      >
                        <FaShoppingCart className="mr-2" />
                        Add to Cart
                      </Button>
                      <Button size="sm" variant="outline">
                        <FaHeart />
                      </Button>
                      <Link href={`/products/${product.id}`}>
                        <Button size="sm" variant="outline">
                          <FaEye />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <FaChevronLeft />
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-4 space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-3">Categories</h3>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-700">All Categories</span>
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === ''}
                        onChange={() => setSelectedCategory('')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                    </label>
                    {categories.map((cat) => (
                      <label key={cat.name} className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-700">{cat.name} ({cat.count})</span>
                        <input
                          type="radio"
                          name="category"
                          value={cat.name}
                          checked={selectedCategory === cat.name}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-3">Price Range</h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-600">Min ($)</label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm text-gray-600">Max ($)</label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <input
                    type="range"
                    min={priceRangeInfo.min}
                    max={priceRangeInfo.max}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-full mt-4"
                  />
                </div>

                {/* Availability */}
                <div>
                  <h3 className="font-semibold mb-3">Availability</h3>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>

                {/* Featured */}
                <div>
                  <h3 className="font-semibold mb-3">Featured</h3>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span>Featured Products</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button onClick={applyFilters} className="flex-1">Apply Filters</Button>
                  <Button variant="outline" onClick={resetFilters} className="flex-1">Reset All</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Admin Info */}
      <div className="bg-gray-900 text-white py-3 mt-8">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>Administrator: Hafiz Sajid Syed | Email: hafiz.sajid.syed@gmail.com</p>
        </div>
      </div>
    </div>
  )
}