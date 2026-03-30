/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import { useCart } from '@/hooks/use-cart'
 
import { Button } from '@/components/ui/button'
import { 
  FaHome, 
  FaShoppingCart, 
  FaHeart, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBox,
  FaTachometerAlt,
  FaClipboardList,
  FaMapMarkerAlt,
  FaBell,
  FaCreditCard,
  FaQuestionCircle,
  FaHeadset,
  FaStore
} from 'react-icons/fa'
import toast from 'react-hot-toast'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: FaTachometerAlt },
  { name: 'My Orders', href: '/dashboard/orders', icon: FaClipboardList },
  { name: 'My Products', href: '/dashboard/products', icon: FaBox },
  { name: 'Wishlist', href: '/dashboard/wishlist', icon: FaHeart },
  { name: 'Addresses', href: '/dashboard/addresses', icon: FaMapMarkerAlt },
  { name: 'Payment Methods', href: '/dashboard/payment-methods', icon: FaCreditCard },
  { name: 'Notifications', href: '/dashboard/notifications', icon: FaBell },
  { name: 'Settings', href: '/dashboard/settings', icon: FaCog },
]

const bottomNavItems: NavItem[] = [
  { name: 'Help Center', href: '/help', icon: FaQuestionCircle },
  { name: 'Support', href: '/contact', icon: FaHeadset },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isInitialized, logout } = useAuth()
  const { totalItems } = useCart()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Check authentication
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/login')
      toast.error('Please login to access dashboard')
    }
  }, [user, isInitialized, router])

  // Track scroll for header style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [sidebarOpen])

  const handleLogout = async () => {
    await logout()
    router.push('/')
    toast.success('Logged out successfully')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, type: 'tween' }}
        className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-30 overflow-y-auto lg:translate-x-0 lg:static lg:z-0"
      >
        {/* Logo Section */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">TechShop</h1>
                <p className="text-xs text-gray-500">User Dashboard</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name || 'User'}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-white text-xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                }`}
              >
                <item.icon className="text-lg" />
                <span>{item.name}</span>
                {item.name === 'My Products' && totalItems > 0 && (
                  <span className="ml-auto bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200" />

          {/* Bottom Navigation */}
          <div className="space-y-1">
            {bottomNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-all duration-200"
              >
                <item.icon className="text-lg" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="lg:ml-0">
        {/* Header */}
        <header
          className={`sticky top-0 z-20 bg-white/90 backdrop-blur-md transition-all duration-300 ${
            scrolled ? 'shadow-md' : 'shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-4 lg:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition lg:hidden"
              >
                <FaBars className="text-gray-600 text-xl" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {navItems.find(item => isActive(item.href))?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <FaShoppingCart className="text-gray-600 text-xl" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Store Link */}
              <Link
                href="/"
                className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <FaStore className="text-gray-600" />
                <span className="text-sm text-gray-600">Visit Store</span>
              </Link>

              {/* User Menu (Mobile) */}
              <div className="relative lg:hidden">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                  <FaUser className="text-gray-600 text-xl" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
              <p>&copy; {new Date().getFullYear()} TechShop. All rights reserved.</p>
              <div className="flex space-x-4 mt-2 sm:mt-0">
                <Link href="/terms" className="hover:text-purple-600 transition">
                  Terms
                </Link>
                <Link href="/privacy" className="hover:text-purple-600 transition">
                  Privacy
                </Link>
                <Link href="/contact" className="hover:text-purple-600 transition">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Bismillah Tooltip (Optional) */}
      <div className="fixed bottom-4 left-4 z-50 hidden lg:block">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-3 py-1 rounded-full shadow-lg opacity-75 hover:opacity-100 transition">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      </div>
    </div>
  )
}