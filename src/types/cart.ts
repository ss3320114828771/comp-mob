import { Product, ProductVariant } from './product'

// ==================== Cart Item Types ====================

export interface CartItem {
  id: string
  productId: string
  productName: string
  productPrice: number
  quantity: number
  image: string
  stock: number
  category?: string
  
  // Optional fields
  variantId?: string
  variant?: ProductVariant
  subtotal?: number
  discount?: number
  discountAmount?: number
  total?: number
  notes?: string
  
  // Product details for quick access
  product?: Product
}

export interface CartItemWithDetails extends CartItem {
  product: Product
  subtotal: number
  total: number
  isAvailable: boolean
  maxQuantity: number
  hasDiscount: boolean
  discountPercentage?: number
}

// ==================== Cart Types ====================

export interface Cart {
  id: string
  userId?: string
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  totalItems: number
  couponCode?: string
  couponDiscount?: number
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface CartWithDetails extends Cart {
  items: CartItemWithDetails[]
  subtotalFormatted: string
  shippingFormatted: string
  taxFormatted: string
  discountFormatted: string
  totalFormatted: string
  hasItems: boolean
  isEligibleForFreeShipping: boolean
  freeShippingThreshold: number
  remainingForFreeShipping: number
  estimatedDelivery?: Date
}

// ==================== Cart Operations ====================

export interface AddToCartInput {
  productId: string
  quantity: number
  variantId?: string
  notes?: string
}

export interface UpdateCartItemInput {
  itemId: string
  quantity: number
  notes?: string
}

export interface RemoveCartItemInput {
  itemId: string
}

export interface BulkCartOperation {
  items: Array<{
    productId: string
    quantity: number
    variantId?: string
  }>
}

// ==================== Cart Response Types ====================

export interface CartResponse {
  success: boolean
  data: Cart
  message?: string
}

export interface CartItemResponse {
  success: boolean
  data: CartItem
  message?: string
}

export interface CartSummaryResponse {
  success: boolean
  data: {
    subtotal: number
    shipping: number
    tax: number
    discount: number
    total: number
    totalItems: number
    itemCount: number
    uniqueItems: number
  }
  message?: string
}

// ==================== Coupon Types ====================

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  minSpend?: number
  maxDiscount?: number
  startDate?: Date
  endDate?: Date
  usageLimit?: number
  usedCount: number
  perUserLimit?: number
  applicableCategories?: string[]
  applicableProducts?: string[]
  excludedProducts?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ApplyCouponInput {
  code: string
}

export interface CouponResponse {
  success: boolean
  data: {
    coupon: Coupon
    discount: number
    newTotal: number
    message: string
  }
}

// ==================== Checkout Types ====================

export interface CheckoutItem {
  itemId: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  subtotal: number
  variant?: string
}

export interface CheckoutSummary {
  items: CheckoutItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  totalItems: number
  couponApplied?: string
  couponDiscount?: number
  shippingMethod?: ShippingMethod
}

export interface ShippingMethod {
  id: string
  name: string
  price: number
  estimatedDays: number
  estimatedDelivery?: Date
  isFree?: boolean
  minSpend?: number
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'
  icon?: string
  isEnabled: boolean
  processingFee?: number
}

// ==================== Cart State Types ====================

export interface CartState {
  // State
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  totalItems: number
  couponCode: string | null
  couponDiscount: number
  isLoading: boolean
  error: string | null
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updateItemNotes: (productId: string, notes: string) => void
  clearCart: () => void
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: () => void
  calculateTotals: () => void
  syncWithServer: () => Promise<void>
  fetchCartFromServer: () => Promise<void>
  
