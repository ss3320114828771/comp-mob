'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useCart } from '@/hooks/use-cart'
import { 
  FaBars, 
  FaTimes, 
  FaShoppingCart, 
  FaUser, 
  FaHome, 
  FaBox, 
  FaInfoCircle, 
  FaEnvelope,
  FaSearch,
  FaHeart,
  FaTag,
  FaCrown,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaTachometerAlt,
  FaStore,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FaGift,
  FaHeadset,
  FaShieldAlt,
  FaTruck,
  FaUndo
} from 'react-icons/fa'
import toast from 'react-hot-toast'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const { items } = useCart()

  // Track scroll for navbar style
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      setIsOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
    toast.success('Logged out successfully')
  }

  const cartCount = items.length

  const mainMenuItems = [
    { href: '/', label: 'Home', icon: FaHome, color: 'text-purple-500' },
    { href: '/products', label: 'Products', icon: FaBox, color: 'text-blue-500' },
    { href: '/about', label: 'About Us', icon: FaInfoCircle, color: 'text-green-500' },
    { href: '/contact', label: 'Contact', icon: FaEnvelope, color: 'text-yellow-500' },
  ]

  const featuredItems = [
    { href: '/products?featured=true', label: 'Featured', icon: FaCrown, color: 'text-amber-500' },
    { href: '/products?discount=true', label: 'On Sale', icon: FaTag, color: 'text-red-500' },
    { href: '/wishlist', label: 'Wishlist', icon: FaHeart, color: 'text-pink-500' },
  ]

  const supportItems = [
    { href: '/shipping', label: 'Shipping Info', icon: FaTruck },
    { href: '/returns', label: 'Returns', icon: FaUndo },
    { href: '/faq', label: 'FAQ', icon: FaHeadset },
    { href: '/privacy', label: 'Privacy Policy', icon: FaShieldAlt },
  ]

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 md:hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 ${
          scrolled ? 'shadow-lg' : 'shadow-xl'
        }`}
      >
        <FaBars className="text-2xl" />
      </motion.button>

      {/* Cart Indicator Badge */}
      {cartCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-24 right-6 z-50 md:hidden bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg"
        >
          {cartCount}
        </motion.div>
      )}

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 md:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-4 shadow-lg z-10">
              <div className="flex justify-between items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <FaStore className="text-white text-xl" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">TechShop</h2>
                    <p className="text-white/80 text-xs">Premium Accessories</p>
                  </div>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="text-white p-2 hover:bg-white/20 rounded-full transition-all"
                >
                  <FaTimes className="text-2xl" />
                </motion.button>
              </div>

              {/* Search Bar */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSearch}
                className="mt-4"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-full bg-white/10 backdrop-blur-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 border border-white/20"
                    autoFocus
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" />
                </div>
              </motion.form>
            </div>

            {/* Menu Content */}
            <div className="p-4 pb-24">
              {/* User Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                {user ? (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <FaUser className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold">{user.name}</p>
                        <p className="text-white/60 text-sm">{user.email}</p>
                      </div>
                      {user.role === 'ADMIN' && (
                        <div className="bg-amber-500/20 px-2 py-1 rounded-full">
                          <span className="text-amber-400 text-xs font-semibold">ADMIN</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl text-center font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
                    >
                      <FaSignInAlt />
                      <span>Login</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-xl text-center font-semibold flex items-center justify-center space-x-2 border border-white/20 hover:bg-white/20 transition-all"
                    >
                      <FaUserPlus />
                      <span>Sign Up</span>
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Main Menu Items */}
              <div className="mb-6">
                <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                  Main Menu
                </h3>
                <div className="space-y-2">
                  {mainMenuItems.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white'
                              : 'text-white/80 hover:bg-white/10'
                          }`}
                        >
                          <item.icon className={`text-xl ${item.color}`} />
                          <span className="font-medium">{item.label}</span>
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="ml-auto w-1 h-6 bg-purple-400 rounded-full"
                            />
                          )}
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Cart & Dashboard */}
              <div className="mb-6">
                <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white hover:from-purple-600/50 hover:to-pink-600/50 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <FaShoppingCart className="text-xl" />
                      <span className="font-medium">Shopping Cart</span>
                    </div>
                    {cartCount > 0 && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {cartCount} items
                      </span>
                    )}
                  </Link>
                  
                  {user && (
                    <Link
                      href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/80 hover:bg-white/10 transition-all"
                    >
                      <FaTachometerAlt className="text-xl" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Featured Items */}
              <div className="mb-6">
                <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                  Featured
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {featuredItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex flex-col items-center space-y-2 px-3 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
                      >
                        <item.icon className={`text-2xl ${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-xs text-white/80 text-center">{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Support & Legal */}
              <div className="mb-6">
                <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                  Support
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {supportItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.03 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
                      >
                        <item.icon className="text-sm" />
                        <span>{item.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Admin Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-4 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl border border-emerald-500/30"
              >
                <div className="text-center">
                  <p className="text-emerald-400 text-sm font-arabic mb-2">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <p className="text-white/60 text-xs">Administrator</p>
                  <p className="text-white text-sm font-semibold">Hafiz Sajid Syed</p>
                  <p className="text-white/50 text-xs mt-1">hafiz.sajid.syed@gmail.com</p>
                </div>
              </motion.div>

              {/* Logout Button */}
              {user && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={handleLogout}
                  className="mt-6 w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </motion.button>
              )}
            </div>

            {/* Decorative Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-20 -left-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20" />
              <div className="absolute bottom-20 -right-20 w-60 h-60 bg-pink-500 rounded-full blur-3xl opacity-20" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-10" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}