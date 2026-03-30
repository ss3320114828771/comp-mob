/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaSave, FaTimes, FaTrash, FaPlus } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Product, CreateProductInput } from '@/types/product'
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '@/types/product'
import toast from 'react-hot-toast'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: CreateProductInput) => Promise<void>
  isLoading?: boolean
}

export function ProductForm({ product, onSubmit, isLoading = false }: ProductFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CreateProductInput>({
    name: '',
    description: '',
    price: 0,
    category: 'ACCESSORIES',
    images: [],
    stock: 0,
    featured: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with product data if editing
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category: product.category,
        images: product.images || [],
        stock: product.stock,
        featured: product.featured,
      })
    }
  }, [product])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Product name must be at least 2 characters'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Product name must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters'
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    } else if (formData.price > 100000) {
      newErrors.price = 'Price cannot exceed $100,000'
    }

    const currentStock = formData.stock ?? 0
    if (currentStock < 0) {
      newErrors.stock = 'Stock cannot be negative'
    } else if (currentStock > 999999) {
      newErrors.stock = 'Stock cannot exceed 999,999'
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageUrlChange = (index: number, url: string) => {
    const newImages = [...(formData.images || [])]
    newImages[index] = url
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), ''] }))
  }

  const removeImageField = (index: number) => {
    const newImages = [...(formData.images || [])]
    newImages.splice(index, 1)
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    // Filter out empty image URLs
    const filteredImages = (formData.images || []).filter(img => img.trim() !== '')
    
    const submitData = {
      ...formData,
      images: filteredImages,
    }
    
    setIsSubmitting(true)
    
    try {
      await onSubmit(submitData)
      toast.success(product ? 'Product updated successfully!' : 'Product created successfully!')
      router.push('/admin/products')
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              error={errors.name}
              disabled={isLoading || isSubmitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              placeholder="Enter product description"
              disabled={isLoading || isSubmitting}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {(formData.description || '').length}/2000 characters
            </p>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) *
              </label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                error={errors.price}
                disabled={isLoading || isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Quantity *
              </label>
              <Input
                type="number"
                name="stock"
                value={formData.stock ?? 0}
                onChange={handleChange}
                placeholder="0"
                step="1"
                min="0"
                error={errors.stock}
                disabled={isLoading || isSubmitting}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              disabled={isLoading || isSubmitting}
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          {/* Featured Product */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              disabled={isLoading || isSubmitting}
            />
            <label className="ml-2 block text-sm text-gray-700">
              Feature this product (display on homepage)
            </label>
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Product Images</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addImageField}
            disabled={isLoading || isSubmitting || (formData.images?.length || 0) >= 10}
          >
            <FaPlus className="mr-2" />
            Add Image URL
          </Button>
        </div>
        
        <div className="space-y-3">
          {(formData.images || []).length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No images added. Click &quot;Add Image URL&quot; to add product images.
            </p>
          ) : (
            (formData.images || []).map((url, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    disabled={isLoading || isSubmitting}
                  />
                  {url && (
                    <div className="mt-2">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeImageField(index)}
                  disabled={isLoading || isSubmitting}
                  className="text-red-600 hover:text-red-700"
                >
                  <FaTrash />
                </Button>
              </div>
            ))
          )}
        </div>
        
        <p className="mt-4 text-xs text-gray-500">
          Enter image URLs. First image will be used as the main product image.
          Supported formats: JPG, PNG, GIF, WEBP
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading || isSubmitting}
        >
          <FaTimes className="mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isSubmitting}
          className="min-w-[120px]"
        >
          {(isLoading || isSubmitting) ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <FaSave className="mr-2" />
              {product ? 'Update Product' : 'Create Product'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

// Product Form Modal for quick editing
interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product
  onSubmit: (data: CreateProductInput) => Promise<void>
}

export function ProductFormModal({ isOpen, onClose, product, onSubmit }: ProductFormModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {product ? 'Edit Product' : 'Create New Product'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="p-6">
            <ProductForm product={product} onSubmit={onSubmit} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// Product Form Skeleton Loader
export function ProductFormSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
        
        <div className="space-y-4">
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
          
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>
          
          <div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
      
      <div className="flex justify-end gap-3">
        <div className="h-10 w-24 bg-gray-200 rounded" />
        <div className="h-10 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  )
}