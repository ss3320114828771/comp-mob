import { ProductCategory } from '@/types/product'

// ==================== App Configuration ====================

export const APP_NAME = 'TechShop'
export const APP_DESCRIPTION = 'Premium Computer & Mobile Accessories'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const APP_EMAIL = 'hafiz.sajid.syed@gmail.com'
export const APP_PHONE = '+92 300 1234567'
export const APP_ADDRESS = 'Pakistan'

// ==================== Admin Information ====================

export const ADMIN_NAME = 'Hafiz Sajid Syed'
export const ADMIN_EMAIL = 'hafiz.sajid.syed@gmail.com'
export const ADMIN_ROLE = 'ADMIN'

// ==================== Routes ====================

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAILS: (id: string) => `/products/${id}`,
  CART: '/cart',
  CHECKOUT: '/checkout',
  ABOUT: '/about',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_USERS: '/admin/users',
  PROFILE: '/profile',
  ORDERS: '/orders',
  WISHLIST: '/wishlist',
  FAQ: '/faq',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  SHIPPING: '/shipping',
  RETURNS: '/returns',
}

// ==================== Product Constants ====================

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string; icon: string; description: string }[] = [
  { value: 'COMPUTER', label: 'Computer', icon: '💻', description: 'Laptops, Desktops, and Computer Components' },
  { value: 'MOBILE', label: 'Mobile', icon: '📱', description: 'Smartphones and Mobile Accessories' },
  { value: 'ACCESSORIES', label: 'Accessories', icon: '🎧', description: 'Cables, Chargers, and Other Accessories' },
  { value: 'GAMING', label: 'Gaming', icon: '🎮', description: 'Gaming Gear and Equipment' },
  { value: 'AUDIO', label: 'Audio', icon: '🔊', description: 'Headphones, Speakers, and Audio Equipment' },
]

export const PRODUCT_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', field: 'createdAt', order: 'desc' },
  { value: 'price_asc', label: 'Price: Low to High', field: 'price', order: 'asc' },
  { value: 'price_desc', label: 'Price: High to Low', field: 'price', order: 'desc' },
  { value: 'name_asc', label: 'Name: A to Z', field: 'name', order: 'asc' },
  { value: 'name_desc', label: 'Name: Z to A', field: 'name', order: 'desc' },
  { value: 'popular', label: 'Best Selling', field: 'totalSold', order: 'desc' },
  { value: 'rating', label: 'Top Rated', field: 'rating', order: 'desc' },
]

export const PRODUCT_LIMITS = {
  DEFAULT: 12,
  MIN: 1,
  MAX: 100,
  RELATED: 4,
  FEATURED: 6,
  NEW_ARRIVALS: 8,
}

export const PRODUCT_PRICE_RANGE = {
  MIN: 0,
  MAX: 10000,
  STEP: 10,
}

// ==================== Cart Constants ====================

export const CART = {
  DEFAULT_SHIPPING_COST: 10,
  FREE_SHIPPING_THRESHOLD: 50,
  TAX_RATE: 0.1, // 10%
  MAX_ITEMS: 50,
  MAX_ITEM_QUANTITY: 99,
  EXPIRY_DAYS: 7,
}

export const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard Shipping', price: 5, days: 5, estimatedDays: '5-7 business days' },
  { id: 'express', name: 'Express Shipping', price: 15, days: 2, estimatedDays: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 25, days: 1, estimatedDays: 'Next day delivery' },
  { id: 'free', name: 'Free Shipping', price: 0, days: 7, estimatedDays: '7-10 business days', minSpend: 50 },
]

export const PAYMENT_METHODS = [
  { id: 'card', name: 'Credit / Debit Card', type: 'card', icon: '💳', processingFee: 0.029 },
  { id: 'paypal', name: 'PayPal', type: 'paypal', icon: '💰', processingFee: 0.03 },
  { id: 'bank_transfer', name: 'Bank Transfer', type: 'bank_transfer', icon: '🏦' },
  { id: 'cod', name: 'Cash on Delivery', type: 'cash_on_delivery', icon: '💵', processingFee: 2 },
]

// ==================== Coupon Constants ====================

export const COUPON_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  FREE_SHIPPING: 'free_shipping',
} as const

export const DEFAULT_COUPONS = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minSpend: 0, description: '10% off your first order' },
  { code: 'SAVE20', type: 'percentage', value: 20, minSpend: 100, description: '20% off orders over $100' },
  { code: 'FREESHIP', type: 'free_shipping', value: 0, description: 'Free shipping on any order' },
  { code: 'SUMMER50', type: 'fixed', value: 50, minSpend: 200, description: '$50 off orders over $200' },
]

