// Product Category Enum
export type ProductCategory = 'COMPUTER' | 'MOBILE' | 'ACCESSORIES' | 'GAMING' | 'AUDIO'

// Product Status
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'discontinued'

// Product Interface
export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: ProductCategory
  images: string[]
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  
  // Optional fields for additional info
  sku?: string
  brand?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
    unit: 'cm' | 'in'
  }
  warranty?: string
  tags?: string[]
  status?: ProductStatus
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
    startDate?: Date
    endDate?: Date
  }
  
  // Computed fields
  totalSold?: number
  totalRevenue?: number
  inCart?: number
  averageRating?: number
  reviewCount?: number
  rating?: number // Added for sorting compatibility
}

// Product Variant (for products with multiple options)
export interface ProductVariant {
  id: string
  productId: string
  name: string
  sku: string
  price: number
  stock: number
  attributes: Record<string, string>
  images?: string[]
}

// Product Review
export interface ProductReview {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  title: string
  comment: string
  images?: string[]
  verified: boolean
  helpful: number
  createdAt: Date
  updatedAt: Date
}

// Product Filters
export interface ProductFilters {
  page?: number
  limit?: number
  search?: string
  category?: ProductCategory
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  inStock?: boolean
  sortBy?: 'createdAt' | 'price' | 'name' | 'stock' | 'rating' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  brands?: string[]
  tags?: string[]
  rating?: number
  onSale?: boolean
}

// Products API Response
export interface ProductsResponse {
  success: boolean
  data: Product[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  filters: {
    categories: Array<{
      name: string
      count: number
      totalStock: number
    }>
    priceRange: {
      min: number
      max: number
    }
    brands?: Array<{
      name: string
      count: number
    }>
  }
}

// Single Product API Response
export interface ProductResponse {
  success: boolean
  data: Product
  relatedProducts?: Product[]
  reviews?: ProductReview[]
  stats?: ProductStats
}

// Product Statistics
export interface ProductStats {
  productId: string
  productName: string
  totalOrders: number
  totalQuantitySold: number
  totalRevenue: number
  averageOrderValue: number
  currentStock: number
  viewsCount: number
  wishlistCount: number
  averageRating: number
  reviewCount: number
  createdAt: Date
  lastUpdated: Date
}

// Create Product Input
export interface CreateProductInput {
  name: string
  description?: string
  price: number
  category: ProductCategory
  images?: string[]
  stock?: number
  featured?: boolean
  sku?: string
  brand?: string
  weight?: number
  dimensions?: Product['dimensions']
  warranty?: string
  tags?: string[]
}

// Update Product Input
export interface UpdateProductInput extends Partial<CreateProductInput> {
  status?: ProductStatus
}

// Stock Update Input
export interface StockUpdateInput {
  quantity: number
  operation: 'add' | 'subtract' | 'set'
  reason?: string
}

// Bulk Product Operations
export interface BulkDeleteInput {
  productIds: string[]
  confirm: boolean
}

export interface BulkStockUpdateInput {
  updates: Array<{
    id: string
    stock: number
  }>
}

export interface BulkFeaturedUpdateInput {
  productIds: string[]
  featured: boolean
}

// Product Import/Export
export interface ProductImportRow {
  name: string
  description?: string
  price: number
  category: ProductCategory
  stock: number
  sku?: string
  brand?: string
  images?: string
  tags?: string
}

export interface ProductExportOptions {
  fields: Array<keyof Product>
  format: 'csv' | 'json' | 'excel'
  filter?: ProductFilters
}

// Product Search
export interface ProductSearchResult {
  product: Product
  relevance: number
  matchedFields: string[]
}

export interface ProductSearchParams {
  query: string
  limit?: number
  fuzzy?: boolean
  fields?: Array<keyof Product>
}

// Product Categories
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  children?: Category[]
  productCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface CategoryWithStats extends Category {
  productCount: number
  totalStock: number
  averagePrice: number
  totalRevenue: number
}

// Product Tags
export interface ProductTag {
  id: string
  name: string
  slug: string
  productCount: number
}

// Product Attributes
export interface ProductAttribute {
  id: string
  name: string
  slug: string
  type: 'text' | 'number' | 'color' | 'size' | 'select'
  options?: string[]
}

export interface ProductAttributeValue {
  attributeId: string
  value: string
  productId: string
}

// Product Gallery
export interface ProductImage {
  id: string
  productId: string
  url: string
  alt: string
  order: number
  isPrimary: boolean
  createdAt: Date
}

// Product Inventory
export interface InventoryTransaction {
  id: string
  productId: string
  quantity: number
  type: 'purchase' | 'sale' | 'return' | 'adjustment'
  reason: string
  reference?: string
  createdAt: Date
  createdBy: string
}

// Product Pricing
export interface PriceHistory {
  id: string
  productId: string
  price: number
  oldPrice: number
  discount?: number
  createdAt: Date
}

// Product SEO
export interface ProductSEO {
  productId: string
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  metaRobots?: string
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
}

// Product Wishlist
export interface WishlistItem {
  id: string
  userId: string
  productId: string
  product: Product
  createdAt: Date
}

// Product Comparison
export interface ProductComparison {
  id: string
  products: Product[]
  features: Array<{
    name: string
    values: Array<{
      productId: string
      value: string
    }>
  }>
}

// Product Recommendation
export interface ProductRecommendation {
  product: Product
  score: number
  reason: 'frequently_bought' | 'similar' | 'trending' | 'personalized'
}

// Helper Types
export type ProductSortOption = {
  label: string
  value: string
  field: keyof Product
  order: 'asc' | 'desc'
}

export type ProductFilterOption = {
  label: string
  value: string
  count?: number
}

export type ProductPriceRange = {
  min: number
  max: number
  step?: number
}

// Constants
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'COMPUTER',
  'MOBILE',
  'ACCESSORIES',
  'GAMING',
  'AUDIO'
]

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  COMPUTER: 'Computer',
  MOBILE: 'Mobile',
  ACCESSORIES: 'Accessories',
  GAMING: 'Gaming',
  AUDIO: 'Audio'
}

