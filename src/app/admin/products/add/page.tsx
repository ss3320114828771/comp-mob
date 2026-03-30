'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { ProductForm } from '@/components/products/product-form'
import { GradientText } from '@/components/animations/gradient-text'
import { Button } from '@/components/ui/button'
import { FaArrowLeft, FaPlus } from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function AddProductPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check admin access
  useEffect(() => {
    if (isInitialized && (!user || user.role !== 'ADMIN')) {
      router.push('/')
      toast.error('Access denied. Admin only.')
    }
  }, [user, isInitialized, router])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product')
      }
      
      toast.success('Product created successfully!')
      router.push('/admin/products')
      
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create product')
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking auth
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  // Redirect if not admin
  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="gap-2"
                >
                  <FaArrowLeft />
                  Back
                </Button>
              </div>
              <GradientText gradient="primary" size="2xl" weight="bold">
                Add New Product
              </GradientText>
              <p className="text-gray-600 mt-2">
                Create a new product for your store. Fill in all the details below.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg">
                <div className="flex items-center gap-2">
                  <FaPlus />
                  <span>New Product</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <ProductForm 
            onSubmit={handleSubmit} 
            isLoading={isSubmitting}
          />
        </div>

        {/* Quick Tips */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-3">💡 Quick Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Use clear, descriptive product names that include key features</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Write detailed descriptions highlighting benefits and specifications</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Upload high-quality images from multiple angles</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Set competitive prices based on market research</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Accurate stock levels help manage inventory</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Feature best-selling or new products to increase visibility</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500 border border-gray-200">
            <p>Administrator: Hafiz Sajid Syed | Email: hafiz.sajid.syed@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}