// ==================== Order Constants ====================

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'yellow',
  processing: 'blue',
  confirmed: 'purple',
  shipped: 'indigo',
  delivered: 'green',
  cancelled: 'red',
  refunded: 'gray',
}

// ==================== User Constants ====================

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  SUPPORT: 'SUPPORT',
} as const

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  PENDING_VERIFICATION: 'pending_verification',
} as const

export const LOYALTY_TIERS = {
  BRONZE: { minSpent: 0, multiplier: 1, color: '#CD7F32', label: 'Bronze' },
  SILVER: { minSpent: 500, multiplier: 1.1, color: '#C0C0C0', label: 'Silver' },
  GOLD: { minSpent: 1000, multiplier: 1.2, color: '#FFD700', label: 'Gold' },
  PLATINUM: { minSpent: 2500, multiplier: 1.3, color: '#E5E4E2', label: 'Platinum' },
  DIAMOND: { minSpent: 5000, multiplier: 1.5, color: '#B9F2FF', label: 'Diamond' },
}

// ==================== API Constants ====================

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth?action=login',
    REGISTER: '/api/auth?action=register',
    LOGOUT: '/api/auth?action=logout',
    VERIFY: '/api/auth?action=verify',
    FORGOT_PASSWORD: '/api/auth?action=forgot-password',
    RESET_PASSWORD: '/api/auth?action=reset-password',
  },
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: (id: string) => `/api/products/${id}`,
    CREATE: '/api/products',
    UPDATE: (id: string) => `/api/products/${id}`,
    DELETE: (id: string) => `/api/products/${id}`,
    STOCK: (id: string) => `/api/products/${id}/stock`,
    ANALYTICS: (id: string) => `/api/products/${id}/analytics`,
  },
  CART: {
    GET: '/api/cart',
    ADD: '/api/cart',
    UPDATE: (id: string) => `/api/cart/${id}`,
    REMOVE: (id: string) => `/api/cart/${id}`,
    CLEAR: '/api/cart/clear',
    COUPON: '/api/cart/coupon',
  },
  ORDERS: {
    LIST: '/api/orders',
    DETAIL: (id: string) => `/api/orders/${id}`,
    CREATE: '/api/orders',
    UPDATE: (id: string) => `/api/orders/${id}`,
    CANCEL: (id: string) => `/api/orders/${id}/cancel`,
  },
  UPLOAD: {
    SINGLE: '/api/upload',
    MULTIPLE: '/api/upload/multiple',
    DELETE: (url: string) => `/api/upload?url=${encodeURIComponent(url)}`,
  },
  EMAIL: {
    CONTACT: '/api/email?type=contact',
    ORDER_CONFIRMATION: '/api/email?type=order-confirmation',
    WELCOME: '/api/email?type=welcome',
    NEWSLETTER: '/api/email?type=newsletter',
  },
}

// ==================== Pagination Constants ====================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
}

// ==================== File Upload Constants ====================

export const UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
}

// ==================== Validation Constants ====================

export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL: true,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    MAX_LENGTH: 100,
  },
  PHONE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 15,
  },
  ADDRESS: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 200,
  },
}

// ==================== Date & Time Constants ====================

export const DATE_FORMATS = {
  FULL: 'MMMM dd, yyyy',
  SHORT: 'MM/dd/yyyy',
  YEAR_MONTH: 'yyyy-MM',
  TIME: 'hh:mm a',
  DATE_TIME: 'MMMM dd, yyyy hh:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
}

export const TIMEZONES = {
  DEFAULT: 'UTC',
  LOCAL: 'Asia/Karachi',
}

// ==================== Cache Constants ====================

export const CACHE = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  CATEGORIES: 30 * 60 * 1000, // 30 minutes
  USER: 15 * 60 * 1000, // 15 minutes
  ORDERS: 2 * 60 * 1000, // 2 minutes
  CART: 60 * 1000, // 1 minute
}

// ==================== SEO Constants ====================

export const SEO = {
  TITLE_TEMPLATE: `%s | ${APP_NAME}`,
  DEFAULT_TITLE: APP_NAME,
  DEFAULT_DESCRIPTION: APP_DESCRIPTION,
  DEFAULT_KEYWORDS: 'computer accessories, mobile accessories, tech shop, electronics, gadgets',
  DEFAULT_OG_IMAGE: '/og-image.jpg',
  DEFAULT_TWITTER_IMAGE: '/twitter-image.jpg',
}

