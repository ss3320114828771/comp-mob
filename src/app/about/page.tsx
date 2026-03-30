'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { GradientText } from '@/components/animations/gradient-text'
import { AnimatedSection } from '@/components/animations/animated-section'
import { Button } from '@/components/ui/button'
import { 
  FaTrophy, 
  FaUsers, 
  FaBox, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FaTruck, 
  FaHeadset, 
  FaShieldAlt,
  FaHeart,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FaStar,
  FaRocket,
  FaGlobe,
  FaAward,
  FaHandsHelping
} from 'react-icons/fa'

export default function AboutPage() {
  const stats = [
    { number: '5+', label: 'Years of Excellence', icon: FaTrophy, color: 'text-yellow-500' },
    { number: '50K+', label: 'Happy Customers', icon: FaUsers, color: 'text-green-500' },
    { number: '500+', label: 'Products', icon: FaBox, color: 'text-blue-500' },
    { number: '24/7', label: 'Customer Support', icon: FaHeadset, color: 'text-purple-500' },
  ]

  const values = [
    {
      icon: FaHeart,
      title: 'Customer First',
      description: 'We prioritize our customers\' needs and satisfaction above everything else.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: FaShieldAlt,
      title: 'Quality Assurance',
      description: 'Every product undergoes strict quality checks before reaching you.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FaRocket,
      title: 'Innovation',
      description: 'Constantly evolving to bring you the latest in tech accessories.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: FaGlobe,
      title: 'Global Reach',
      description: 'Serving customers worldwide with fast and reliable shipping.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FaAward,
      title: 'Premium Quality',
      description: 'Only the best products from trusted manufacturers.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: FaHandsHelping,
      title: 'Community Support',
      description: 'Giving back to the community through various initiatives.',
      color: 'from-teal-500 to-green-500'
    }
  ]

  const milestones = [
    { year: '2020', title: 'Founded', description: 'TechShop was established with a vision to provide quality tech accessories.' },
    { year: '2021', title: 'First Milestone', description: 'Reached 10,000 happy customers and expanded product range.' },
    { year: '2022', title: 'Global Expansion', description: 'Started shipping internationally to serve customers worldwide.' },
    { year: '2023', title: 'Award Winner', description: 'Recognized as "Best Tech Accessory Store" by industry experts.' },
    { year: '2024', title: 'Innovation Hub', description: 'Launched new AI-powered recommendation system.' },
  ]

  const team = [
    {
      name: 'Hafiz Sajid Syed',
      role: 'Founder & CEO',
      image: '/avatar-placeholder.jpg',
      bio: 'Visionary leader with 10+ years of experience in tech industry.',
      social: { linkedin: '#', twitter: '#', github: '#' }
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
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="fadeLeft">
              <GradientText gradient="primary" size="3xl" weight="extrabold" className="mb-4">
                About TechShop
              </GradientText>
              <p className="text-xl text-gray-600 mb-6">
                Your trusted partner for premium computer and mobile accessories since 2020.
              </p>
              <p className="text-gray-600 mb-8">
                At TechShop, we believe that technology should enhance your life, not complicate it. 
                That&#39;s why we carefully curate our collection of computer and mobile accessories to 
                bring you only the best products that combine quality, functionality, and style.
              </p>
              <Link href="/products">
                <Button size="lg">
                  Shop Our Products
                </Button>
              </Link>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeRight" delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-2xl opacity-20" />
                <Image
                  src="/n6.jpeg"
                  alt="About TechShop"
                  width={500}
                  height={400}
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <GradientText gradient="primary" size="2xl" weight="bold">
              Our Impact
            </GradientText>
            <p className="text-gray-600 mt-4">
              Numbers that speak for themselves
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-4`}>
                    <stat.icon className={`text-4xl ${stat.color}`} />
                  </div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatedSection animation="fadeLeft">
              <div className="bg-white p-8 rounded-2xl shadow-lg h-full">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-purple-600 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To empower individuals with high-quality, innovative tech accessories that 
                  enhance productivity, creativity, and connectivity in their daily lives. 
                  We strive to make technology accessible, reliable, and enjoyable for everyone.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fadeRight" delay={0.2}>
              <div className="bg-white p-8 rounded-2xl shadow-lg h-full">
                <div className="text-5xl mb-4">👁️</div>
                <h3 className="text-2xl font-bold text-purple-600 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To become the world&#39;s most trusted destination for tech accessories, 
                  known for our commitment to quality, customer satisfaction, and innovation. 
                  We envision a future where technology seamlessly integrates with everyday life.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <GradientText gradient="primary" size="2xl" weight="bold">
              Our Core Values
            </GradientText>
            <p className="text-gray-600 mt-4">
              The principles that guide everything we do
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <AnimatedSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${value.color} text-white mb-4`}>
                    <value.icon className="text-2xl" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <GradientText gradient="primary" size="2xl" weight="bold">
              Our Journey
            </GradientText>
            <p className="text-gray-600 mt-4">
              Milestones that shaped TechShop
            </p>
          </AnimatedSection>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-600 to-pink-600 hidden md:block" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex flex-col md:flex-row ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full hidden md:block" />
                  
                  {/* Content */}
                  <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <AnimatedSection animation={index % 2 === 0 ? 'fadeLeft' : 'fadeRight'} delay={index * 0.1}>
                      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                        <div className="text-purple-600 font-bold text-xl mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </AnimatedSection>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <GradientText gradient="primary" size="2xl" weight="bold">
              Meet Our Founder
            </GradientText>
            <p className="text-gray-600 mt-4">
              The visionary behind TechShop
            </p>
          </AnimatedSection>

          <div className="max-w-md mx-auto">
            {team.map((member, index) => (
              <AnimatedSection key={index}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg"
                >
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-md opacity-50" />
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="rounded-full object-cover border-4 border-white"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-purple-600 font-semibold mb-3">{member.role}</p>
                  <p className="text-gray-600 mb-4">{member.bio}</p>
                  <div className="flex justify-center space-x-3">
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-purple-600 transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                    <a href={member.social.twitter} className="text-gray-400 hover:text-purple-600 transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.104c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0021.683-11.734c0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    <a href={member.social.github} className="text-gray-400 hover:text-purple-600 transition">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Join Our Community
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Be part of our growing family of tech enthusiasts. Experience the best in tech accessories.
            </p>
            <Link href="/products">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl"
              >
                Start Shopping
                <FaHeart className="ml-2" />
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
    </div>
  )
}