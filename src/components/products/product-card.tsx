'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card, CardImage, CardContent, CardFooter } from '@/components/ui/card'
import { FaHeart, FaShoppingCart, FaEye, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'
import toast from 'react-hot-toast'

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

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured' | 'horizontal'
  showActions?: boolean
  showRating?: boolean
  showQuickView?: boolean
  onQuickView?: (product: Product) => void
  onAddToWishlist?: (product: Product) => void
}

export function ProductCard({
  product,
  variant = 'default',
  showActions = true,
  showRating = true,
  showQuickView = true,
  onQuickView,
  onAddToWishlist
}: ProductCardProps) {
  const { addItem } = useCart()
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)

  // Calculate rating (mock data - in real app, this would come from product)
  const rating = product.averageRating || 4.5
  const reviewCount = product.reviewCount || 128

  // Render stars based on rating
  const renderStars = () => {
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

  const handleAddToCart = async () => {
    if (product.stock === 0) {
      toast.error('Product is out of stock')
      return
    }
    
    setIsAdding(true)
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 500))
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.jpg',
      stock: product.stock,
      quantity: 1,
    })
    
    setIsAdding(false)
  }

  const handleAddToWishlist = () => {
    onAddToWishlist?.(product)
    toast.success('Added to wishlist')
  }

  const handleQuickView = () => {
    onQuickView?.(product)
  }

  // Variant-specific styles
  const getCardVariant = () => {
    switch (variant) {
      case 'featured':
        return 'gradient'
      case 'horizontal':
        return 'glass'
      default:
        return 'default'
    }
  }

  const getImageHeight = () => {
    switch (variant) {
      case 'compact':
        return 'h-40'
      case 'horizontal':
        return 'h-full'
      default:
        return 'h-56'
    }
  }

  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  // Horizontal variant layout
  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image Section */}
          <div className="relative sm:w-48 h-48 sm:h-auto bg-gray-100">
            <Image
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold px-3 py-1 bg-red-600 rounded-full text-sm">
                  Out of Stock
                </span>
              </div>
            )}
            {isLowStock && !isOutOfStock && (
              <div className="absolute top-2 left-2">
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  Low Stock
                </span>
              </div>
            )}
            {product.featured && (
              <div className="absolute top-2 right-2">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full">
                  Featured
                </span>
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div>
                <Link href={`/products/${product.id}`}>
                  <h3 className="text-lg font-semibold hover:text-purple-600 transition line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                {showRating && (
                  <div className="flex items-center space-x-1 mt-1">
                    {renderStars()}
                    <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-purple-600">
                  ${product.price.toFixed(2)}
                </span>
                {product.totalSold && (
                  <p className="text-xs text-gray-500">{product.totalSold} sold</p>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {product.description}
            </p>
            
            {showActions && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    disabled={isAdding || isOutOfStock}
                    className="flex-1"
                  >
                    {isAdding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  {showQuickView && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleQuickView}
                    >
                      <FaEye />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddToWishlist}
                  >
                    <FaHeart />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Default and compact variants
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <Card variant={getCardVariant()} hover={true} padding={variant === 'compact' ? 'sm' : 'md'}>
        {/* Image Section */}
        <div className="relative">
          <div className={`relative ${getImageHeight()} w-full overflow-hidden rounded-t-xl`}>
            <Image
              src={product.images[currentImage] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          
          {/* Image Gallery Dots */}
          {product.images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    currentImage === index
                      ? 'bg-purple-600 w-3'
                      : 'bg-white/80 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOutOfStock && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                Out of Stock
              </span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                Only {product.stock} left
              </span>
            )}
            {product.featured && !isOutOfStock && (
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full">
                Featured
              </span>
            )}
          </div>
          
          {/* Quick Action Buttons */}
          <AnimatePresence>
            {isHovered && showActions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2"
              >
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className="transform hover:scale-105"
                >
                  <FaShoppingCart className="mr-2" />
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </Button>
                {showQuickView && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleQuickView}
                    className="transform hover:scale-105"
                  >
                    <FaEye />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddToWishlist}
                  className="transform hover:scale-105"
                >
                  <FaHeart />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Content Section */}
        <CardContent>
          <Link href={`/products/${product.id}`}>
            <h3 className={`font-semibold hover:text-purple-600 transition line-clamp-2 ${
              variant === 'compact' ? 'text-sm' : 'text-lg'
            }`}>
              {product.name}
            </h3>
          </Link>
          
          {variant !== 'compact' && product.description && (
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
          
          {showRating && variant !== 'compact' && (
            <div className="flex items-center space-x-1 mt-2">
              {renderStars()}
              <span className="text-xs text-gray-500 ml-1">({reviewCount})</span>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3">
            <div>
              <span className={`font-bold text-purple-600 ${
                variant === 'compact' ? 'text-lg' : 'text-2xl'
              }`}>
                ${product.price.toFixed(2)}
              </span>
              {product.totalSold && variant !== 'compact' && (
                <p className="text-xs text-gray-500">{product.totalSold} sold</p>
              )}
            </div>
            
            {!showActions && variant !== 'compact' && (
              <Link href={`/products/${product.id}`}>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
        
        {/* Footer for compact variant */}
        {variant === 'compact' && showActions && (
          <CardFooter divider={false}>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              fullWidth
            >
              {isAdding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
}

// Product Card Grid Component
interface ProductGridProps {
  products: Product[]
  variant?: ProductCardProps['variant']
  columns?: 2 | 3 | 4
  showActions?: boolean
  showRating?: boolean
  onQuickView?: (product: Product) => void
  onAddToWishlist?: (product: Product) => void
}

export function ProductGrid({
  products,
  variant = 'default',
  columns = 3,
  showActions = true,
  showRating = true,
  onQuickView,
  onAddToWishlist
}: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }
  
  return (
    <div className={`grid ${gridCols[columns]} gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          showActions={showActions}
          showRating={showRating}
          onQuickView={onQuickView}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  )
}

// Skeleton Loader for Product Card
export function ProductCardSkeleton({ variant = 'default' }: { variant?: ProductCardProps['variant'] }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className={`bg-gray-200 ${variant === 'compact' ? 'h-40' : 'h-56'}`} />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-full mb-1" />
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  )
}