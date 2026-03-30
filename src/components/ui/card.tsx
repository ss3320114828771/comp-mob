'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { forwardRef, HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'outline' | 'gradient'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  animate?: boolean
  children: React.ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = 'default', 
    padding = 'md', 
    hover = true,
    animate = true,
    className = '',
    children,
    ...props 
  }, ref) => {
    
    // Variant styles
    const variantStyles = {
      default: 'bg-white border border-gray-200',
      glass: 'bg-white/80 backdrop-blur-md border border-white/20',
      outline: 'bg-transparent border-2 border-purple-200',
      gradient: 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100'
    }
    
    // Padding styles
    const paddingStyles = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8'
    }
    
    // Hover effects
    const hoverStyles = hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : ''
    
    // Base styles
    const baseStyles = 'rounded-xl shadow-lg overflow-hidden'
    
    // Combined classes
    const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`
    
    const content = (
      <div ref={ref} className={combinedClasses} {...props}>
        {children}
      </div>
    )
    
    if (animate) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={hover ? { y: -5, transition: { duration: 0.2 } } : {}}
        >
          {content}
        </motion.div>
      )
    }
    
    return content
  }
)

Card.displayName = 'Card'

// Card Header Component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, icon, action, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between border-b border-gray-200 pb-4 mb-4 ${className}`}
        {...props}
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="text-purple-600 text-2xl">
              {icon}
            </div>
          )}
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
            {children}
          </div>
        </div>
        {action && (
          <div className="ml-4">
            {action}
          </div>
        )}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

// Card Content Component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

// Card Footer Component
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  divider?: boolean
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = '', divider = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          mt-4 pt-4
          ${divider ? 'border-t border-gray-200' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'

// Card Image Component
interface CardImageProps extends HTMLAttributes<HTMLDivElement> {
  src: string
  alt: string
  height?: string
  overlay?: boolean
  overlayContent?: React.ReactNode
}

const CardImage = forwardRef<HTMLDivElement, CardImageProps>(
  ({ src, alt, height = 'h-48', overlay = false, overlayContent, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative ${height} overflow-hidden bg-gray-100 ${className}`}
        {...props}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        {overlay && overlayContent && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            {overlayContent}
          </div>
        )}
      </div>
    )
  }
)

CardImage.displayName = 'CardImage'

// Card Stats Component
interface CardStatsProps {
  stats: Array<{
    label: string
    value: string | number
    icon?: React.ReactNode
    trend?: {
      value: number
      direction: 'up' | 'down'
    }
  }>
  columns?: 2 | 3 | 4
}

const CardStats = ({ stats, columns = 3 }: CardStatsProps) => {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }
  
  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          {stat.icon && (
            <div className="text-2xl text-purple-600 mb-2">
              {stat.icon}
            </div>
          )}
          <div className="text-2xl font-bold text-gray-900">
            {stat.value}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {stat.label}
          </div>
          {stat.trend && (
            <div className={`text-xs mt-1 ${stat.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {stat.trend.direction === 'up' ? '↑' : '↓'} {Math.abs(stat.trend.value)}%
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Card Grid Component
interface CardGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

const CardGrid = ({ children, columns = 3, gap = 'md', className = '' }: CardGridProps) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }
  
  const gapSizes = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }
  
  return (
    <div className={`grid ${gridCols[columns]} ${gapSizes[gap]} ${className}`}>
      {children}
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardImage,
  CardStats,
  CardGrid
}