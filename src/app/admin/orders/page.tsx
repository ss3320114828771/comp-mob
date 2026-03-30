'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  FaSearch, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaDownload,
  FaCheck,
  FaTimes,
  FaTruck,
  FaBox,
  FaClock,
  FaSync,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Order {
  id: string
  orderNumber: string
  userId: string
  user: {
    name: string
    email: string
    phone?: string
  }
  total: number
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  items: OrderItem[]
  shippingAddress: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: Date
  updatedAt: Date
  trackingNumber?: string
  estimatedDelivery?: Date
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  image: string
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow', icon: FaClock },
  { value: 'processing', label: 'Processing', color: 'blue', icon: FaSync },
  { value: 'confirmed', label: 'Confirmed', color: 'purple', icon: FaCheck },
  { value: 'shipped', label: 'Shipped', color: 'indigo', icon: FaTruck },
  { value: 'delivered', label: 'Delivered', color: 'green', icon: FaBox },
  { value: 'cancelled', label: 'Cancelled', color: 'red', icon: FaTimes },
  { value: 'refunded', label: 'Refunded', color: 'gray', icon: FaTimes },
]

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'refunded', label: 'Refunded', color: 'gray' },
]

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Check admin access
  useEffect(() => {
    if (isInitialized && (!user || user.role !== 'ADMIN')) {
      router.push('/')
      toast.error('Access denied. Admin only.')
    }
  }, [user, isInitialized, router])

  // Fetch orders
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setOrders(data.data || [])
      } else {
        toast.error(data.error || 'Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (response.ok) {
        toast.success(`Order status updated to ${status}`)
        fetchOrders()
        setShowStatusModal(false)
        setSelectedOrder(null)
      } else {
        toast.error(data.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        toast.success('Order cancelled successfully')
        fetchOrders()
      } else {
        toast.error(data.error || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Failed to cancel order')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status)
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    }
    return colors[statusConfig?.color as keyof typeof colors] || colors.gray
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = PAYMENT_STATUSES.find(s => s.value === status)
    const colors = {
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800',
    }
    return colors[statusConfig?.color as keyof typeof colors] || colors.gray
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === '' || order.status === filterStatus
    const matchesPayment = filterPaymentStatus === '' || order.paymentStatus === filterPaymentStatus
    
    return matchesSearch && matchesStatus && matchesPayment
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Export orders
  const exportOrders = () => {
    const data = filteredOrders.map(order => ({
      'Order ID': order.orderNumber,
      'Customer': order.user.name,
      'Email': order.user.email,
      'Total': order.total,
      'Status': order.status,
      'Payment Status': order.paymentStatus,
      'Date': formatDate(order.createdAt),
    }))
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${formatDate(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Orders exported successfully')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by order ID, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Payment Status Filter */}
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Payment Statuses</option>
              {PAYMENT_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Export Button */}
            <Button onClick={exportOrders} variant="outline" className="gap-2">
              <FaDownload /> Export
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{order.user.name}</div>
                        <div className="text-sm text-gray-500">{order.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(order.status)}`}>
                        {ORDER_STATUSES.find(s => s.value === order.status)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusBadge(order.paymentStatus)}`}>
                        {PAYMENT_STATUSES.find(s => s.value === order.paymentStatus)?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowDetailsModal(true)
                          }}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowStatusModal(true)
                          }}
                        >
                          <FaEdit />
                        </Button>
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => cancelOrder(order.id)}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
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

        {/* Order Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedOrder(null)
          }}
          title="Order Details"
          size="lg"
        >
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Placed on</p>
                  <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedOrder.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedOrder.user.email}</p>
                  </div>
                  {selectedOrder.user.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedOrder.user.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-3">Shipping Address</h3>
                <p className="text-gray-700">
                  {selectedOrder.shippingAddress.street}<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}<br />
                  {selectedOrder.shippingAddress.country}
                </p>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              {selectedOrder.trackingNumber && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold mb-2">Tracking Information</h3>
                  <p className="text-gray-700">Tracking Number: {selectedOrder.trackingNumber}</p>
                  {selectedOrder.estimatedDelivery && (
                    <p className="text-gray-700">Estimated Delivery: {formatDate(selectedOrder.estimatedDelivery)}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Update Status Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false)
            setSelectedOrder(null)
          }}
          title="Update Order Status"
        >
          {selectedOrder && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Current Status: <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedOrder.status)}`}>
                  {ORDER_STATUSES.find(s => s.value === selectedOrder.status)?.label}
                </span>
              </p>
              
              <select
                defaultValue={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                disabled={updatingStatus}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {ORDER_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              {updatingStatus && (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}