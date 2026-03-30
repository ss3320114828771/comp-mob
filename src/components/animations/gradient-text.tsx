'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { useRef, useState } from 'react'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
  animation?: 'fade' | 'slide' | 'scale' | 'bounce' | 'gradientMove'
  gradient?: 'primary' | 'secondary' | 'rainbow' | 'sunset' | 'ocean' | 'aurora' | 'neon' | 'fire'
  speed?: 'slow' | 'normal' | 'fast'
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  duration?: number
  hover?: boolean
  shadow?: boolean
  shimmer?: boolean
  stroke?: boolean
  strokeColor?: string
  glow?: boolean
  glowColor?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'light' | 'normal' | 'semibold' | 'bold' | 'extrabold'
  gradientAngle?: number
  onAnimationComplete?: () => void
}

// Gradient definitions
const gradients = {
  primary: 'from-purple-600 via-pink-600 to-blue-600',
  secondary: 'from-cyan-500 via-blue-500 to-indigo-500',
  rainbow: 'from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500',
  sunset: 'from-orange-500 via-red-500 to-pink-500',
  ocean: 'from-blue-500 via-cyan-500 to-teal-500',
  aurora: 'from-green-400 via-blue-500 to-purple-600',
  neon: 'from-green-400 via-yellow-400 to-pink-500',
  fire: 'from-red-600 via-orange-500 to-yellow-500'
}

// Size mappings
const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl'
}

// Weight mappings
const weightClasses = {
  light: 'font-light',
  normal: 'font-normal',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold'
}

// Animation variants with proper types
const animationVariants: Record<string, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  slide: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  bounce: {
    hidden: { opacity: 0, y: 50 },
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
  gradientMove: {
    hidden: { backgroundPosition: '0% 50%' },
    visible: { 
      backgroundPosition: '100% 50%',
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "linear"
      }
    }
  }
}

