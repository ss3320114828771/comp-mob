'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaGithub, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarker,
  FaShoppingCart,
  FaBox,
  FaInfoCircle,
  FaClock,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaCreditCard
} from 'react-icons/fa'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    
    setSubscribing(true)
    // Simulate API call
    setTimeout(() => {
      toast.success('Subscribed to newsletter!')
      setEmail('')
      setSubscribing(false)
    }, 1000)
  }

  const footerLinks = {
    shop: [
      { name: 'All Products', href: '/products', icon: FaBox },
      { name: 'New Arrivals', href: '/products?sort=newest', icon: FaClock },
      { name: 'Best Sellers', href: '/products?featured=true', icon: FaShoppingCart },
      { name: 'Special Offers', href: '/products?discount=true', icon: FaShieldAlt },
    ],
    support: [
      { name: 'Contact Us', href: '/contact', icon: FaEnvelope },
      { name: 'About Us', href: '/about', icon: FaInfoCircle },
      { name: 'Shipping Info', href: '/shipping', icon: FaTruck },
      { name: 'Returns', href: '/returns', icon: FaUndo },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy', icon: FaShieldAlt },
      { name: 'Terms of Service', href: '/terms', icon: FaCreditCard },
      { name: 'FAQ', href: '/faq', icon: FaInfoCircle },
    ]
  }

  const paymentMethods = [
    { name: 'Visa', icon: '💳' },
    { name: 'Mastercard', icon: '💳' },
    { name: 'PayPal', icon: '💰' },
    { name: 'Apple Pay', icon: '🍎' },
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto">
      {/* Decorative Top Border */}
      <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Company Info Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="mb-4">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                TechShop
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                Premium Computer & Mobile Accessories
              </p>
            </div>
            
            <p className="text-gray-300 mb-4 leading-relaxed">
              Your one-stop destination for high-quality computer and mobile accessories. 
              We provide premium products with exceptional customer service and fast delivery.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4 mb-6">
              <motion.a
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-purple-600 transition-all duration-300"
              >
                <FaFacebook className="text-xl" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-purple-600 transition-all duration-300"
              >
                <FaTwitter className="text-xl" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-purple-600 transition-all duration-300"
              >
                <FaInstagram className="text-xl" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-purple-600 transition-all duration-300"
              >
                <FaGithub className="text-xl" />
              </motion.a>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-gray-300">
                <FaEnvelope className="text-purple-400" />
                <span className="text-sm">hafiz.sajid.syed@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <FaPhone className="text-purple-400" />
                <span className="text-sm">+92 300 1234567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <FaMapMarker className="text-purple-400" />
                <span className="text-sm">Pakistan</span>
              </div>
            </div>
          </motion.div>

          {/* Shop Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold mb-4 text-purple-400">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-purple-400 transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <link.icon className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform inline-block">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-4 text-purple-400">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-purple-400 transition-all duration-300 flex items-center space-x-2 group"
                  >
                    <link.icon className="text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform inline-block">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-4 text-purple-400">Newsletter</h4>
            <p className="text-gray-300 text-sm mb-3">
              Subscribe for exclusive offers and updates!
            </p>
            <form onSubmit={handleNewsletter} className="mb-4">
              <div className="flex flex-col space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={subscribing}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </motion.button>
              </div>
            </form>
            
            {/* Admin Info */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Administrator</p>
              <p className="text-sm font-semibold text-purple-400">Hafiz Sajid Syed</p>
              <p className="text-xs text-gray-400 mt-1">hafiz.sajid.syed@gmail.com</p>
            </div>
          </motion.div>
        </div>

        {/* Payment Methods & Features */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex space-x-4">
              {paymentMethods.map((method, index) => (
                <motion.div
                  key={method.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-800 px-3 py-1 rounded-lg text-sm flex items-center space-x-1"
                >
                  <span>{method.icon}</span>
                  <span>{method.name}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="text-sm text-gray-400">
              <span>🔒 Secure Payment | </span>
              <span>🚚 Free Shipping Over $50 | </span>
              <span>✅ 30-Day Returns</span>
            </div>
          </div>
        </div>

        {/* Bismillah & Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-full">
              <p className="text-lg font-arabic text-emerald-400">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          </motion.div>
          
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} TechShop. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Developed with ❤️ by Hafiz Sajid Syed
          </p>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 z-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </footer>
  )
}