// Fix: Changed 'rating' to 'averageRating' which exists on Product
export const PRODUCT_SORT_OPTIONS: ProductSortOption[] = [
  { label: 'Newest First', value: 'newest', field: 'createdAt', order: 'desc' },
  { label: 'Price: Low to High', value: 'price_asc', field: 'price', order: 'asc' },
  { label: 'Price: High to Low', value: 'price_desc', field: 'price', order: 'desc' },
  { label: 'Name: A to Z', value: 'name_asc', field: 'name', order: 'asc' },
  { label: 'Name: Z to A', value: 'name_desc', field: 'name', order: 'desc' },
  { label: 'Best Selling', value: 'popular', field: 'totalSold', order: 'desc' },
  { label: 'Top Rated', value: 'rating', field: 'averageRating', order: 'desc' }
]

// Fix: Made category optional and used proper type with partial
export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {
  page: 1,
  limit: 12,
  search: '',
  minPrice: 0,
  maxPrice: 10000,
  featured: false,
  inStock: false,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  brands: [],
  tags: [],
  rating: 0,
  onSale: false
}

// Type Guards
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isProduct(obj: any): obj is Product {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.price === 'number' &&
    PRODUCT_CATEGORIES.includes(obj.category)
  )
}

export function isValidCategory(category: string): category is ProductCategory {
  return PRODUCT_CATEGORIES.includes(category as ProductCategory)
}

export function getCategoryLabel(category: ProductCategory): string {
  return CATEGORY_LABELS[category] || category
}

// Helper Functions
export function calculateDiscountedPrice(product: Product): number {
  if (!product.discount) return product.price
  
  if (product.discount.type === 'percentage') {
    return product.price * (1 - product.discount.value / 100)
  } else {
    return Math.max(0, product.price - product.discount.value)
  }
}

export function isProductOnSale(product: Product): boolean {
  if (!product.discount) return false
  
  if (product.discount.startDate && product.discount.startDate > new Date()) {
    return false
  }
  
  if (product.discount.endDate && product.discount.endDate < new Date()) {
    return false
  }
  
  return true
}

export function getProductStatus(product: Product): ProductStatus {
  if (product.stock === 0) return 'out_of_stock'
  if (product.status === 'inactive') return 'inactive'
  if (product.status === 'discontinued') return 'discontinued'
  return 'active'
}

export function filterProductsByPrice(
  products: Product[],
  minPrice: number,
  maxPrice: number
): Product[] {
  return products.filter(
    product => product.price >= minPrice && product.price <= maxPrice
  )
}

export function sortProducts(
  products: Product[],
  sortBy: keyof Product,
  sortOrder: 'asc' | 'desc'
): Product[] {
  return [...products].sort((a, b) => {
    const aValue = a[sortBy]
    const bValue = b[sortBy]
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime()
    }
    
    return 0
  })
}

export function getProductPriceRange(products: Product[]): ProductPriceRange {
  if (products.length === 0) {
    return { min: 0, max: 0 }
  }
  
  const prices = products.map(p => p.price)
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  }
}

export function groupProductsByCategory(products: Product[]): Map<ProductCategory, Product[]> {
  const grouped = new Map<ProductCategory, Product[]>()
  
  for (const category of PRODUCT_CATEGORIES) {
    grouped.set(category, products.filter(p => p.category === category))
  }
  
  return grouped
}

// Additional utility function to get product rating
export function getProductRating(product: Product): number {
  return product.averageRating || product.rating || 0
}

// Utility to check if product has sufficient stock
export function hasSufficientStock(product: Product, quantity: number): boolean {
  return product.stock >= quantity
}

// Utility to format product price
export function formatProductPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

// Utility to get product image URL
export function getProductImage(product: Product, index: number = 0): string {
  return product.images[index] || '/placeholder.jpg'
}

// Utility to get product category display name
export function getProductCategoryDisplay(category: ProductCategory): string {
  const displayNames: Record<ProductCategory, string> = {
    COMPUTER: 'Computer & Laptop',
    MOBILE: 'Mobile Phones',
    ACCESSORIES: 'Accessories',
    GAMING: 'Gaming Gear',
    AUDIO: 'Audio Equipment'
  }
  return displayNames[category] || category
}