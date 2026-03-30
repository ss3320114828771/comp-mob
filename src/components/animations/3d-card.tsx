'use client'

import { useState, useRef } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import Image from 'next/image'

interface ThreeDCardProps {
  children: React.ReactNode
  className?: string
  glareEnabled?: boolean
  tiltEnabled?: boolean
  scaleOnHover?: boolean
  perspective?: number
  glareColor?: string
  backgroundImage?: string
  gradientOverlay?: boolean
  shineEffect?: boolean
  borderGlow?: boolean
  onClick?: () => void
}

export function ThreeDCard({
  children,
  className = '',
  glareEnabled = true,
  tiltEnabled = true,
  scaleOnHover = true,
  perspective = 1000,
  glareColor = 'rgba(255, 255, 255, 0.3)',
  backgroundImage,
  gradientOverlay = true,
  shineEffect = true,
  borderGlow = true,
  onClick
}: ThreeDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  // Motion values for smooth spring animations
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !tiltEnabled) return

    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseXPos = e.clientX - centerX
    const mouseYPos = e.clientY - centerY
    
    // Calculate rotation (max 15 degrees)
    const maxRotate = 15
    const rotateYValue = (mouseXPos / (rect.width / 2)) * maxRotate
    const rotateXValue = -(mouseYPos / (rect.height / 2)) * maxRotate
    
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
    
    // Calculate glare position
    if (glareEnabled) {
      const glareX = (e.clientX - rect.left) / rect.width
      const glareY = (e.clientY - rect.top) / rect.height
      setGlarePosition({ x: glareX, y: glareY })
    }
    
    // Update motion values
    mouseX.set(rotateYValue)
    mouseY.set(rotateXValue)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotateX(0)
    setRotateY(0)
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <motion.div
      ref={cardRef}
      className={`relative cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onClick={onClick}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
      }}
      whileHover={scaleOnHover ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="relative w-full h-full rounded-2xl overflow-hidden"
        style={{
          rotateX: tiltEnabled ? rotateX : 0,
          rotateY: tiltEnabled ? rotateY : 0,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
          boxShadow: borderGlow && isHovered 
            ? '0 0 20px rgba(139, 92, 246, 0.5)' 
            : '0 10px 30px -10px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Background Image */}
        {backgroundImage && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        
        {/* Gradient Overlay */}
        {gradientOverlay && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20" />
        )}
        
        {/* Shine Effect */}
        {shineEffect && isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2 }}
          />
        )}
        
        {/* Glare Effect */}
        {glareEnabled && isHovered && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x * 100}% ${glarePosition.y * 100}%, ${glareColor}, transparent 70%)`,
            }}
          />
        )}
        
        {/* Content */}
        <div 
          className="relative z-10 h-full"
          style={{
            transform: 'translateZ(20px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

// 3D Card with Floating Elements
interface FloatingCardProps {
  children: React.ReactNode
  className?: string
  floatingElements?: Array<{
    icon: React.ReactNode
    delay: number
    x: number
    y: number
  }>
}

export function FloatingCard({ children, className = '', floatingElements = [] }: FloatingCardProps) {
  return (
    <div className={`relative ${className}`}>
      <ThreeDCard>
        {children}
      </ThreeDCard>
      
      {/* Floating Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 3,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="text-4xl text-purple-500/80">
            {element.icon}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// 3D Product Card with Specs
interface Product3DCardProps {
  title: string
  price: number
  originalPrice?: number
  image: string
  rating?: number
  specs?: string[]
  onBuy?: () => void
  onAddToCart?: () => void
  className?: string
}

export function Product3DCard({
  title,
  price,
  originalPrice,
  image,
  rating = 4.5,
  specs = [],
  onBuy,
  onAddToCart,
  className = ''
}: Product3DCardProps) {
  const [showSpecs, setShowSpecs] = useState(false)
  
  return (
    <ThreeDCard
      className={`group ${className}`}
      glareEnabled={true}
      tiltEnabled={true}
      borderGlow={true}
      backgroundImage={image}
    >
      <div className="relative p-6 min-h-[400px] flex flex-col justify-between">
        {/* Content that appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Front Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: showSpecs ? -20 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-3xl font-bold text-purple-400">${price}</span>
              {originalPrice && (
                <span className="text-gray-400 line-through">${originalPrice}</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-400'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-white ml-2">({rating})</span>
            </div>
          </motion.div>
        </div>
        
        {/* Back/Hover Content */}
        <motion.div
          className="relative z-10 mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showSpecs ? 1 : 0, y: showSpecs ? 0 : 20 }}
          transition={{ duration: 0.3 }}
        >
          {specs.length > 0 && (
            <div className="mb-4">
              <h4 className="text-white font-semibold mb-2">Specifications:</h4>
              <ul className="space-y-1">
                {specs.map((spec, index) => (
                  <li key={index} className="text-sm text-gray-200">• {spec}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              onClick={onAddToCart}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Add to Cart
            </button>
            <button
              onClick={onBuy}
              className="flex-1 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition"
            >
              Buy Now
            </button>
          </div>
        </motion.div>
        
        {/* Toggle Specs Button */}
        <button
          onClick={() => setShowSpecs(!showSpecs)}
          className="absolute top-4 right-4 z-20 p-2 bg-white/20 rounded-full backdrop-blur-sm hover:bg-white/30 transition"
        >
          <svg
            className={`w-5 h-5 text-white transition-transform ${showSpecs ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </ThreeDCard>
  )
}

// 3D Card Stack for Gallery
interface CardStackProps {
  cards: Array<{
    id: string
    title: string
    image: string
    content: React.ReactNode
  }>
  onCardClick?: (id: string) => void
}

export function CardStack({ cards, onCardClick }: CardStackProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  
  return (
    <div className="relative h-[500px] flex items-center justify-center">
      {cards.map((card, index) => {
        const isHovered = hoveredIndex === index
        const offset = (cards.length - 1 - index) * 20
        const zIndex = cards.length - index
        
        return (
          <motion.div
            key={card.id}
            className="absolute cursor-pointer"
            style={{
              zIndex,
              x: isHovered ? 0 : -offset,
              y: isHovered ? -20 : 0,
              rotate: isHovered ? 0 : -5,
            }}
            animate={{
              x: isHovered ? 0 : -offset,
              y: isHovered ? -20 : 0,
              rotate: isHovered ? 0 : -5,
            }}
            transition={{ duration: 0.3 }}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            onClick={() => onCardClick?.(card.id)}
          >
            <ThreeDCard
              className="w-[300px] h-[400px]"
              glareEnabled={true}
              tiltEnabled={isHovered}
            >
              <div className="relative w-full h-full">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-2xl" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2"
                    >
                      {card.content}
                    </motion.div>
                  )}
                </div>
              </div>
            </ThreeDCard>
          </motion.div>
        )
      })}
    </div>
  )
}

// 3D Carousel Card
interface CarouselCardProps {
  children: React.ReactNode
  rotation?: number
  zIndex?: number
  isActive?: boolean
}

export function CarouselCard({ children, rotation = 0, zIndex = 0, isActive = false }: CarouselCardProps) {
  return (
    <motion.div
      className="absolute w-[300px] h-[400px]"
      style={{
        rotateY: rotation,
        zIndex,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        rotateY: rotation,
        scale: isActive ? 1.1 : 1,
      }}
      transition={{ duration: 0.5 }}
    >
      <ThreeDCard
        glareEnabled={isActive}
        tiltEnabled={isActive}
        borderGlow={isActive}
      >
        {children}
      </ThreeDCard>
    </motion.div>
  )
}