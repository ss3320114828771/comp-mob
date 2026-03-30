/* eslint-disable import/no-anonymous-default-export */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Product, ProductCategory } from '@/types/product'
import { Cart, CartItem } from '@/types/cart'

// ==================== Tailwind CSS Utilities ====================

/**
 * Merge Tailwind CSS classes without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ==================== Price & Currency Helpers ====================

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

/**
 * Calculate discounted price
 */
export function calculateDiscountedPrice(price: number, discountPercentage: number): number {
  return price * (1 - discountPercentage / 100)
}

/**
 * Calculate savings amount
 */
export function calculateSavings(originalPrice: number, discountedPrice: number): number {
  return originalPrice - discountedPrice
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (originalPrice === 0) return 0
  return ((originalPrice - discountedPrice) / originalPrice) * 100
}

// ==================== Cart Helpers ====================

/**
 * Calculate cart subtotal
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0)
}

/**
 * Calculate shipping cost
 */
export function calculateShipping(subtotal: number, freeShippingThreshold: number = 50, defaultShipping: number = 10): number {
  return subtotal >= freeShippingThreshold ? 0 : defaultShipping
}

/**
 * Calculate tax amount
 */
export function calculateTax(subtotal: number, taxRate: number = 0.1): number {
  return subtotal * taxRate
}

/**
 * Calculate total price
 */
export function calculateTotal(subtotal: number, shipping: number, tax: number, discount: number = 0): number {
  return subtotal + shipping + tax - discount
}

/**
 * Get cart summary
 */
export function getCartSummary(cart: Cart) {
  return {
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    tax: cart.tax,
    discount: cart.discount,
    total: cart.total,
    totalItems: cart.totalItems,
    itemCount: cart.items.length,
  }
}

/**
 * Check if cart is eligible for free shipping
 */
export function isEligibleForFreeShipping(subtotal: number, threshold: number = 50): boolean {
  return subtotal >= threshold
}

/**
 * Get remaining amount for free shipping
 */
export function getRemainingForFreeShipping(subtotal: number, threshold: number = 50): number {
  return Math.max(0, threshold - subtotal)
}

// ==================== Product Helpers ====================

/**
 * Get product display name
 */
export function getProductDisplayName(product: Product): string {
  return product.name
}

/**
 * Get product main image
 */
export function getProductMainImage(product: Product): string {
  return product.images[0] || '/placeholder.jpg'
}

/**
 * Check if product is in stock
 */
export function isInStock(product: Product): boolean {
  return product.stock > 0
}

/**
 * Check if product is low stock
 */
export function isLowStock(product: Product, threshold: number = 5): boolean {
  return product.stock > 0 && product.stock <= threshold
}

/**
 * Get product stock status
 */
export function getStockStatus(product: Product): {
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  message: string
  color: string
} {
  if (product.stock === 0) {
    return { status: 'out_of_stock', message: 'Out of Stock', color: 'red' }
  }
  if (product.stock <= 5) {
    return { status: 'low_stock', message: `Only ${product.stock} left`, color: 'orange' }
  }
  return { status: 'in_stock', message: 'In Stock', color: 'green' }
}

/**
 * Get product rating display
 */
export function getRatingDisplay(rating: number): string {
  return rating.toFixed(1)
}

/**
 * Get product stars
 */
export function getProductStars(rating: number): { full: number; half: boolean; empty: number } {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  return { full: fullStars, half: hasHalfStar, empty: emptyStars }
}

// ==================== Category Helpers ====================

/**
 * Get category label
 */
export function getCategoryLabel(category: ProductCategory): string {
  const labels: Record<ProductCategory, string> = {
    COMPUTER: 'Computer',
    MOBILE: 'Mobile',
    ACCESSORIES: 'Accessories',
    GAMING: 'Gaming',
    AUDIO: 'Audio',
  }
  return labels[category] || category
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: ProductCategory): string {
  const icons: Record<ProductCategory, string> = {
    COMPUTER: '💻',
    MOBILE: '📱',
    ACCESSORIES: '🎧',
    GAMING: '🎮',
    AUDIO: '🔊',
  }
  return icons[category] || '📦'
}

// ==================== Order Helpers ====================

/**
 * Format order number
 */
export function formatOrderNumber(orderNumber: string): string {
  return `#${orderNumber}`
}

/**
 * Get order status color
 */
