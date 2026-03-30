'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GradientText } from '@/components/animations/gradient-text'
import { AnimatedSection } from '@/components/animations/animated-section'
import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUser, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FaComment,
  FaPaperPlane,
  FaCheckCircle,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaHeadset,
  FaTruck,
  FaShieldAlt,
  FaUndo
} from 'react-icons/fa'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    setSubmitting(true)
    
    try {
      // Send email via API
      const response = await fetch('/api/email?type=contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSubmitted(true)
        toast.success('Message sent successfully! We\'ll get back to you soon.')
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        })
      } else {
        throw new Error(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const contactInfo = [
    {
      icon: FaEnvelope,
      title: 'Email Us',
      details: ['hafiz.sajid.syed@gmail.com', 'support@techshop.com'],
      color: 'from-blue-500 to-cyan-500',
      action: 'mailto:hafiz.sajid.syed@gmail.com',
    },
    {
      icon: FaPhone,
      title: 'Call Us',
      details: ['+92 300 1234567', '+92 321 7654321'],
      color: 'from-green-500 to-emerald-500',
      action: 'tel:+923001234567',
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Visit Us',
      details: ['123 Tech Street, Islamabad', 'Pakistan'],
      color: 'from-red-500 to-pink-500',
      action: 'https://maps.google.com',
    },
    {
      icon: FaClock,
      title: 'Business Hours',
      details: ['Mon-Fri: 9:00 AM - 6:00 PM', 'Sat: 10:00 AM - 4:00 PM', 'Sun: Closed'],
      color: 'from-purple-500 to-indigo-500',
    },
  ]

  const features = [
    { icon: FaHeadset, title: '24/7 Support', description: 'Round-the-clock assistance' },
    { icon: FaTruck, title: 'Fast Response', description: 'Within 24 hours' },
    { icon: FaShieldAlt, title: 'Secure Communication', description: 'Your data is safe' },
    { icon: FaUndo, title: 'Satisfaction Guaranteed', description: 'We value your feedback' },
  ]

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for contacting us. We&apos;ll get back to you within 24 hours.
            </p>
            <Button onClick={() => setSubmitted(false)}>
              Send Another Message
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-block px-6 py-2 bg-white/20 rounded-full mb-4">
              <p className="text-sm">Get in Touch</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Bismillah Section */}
      <div className="container mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg">
            <h2 className="text-lg font-arabic text-white">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h2>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Features Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={index * 0.1}>
              <div className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition">
                <feature.icon className="text-2xl text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-500">{feature.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <AnimatedSection animation="fadeLeft">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <GradientText gradient="primary" size="xl" weight="bold">
                  Send Us a Message
                </GradientText>
                <p className="text-gray-500 mt-2">
                  Fill out the form below and we&apos;ll get back to you shortly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className="pl-10"
                      error={errors.name}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="pl-10"
                      error={errors.email}
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is this regarding?"
                    error={errors.subject}
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={submitting}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.message.length}/2000 characters
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  fullWidth
                  size="lg"
                  className="mt-6"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </AnimatedSection>

          {/* Contact Information */}
          <AnimatedSection animation="fadeRight" delay={0.2}>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${info.color}`}>
                      <info.icon className="text-white text-xl" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-2">{info.title}</h3>
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-gray-600 text-sm">
                          {detail}
                        </p>
                      ))}
                      {info.action && (
                        <a
                          href={info.action}
                          target={info.action.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="inline-block mt-2 text-purple-600 text-sm hover:underline"
                        >
                          Get in touch →
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Social Media Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="font-semibold text-gray-800 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition"
                  >
                    <FaFacebook />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:scale-110 transition"
                  >
                    <FaTwitter />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:scale-110 transition"
                  >
                    <FaLinkedin />
                  </a>
                </div>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>

        {/* Map Section */}
        <AnimatedSection className="mt-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="h-96 bg-gray-200 relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3319.202497573478!2d73.047616!3d33.684422!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbfd0781d7c3d%3A0x5f4b6c8e9e5c6b7d!2sIslamabad%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="TechShop Location"
              />
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