  // Selectors
  getItemCount: () => number
  getItem: (productId: string) => CartItem | undefined
  getItemQuantity: (productId: string) => number
  getSubtotal: () => number
  getTotal: () => number
  getShippingCost: () => number
  getTaxAmount: () => number
  isInCart: (productId: string) => boolean
  hasItems: () => boolean
  isEligibleForFreeShipping: () => boolean
}

// ==================== Cart Validation Types ====================

export interface CartValidationError {
  itemId: string
  productId: string
  message: string
  type: 'out_of_stock' | 'price_changed' | 'product_unavailable' | 'quantity_exceeded'
  availableStock?: number
}

export interface CartValidationResult {
  isValid: boolean
  errors: CartValidationError[]
  warnings: string[]
  updatedItems?: CartItem[]
}

// ==================== Cart Analytics Types ====================

export interface CartAnalytics {
  totalCarts: number
  activeCarts: number
  abandonedCarts: number
  averageCartValue: number
  conversionRate: number
  topProducts: Array<{
    productId: string
    productName: string
    addedCount: number
    conversionRate: number
  }>
  cartAbandonmentRate: number
  averageTimeInCart: number
}

export interface CartAbandonmentData {
  cartId: string
  userId?: string
  email?: string
  totalValue: number
  items: CartItem[]
  createdAt: Date
  abandonedAt: Date
  recoveryStatus: 'pending' | 'sent' | 'recovered' | 'expired'
  recoveryEmailSent?: Date
  recoveredAt?: Date
}

// ==================== Cart Export Types ====================

export interface CartExportOptions {
  format: 'json' | 'csv' | 'pdf'
  includeAbandoned?: boolean
  dateFrom?: Date
  dateTo?: Date
  minValue?: number
  maxValue?: number
}

export interface CartExportData {
  carts: Cart[]
  summary: {
    totalCarts: number
    totalValue: number
    averageValue: number
    uniqueProducts: number
  }
  exportDate: Date
  dateRange?: {
    from: Date
    to: Date
  }
}

// ==================== Helper Types ====================

export type CartStatus = 'active' | 'abandoned' | 'converted' | 'expired'

export type CartEventType = 
  | 'add_item'
  | 'remove_item'
  | 'update_quantity'
  | 'apply_coupon'
  | 'remove_coupon'
  | 'clear_cart'
  | 'checkout_started'
  | 'checkout_completed'
  | 'abandoned'

export interface CartEvent {
  id: string
  cartId: string
  type: CartEventType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
  timestamp: Date
}

// ==================== Constants ====================

export const DEFAULT_SHIPPING_COST = 10
export const FREE_SHIPPING_THRESHOLD = 50
export const TAX_RATE = 0.1 // 10%
export const MAX_CART_ITEMS = 50
export const MAX_ITEM_QUANTITY = 99
export const CART_EXPIRY_DAYS = 7

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standard Shipping',
    price: 5,
    estimatedDays: 5,
  },
  {
    id: 'express',
    name: 'Express Shipping',
    price: 15,
    estimatedDays: 2,
  },
  {
    id: 'free',
    name: 'Free Shipping',
    price: 0,
    estimatedDays: 7,
    isFree: true,
    minSpend: 50,
  },
]

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit / Debit Card',
    type: 'card',
    isEnabled: true,
    processingFee: 0.029, // 2.9%
  },
  {
    id: 'paypal',
    name: 'PayPal',
    type: 'paypal',
    isEnabled: true,
    processingFee: 0.03, // 3%
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    type: 'bank_transfer',
    isEnabled: true,
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    type: 'cash_on_delivery',
    isEnabled: true,
    processingFee: 2, // $2 fee
  },
]

// ==================== Helper Functions ====================

/**
 * Calculate cart subtotal
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0)
}

/**
 * Calculate shipping cost
 */
export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST
}

/**
 * Calculate tax amount
 */
export function calculateTax(subtotal: number): number {
  return subtotal * TAX_RATE
}

/**
 * Calculate total after discount
 */
export function calculateTotalAfterDiscount(total: number, discount: number): number {
  return Math.max(0, total - discount)
}

/**
 * Calculate discount amount from coupon
 */
