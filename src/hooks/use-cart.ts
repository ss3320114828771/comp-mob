'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  stock: number
  category?: string
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  subtotal: number
  shipping: number
  tax: number
  discount: number
  isLoading: boolean
  couponCode: string | null
  couponDiscount: number
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getItem: (productId: string) => CartItem | undefined
  applyCoupon: (code: string) => Promise<boolean>
  removeCoupon: () => void
  calculateTotals: () => void
  syncCartWithServer: () => Promise<void>
  fetchCartFromServer: () => Promise<void>
}

// Helper function to calculate totals
const calculateCartTotals = (items: CartItem[], couponDiscount: number = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 50 ? 0 : 10 // Free shipping over $50
  const tax = subtotal * 0.1 // 10% tax
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const discount = couponDiscount
  const totalPrice = subtotal + shipping + tax - discount
  
  return {
    subtotal,
    shipping,
    tax,
    discount,
    totalPrice,
    totalItems,
  }
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      isLoading: false,
      couponCode: null,
      couponDiscount: 0,

      // Calculate all totals
      calculateTotals: () => {
        const { items, couponDiscount } = get()
        const { subtotal, shipping, tax, discount, totalPrice, totalItems } = calculateCartTotals(items, couponDiscount)
        
        set({
          subtotal,
          shipping,
          tax,
          discount,
          totalPrice,
          totalItems,
        })
      },

      // Add item to cart
      addItem: (item) => {
        const { items, syncCartWithServer } = get()
        const existingItem = items.find(i => i.productId === item.productId)
        
        let newItems: CartItem[]
        
        if (existingItem) {
          // Check stock limit
          const newQuantity = existingItem.quantity + item.quantity
          if (newQuantity > item.stock) {
            toast.error(`Only ${item.stock} items available in stock`)
            return
          }
          
          newItems = items.map(i =>
            i.productId === item.productId
              ? { ...i, quantity: newQuantity }
              : i
          )
          toast.success(`Updated ${item.name} quantity in cart`)
        } else {
          newItems = [...items, { ...item, id: Math.random().toString(36).substr(2, 9) }]
          toast.success(`${item.name} added to cart`)
        }
        
        set({ items: newItems })
        get().calculateTotals()
        
        // Sync with server if logged in
        const token = localStorage.getItem('token')
        if (token) {
          syncCartWithServer()
        }
      },

      // Remove item from cart
      removeItem: (productId) => {
        const { items, syncCartWithServer } = get()
        const item = items.find(i => i.productId === productId)
        
        if (!item) return
        
        const newItems = items.filter(i => i.productId !== productId)
        set({ items: newItems })
        get().calculateTotals()
        
        toast.success(`${item.name} removed from cart`)
        
        // Sync with server if logged in
        const token = localStorage.getItem('token')
        if (token) {
          syncCartWithServer()
        }
      },

      // Update item quantity
      updateQuantity: (productId, quantity) => {
        const { items, syncCartWithServer } = get()
        const item = items.find(i => i.productId === productId)
        
        if (!item) return
        
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        if (quantity > item.stock) {
          toast.error(`Only ${item.stock} items available in stock`)
          return
        }
        
        const newItems = items.map(i =>
          i.productId === productId ? { ...i, quantity } : i
        )
        
        set({ items: newItems })
        get().calculateTotals()
        
        // Sync with server if logged in
        const token = localStorage.getItem('token')
        if (token) {
          syncCartWithServer()
        }
      },

      // Clear entire cart
      clearCart: () => {
        const { syncCartWithServer } = get()
        set({ 
          items: [], 
          totalItems: 0, 
          totalPrice: 0,
          subtotal: 0,
          shipping: 0,
          tax: 0,
          discount: 0,
          couponCode: null,
          couponDiscount: 0,
        })
        toast.success('Cart cleared')
        
        // Sync with server if logged in
        const token = localStorage.getItem('token')
        if (token) {
          syncCartWithServer()
        }
      },

      // Get total item count
      getItemCount: () => {
        const { items } = get()
        return items.reduce((sum, item) => sum + item.quantity, 0)
      },

      // Get specific item
      getItem: (productId) => {
        const { items } = get()
        return items.find(i => i.productId === productId)
      },

      // Apply coupon code
      applyCoupon: async (code: string) => {
        set({ isLoading: true })
        
        try {
          // Simulate API call to validate coupon
          // In production, replace with actual API call
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Example coupon logic
          let discountAmount = 0
          if (code === 'WELCOME10') {
            discountAmount = get().subtotal * 0.1 // 10% off
          } else if (code === 'SAVE20') {
            discountAmount = get().subtotal * 0.2 // 20% off
          } else if (code === 'FREESHIP') {
            discountAmount = get().shipping // Free shipping
          } else {
            toast.error('Invalid coupon code')
            return false
          }
          
          set({ 
            couponCode: code, 
            couponDiscount: discountAmount 
          })
          get().calculateTotals()
          
          toast.success(`Coupon applied! You saved $${discountAmount.toFixed(2)}`)
          return true
          
        } catch (error) {
          console.error('Coupon application error:', error)
          toast.error('Failed to apply coupon')
          return false
        } finally {
          set({ isLoading: false })
        }
      },

      // Remove coupon
      removeCoupon: () => {
        set({ 
          couponCode: null, 
          couponDiscount: 0 
        })
        get().calculateTotals()
        toast.success('Coupon removed')
      },

      // Sync cart with server (for authenticated users)
      syncCartWithServer: async () => {
        const token = localStorage.getItem('token')
        if (!token) return
        
        const { items } = get()
        
        try {
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ items }),
          })
          
          if (!response.ok) {
            throw new Error('Failed to sync cart')
          }
          
        } catch (error) {
          console.error('Cart sync error:', error)
        }
      },

      // Fetch cart from server (for authenticated users)
      fetchCartFromServer: async () => {
        const token = localStorage.getItem('token')
        if (!token) return
        
        set({ isLoading: true })
        
        try {
          const response = await fetch('/api/cart', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
          
          if (!response.ok) {
            throw new Error('Failed to fetch cart')
          }
          
          const data = await response.json()
          
          if (data.items && data.items.length > 0) {
            set({ items: data.items })
            get().calculateTotals()
          }
          
        } catch (error) {
          console.error('Fetch cart error:', error)
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        },
      },
    }
  )
)

// Custom hooks for specific cart features
export const useCartItems = () => {
  const { items } = useCart()
  return items
}

export const useCartTotals = () => {
  const { subtotal, shipping, tax, discount, totalPrice, totalItems } = useCart()
  return { subtotal, shipping, tax, discount, totalPrice, totalItems }
}

export const useCartCount = () => {
  const { totalItems } = useCart()
  return totalItems
}

export const useCartItem = (productId: string) => {
  const { getItem } = useCart()
  return getItem(productId)
}

// Helper to check if item is in cart
export const useIsInCart = (productId: string) => {
  const { getItem } = useCart()
  return !!getItem(productId)
}

// Helper to get item quantity in cart
export const useCartItemQuantity = (productId: string) => {
  const { getItem } = useCart()
  return getItem(productId)?.quantity || 0
}

// Checkout summary hook
export const useCheckoutSummary = () => {
  const { subtotal, shipping, tax, discount, totalPrice, totalItems } = useCart()
  
  return {
    subtotal,
    shipping,
    tax,
    discount,
    totalPrice,
    totalItems,
    hasItems: totalItems > 0,
    isFreeShipping: subtotal > 50,
    freeShippingThreshold: 50,
    remainingForFreeShipping: Math.max(0, 50 - subtotal),
  }
}