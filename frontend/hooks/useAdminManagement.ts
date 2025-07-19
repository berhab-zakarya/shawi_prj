import { useState, useEffect } from "react";
import { get, put, del, post, patch } from "../lib/api";
import {
  ADMIN_USER_LIST_ENDPOINT,
  ADMIN_USER_DETAIL_ENDPOINT,
  ADMIN_USER_UPDATE_ENDPOINT,
  ADMIN_USER_DELETE_ENDPOINT,
  ADMIN_USER_TOGGLE_ACTIVE_ENDPOINT,
  ADMIN_NOTIFICATION_CREATE_ENDPOINT,
  USER_NOTIFICATION_LIST_ENDPOINT,
  USER_NOTIFICATION_MARK_READ_ENDPOINT,
} from "@/lib/apiConstants";
import { extractErrorMessages } from "@/lib/errorHandler";
import {
  AdminUser,
  AdminUserResponse,
  Notification,
  NotificationCreateData,
  NotificationResponse,
  UpdateAdminUserData,
} from "@/types/admin";

export function useAdminManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all users
  const getUsers = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await get<AdminUserResponse>(ADMIN_USER_LIST_ENDPOINT, {
        isPrivate: true,
      });
      setUsers(response.data);
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single user details
  const getUserDetails = async (id: number) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await get<AdminUser>(
        ADMIN_USER_DETAIL_ENDPOINT(id),
        { isPrivate: true }
      );
      setSelectedUser(response.data);
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user
  const updateUser = async (id: number, data: UpdateAdminUserData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const formData = new FormData();
      if (data.first_name) formData.append("first_name", data.first_name);
      if (data.last_name) formData.append("last_name", data.last_name);
      if (data.bio) formData.append("bio", data.bio);
      if (data.time_zone) formData.append("time_zone", data.time_zone);
      if (data.role) formData.append("role", data.role.toString());
      if (data.avatar) formData.append("avatar", data.avatar);
      if (data.profile) {
        if (data.profile.phone_number)
          formData.append("profile.phone_number", data.profile.phone_number);
        if (data.profile.address)
          formData.append("profile.address", data.profile.address);
        if (data.profile.city) formData.append("profile.city", data.profile.city);
        if (data.profile.country)
          formData.append("profile.country", data.profile.country);
        if (data.profile.date_of_birth)
          formData.append("profile.date_of_birth", data.profile.date_of_birth);
        if (data.profile.gender)
          formData.append("profile.gender", data.profile.gender);
        if (data.profile.nationality)
          formData.append("profile.nationality", data.profile.nationality);
        if (data.profile.languages)
          formData.append("profile.languages", data.profile.languages);
        if (data.profile.occupation)
          formData.append("profile.occupation", data.profile.occupation);
        if (data.profile.company_name)
          formData.append("profile.company_name", data.profile.company_name);
        if (data.profile.education)
          formData.append("profile.education", data.profile.education);
        if (data.profile.license_number)
          formData.append("profile.license_number", data.profile.license_number);
        if (data.profile.bar_association)
          formData.append("profile.bar_association", data.profile.bar_association);
        if (data.profile.linkedin_url)
          formData.append("profile.linkedin_url", data.profile.linkedin_url);
        if (data.profile.twitter_url)
          formData.append("profile.twitter_url", data.profile.twitter_url);
        if (data.profile.website)
          formData.append("profile.website", data.profile.website);
      }

      const response = await put<
        { message: string; data: AdminUser },
        FormData
      >(ADMIN_USER_UPDATE_ENDPOINT(id), formData, { isPrivate: true });
      setSelectedUser(response.data.data);
      return response.data.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (id: number) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      await del<{ message: string }>(ADMIN_USER_DELETE_ENDPOINT(id), {
        isPrivate: true,
      });
      setUsers(users.filter((user) => user.id !== id));
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle user active status
  const toggleUserActive = async (id: number) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await patch<{ message: string }, {}>(
        ADMIN_USER_TOGGLE_ACTIVE_ENDPOINT(id),
        {},
        { isPrivate: true }
      );
      setUsers(
        users.map((user) =>
          user.id === id
            ? { ...user, is_active: !user.is_active }
            : user
        )
      );
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser({ ...selectedUser, is_active: !selectedUser.is_active });
      }
      return response.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Create notification
  const createNotification = async (data: NotificationCreateData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await post<
        { message: string; data: Notification },
        NotificationCreateData
      >(ADMIN_NOTIFICATION_CREATE_ENDPOINT, data, { isPrivate: true });
      return response.data.data;
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user notifications
  const getNotifications = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await get<NotificationResponse>(
        USER_NOTIFICATION_LIST_ENDPOINT,
        { isPrivate: true }
      );
      setNotifications(response.data);
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markNotificationRead = async (id: number) => {
    try {
      setIsLoading(true)
      setErrorMessage("");
      const response = await patch<{ message: string }, {}>(
        USER_NOTIFICATION_MARK_READ_ENDPOINT(id),
        {},
        { isPrivate: true }
      );
      setNotifications(
        notifications.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (e: any) {
      const msg = extractErrorMessages(e);
      setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically fetch users and notifications on mount
  useEffect(() => {
    getUsers();
    getNotifications();
  }, []);

  return {
    errorMessage,
    loading,
    users,
    selectedUser,
    notifications,
    getUsers,
    getUserDetails,
    updateUser,
    deleteUser,
    toggleUserActive,
    createNotification,
    getNotifications,
    markNotificationRead,
  };
}