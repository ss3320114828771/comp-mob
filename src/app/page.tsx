'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { GradientText } from '@/components/animations/gradient-text'
import { AnimatedSection } from '@/components/animations/animated-section'
import { ThreeDCard } from '@/components/animations/3d-card'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/products/product-card'
import { 
  FaTruck, 
  FaShieldAlt, 
  FaUndo, 
  FaHeadset,
  FaArrowRight,
  FaGift
} from 'react-icons/fa'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  images: string[]
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date  // Added missing property
  totalSold?: number
  averageRating?: number
  reviewCount?: number
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    orders: 0,
    satisfaction: 0
  })

  // Fetch featured products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch featured products
        const featuredRes = await fetch('/api/products?featured=true&limit=6')
        const featuredData = await featuredRes.json()
        setFeaturedProducts(featuredData.data || [])

        // Fetch new arrivals
        const newRes = await fetch('/api/products?sortBy=createdAt&sortOrder=desc&limit=6')
        const newData = await newRes.json()
        setNewArrivals(newData.data || [])

        // Fetch stats (mock data - in production, get from API)
        setStats({
          customers: 12500,
          products: 500,
          orders: 25000,
          satisfaction: 98
        })
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Categories data
  const categories = [
    { name: 'Computer', icon: '💻', color: 'from-blue-500 to-cyan-500', count: 120, image: '/n1.jpeg' },
    { name: 'Mobile', icon: '📱', color: 'from-green-500 to-emerald-500', count: 85, image: '/n2.jpeg' },
    { name: 'Accessories', icon: '🎧', color: 'from-purple-500 to-pink-500', count: 200, image: '/n3.jpeg' },
    { name: 'Gaming', icon: '🎮', color: 'from-red-500 to-orange-500', count: 95, image: '/n4.jpeg' },
    { name: 'Audio', icon: '🔊', color: 'from-indigo-500 to-purple-500', count: 110, image: '/n5.jpeg' }
  ]

  // Features data
  const features = [
    {
      icon: FaTruck,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50',
      color: 'text-blue-500'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure Payment',
      description: '100% secure payment processing',
      color: 'text-green-500'
    },
    {
      icon: FaUndo,
      title: '30-Day Returns',
      description: 'Easy returns within 30 days',
      color: 'text-orange-500'
    },
    {
      icon: FaHeadset,
      title: '24/7 Support',
      description: 'Dedicated customer support',
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Bismillah Section */}
      <div className="container mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg">
            <h2 className="text-2xl font-arabic text-white">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </h2>
          </div>
        </motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50" />
        
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <AnimatedSection animation="fadeLeft">
              <div className="space-y-6">
                <GradientText 
                  gradient="primary" 
                  size="3xl" 
                  weight="extrabold"
                  className="text-5xl md:text-6xl leading-tight"
                  animate={true}
                >
                  Premium Tech Accessories
                </GradientText>
                
                <p className="text-xl text-gray-600">
                  Discover the best computer and mobile accessories at unbeatable prices. 
                  Quality products, fast delivery, and exceptional customer service.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link href="/products">
                    <Button size="lg" className="group">
                      Shop Now
                      <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.customers.toLocaleString()}+</div>
                    <div className="text-sm text-gray-500">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.products}+</div>
                    <div className="text-sm text-gray-500">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.orders.toLocaleString()}+</div>
                    <div className="text-sm text-gray-500">Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{stats.satisfaction}%</div>
                    <div className="text-sm text-gray-500">Satisfaction</div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Right Content - 3D Card */}
            <AnimatedSection animation="fadeRight" delay={0.2}>
              <ThreeDCard glareEnabled tiltEnabled>
                <div className="relative rounded-2xl overflow-hidden">
                  <Image
                    src="/n6.jpeg"
                    alt="Featured Product"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-sm opacity-90">Limited Time Offer</p>
                    <h3 className="text-2xl font-bold">Summer Sale</h3>
                    <p className="text-lg">Up to 50% off</p>
                  </div>
                </div>
              </ThreeDCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <GradientText gradient="primary" size="2xl" weight="bold">
              Why Choose TechShop?
            </GradientText>
            <p className="text-gray-600 mt-4">
              We provide the best shopping experience with premium quality products
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-4`}>
                    <feature.icon className={`text-4xl ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <GradientText gradient="primary" size="2xl" weight="bold">
                Featured Products
              </GradientText>
              <p className="text-gray-600 mt-2">Our hand-picked selection of premium products</p>
            </div>
            <Link href="/products?featured=true">
              <Button variant="outline" className="group">
                View All
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <GradientText gradient="primary" size="2xl" weight="bold">
              Shop by Category
            </GradientText>
            <p className="text-gray-600 mt-4">Browse our extensive collection by category</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <Link href={`/products?category=${category.name.toUpperCase()}`}>
                  <motion.div
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer"
                  >
                    <div className="relative h-64">
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={300}
                        height={256}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-70 transition-opacity`} />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="text-4xl mb-2">{category.icon}</div>
                        <h3 className="text-xl font-bold">{category.name}</h3>
                        <p className="text-sm opacity-90">{category.count} Products</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <GradientText gradient="secondary" size="2xl" weight="bold">
                New Arrivals
              </GradientText>
              <p className="text-gray-600 mt-2">Check out our latest products</p>
            </div>
            <Link href="/products?sortBy=createdAt&sortOrder=desc">
              <Button variant="outline" className="group">
                View All
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-56 bg-gray-200" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Upgrade Your Tech?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers and experience the best in tech accessories
            </p>
            <Link href="/products">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl"
              >
                Start Shopping Now
                <FaGift className="ml-2" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Admin Info Bar */}
      <div className="bg-gray-900 text-white py-3">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>
            Administrator: Hafiz Sajid Syed | Email: hafiz.sajid.syed@gmail.com
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}