// User Role Enum
export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR' | 'SUPPORT'

// User Status Enum
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'pending_verification'

// User Interface
export interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  status: UserStatus
  avatar?: string
  emailVerified: boolean
  phone?: string
  address?: Address
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
  preferences?: UserPreferences
  
  // Computed fields
  ordersCount?: number
  totalSpent?: number
  cartId?: string
  wishlistCount?: number
  reviewCount?: number
}

// User Address
export interface Address {
  id?: string
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  isDefault?: boolean
  addressType?: 'shipping' | 'billing' | 'both'
  phone?: string
  name?: string
}

// User Preferences
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  currency?: string
  notifications?: NotificationPreferences
  newsletter?: boolean
  marketingEmails?: boolean
  orderUpdates?: boolean
  promotions?: boolean
  twoFactorEnabled?: boolean
}

// Notification Preferences
export interface NotificationPreferences {
  email: {
    orderConfirmation: boolean
    shippingUpdate: boolean
    deliveryConfirmation: boolean
    passwordChange: boolean
    promotions: boolean
    newsletter: boolean
  }
  push: {
    orderUpdates: boolean
    promotions: boolean
  }
  sms: {
    orderUpdates: boolean
    deliveryConfirmation: boolean
  }
}

// User Profile Update Input
export interface UpdateProfileInput {
  name?: string
  email?: string
  phone?: string
  avatar?: string
  preferences?: Partial<UserPreferences>
}

// User Address Input
export interface AddressInput {
  street: string
  city: string
  state: string
  country: string
  postalCode: string
  isDefault?: boolean
  addressType?: Address['addressType']
  phone?: string
  name?: string
}

// Password Management
export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordInput {
  email: string
}

// Authentication
export interface LoginInput {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterInput {
  email: string
  password: string
  name: string
  phone?: string
  acceptTerms: boolean
}

export interface AuthResponse {
  success: boolean
  user: User
  token: string
  refreshToken?: string
  expiresIn?: number
}

export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

// User Session
export interface UserSession {
  id: string
  userId: string
  token: string
  deviceInfo?: DeviceInfo
  ipAddress?: string
  userAgent?: string
  createdAt: Date
  expiresAt: Date
  isActive: boolean
}

export interface DeviceInfo {
  browser: string
  os: string
  device: string
  platform: string
  version?: string
}

// User Statistics
export interface UserStats {
  userId: string
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  wishlistCount: number
  reviewCount: number
  favoriteCategory?: string
  lastOrderDate?: Date
  memberSince: Date
  loyaltyTier: LoyaltyTier
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'

// User Activity
export interface UserActivity {
  id: string
  userId: string
  action: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export interface UserLoginHistory {
  id: string
  userId: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  location?: string
  success: boolean
}

// User Wishlist
export interface Wishlist {
  id: string
  userId: string
  items: WishlistItem[]
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  id: string
  productId: string
  productName: string
  productPrice: number
  productImage: string
  addedAt: Date
  notes?: string
}

// User Cart (for server-side cart)
export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  subtotal: number
  total: number
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  productId: string
  quantity: number
  price: number
  productName: string
  productImage: string
}

// User Reviews
export interface UserReview {
  id: string
  userId: string
  productId: string
  rating: number
  title: string
  comment: string
  images?: string[]
  verified: boolean
  helpful: number
  createdAt: Date
  updatedAt: Date
  productName?: string
  productImage?: string
}

// User Orders
export interface UserOrder {
  id: string
  userId: string
  orderNumber: string
  total: number
  status: string
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
  trackingNumber?: string
  estimatedDelivery?: Date
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  image: string
}

// Admin User Management
export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  role?: UserRole
  status?: UserStatus
  sortBy?: 'createdAt' | 'lastLogin' | 'totalSpent' | 'ordersCount'
  sortOrder?: 'asc' | 'desc'
  dateFrom?: Date
  dateTo?: Date
}

export interface UsersResponse {
  success: boolean
  data: User[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  stats?: {
    totalUsers: number
    activeUsers: number
    newUsersThisMonth: number
    averageOrdersPerUser: number
  }
}

export interface UserResponse {
  success: boolean
  data: User
  stats?: UserStats
  recentActivities?: UserActivity[]
  recentOrders?: UserOrder[]
}

// Admin Actions
export interface UpdateUserInput {
  name?: string
  email?: string
  role?: UserRole
  status?: UserStatus
  phone?: string
  address?: Address
  preferences?: Partial<UserPreferences>
}

export interface CreateUserInput extends RegisterInput {
  role?: UserRole
  status?: UserStatus
}

// Two-Factor Authentication
export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface TwoFactorVerify {
  code: string
}

export interface TwoFactorDisable {
  password: string
  code?: string
}

// Email Verification
export interface EmailVerificationRequest {
  email: string
}

export interface EmailVerificationVerify {
  token: string
}

// User Export
export interface UserExportOptions {
  fields: Array<keyof User>
  format: 'csv' | 'json' | 'excel'
  filter?: UserFilters
  includeAddress?: boolean
  includeOrders?: boolean
  includeActivity?: boolean
}

// Constants
export const USER_ROLES: UserRole[] = ['USER', 'ADMIN', 'MODERATOR', 'SUPPORT']
export const USER_STATUSES: UserStatus[] = ['active', 'inactive', 'suspended', 'banned', 'pending_verification']

export const ROLE_LABELS: Record<UserRole, string> = {
  USER: 'Customer',
  ADMIN: 'Administrator',
  MODERATOR: 'Moderator',
  SUPPORT: 'Support Agent'
}

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  banned: 'Banned',
  pending_verification: 'Pending Verification'
}

export const STATUS_COLORS: Record<UserStatus, string> = {
  active: 'green',
  inactive: 'gray',
  suspended: 'orange',
  banned: 'red',
  pending_verification: 'yellow'
}

export const LOYALTY_TIERS: Record<LoyaltyTier, { minSpent: number; multiplier: number; color: string }> = {
  bronze: { minSpent: 0, multiplier: 1, color: '#CD7F32' },
  silver: { minSpent: 500, multiplier: 1.1, color: '#C0C0C0' },
  gold: { minSpent: 1000, multiplier: 1.2, color: '#FFD700' },
  platinum: { minSpent: 2500, multiplier: 1.3, color: '#E5E4E2' },
  diamond: { minSpent: 5000, multiplier: 1.5, color: '#B9F2FF' }
}

// Type Guards
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    USER_ROLES.includes(obj.role)
  )
}

