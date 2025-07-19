import { useState, useMemo } from 'react'
import { BlogPost } from '@/types/blog'

// Mock data - replace with your actual data source
const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'أحكام العقود في الفقه الإسلامي',
    excerpt: 'دراسة شاملة حول أحكام العقود وشروطها في الشريعة الإسلامية وتطبيقاتها المعاصرة',
    content: 'محتوى المقال...',
    author: 'د. محمد أحمد',
    publishedAt: '2024-01-15',
    category: 'العقود والمعاملات',
    imageUrl: '/images/law.jpg',
    tags: ['فقه', 'عقود', 'معاملات'],
    readTime: 8
  },
  {
    id: '2',
    title: 'الأحكام القضائية في النظام السعودي',
    excerpt: 'تحليل للأحكام القضائية الحديثة وتأثيرها على النظام القانوني في المملكة العربية السعودية',
    content: 'محتوى المقال...',
    author: 'أ. فاطمة السالم',
    publishedAt: '2024-01-10',
    category: 'الأحكام القضائية',
    imageUrl: '/images/law.jpg',
    tags: ['قضاء', 'أحكام', 'نظام'],
    readTime: 12
  },
  {
    id: '3',
    title: 'التحكيم التجاري في القانون الدولي',
    excerpt: 'نظرة على آليات التحكيم التجاري الدولي وأهميتها في حل النزاعات التجارية',
    content: 'محتوى المقال...',
    author: 'د. عبدالله الخالد',
    publishedAt: '2024-01-05',
    category: 'العقود والمعاملات',
    imageUrl: '/images/law.jpg',
    tags: ['تحكيم', 'تجارة', 'قانون دولي'],
    readTime: 15
  },
  {
    id: '4',
    title: 'حقوق المرأة في النظام القضائي',
    excerpt: 'دراسة تحليلية لحقوق المرأة وضماناتها في النظام القضائي المعاصر',
    content: 'محتوى المقال...',
    author: 'د. نورا المطيري',
    publishedAt: '2024-01-01',
    category: 'الأحكام القضائية',
    imageUrl: '/images/law.jpg',
    tags: ['حقوق المرأة', 'قضاء', 'نظام'],
    readTime: 10
  }
]

export function useBlog() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = useMemo(() => {
    const categoryCount: Record<string, number> = {}
    mockBlogPosts.forEach(post => {
      categoryCount[post.category] = (categoryCount[post.category] || 0) + 1
    })
    
    return [
      { id: 'all', name: 'جميع المقالات', count: mockBlogPosts.length },
      ...Object.entries(categoryCount).map(([category, count]) => ({
        id: category,
        name: category,
        count
      }))
    ]
  }, [])

  const filteredPosts = useMemo(() => {
    return mockBlogPosts.filter(post => {
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  return {
    posts: filteredPosts,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory
  }
}
