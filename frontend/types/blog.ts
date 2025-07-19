export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  category: string
  imageUrl: string
  tags: string[]
  readTime: number
}

export interface BlogCategory {
  id: string
  name: string
  count: number
}