export function isAdmin(user: User): boolean {
  return user.role === 'ADMIN'
}

export function isModerator(user: User): boolean {
  return user.role === 'MODERATOR' || user.role === 'ADMIN'
}

export function isActiveUser(user: User): boolean {
  return user.status === 'active'
}

// Helper Functions
export function getUserDisplayName(user: User): string {
  return user.name || user.email.split('@')[0]
}

export function getUserInitials(user: User): string {
  if (user.name) {
    const parts = user.name.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }
  return user.email[0].toUpperCase()
}

export function getUserRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] || role
}

export function getUserStatusLabel(status: UserStatus): string {
  return STATUS_LABELS[status] || status
}

export function getUserStatusColor(status: UserStatus): string {
  return STATUS_COLORS[status] || 'gray'
}

export function getLoyaltyTier(totalSpent: number): LoyaltyTier {
  if (totalSpent >= 5000) return 'diamond'
  if (totalSpent >= 2500) return 'platinum'
  if (totalSpent >= 1000) return 'gold'
  if (totalSpent >= 500) return 'silver'
  return 'bronze'
}

export function getLoyaltyTierLabel(tier: LoyaltyTier): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

export function getLoyaltyMultiplier(tier: LoyaltyTier): number {
  return LOYALTY_TIERS[tier].multiplier
}

export function formatUserSince(date: Date): string {
  const now = new Date()
  const diffYears = now.getFullYear() - date.getFullYear()
  const diffMonths = now.getMonth() - date.getMonth()
  
  if (diffYears > 0) {
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`
  }
  if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
  }
  return 'New member'
}

export function calculateUserDiscount(user: User, totalSpent: number): number {
  const tier = getLoyaltyTier(totalSpent)
  const multiplier = LOYALTY_TIERS[tier].multiplier
  return (multiplier - 1) * 100
}

export function canUserReviewProduct(user: User, hasPurchased: boolean): boolean {
  return user.status === 'active' && hasPurchased
}

export function isEmailValid(email: string): boolean {
  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
  return emailRegex.test(email)
}

export function isPasswordStrong(password: string): boolean {
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

// Default values
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'en',
  currency: 'USD',
  notifications: {
    email: {
      orderConfirmation: true,
      shippingUpdate: true,
      deliveryConfirmation: true,
      passwordChange: true,
      promotions: false,
      newsletter: false
    },
    push: {
      orderUpdates: true,
      promotions: false
    },
    sms: {
      orderUpdates: false,
      deliveryConfirmation: true
    }
  },
  newsletter: false,
  marketingEmails: false,
  orderUpdates: true,
  promotions: false,
  twoFactorEnabled: false
}

export const DEFAULT_ADDRESS: Partial<Address> = {
  addressType: 'both',
  isDefault: false
}