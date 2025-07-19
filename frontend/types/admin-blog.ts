
export interface Post {
  id: number;
  title: string;
  slug: string;
  content_type: string;
  content: string;
  media: string | null;
  tags: string[];
  meta_title: string;
  meta_description: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  view_count: number;
  author: string;
  author_email: string;
  author_role: string;
  last_modified_by: string | null;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  date_joined: string;
  profile: {
    phone_number: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    occupation: string | null;
  } | null;
}

export interface PostStats {
  total_posts: number;
  posts_by_type: { [key: string]: number };
  featured_posts: number;
  posts_by_author: { [key: string]: number };
}

export interface CreatePostData {
  title: string;
  content_type: string;
  content: string;
  media?: File;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  is_featured?: boolean;
}

export interface UpdatePostData extends Partial<CreatePostData> {}

export interface CreateUserData {
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  is_active?: boolean;
  email_verified?: boolean;
  profile?: {
    phone_number?: string;
    address?: string;
    city?: string;
    country?: string;
    occupation?: string;
  };
}

export interface UpdateUserData extends Partial<CreateUserData> {}