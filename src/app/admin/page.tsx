/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useProducts } from '@/hooks/use-products'
import { Button } from '@/components/ui/button'
import { 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaDollarSign,
  FaEye,
  FaStar,
  FaTruck,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf
} from 'react-icons/fa'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

// Types
interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: Date
  user?: {
    name: string
    email: string
  }
}

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  outOfStockProducts: number
  featuredProducts: number
  revenueChange: number
  ordersChange: number
  customersChange: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { products, loading: productsLoading } = useProducts()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    featuredProducts: 0,
    revenueChange: 12.5,
    ordersChange: 8.3,
    customersChange: 5.2,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Check admin access
  useEffect(() => {
    if (isInitialized && (!user || user.role !== 'ADMIN')) {
      router.push('/')
      toast.error('Access denied. Admin only.')
    }
  }, [user, isInitialized, router])

  // Fetch dashboard data
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchDashboardData()
    }
  }, [user, products])

  const fetchDashboardData = async () => {
    try {
      // Calculate product stats
      const totalProducts = products.length
      const featuredProducts = products.filter(p => p.featured).length
      const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length
      const outOfStockProducts = products.filter(p => p.stock === 0).length

      // Fetch orders from API
      const ordersResponse = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const ordersData = await ordersResponse.json()
      
      if (ordersResponse.ok) {
        const orders = ordersData.data || []
        const totalOrders = orders.length
        const pendingOrders = orders.filter((o: Order) => o.status === 'pending').length
        const totalRevenue = orders.reduce((sum: number, o: Order) => sum + o.total, 0)
        
        // Get unique customers
        const uniqueCustomers = new Set(orders.map((o: Order) => o.user?.email)).size
        
        // Get recent orders
        const recent = orders
          .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
        
        setRecentOrders(recent)
        
        setStats(prev => ({
          ...prev,
          totalProducts,
          totalOrders,
          totalCustomers: uniqueCustomers,
          totalRevenue,
          pendingOrders,
          lowStockProducts,
          outOfStockProducts,
          featuredProducts,
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
      processing: { color: 'blue', icon: FaHourglassHalf, label: 'Processing' },
      confirmed: { color: 'purple', icon: FaCheckCircle, label: 'Confirmed' },
      shipped: { color: 'indigo', icon: FaTruck, label: 'Shipped' },
      delivered: { color: 'green', icon: FaCheckCircle, label: 'Delivered' },
      cancelled: { color: 'red', icon: FaTimesCircle, label: 'Cancelled' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <config.icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    )
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: FaDollarSign,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-100',
      change: stats.revenueChange,
      changeType: 'up',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: FaShoppingCart,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-100',
      change: stats.ordersChange,
      changeType: 'up',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: FaBox,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-100',
      change: 0,
      changeType: 'neutral',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      icon: FaUsers,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-100',
      change: stats.customersChange,
      changeType: 'up',
    },
  ]

  if (!isInitialized || loading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user.name}! Here&apos;s what&apos;s happening with your store.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/products/add">
            <Button variant="outline" className="gap-2">
              <FaBox /> Add Product
            </Button>
          </Link>
          <Link href="/admin/orders">
            <Button className="gap-2">
              <FaEye /> View All Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  {card.change !== 0 && (
                    <div className={`flex items-center mt-2 text-xs ${card.changeType === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {card.changeType === 'up' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                      {Math.abs(card.change)}% from last month
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`text-2xl text-${card.color.split('-')[1]}-600`} />
                </div>
              </div>
            </div>
            <div className={`h-1 bg-gradient-to-r ${card.color}`} />
          </motion.div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Pending Orders</h3>
            <FaClock className="text-yellow-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.pendingOrders}</p>
          <p className="text-sm text-gray-500 mt-2">Orders waiting for processing</p>
          {stats.pendingOrders > 0 && (
            <Link href="/admin/orders?status=pending" className="mt-4 inline-block text-purple-600 text-sm hover:underline">
              View pending orders →
            </Link>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Low Stock Alert</h3>
            <FaBox className="text-orange-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.lowStockProducts}</p>
          <p className="text-sm text-gray-500 mt-2">Products with ≤5 units left</p>
          {stats.lowStockProducts > 0 && (
            <Link href="/admin/products?filterStock=low_stock" className="mt-4 inline-block text-purple-600 text-sm hover:underline">
              View low stock products →
            </Link>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Featured Products</h3>
            <FaStar className="text-yellow-500 text-xl" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.featuredProducts}</p>
          <p className="text-sm text-gray-500 mt-2">Products on homepage</p>
          {stats.featuredProducts > 0 && (
            <Link href="/admin/products?filterFeatured=true" className="mt-4 inline-block text-purple-600 text-sm hover:underline">
              View featured products →
            </Link>
          )}
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          <Link href="/admin/orders" className="text-purple-600 text-sm hover:underline">
            View All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-900">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.user?.name || 'Guest'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user?.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/products/add">
              <Button variant="outline" className="w-full gap-2">
                <FaBox /> Add Product
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="outline" className="w-full gap-2">
                <FaShoppingCart /> View Orders
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" className="w-full gap-2">
                <FaBox /> Manage Products
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full gap-2">
                <FaChartLine /> Settings
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6"
        >
          <h3 className="font-semibold text-gray-800 mb-4">Admin Info</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <strong className="text-gray-800">Administrator:</strong> Hafiz Sajid Syed
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-800">Email:</strong> hafiz.sajid.syed@gmail.com
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-800">Role:</strong> Super Administrator
            </p>
            <p className="text-gray-600">
              <strong className="text-gray-800">Last Login:</strong> {formatDate(new Date())}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}