export function GradientText({
  children,
  className = '',
  animate = true,
  animation = 'fade',
  gradient = 'primary',
  speed = 'normal',
  direction = 'left',
  delay = 0,
  hover = true,
  shadow = true,
  shimmer = false,
  stroke = false,
  strokeColor = 'white',
  glow = false,
  glowColor = 'rgba(139, 92, 246, 0.5)',
  size = 'md',
  weight = 'bold',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gradientAngle = 135,
  onAnimationComplete
}: GradientTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const [isHovered, setIsHovered] = useState(false)

  // Speed-based animation duration
  const speedDurations = {
    slow: 1.2,
    normal: 0.6,
    fast: 0.3
  }

  const getGradientStyle = () => {
    const gradientClass = gradients[gradient]
    return `bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`
  }

  // Shimmer animation with proper typing
  const shimmerVariants: Variants = {
    initial: { backgroundPosition: '-200% 0' },
    animate: { 
      backgroundPosition: '200% 0',
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  // Glow effect
  const glowStyle = glow ? {
    textShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 0 30px ${glowColor}`
  } : {}

  // Stroke effect
  const strokeStyle = stroke ? {
    WebkitTextStroke: `2px ${strokeColor}`,
    WebkitTextFillColor: 'transparent'
  } : {}

  // Hover effect
  const hoverStyle = hover ? {
    scale: 1.05,
    transition: { duration: 0.3 }
  } : {}

  // Base classes
  const baseClasses = `
    ${sizeClasses[size]}
    ${weightClasses[weight]}
    inline-block
    ${shadow ? 'drop-shadow-lg' : ''}
    ${getGradientStyle()}
    ${className}
  `

  // For animated gradient movement
  if (animation === 'gradientMove') {
    const gradientMoveVariants: Variants = {
      hidden: { backgroundPosition: '0% 50%' },
      visible: { 
        backgroundPosition: '100% 50%',
        transition: {
          duration: speedDurations[speed],
          repeat: Infinity,
          repeatType: "reverse",
          ease: "linear",
          delay
        }
      }
    }

    return (
      <motion.div
        ref={ref}
        className={`${baseClasses} bg-gradient-to-r ${gradients[gradient]} bg-clip-text text-transparent bg-[length:200%_auto]`}
        initial="hidden"
        animate={animate && isInView ? "visible" : "hidden"}
        variants={gradientMoveVariants}
        onAnimationComplete={onAnimationComplete}
      >
        {children}
      </motion.div>
    )
  }

  // For shimmer effect
  if (shimmer) {
    return (
      <motion.div
        ref={ref}
        className={`${baseClasses} relative overflow-hidden`}
        whileHover={hoverStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          variants={shimmerVariants}
          initial="initial"
          animate={isHovered ? "animate" : "initial"}
          style={{ backgroundSize: '200% 100%' }}
        />
      </motion.div>
    )
  }

  // For regular animations
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectedVariant = animationVariants[animation] || animationVariants.fade
  const directionOffsets = {
    left: { x: -30 },
    right: { x: 30 },
    up: { y: -30 },
    down: { y: 30 }
  }

  const directionOffset = directionOffsets[direction] || {}

  const customVariants: Variants = {
    hidden: { 
      opacity: 0,
      ...directionOffset,
      ...(animation === 'scale' ? { scale: 0.8 } : {}),
      ...(animation === 'bounce' ? { y: 50 } : {})
    },
    visible: { 
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration: speedDurations[speed],
        delay,
        ...(animation === 'bounce' ? { type: "spring", stiffness: 300, damping: 15 } : {})
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      className={baseClasses}
      initial="hidden"
      animate={animate && isInView ? "visible" : "hidden"}
      variants={customVariants}
      whileHover={hoverStyle}
      onAnimationComplete={onAnimationComplete}
      style={{
        ...glowStyle,
        ...strokeStyle
      }}
    >
      {children}
    </motion.div>
  )
}

// Word-by-word gradient text animation
interface WordGradientProps {
  text: string
  className?: string
  gradient?: 'primary' | 'secondary' | 'rainbow' | 'sunset' | 'ocean' | 'aurora' | 'neon' | 'fire'
  delayPerWord?: number
  animation?: 'fade' | 'slide' | 'scale'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'light' | 'normal' | 'semibold' | 'bold' | 'extrabold'
}

export function WordGradient({
  text,
  className = '',
  gradient = 'primary',
  delayPerWord = 0.1,
  animation = 'fade',
  size = 'md',
  weight = 'bold'
}: WordGradientProps) {
  const words = text.split(' ')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  const getGradientClass = () => {
    return `bg-gradient-to-r ${gradients[gradient]} bg-clip-text text-transparent`
  }

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: animation === 'slide' ? 20 : 0,
      scale: animation === 'scale' ? 0.8 : 1
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * delayPerWord,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  }

  return (
    <div
      ref={ref}
      className={`flex flex-wrap gap-1 ${sizeClasses[size]} ${weightClasses[weight]} ${className}`}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={wordVariants}
          className={getGradientClass()}
        >
          {word}
          {i < words.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </div>
  )
}

// Character-by-character gradient text animation
interface CharGradientProps {
  text: string
  className?: string
  gradient?: 'primary' | 'secondary' | 'rainbow' | 'sunset' | 'ocean' | 'aurora' | 'neon' | 'fire'
  delayPerChar?: number
  animation?: 'fade' | 'slide' | 'rotate'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'light' | 'normal' | 'semibold' | 'bold' | 'extrabold'
}

export function CharGradient({
  text,
  className = '',
  gradient = 'primary',
  delayPerChar = 0.05,
  animation = 'fade',
  size = 'md',
  weight = 'bold'
}: CharGradientProps) {
  const chars = text.split('')
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  const getGradientClass = () => {
    return `bg-gradient-to-r ${gradients[gradient]} bg-clip-text text-transparent`
  }

  const charVariants: Variants = {
    hidden: {
      opacity: 0,
      y: animation === 'slide' ? 20 : 0,
      rotate: animation === 'rotate' ? -90 : 0,
      scale: animation === 'fade' ? 0.5 : 1
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotate: 0,
      scale: 1,
      transition: {
        delay: i * delayPerChar,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  }

  return (
    <div
      ref={ref}
      className={`inline-block ${sizeClasses[size]} ${weightClasses[weight]} ${className}`}
    >
      {chars.map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={charVariants}
          className={getGradientClass()}
          style={{ display: 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  )
}

// Gradient Text with Background Animation
interface AnimatedBackgroundTextProps {
  children: React.ReactNode
  className?: string
  gradient?: 'primary' | 'secondary' | 'rainbow' | 'sunset' | 'ocean' | 'aurora' | 'neon' | 'fire'
  speed?: 'slow' | 'normal' | 'fast'
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'light' | 'normal' | 'semibold' | 'bold' | 'extrabold'
}

export function AnimatedBackgroundText({
  children,
  className = '',
  gradient = 'primary',
  speed = 'normal',
  size = 'md',
  weight = 'bold'
}: AnimatedBackgroundTextProps) {
  const speedDurations = {
    slow: 8,
    normal: 5,
    fast: 3
  }

  // Get gradient colors as a string for background
  const getGradientColors = () => {
    const gradientMap: Record<string, string> = {
      primary: '139, 92, 246, 236, 72, 153, 59, 130, 246',
      secondary: '6, 182, 212, 59, 130, 246, 99, 102, 241',
      rainbow: '239, 68, 68, 234, 179, 8, 34, 197, 94, 59, 130, 246, 168, 85, 247',
      sunset: '249, 115, 22, 239, 68, 68, 236, 72, 153',
      ocean: '59, 130, 246, 6, 182, 212, 20, 184, 166',
      aurora: '74, 222, 128, 59, 130, 246, 139, 92, 246',
      neon: '74, 222, 128, 250, 204, 21, 236, 72, 153',
      fire: '220, 38, 38, 249, 115, 22, 234, 179, 8'
    }
    return gradientMap[gradient] || gradientMap.primary
  }

  return (
    <motion.div
      className={`relative inline-block ${sizeClasses[size]} ${weightClasses[weight]} ${className}`}
      animate={{
        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
      }}
      transition={{
        duration: speedDurations[speed],
        repeat: Infinity,
        ease: "linear"
      }}
      style={{
        background: `linear-gradient(135deg, rgb(${getGradientColors().split(', ').slice(0, 3).join(', ')}), rgb(${getGradientColors().split(', ').slice(3, 6).join(', ')})), rgb(${getGradientColors().split(', ').slice(6, 9).join(', ')})`,
        backgroundSize: '200% 200%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}
    >
      {children}
    </motion.div>
  )
}

// Multi-line Gradient Text
interface MultiLineGradientProps {
  lines: string[]
  className?: string
  gradient?: 'primary' | 'secondary' | 'rainbow' | 'sunset' | 'ocean' | 'aurora' | 'neon' | 'fire'
  delayPerLine?: number
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  weight?: 'light' | 'normal' | 'semibold' | 'bold' | 'extrabold'
}

export function MultiLineGradient({
  lines,
  className = '',
  gradient = 'primary',
  delayPerLine = 0.2,
  size = 'md',
  weight = 'bold'
}: MultiLineGradientProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  const getGradientClass = () => {
    return `bg-gradient-to-r ${gradients[gradient]} bg-clip-text text-transparent`
  }

  const lineVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * delayPerLine,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  }

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          custom={i}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={lineVariants}
          className={`${sizeClasses[size]} ${weightClasses[weight]} ${getGradientClass()} mb-2`}
        >
          {line}
        </motion.div>
      ))}
    </div>
  )
}