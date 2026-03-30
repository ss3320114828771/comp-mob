/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { motion, useInView, useAnimation, Variants } from 'framer-motion'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  animation?: 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale' | 'zoom' | 'rotate' | 'flip' | 'bounce' | 'stagger'
  threshold?: number
  once?: boolean
  staggerChildren?: boolean
  staggerDelay?: number
  staggerDirection?: 'up' | 'down' | 'left' | 'right'
  onAnimationComplete?: () => void
}

// Animation variants
const animationVariants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  fadeDown: {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0 }
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  fadeRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  zoom: {
    hidden: { opacity: 0, scale: 1.2 },
    visible: { opacity: 1, scale: 1 }
  },
  rotate: {
    hidden: { opacity: 0, rotate: -10, scale: 0.9 },
    visible: { opacity: 1, rotate: 0, scale: 1 }
  },
  flip: {
    hidden: { opacity: 0, rotateX: -90 },
    visible: { opacity: 1, rotateX: 0 }
  },
  bounce: {
    hidden: { opacity: 0, y: 100 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  },
  stagger: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
}

// Stagger children variants
const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  animation = 'fadeUp',
  threshold = 0.2,
  once = true,
  staggerChildren = false,
  staggerDelay = 0.1,
  staggerDirection = 'up',
  onAnimationComplete
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const isInView = useInView(ref, { 
    once, 
    amount: threshold
  })

  useEffect(() => {
    if (isInView) {
      controls.start('visible')
      if (onAnimationComplete) {
        setTimeout(onAnimationComplete, duration * 1000)
      }
    } else if (!once) {
      controls.start('hidden')
    }
  }, [isInView, controls, once, duration, onAnimationComplete])

  // Get animation variants
  const variants = animationVariants[animation] || animationVariants.fadeUp

  // For stagger animations
  if (staggerChildren) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={controls}
        variants={staggerContainerVariants}
        transition={{ staggerChildren: staggerDelay, delayChildren: delay }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.1, 0.25, 1] // Custom cubic-bezier easing
      }}
    >
      {children}
    </motion.div>
  )
}

// Staggered Item Component (to be used inside AnimatedSection with staggerChildren)
interface StaggerItemProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function StaggerItem({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up'
}: StaggerItemProps) {
  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
      x: direction === 'left' ? -20 : direction === 'right' ? 20 : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div
      className={className}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

// Scroll-Triggered Parallax Section
interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  speed?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  bgImage?: string
  overlay?: boolean
  overlayColor?: string
}

export function ParallaxSection({
  children,
  className = '',
  speed = 0.5,
  direction = 'up',
  bgImage,
  overlay = true,
  overlayColor = 'rgba(0,0,0,0.5)'
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const scrolled = window.pageYOffset
      const rate = direction === 'up' ? speed : direction === 'down' ? -speed : 0
      const yOffset = (rect.top - scrolled) * rate
      const xOffset = direction === 'left' ? (rect.left - scrolled) * speed : direction === 'right' ? -(rect.left - scrolled) * speed : 0
      
      setOffset(direction === 'up' || direction === 'down' ? yOffset : xOffset)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed, direction])

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {overlay && (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor }}
        />
      )}
      <motion.div
        style={{
          transform: direction === 'up' || direction === 'down' 
            ? `translateY(${offset}px)` 
            : `translateX(${offset}px)`
        }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  )
}

// Animated Counter Component
interface AnimatedCounterProps {
  from?: number
  to: number
  duration?: number
  delay?: number
  suffix?: string
  prefix?: string
  className?: string
  onComplete?: () => void
}

export function AnimatedCounter({
  from = 0,
  to,
  duration = 2,
  delay = 0,
  suffix = '',
  prefix = '',
  className = '',
  onComplete
}: AnimatedCounterProps) {
  const [count, setCount] = useState(from)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3)
  }

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      const currentCount = from + (to - from) * easeOutCubic(progress)
      setCount(currentCount)
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(to)
        if (onComplete) onComplete()
      }
    }

    const timeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate)
    }, delay * 1000)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(animationFrame)
    }
  }, [isInView, from, to, duration, delay, onComplete])

  return (
    <div ref={ref} className={className}>
      {prefix}{Math.floor(count)}{suffix}
    </div>
  )
}

// Typewriter Effect Component
interface TypewriterProps {
  texts: string[]
  delay?: number
  speed?: number
  className?: string
  cursor?: boolean
  loop?: boolean
}

export function Typewriter({
  texts,
  delay = 0,
  speed = 100,
  className = '',
  cursor = true,
  loop = true
}: TypewriterProps) {
  const [currentText, setCurrentText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (!isInView) return

    let timeout: NodeJS.Timeout

    const type = () => {
      const current = texts[currentIndex]
      
      if (isDeleting) {
        setCurrentText(current.substring(0, currentText.length - 1))
        if (currentText.length === 0) {
          setIsDeleting(false)
          setCurrentIndex((prev) => (prev + 1) % texts.length)
          if (!loop && currentIndex === texts.length - 1) return
        }
        timeout = setTimeout(type, speed / 2)
      } else {
        setCurrentText(current.substring(0, currentText.length + 1))
        if (currentText.length === current.length) {
          setIsDeleting(true)
          timeout = setTimeout(type, delay)
        } else {
          timeout = setTimeout(type, speed)
        }
      }
    }

    timeout = setTimeout(type, delay)

    return () => clearTimeout(timeout)
  }, [currentText, currentIndex, isDeleting, texts, speed, delay, isInView, loop])

  return (
    <div ref={ref} className={className}>
      {currentText}
      {cursor && (
        <span className="animate-pulse inline-block w-0.5 h-6 ml-1 bg-purple-600" />
      )}
    </div>
  )
}

// Reveal on Scroll Component
interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  threshold?: number
  direction?: 'left' | 'right' | 'up' | 'down'
  distance?: number
  duration?: number
}

export function RevealOnScroll({
  children,
  className = '',
  threshold = 0.2,
  direction = 'up',
  distance = 50,
  duration = 0.6
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: threshold })

  const getTransform = () => {
    switch (direction) {
      case 'left': return `translateX(-${distance}px)`
      case 'right': return `translateX(${distance}px)`
      case 'up': return `translateY(${distance}px)`
      case 'down': return `translateY(-${distance}px)`
      default: return `translateY(${distance}px)`
    }
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, transform: getTransform() }}
      animate={isInView ? { opacity: 1, transform: 'translate(0, 0)' } : {}}
      transition={{ duration, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Add missing import
import { useState } from 'react'