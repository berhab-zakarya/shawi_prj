"use client"

import { useState, useEffect } from "react"
import { get, post, put, del } from "../lib/api"


export interface Post {
  id: number
  title: string
  slug: string
  content_type: "article" | "video" | "infographic" | "faq"
  content: string
  media: string | null
  tags: string[]
  meta_title: string
  meta_description: string
  is_featured: boolean
  created_at: string
  updated_at: string
  view_count: number
  author: string
  author_email: string
}

interface TagStat {
  tags__name: string
  count: number
}

interface PostResponse {
  posts: Post[]
  count: number
}
export function extractErrorMessages(errorResponse: Record<string, string[]>): string[] {
    const messages: string[] = [];

    if (!errorResponse || typeof errorResponse !== 'object') {
        return ['An unknown error occurred.'];
    }

    for (const [field, errors] of Object.entries(errorResponse)) {
        if (Array.isArray(errors)) {
            errors.forEach(msg => {
                messages.push(`${field}: ${msg}`);
            });
        }
    }

    return messages.length > 0 ? messages : ['An unknown error occurred.'];
}

// API endpoints
const API_BASE_URL = "http://localhost:8000/api/v1/"
const POSTS_ENDPOINT = `${API_BASE_URL}posts/`
const FEATURED_POSTS_ENDPOINT = `${API_BASE_URL}posts/featured/`
const TAG_STATS_ENDPOINT = `${API_BASE_URL}posts/tag_stats/`

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([])
  const [tagStats, setTagStats] = useState<TagStat[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [totalCount, setTotalCount] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch all posts with optional filters
  const getPosts = async (filters: { content_type?: string; tags__name?: string; created_at?: string } = {}) => {
    try {
      setLoading(true)
      setErrorMessage("")
      const query = new URLSearchParams(
        Object.entries(filters).filter(([_, value]) => value && value !== "all"),
      ).toString()
      const endpoint = query ? `${POSTS_ENDPOINT}?${query}` : POSTS_ENDPOINT
      const response = await get<Post[]>(endpoint, { isPrivate: true })

      // Handle empty response
      if (!response.data) {
        setPosts([])
        setTotalCount(0)
        return
      }

      setPosts(response.data || [])
      setTotalCount(response.data.length || 0)
    } catch (e: any) {
      console.error("Error fetching posts:", e)
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? "خطأ في تحميل المنشورات"))
      setPosts([]) // Set empty array on error
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Fetch a single post by slug
  const getPostBySlug = async (slug: string) => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await get<Post>(`${POSTS_ENDPOINT}${slug}/`, { isPrivate: true })
      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Fetch featured posts
  const getFeaturedPosts = async () => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await get<Post[]>(FEATURED_POSTS_ENDPOINT, { isPrivate: true })
      setFeaturedPosts(response.data || [])
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
    } finally {
      setLoading(false)
    }
  }

  // Fetch tag statistics
  const getTagStats = async () => {
    try {
      setLoading(true)
      setErrorMessage("")
      const response = await get<TagStat[]>(TAG_STATS_ENDPOINT, { isPrivate: true })
      setTagStats(response.data || [])
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""))
    } finally {
      setLoading(false)
    }
  }

  // Create a new post (Admins and Lawyers only)
  const createPost = async (postData: {
    title: string
    content_type: "article" | "video" | "infographic" | "faq"
    content: string
    media?: File
    tags?: string[]
    meta_title?: string
    meta_description?: string
    is_featured?: boolean
  }) => {
    try {
      setLoading(true)
      setErrorMessage("")

      const formData = new FormData()
      formData.append("title", postData.title)
      formData.append("content_type", postData.content_type)
      formData.append("content", postData.content)
      if (postData.media) formData.append("media", postData.media)
      if (postData.tags && postData.tags.length > 0) {
        formData.append("tags", JSON.stringify(postData.tags))
      }
      if (postData.meta_title) formData.append("meta_title", postData.meta_title)
      if (postData.meta_description) formData.append("meta_description", postData.meta_description)
      formData.append("is_featured", postData.is_featured ? "true" : "false")

      const response = await post<Post, FormData>(POSTS_ENDPOINT, formData, {
        isPrivate: true,
        headers: { "Content-Type": "multipart/form-data" },
      })

      // Update posts list and refresh data
      setPosts((prev) => [response.data, ...prev])

      // Refresh featured posts if this post is featured
      if (response.data.is_featured) {
        getFeaturedPosts()
      }

      // Refresh tag stats
      getTagStats()

      return response.data
    } catch (e: any) {
      console.log(e)
      const msg = extractErrorMessages(e.response.data)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? "خطأ في إنشاء المنشور"))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Update a post (Admins and Lawyers only, Lawyers must be the author)
  const updatePost = async (
    slug: string,
    postData: {
      title?: string
      content_type?: "article" | "video" | "infographic" | "faq"
      content?: string
      media?: File
      tags?: string[]
      meta_title?: string
      meta_description?: string
      is_featured?: boolean
    },
  ) => {
    try {
      setLoading(true)
      setErrorMessage("")

      const formData = new FormData()
      if (postData.title) formData.append("title", postData.title)
      if (postData.content_type) formData.append("content_type", postData.content_type)
      if (postData.content) formData.append("content", postData.content)
      if (postData.media) formData.append("media", postData.media)
      if (postData.tags && postData.tags.length > 0) {
        formData.append("tags", JSON.stringify(postData.tags))
      }
      if (postData.meta_title) formData.append("meta_title", postData.meta_title)
      if (postData.meta_description) formData.append("meta_description", postData.meta_description)
      if (postData.is_featured !== undefined) formData.append("is_featured", postData.is_featured ? "true" : "false")

      const response = await put<Post, FormData>(`${POSTS_ENDPOINT}${slug}/`, formData, {
        isPrivate: true,
        headers: { "Content-Type": "multipart/form-data" },
      })

      // Update posts list
      setPosts((prev) => prev.map((post) => (post.slug === slug ? response.data : post)))

      // Refresh featured posts and tag stats
      getFeaturedPosts()
      getTagStats()

      return response.data
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? "خطأ في تحديث المنشور"))
      return null
    } finally {
      setLoading(false)
    }
  }

  // Delete a post (Admins and Lawyers only, Lawyers must be the author)
  const deletePost = async (slug: string) => {
    try {
      setLoading(true)
      setErrorMessage("")
      await del<null>(`${POSTS_ENDPOINT}${slug}/`, { isPrivate: true })

      // Update posts list
      setPosts((prev) => prev.filter((post) => post.slug !== slug))

      // Refresh featured posts and tag stats
      getFeaturedPosts()
      getTagStats()

      return true
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? "خطأ في حذف المنشور"))
      return false
    } finally {
      setLoading(false)
    }
  }

  // Automatically fetch posts, featured posts, and tag stats on mount
  useEffect(() => {
    if (!isInitialized) {
      getPosts()
      getFeaturedPosts()
      getTagStats()
      setIsInitialized(true)
    }
  }, [isInitialized])

  return {
    posts,
    featuredPosts,
    tagStats,
    totalCount,
    loading,
    errorMessage,
    getPosts,
    getPostBySlug,
    getFeaturedPosts,
    getTagStats,
    createPost,
    updatePost,
    deletePost,
  }
}
