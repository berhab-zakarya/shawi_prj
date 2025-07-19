import { useState } from "react";
import { get, post, put, del } from "../lib/api";
import { 
  ADMIN_POSTS_ENDPOINT,
  ADMIN_POSTS_STATS_ENDPOINT,
  ADMIN_USER_LIST_ENDPOINT,
  ADMIN_USER_TOGGLE_ACTIVE_ENDPOINT,
  ADMIN_USER_CONTENT_CREATORS_ENDPOINT
} from "../lib/apiConstants";
import { extractErrorMessages } from "../lib/errorHandler";
import { Post, User, PostStats, CreatePostData, UpdatePostData, CreateUserData, UpdateUserData } from "@/types/admin-blog";

export function useAdmin() {
  const [loading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Posts Management
  const createPost = async (data: CreatePostData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const formData = new FormData();
      if (data.title) formData.append("title", data.title);
      if (data.content_type) formData.append("content_type", data.content_type);
      if (data.content) formData.append("content", data.content);
      if (data.media) formData.append("media", data.media);
      if (data.tags) formData.append("tags", JSON.stringify(data.tags));
      if (data.meta_title) formData.append("meta_title", data.meta_title);
      if (data.meta_description) formData.append("meta_description", data.meta_description);
      if (data.is_featured !== undefined) formData.append("is_featured", String(data.is_featured));

      const response = await post<{ message: string; data: Post }, FormData>(
        ADMIN_POSTS_ENDPOINT,
        formData,
        { isPrivate: true }
      );
      return response.data.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePost = async (slug: string, data: UpdatePostData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const formData = new FormData();
      if (data.title) formData.append("title", data.title);
      if (data.content_type) formData.append("content_type", data.content_type);
      if (data.content) formData.append("content", data.content);
      if (data.media) formData.append("media", data.media);
      if (data.tags) formData.append("tags", JSON.stringify(data.tags));
      if (data.meta_title) formData.append("meta_title", data.meta_title);
      if (data.meta_description) formData.append("meta_description", data.meta_description);
      if (data.is_featured !== undefined) formData.append("is_featured", String(data.is_featured));

      const response = await put<{ message: string; data: Post }, FormData>(
        `${ADMIN_POSTS_ENDPOINT}${slug}/`,
        formData,
        { isPrivate: true }
      );
      return response.data.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (slug: string) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      await del<void>(
        `${ADMIN_POSTS_ENDPOINT}${slug}/`,
        { isPrivate: true }
      );
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const getPostStats = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await get<PostStats>(
        ADMIN_POSTS_STATS_ENDPOINT,
        { isPrivate: true }
      );
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // User Management
  const createUser = async (data: CreateUserData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const payload: any = { ...data };
      if (data.profile) {
        payload.profile = { ...data.profile };
      }
      const response = await post<{ message: string; data: User }, any>(
        ADMIN_USER_LIST_ENDPOINT,
        payload,
        { isPrivate: true }
      );
      return response.data.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: number, data: UpdateUserData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const payload: any = { ...data };
      if (data.profile) {
        payload.profile = { ...data.profile };
      }
      const response = await put<{ message: string; data: User }, any>(
        `${ADMIN_USER_LIST_ENDPOINT}${id}/`,
        payload,
        { isPrivate: true }
      );
      return response.data.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleUserActive = async (id: number) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await post<{ message: string; data: { is_active: boolean } }, {}>(
        ADMIN_USER_TOGGLE_ACTIVE_ENDPOINT(id),
        {},
        { isPrivate: true }
      );
      return response.data.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const getContentCreators = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await get<User[]>(
        ADMIN_USER_CONTENT_CREATORS_ENDPOINT,
        { isPrivate: true }
      );
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    errorMessage,
    loading,
    createPost,
    updatePost,
    deletePost,
    getPostStats,
    createUser,
    updateUser,
    toggleUserActive,
    getContentCreators,
  };
}