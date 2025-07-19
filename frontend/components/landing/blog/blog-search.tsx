"use client"

import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import type { BlogCategory } from "@/types/blog"

interface BlogSearchProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  categories: BlogCategory[]
}

export function BlogSearch({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
}: BlogSearchProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 mb-6"
    >
      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="ابحث في المقالات..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10 pl-4 py-3 text-right border-2 border-gray-200 focus:border-[#D4AF37] rounded-xl transition-colors duration-200"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-1 h-auto hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? "bg-[#D4AF37] hover:bg-[#B8941F] text-white shadow-lg"
                  : "border-2 border-gray-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
              }`}
            >
              {category.name}
              <span className="mr-2 text-xs opacity-75">({category.count})</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
