'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'
import { useProducts } from '@/hooks/use-products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { ProductForm } from '@/components/products/product-form'
import type { Product as ProductType } from '@/types/product'
import { 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaStar, 
  FaStarHalfAlt,
  FaDownload,
  FaEye,
  FaBox,
  FaDollarSign,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

// Helper function for relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`
  if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`
  return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`
}

// Helper to safely get rating value
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getRatingValue(rating: any): number {
  if (typeof rating === 'number') return rating
  if (rating && typeof rating === 'object' && 'props' in rating) return 4.5
  return 4.5
}

export default function AdminProductsPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { products, loading, deleteProduct, toggleFeatured, fetchProducts } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterStock, setFilterStock] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Check admin access
  useEffect(() => {
    if (isInitialized && (!user || user.role !== 'ADMIN')) {
      router.push('/')
      toast.error('Access denied. Admin only.')
    }
  }, [user, isInitialized, router])

  // Categories for filtering
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'COMPUTER', label: 'Computer' },
    { value: 'MOBILE', label: 'Mobile' },
    { value: 'ACCESSORIES', label: 'Accessories' },
    { value: 'GAMING', label: 'Gaming' },
    { value: 'AUDIO', label: 'Audio' },
  ]

  const stockFilters = [
    { value: '', label: 'All Stock' },
    { value: 'in_stock', label: 'In Stock (>0)' },
    { value: 'low_stock', label: 'Low Stock (≤5)' },
    { value: 'out_of_stock', label: 'Out of Stock (0)' },
  ]

  // Convert products from hook to match ProductType safely
  const mappedProducts: ProductType[] = products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category as ProductType['category'],
    images: product.images,
    stock: product.stock,
    featured: product.featured,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    totalSold: product.totalSold,
    totalRevenue: product.totalRevenue,
    averageRating: getRatingValue(product.averageRating),
  }))

  // Filter products
  const filteredProducts = mappedProducts.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === '' || product.category === filterCategory
    
    let matchesStock = true
    if (filterStock === 'in_stock') matchesStock = product.stock > 0
    else if (filterStock === 'low_stock') matchesStock = product.stock > 0 && product.stock <= 5
    else if (filterStock === 'out_of_stock') matchesStock = product.stock === 0
    
    return matchesSearch && matchesCategory && matchesStock
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDelete = async (id: string) => {
    const success = await deleteProduct(id)
    if (success) {
      setShowDeleteModal(false)
      setSelectedProduct(null)
    }
  }

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    await toggleFeatured(id, !featured)
  }

  const handleEdit = (product: ProductType) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  const handleViewDetails = (product: ProductType) => {
    setSelectedProduct(product)
    setShowDetailsModal(true)
  }

  const exportProducts = () => {
    const data = filteredProducts.map(product => ({
      'ID': product.id,
      'Name': product.name,
      'Price': product.price,
      'Category': product.category,
      'Stock': product.stock,
      'Featured': product.featured ? 'Yes' : 'No',
      'Created': formatDate(product.createdAt),
      'Total Sold': product.totalSold || 0,
      'Total Revenue': product.totalRevenue || 0,
    }))
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-${formatDate(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Products exported successfully')
  }

  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return { color: 'red', text: 'Out of Stock', icon: FaTimesCircle }
    } else if (stock <= 5) {
      return { color: 'orange', text: 'Low Stock', icon: FaBox }
    } else {
      return { color: 'green', text: 'In Stock', icon: FaCheckCircle }
    }
  }

  const renderStars = (rating: number = 4.5) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400 w-3 h-3" />)
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400 w-3 h-3" />)
    }
    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="text-gray-300 w-3 h-3" />)
    }
    return stars
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
              <p className="text-gray-600 mt-2">Manage your products, inventory, and pricing</p>
            </div>
            <Button onClick={() => router.push('/admin/products/add')} className="gap-2">
              <FaPlus /> Add New Product
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-gray-800">{filteredProducts.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaBox className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Value</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatCurrency(filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0))}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaDollarSign className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredProducts.filter(p => p.stock === 0).length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FaTimesCircle className="text-red-600 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Featured Products</p>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredProducts.filter(p => p.featured).length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaStar className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {stockFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {/* Export Button */}
            <Button onClick={exportProducts} variant="outline" className="gap-2">
              <FaDownload /> Export
            </Button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                      </div>
                    </td>
                  </tr>
                ) : paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => {
                    const stockBadge = getStockBadge(product.stock)
                    const StockIcon = stockBadge.icon
                    
                    return (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={product.images[0] || '/placeholder.jpg'}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {product.description || 'No description'}
                              </div>
                              <div className="flex items-center mt-1">
                                {renderStars(product.averageRating || 4.5)}
                                <span className="text-xs text-gray-500 ml-1">
                                  ({product.totalSold || 0} sold)
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-purple-600">
                            {formatCurrency(product.price)}
                          </div>
                          {product.totalRevenue && product.totalRevenue > 0 && (
                            <div className="text-xs text-gray-500">
                              Revenue: {formatCurrency(product.totalRevenue)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <StockIcon className={`text-${stockBadge.color}-500`} />
                            <span className={`text-${stockBadge.color}-600 font-medium`}>
                              {stockBadge.text}
                            </span>
                            <span className="text-gray-500">({product.stock})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleFeatured(product.id, product.featured)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                              product.featured
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {product.featured ? 'Featured' : 'Not Featured'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(product)}
                            >
                              <FaEye />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedProduct(product)
                                setShowDeleteModal(true)
                              }}
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <FaChevronLeft />
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedProduct(null)
          }}
          title="Delete Product"
        >
          {selectedProduct && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete <strong className="text-red-600">{selectedProduct.name}</strong>?
              </p>
              <p className="text-sm text-gray-500">
                This action cannot be undone. All data related to this product will be permanently removed.
              </p>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedProduct(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleDelete(selectedProduct.id)}
                >
                  Delete Product
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Edit Product Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedProduct(null)
          }}
          title="Edit Product"
          size="lg"
        >
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              onSubmit={async () => {
                await fetchProducts()
                setShowEditModal(false)
                setSelectedProduct(null)
              }}
            />
          )}
        </Modal>

        {/* Product Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedProduct(null)
          }}
          title="Product Details"
          size="lg"
        >
          {selectedProduct && (
            <div className="space-y-4">
              {/* Images */}
              <div className="grid grid-cols-3 gap-2">
                {selectedProduct.images.slice(0, 3).map((img, idx) => (
                  <div key={idx} className="relative h-32 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={img}
                      alt={`${selectedProduct.name} - ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-800">{selectedProduct.name}</h3>
                <p className="text-gray-600 mt-1">{selectedProduct.description || 'No description'}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(selectedProduct.price)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Stock</p>
                  <p className={`text-xl font-bold ${
                    selectedProduct.stock === 0 ? 'text-red-600' : 
                    selectedProduct.stock <= 5 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {selectedProduct.stock} units
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-lg font-semibold">{selectedProduct.category}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm">{formatDate(selectedProduct.createdAt)}</p>
                  <p className="text-xs text-gray-500">{getRelativeTime(selectedProduct.createdAt)}</p>
                </div>
              </div>

              {/* Sales Stats */}
              {(selectedProduct.totalSold || selectedProduct.totalRevenue) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Sales Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Sold</p>
                      <p className="text-lg font-bold">{selectedProduct.totalSold || 0} units</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="text-lg font-bold">{formatCurrency(selectedProduct.totalRevenue || 0)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}