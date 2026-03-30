'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/animations/animated-section'
import { 
  FaShoppingCart, 
  FaHeart, 
  FaBox, 
  FaTruck, 
  FaClock, 
  FaCheckCircle,
  FaMapMarkerAlt,
  FaCreditCard,
  FaUser,
  FaChartLine,
  FaArrowRight
} from 'react-icons/fa'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  total: number
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Date
  items: OrderItem[]
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  image: string
}

interface WishlistItem {
  id: string
  productId: string
  productName: string
  price: number
  image: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { totalItems } = useCart()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    savedItems: 0,
  })
  const [loading, setLoading] = useState(true)

  // Fetch dashboard data
  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch recent orders
      const ordersResponse = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const ordersData = await ordersResponse.json()
      
      if (ordersResponse.ok) {
        const orders = ordersData.data || []
        setRecentOrders(orders.slice(0, 5))
        
        const totalOrders = orders.length
        const totalSpent = orders.reduce((sum: number, order: Order) => sum + order.total, 0)
        
        setStats(prev => ({
          ...prev,
          totalOrders,
          totalSpent,
        }))
      }
      
      // Fetch wishlist
      const wishlistResponse = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const wishlistData = await wishlistResponse.json()
      
      if (wishlistResponse.ok) {
        const items = wishlistData.data || []
        setWishlistItems(items.slice(0, 4))
        setStats(prev => ({
          ...prev,
          wishlistCount: items.length,
        }))
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
      pending: { color: 'yellow', icon: FaClock, label: 'Pending' },
      processing: { color: 'blue', icon: FaClock, label: 'Processing' },
      confirmed: { color: 'purple', icon: FaCheckCircle, label: 'Confirmed' },
      shipped: { color: 'indigo', icon: FaTruck, label: 'Shipped' },
      delivered: { color: 'green', icon: FaCheckCircle, label: 'Delivered' },
      cancelled: { color: 'red', icon: FaClock, label: 'Cancelled' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const quickActions = [
    {
      title: 'Continue Shopping',
      description: 'Browse our latest products',
      icon: FaShoppingCart,
      href: '/products',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'View Orders',
      description: 'Track your recent orders',
      icon: FaBox,
      href: '/dashboard/orders',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Wishlist',
      description: `${stats.wishlistCount} items saved`,
      icon: FaHeart,
      href: '/dashboard/wishlist',
      color: 'from-red-500 to-pink-500',
    },
    {
      title: 'Account Settings',
      description: 'Update your profile',
      icon: FaUser,
      href: '/dashboard/settings',
      color: 'from-green-500 to-emerald-500',
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <AnimatedSection animation="fadeUp">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-purple-100 mb-4 md:mb-0">
                Here&apos;s what&apos;s happening with your account today.
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/products">
                <Button className="bg-white text-purple-600 hover:bg-purple-50">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Orders',
            value: stats.totalOrders,
            icon: FaBox,
            color: 'from-blue-500 to-cyan-500',
            change: '+12%',
          },
          {
            title: 'Total Spent',
            value: formatCurrency(stats.totalSpent),
            icon: FaChartLine,
            color: 'from-green-500 to-emerald-500',
            change: '+8%',
          },
          {
            title: 'Cart Items',
            value: totalItems,
            icon: FaShoppingCart,
            color: 'from-purple-500 to-pink-500',
            change: totalItems > 0 ? `${totalItems} items` : 'Empty',
          },
          {
            title: 'Wishlist',
            value: stats.wishlistCount,
            icon: FaHeart,
            color: 'from-red-500 to-pink-500',
            change: `${stats.wishlistCount} saved`,
          },
        ].map((stat, index) => (
          <AnimatedSection key={stat.title} delay={index * 0.1}>
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="text-white text-xl" />
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <AnimatedSection key={action.title} delay={index * 0.1}>
              <Link href={action.href}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className={`p-3 rounded-full bg-gradient-to-r ${action.color} w-fit mb-3`}>
                    <action.icon className="text-white text-lg" />
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </motion.div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-purple-600 hover:text-purple-700 text-sm flex items-center">
            View All <FaArrowRight className="ml-1 text-xs" />
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
            <Link href="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                 </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm">{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(order.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-purple-600 hover:text-purple-700 text-sm"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Wishlist Preview */}
      {wishlistItems.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Saved Items</h2>
            <Link href="/dashboard/wishlist" className="text-purple-600 hover:text-purple-700 text-sm flex items-center">
              View All <FaArrowRight className="ml-1 text-xs" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item, index) => (
              <AnimatedSection key={item.id} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                >
                  <div className="relative h-40">
                    <Image
                      src={item.image || '/placeholder.jpg'}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                      {item.productName}
                    </h3>
                    <p className="text-purple-600 font-bold mb-3">
                      {formatCurrency(item.price)}
                    </p>
                    <Link href={`/products/${item.productId}`}>
                      <Button size="sm" fullWidth>
                        View Product
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      )}

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaMapMarkerAlt className="text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Default Address</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            No address added yet. Add your first address for faster checkout.
          </p>
          <Link href="/dashboard/addresses">
            <Button variant="outline" size="sm">
              Add Address
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCreditCard className="text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800">Payment Methods</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            No payment methods saved. Add a payment method for quick checkout.
          </p>
          <Link href="/dashboard/payment-methods">
            <Button variant="outline" size="sm">
              Add Payment Method
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500 border border-gray-200">
        <p>
          Administrator: Hafiz Sajid Syed | Email: hafiz.sajid.syed@gmail.com
        </p>
      </div>
    </div>
  )
}