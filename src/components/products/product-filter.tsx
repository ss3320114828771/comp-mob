/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSearch, FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ProductFilters, ProductCategory } from '@/types/product'
import { CATEGORY_LABELS } from '@/types/product'
import { cn } from '@/lib/utils'

interface ProductFiltersProps {
  filters: ProductFilters
  setFilters: (filters: ProductFilters) => void
  filtersInfo: {
    categories: Array<{ name: string; count: number; totalStock: number }>
    priceRange: { min: number; max: number }
  }
  onClose?: () => void
  isMobile?: boolean
}

export function ProductFilters({
  filters,
  setFilters,
  filtersInfo,
  onClose: _onClose,
  isMobile = false
}: ProductFiltersProps) {
  const [isOpen, setIsOpen] = useState(!isMobile)
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || filtersInfo.priceRange.min,
    max: filters.maxPrice || filtersInfo.priceRange.max,
  })
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    availability: true,
    featured: true,
  })

  // Update local price range when filters change
  useEffect(() => {
    setPriceRange({
      min: filters.minPrice ?? filtersInfo.priceRange.min,
      max: filters.maxPrice ?? filtersInfo.priceRange.max,
    })
  }, [filters.minPrice, filters.maxPrice, filtersInfo.priceRange])

  const handleCategoryChange = (category: string) => {
    if (filters.category === category) {
      // Remove filter if same category
       
      const { category: _, ...rest } = filters
      setFilters(rest)
    } else {
      setFilters({ ...filters, category: category as ProductCategory, page: 1 })
    }
  }

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newRange = { ...priceRange, [type]: value }
    setPriceRange(newRange)
  }

  const applyPriceFilter = () => {
    setFilters({
      ...filters,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
      page: 1,
    })
  }

  const clearPriceFilter = () => {
    setPriceRange({
      min: filtersInfo.priceRange.min,
      max: filtersInfo.priceRange.max,
    })
     
    const { minPrice, maxPrice, ...rest } = filters
    setFilters(rest)
  }

  const handleAvailabilityChange = (inStock: boolean) => {
    if (filters.inStock === inStock) {
      // Remove filter
       
      const { inStock: _, ...rest } = filters
      setFilters(rest)
    } else {
      setFilters({ ...filters, inStock, page: 1 })
    }
  }

  const handleFeaturedChange = (featured: boolean) => {
    if (filters.featured === featured) {
      // Remove filter
       
      const { featured: _, ...rest } = filters
      setFilters(rest)
    } else {
      setFilters({ ...filters, featured, page: 1 })
    }
  }

  const clearAllFilters = () => {
    setFilters({
      page: 1,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    })
    setPriceRange({
      min: filtersInfo.priceRange.min,
      max: filtersInfo.priceRange.max,
    })
  }

  const hasActiveFilters = () => {
    return !!(
      filters.category ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.inStock !== undefined ||
      filters.featured !== undefined
    )
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const FilterSection = ({ 
    title, 
    section, 
    children 
  }: { 
    title: string; 
    section: keyof typeof expandedSections; 
    children: React.ReactNode 
  }) => (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex justify-between items-center py-4 text-left font-semibold text-gray-700 hover:text-purple-600 transition"
      >
        <span>{title}</span>
        {expandedSections[section] ? <FaChevronUp /> : <FaChevronDown />}
      </button>
      <AnimatePresence>
        {expandedSections[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  // Mobile drawer version
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaFilter /> Filters
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-4">
                <FiltersContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  // Desktop version
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sticky top-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FaFilter /> Filters
        </h2>
        {hasActiveFilters() && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        )}
      </div>
      
      <FiltersContent />
    </div>
  )

  function FiltersContent() {
    return (
      <div className="space-y-2">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="pl-10"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Categories */}
        <FilterSection title="Categories" section="categories">
          <div className="space-y-2">
            {filtersInfo.categories.map((category) => {
              const isActive = filters.category === category.name
              return (
                <button
                  key={category.name}
                  onClick={() => handleCategoryChange(category.name)}
                  className={cn(
                    "w-full flex justify-between items-center px-3 py-2 rounded-lg transition",
                    isActive
                      ? "bg-purple-100 text-purple-700 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <span>{CATEGORY_LABELS[category.name as ProductCategory] || category.name}</span>
                  <span className="text-sm text-gray-500">{category.count}</span>
                </button>
              )
            })}
          </div>
        </FilterSection>

        {/* Price Range */}
        <FilterSection title="Price Range" section="price">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-gray-600 mb-1 block">Min ($)</label>
                <Input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                  min={filtersInfo.priceRange.min}
                  max={filtersInfo.priceRange.max}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 mb-1 block">Max ($)</label>
                <Input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                  min={filtersInfo.priceRange.min}
                  max={filtersInfo.priceRange.max}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Price Range Slider */}
            <div className="px-2">
              <input
                type="range"
                min={filtersInfo.priceRange.min}
                max={filtersInfo.priceRange.max}
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <input
                type="range"
                min={filtersInfo.priceRange.min}
                max={filtersInfo.priceRange.max}
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
              />
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" onClick={applyPriceFilter} className="flex-1">
                Apply
              </Button>
              {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                <Button size="sm" variant="outline" onClick={clearPriceFilter}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection title="Availability" section="availability">
          <div className="space-y-2">
            <button
              onClick={() => handleAvailabilityChange(true)}
              className={cn(
                "w-full flex justify-between items-center px-3 py-2 rounded-lg transition",
                filters.inStock === true
                  ? "bg-green-100 text-green-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <span>In Stock</span>
              {filters.inStock === true && <span className="text-green-600">✓</span>}
            </button>
            <button
              onClick={() => handleAvailabilityChange(false)}
              className={cn(
                "w-full flex justify-between items-center px-3 py-2 rounded-lg transition",
                filters.inStock === false
                  ? "bg-red-100 text-red-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <span>Out of Stock</span>
              {filters.inStock === false && <span className="text-red-600">✓</span>}
            </button>
          </div>
        </FilterSection>

        {/* Featured Products */}
        <FilterSection title="Featured" section="featured">
          <div className="space-y-2">
            <button
              onClick={() => handleFeaturedChange(true)}
              className={cn(
                "w-full flex justify-between items-center px-3 py-2 rounded-lg transition",
                filters.featured === true
                  ? "bg-amber-100 text-amber-700 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
              )}
            >
              <span>Featured Products</span>
              {filters.featured === true && <span className="text-amber-600">✓</span>}
            </button>
          </div>
        </FilterSection>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Active Filters:</h3>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1">
                  {CATEGORY_LABELS[filters.category as ProductCategory]}
                  <button
                    onClick={() => handleCategoryChange(filters.category!)}
                    className="hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                  ${filters.minPrice ?? filtersInfo.priceRange.min} - ${filters.maxPrice ?? filtersInfo.priceRange.max}
                  <button onClick={clearPriceFilter} className="hover:text-blue-900">
                    ×
                  </button>
                </span>
              )}
              {filters.inStock !== undefined && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
                  {filters.inStock ? 'In Stock' : 'Out of Stock'}
                  <button
                    onClick={() => handleAvailabilityChange(filters.inStock!)}
                    className="hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.featured === true && (
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm flex items-center gap-1">
                  Featured
                  <button
                    onClick={() => handleFeaturedChange(true)}
                    className="hover:text-amber-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}

// Filter Button for Mobile
export function MobileFilterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden fixed bottom-6 left-6 z-40 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition"
    >
      <FaFilter className="text-xl" />
    </button>
  )
}