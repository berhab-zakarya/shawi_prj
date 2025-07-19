"use client"

import { motion } from "framer-motion"
import type { BlogPost } from "@/types/blog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User } from "lucide-react"
import Image from "next/image"

interface BlogCardProps {
  post: BlogPost
  index: number
}

export function BlogCard({ post, index }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2 },
      }}
      className="h-full"
    >
      <Card className="h-full overflow-hidden group cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
        <div className="relative overflow-hidden">
          <Image
            src={post.imageUrl || "/images/law.jpg"}
            alt={post.title}
            width={400}
            height={300}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Badge
            className="absolute top-4 right-4 text-white border-0 shadow-lg"
            style={{ backgroundColor: "#D4AF37" }}
          >
            {post.category}
          </Badge>
        </div>

        <CardHeader className="pb-3">
          <motion.h3
            className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[#D4AF37] transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
          >
            {post.title}
          </motion.h3>
        </CardHeader>

        <CardContent className="pt-0 flex flex-col justify-between flex-1">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">{post.excerpt}</p>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, tagIndex) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + tagIndex * 0.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-700 hover:bg-[#D4AF37] hover:text-white transition-colors duration-200"
                  >
                    {tag}
                  </Badge>
                </motion.span>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{post.readTime} دقائق</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