export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'yellow',
    processing: 'blue',
    confirmed: 'purple',
    shipped: 'indigo',
    delivered: 'green',
    cancelled: 'red',
    refunded: 'gray',
  }
  return colors[status] || 'gray'
}

/**
 * Get order status label
 */
export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    confirmed: 'Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  }
  return labels[status] || status
}

/**
 * Get estimated delivery date
 */
export function getEstimatedDelivery(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

// ==================== Date Helpers ====================

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string | number, format: 'short' | 'long' | 'full' = 'long'): string {
  const d = new Date(date)
  const options: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'numeric', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  }
  return d.toLocaleDateString('en-US', options[format])
}

/**
 * Get relative time
 */
export function getRelativeTime(date: Date | string | number): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`
  if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`
  return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const d = new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

// ==================== String Helpers ====================

/**
 * Truncate string
 */
export function truncate(str: string, length: number, ending: string = '...'): string {
  if (str.length <= length) return str
  return str.substring(0, length - ending.length) + ending
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Capitalize each word
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Generate slug
 */
export function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length)
}

/**
 * Generate order number
 */
export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${year}${month}${day}-${random}`
}

// ==================== Validation Helpers ====================

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,4}$/
  return phoneRegex.test(phone)
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if password is strong
 */
export function isStrongPassword(password: string): boolean {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  )
}

/**
 * Get password strength
 */
export function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  let score = 0
  
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  const strengths = [
    { score: 0, label: 'Very Weak', color: 'red' },
    { score: 1, label: 'Weak', color: 'orange' },
    { score: 2, label: 'Fair', color: 'yellow' },
    { score: 3, label: 'Good', color: 'blue' },
    { score: 4, label: 'Strong', color: 'green' },
    { score: 5, label: 'Very Strong', color: 'green' },
  ]
  
  const strength = strengths[Math.min(score, 5)]
  return { score, label: strength.label, color: strength.color }
}

// ==================== File Helpers ====================

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Check if file is image
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  return imageExtensions.includes(getFileExtension(filename))
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ==================== Browser Helpers ====================

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * Detect mobile device
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Detect touch device
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Scroll to top
 */
export function scrollToTop(smooth: boolean = true): void {
  window.scrollTo({
    top: 0,
    behavior: smooth ? 'smooth' : 'auto',
  })
}

/**
 * Get URL parameters
 */
export function getUrlParams(): URLSearchParams {
  return new URLSearchParams(window.location.search)
}

/**
 * Set URL parameters
 */
export function setUrlParams(params: Record<string, string | number | boolean | null>): void {
  const url = new URL(window.location.href)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    } else {
      url.searchParams.delete(key)
    }
  })
  window.history.pushState({}, '', url.toString())
}

// ==================== Performance Helpers ====================

/**
 * Debounce function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Sleep for milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ==================== Object Helpers ====================

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Pick specific keys from object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pick<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Omit specific keys from object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  return result
}

// ==================== Array Helpers ====================

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key])
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Chunk array
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

/**
 * Remove duplicates
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Shuffle array
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ==================== Export all ====================

export default {
  cn,
  formatPrice,
  calculateDiscountedPrice,
  calculateSavings,
  calculateDiscountPercentage,
  calculateSubtotal,
  calculateShipping,
  calculateTax,
  calculateTotal,
  getCartSummary,
  isEligibleForFreeShipping,
  getRemainingForFreeShipping,
  getProductDisplayName,
  getProductMainImage,
  isInStock,
  isLowStock,
  getStockStatus,
  getRatingDisplay,
  getProductStars,
  getCategoryLabel,
  getCategoryIcon,
  formatOrderNumber,
  getOrderStatusColor,
  getOrderStatusLabel,
  getEstimatedDelivery,
  formatDate,
  getRelativeTime,
  isToday,
  truncate,
  capitalize,
  capitalizeWords,
  generateSlug,
  generateRandomString,
  generateOrderNumber,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  isStrongPassword,
  getPasswordStrength,
  getFileExtension,
  isImageFile,
  formatFileSize,
  copyToClipboard,
  isMobile,
  isTouchDevice,
  scrollToTop,
  getUrlParams,
  setUrlParams,
  debounce,
  throttle,
  sleep,
  deepClone,
  pick,
  omit,
  groupBy,
  chunk,
  unique,
  shuffle,
}