export function calculateCouponDiscount(
  subtotal: number,
  coupon: Coupon
): number {
  let discount = 0
  
  if (coupon.type === 'percentage') {
    discount = subtotal * (coupon.value / 100)
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount)
    }
  } else if (coupon.type === 'fixed') {
    discount = coupon.value
  } else if (coupon.type === 'free_shipping') {
    discount = calculateShipping(subtotal)
  }
  
  return Math.min(discount, subtotal)
}

/**
 * Check if coupon is valid
 */
export function isCouponValid(
  coupon: Coupon,
  subtotal: number,
  userId?: string,
  userUsedCount?: number
): { valid: boolean; message?: string } {
  const now = new Date()
  
  if (coupon.startDate && coupon.startDate > now) {
    return { valid: false, message: 'Coupon not yet active' }
  }
  
  if (coupon.endDate && coupon.endDate < now) {
    return { valid: false, message: 'Coupon has expired' }
  }
  
  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return { valid: false, message: `Minimum spend of $${coupon.minSpend} required` }
  }
  
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, message: 'Coupon usage limit reached' }
  }
  
  if (coupon.perUserLimit && userUsedCount && userUsedCount >= coupon.perUserLimit) {
    return { valid: false, message: 'You have already used this coupon' }
  }
  
  return { valid: true }
}

/**
 * Validate cart item quantity
 */
export function isValidQuantity(quantity: number, stock: number): boolean {
  return quantity > 0 && quantity <= Math.min(stock, MAX_ITEM_QUANTITY)
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(items: CartItem[]): {
  subtotal: number
  shipping: number
  tax: number
  total: number
  totalItems: number
} {
  const subtotal = calculateSubtotal(items)
  const shipping = calculateShipping(subtotal)
  const tax = calculateTax(subtotal)
  const total = subtotal + shipping + tax
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  
  return { subtotal, shipping, tax, total, totalItems }
}

/**
 * Check if cart is eligible for free shipping
 */
export function isEligibleForFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD
}

/**
 * Get remaining amount for free shipping
 */
export function getRemainingForFreeShipping(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
}

/**
 * Format cart summary
 */
export function formatCartSummary(cart: Cart): CartSummaryResponse['data'] {
  return {
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    tax: cart.tax,
    discount: cart.discount,
    total: cart.total,
    totalItems: cart.totalItems,
    itemCount: cart.items.length,
    uniqueItems: new Set(cart.items.map(i => i.productId)).size,
  }
}

/**
 * Check if cart has items
 */
export function hasItems(cart: Cart): boolean {
  return cart.items.length > 0
}

/**
 * Get item count by product
 */
export function getItemCountByProduct(cart: Cart, productId: string): number {
  const item = cart.items.find(i => i.productId === productId)
  return item?.quantity || 0
}

/**
 * Validate cart items against product stock
 */
export function validateCartItems(
  items: CartItem[],
  products: Map<string, { stock: number; price: number; available: boolean }>
): CartValidationResult {
  const errors: CartValidationError[] = []
  const warnings: string[] = []
  const updatedItems: CartItem[] = []
  
  for (const item of items) {
    const product = products.get(item.productId)
    
    if (!product || !product.available) {
      errors.push({
        itemId: item.id,
        productId: item.productId,
        message: 'Product is no longer available',
        type: 'product_unavailable',
      })
      continue
    }
    
    if (item.quantity > product.stock) {
      errors.push({
        itemId: item.id,
        productId: item.productId,
        message: `Only ${product.stock} items available`,
        type: 'out_of_stock',
        availableStock: product.stock,
      })
      
      // Update to max available
      updatedItems.push({
        ...item,
        quantity: product.stock,
      })
    }
    
    if (item.productPrice !== product.price) {
      warnings.push(`Price for ${item.productName} has changed`)
      updatedItems.push({
        ...item,
        productPrice: product.price,
      })
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    updatedItems: updatedItems.length > 0 ? updatedItems : undefined,
  }
}