// ==================== Social Media Links ====================

export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/techshop',
  TWITTER: 'https://twitter.com/techshop',
  INSTAGRAM: 'https://instagram.com/techshop',
  GITHUB: 'https://github.com/techshop',
  LINKEDIN: 'https://linkedin.com/company/techshop',
}

// ==================== Support Contact ====================

export const SUPPORT = {
  EMAIL: ADMIN_EMAIL,
  PHONE: APP_PHONE,
  HOURS: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM, Sun: Closed',
  RESPONSE_TIME: '24 hours',
}

// ==================== Error Messages ====================

export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  SERVER: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EMAIL_EXISTS: 'Email already registered.',
    WEAK_PASSWORD: 'Password is too weak. Please use a stronger password.',
    TOKEN_EXPIRED: 'Session expired. Please login again.',
    INVALID_TOKEN: 'Invalid token.',
    EMAIL_NOT_VERIFIED: 'Please verify your email address.',
  },
  
  PRODUCT: {
    NOT_FOUND: 'Product not found.',
    OUT_OF_STOCK: 'Product is out of stock.',
    INSUFFICIENT_STOCK: 'Insufficient stock available.',
    INVALID_PRICE: 'Invalid product price.',
  },
  
  CART: {
    EMPTY: 'Your cart is empty.',
    ITEM_NOT_FOUND: 'Item not found in cart.',
    QUANTITY_EXCEEDED: 'Quantity exceeds available stock.',
    COUPON_INVALID: 'Invalid coupon code.',
    COUPON_EXPIRED: 'Coupon has expired.',
  },
  
  ORDER: {
    NOT_FOUND: 'Order not found.',
    CANCELLATION_FAILED: 'Order cannot be cancelled.',
    PAYMENT_FAILED: 'Payment processing failed.',
  },
  
  UPLOAD: {
    FILE_TOO_LARGE: 'File size too large.',
    INVALID_TYPE: 'Invalid file type.',
    UPLOAD_FAILED: 'Failed to upload file.',
  },
}

// ==================== Success Messages ====================

export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN: 'Logged in successfully!',
    REGISTER: 'Account created successfully!',
    LOGOUT: 'Logged out successfully!',
    PASSWORD_RESET: 'Password reset email sent!',
    PASSWORD_CHANGED: 'Password changed successfully!',
    EMAIL_VERIFIED: 'Email verified successfully!',
  },
  
  PRODUCT: {
    CREATED: 'Product created successfully!',
    UPDATED: 'Product updated successfully!',
    DELETED: 'Product deleted successfully!',
    STOCK_UPDATED: 'Stock updated successfully!',
  },
  
  CART: {
    ADDED: 'Added to cart!',
    UPDATED: 'Cart updated!',
    REMOVED: 'Removed from cart!',
    CLEARED: 'Cart cleared!',
    COUPON_APPLIED: 'Coupon applied successfully!',
  },
  
  ORDER: {
    PLACED: 'Order placed successfully!',
    CANCELLED: 'Order cancelled successfully!',
  },
  
  UPLOAD: {
    SUCCESS: 'File uploaded successfully!',
    DELETED: 'File deleted successfully!',
  },
}

// ==================== Regex Patterns ====================

export const REGEX = {
  EMAIL: /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/,
  PHONE: /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{3,4}[-\s\.]?[0-9]{3,4}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/,
}

// ==================== Default Values ====================

export const DEFAULTS = {
  AVATAR: '/default-avatar.png',
  PRODUCT_IMAGE: '/placeholder.jpg',
  CURRENCY: 'USD',
  LOCALE: 'en-US',
  THEME: 'system',
  LANGUAGE: 'en',
  COUNTRY: 'US',
}

// ==================== Feature Flags ====================

export const FEATURES = {
  ENABLE_WISHLIST: true,
  ENABLE_REVIEWS: true,
  ENABLE_COMPARE: true,
  ENABLE_NEWSLETTER: true,
  ENABLE_LIVE_CHAT: false,
  ENABLE_SOCIAL_LOGIN: false,
  ENABLE_2FA: false,
  ENABLE_BACK_IN_STOCK: true,
  ENABLE_ORDER_TRACKING: true,
}

// ==================== Analytics ====================

export const ANALYTICS = {
  GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  FB_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
  ENABLED: process.env.NODE_ENV === 'production',
}