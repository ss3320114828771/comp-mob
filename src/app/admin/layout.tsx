'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { 
  FaTachometerAlt, 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartLine,
  FaTag,
  FaEnvelope,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FaFileAlt,
  FaBell,
  FaUserCircle,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa'
import toast from 'react-hot-toast'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: FaTachometerAlt,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: FaBox,
    children: [
      { name: 'All Products', href: '/admin/products', icon: FaBox },
      { name: 'Add New', href: '/admin/products/add', icon: FaPlus },
      { name: 'Categories', href: '/admin/categories', icon: FaTag },
    ],
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: FaShoppingCart,
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: FaUsers,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: FaChartLine,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: FaCog,
    children: [
      { name: 'General', href: '/admin/settings/general', icon: FaCog },
      { name: 'Payment', href: '/admin/settings/payment', icon: FaTag },
      { name: 'Shipping', href: '/admin/settings/shipping', icon: FaBox },
      { name: 'Email', href: '/admin/settings/email', icon: FaEnvelope },
    ],
  },
]

// Import FaPlus for the add product link
import { FaPlus } from 'react-icons/fa'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isInitialized, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedItems, setExpandedItems] = useState<string[]>(['Products', 'Settings'])

  // Check admin access
  useEffect(() => {
    if (isInitialized && (!user || user.role !== 'ADMIN')) {
      router.push('/')
      toast.error('Access denied. Admin only.')
    }
  }, [user, isInitialized, router])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(i => i !== itemName)
        : [...prev, itemName]
    )
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    toast.success('Logged out successfully')
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === href
    }
    return pathname.startsWith(href)
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
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(true)}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, type: 'tween' }}
        className="fixed top-0 left-0 bottom-0 w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white z-30 shadow-2xl overflow-y-auto"
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">TechShop</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            </Link>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <FaUserCircle className="text-xl" />
            </div>
            <div>
              <p className="font-semibold">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
              <span className="text-xs text-purple-400">Administrator</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="text-lg" />
                        <span>{item.name}</span>
                      </div>
                      {expandedItems.includes(item.name) ? (
                        <FaChevronDown className="text-sm" />
                      ) : (
                        <FaChevronRight className="text-sm" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedItems.includes(item.name) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-8 mt-1 space-y-1 overflow-hidden"
                        >
                          {item.children.map((child) => (
                            <Link
                              key={child.name}
                              href={child.href}
                              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                                isActive(child.href)
                                  ? 'bg-purple-600 text-white'
                                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                              }`}
                            >
                              <child.icon className="text-sm" />
                              <span className="text-sm">{child.name}</span>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="text-lg" />
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-72' : 'ml-0'
        }`}
      >
        {/* Top Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <FaBars className="text-gray-600 text-xl" />
              </button>
              <div className="hidden md:block">
                <h2 className="text-xl font-semibold text-gray-800">
                  {navItems.find(item => isActive(item.href))?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition">
                <FaBell className="text-gray-600 text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Admin Profile Dropdown (Mobile) */}
              <div className="md:hidden">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition">
                  <FaUserCircle className="text-gray-600 text-2xl" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}