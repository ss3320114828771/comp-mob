'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GradientText } from '@/components/animations/gradient-text'
import { AnimatedSection } from '@/components/animations/animated-section'
import { 
  FaTrash, 
  FaPlus, 
  FaMinus, 
  FaShoppingCart, 
  FaArrowLeft,
  FaLock,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaGift,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FaTag,
  FaCheckCircle
} from 'react-icons/fa'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    subtotal, 
    shipping, 
    tax, 
    discount, 
    couponCode, 
    updateQuantity, 
    removeItem, 
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCart()
  const { user } = useAuth()
  const [couponInput, setCouponInput] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string, productName: string) => {
    if (confirm(`Remove ${productName} from cart?`)) {
      removeItem(productId)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error('Please enter a coupon code')
      return
    }
    
    setApplyingCoupon(true)
    const success = await applyCoupon(couponInput)
    if (success) {
      setCouponInput('')
    }
    setApplyingCoupon(false)
  }

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to checkout')
      return
    }
    
    setLoadingCheckout(true)
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Redirecting to checkout...')
    // In production, redirect to checkout page
    // router.push('/checkout')
    setLoadingCheckout(false)
  }

  const features = [
    { icon: FaTruck, title: 'Free Shipping', text: 'On orders over $50' },
    { icon: FaShieldAlt, title: 'Secure Payment', text: '100% secure checkout' },
    { icon: FaUndo, title: 'Easy Returns', text: '30-day return policy' },
    { icon: FaGift, title: 'Gift Options', text: 'Available on checkout' },
  ]

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShoppingCart className="text-4xl text-gray-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
              <p className="text-gray-500 mb-6">
                Looks like you haven&apos;t added any items to your cart yet.
              </p>
              <Link href="/products">
                <Button size="lg" fullWidth>
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
              <p className="text-gray-500 mt-1">{totalItems} items in your cart</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="gap-2">
                <FaArrowLeft /> Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <motion.div
                    key={item.productId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 flex flex-col sm:flex-row gap-4"
                  >
                    {/* Product Image */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                        <div>
                          <Link href={`/products/${item.productId}`}>
                            <h3 className="font-semibold text-gray-800 hover:text-purple-600 transition">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            Unit Price: {formatCurrency(item.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.productId, item.name)}
                          className="text-red-500 hover:text-red-600 transition"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaMinus className="text-sm" />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaPlus className="text-sm" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="font-bold text-purple-600">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          {item.quantity === item.stock && (
                            <p className="text-xs text-orange-500 mt-1">Max stock reached</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">{formatCurrency(tax)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {couponCode && `(${couponCode})`}</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-purple-600">{formatCurrency(totalPrice)}</span>
                  </div>
                  {subtotal < 50 && (
                    <p className="text-xs text-gray-500 mt-2">
                      Add {formatCurrency(50 - subtotal)} more for free shipping
                    </p>
                  )}
                </div>
              </div>

              {/* Coupon Code */}
              {!couponCode ? (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponInput}
                      variant="outline"
                    >
                      Apply
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Try: WELCOME10 (10% off), SAVE20 (20% off), FREESHIP (free shipping)
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-green-50 rounded-lg flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-green-700 text-sm">Coupon applied: {couponCode}</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-500 text-xs hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                onClick={handleCheckout}
                disabled={loadingCheckout}
                fullWidth
                size="lg"
                className="mb-4"
              >
                {loadingCheckout ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaLock className="mr-2" />
                    Proceed to Checkout
                  </>
                )}
              </Button>

              {/* Features */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="text-center">
                      <feature.icon className="text-purple-500 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-700">{feature.title}</p>
                      <p className="text-xs text-gray-500">{feature.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products Section */}
        <AnimatedSection className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* This would be populated with recommended products from API */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-500">Recommended products coming soon...</p>
            </div>
          </div>
        </AnimatedSection>

        {/* Admin Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Administrator: Hafiz Sajid Syed | Email: hafiz.sajid.syed@gmail.com</p>
        </div>
      </div>
    </div>
  )
}