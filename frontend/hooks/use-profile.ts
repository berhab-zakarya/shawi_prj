import { ProfileResponse, UpdateProfileData } from "@/types/auth";
import { useState, useEffect } from "react";
import { get, put } from "../lib/api"
import { PROFILE_ENDPOINT,PROFILE_UPDATE_ENDPOINT } from "@/lib/apiConstants";
import { extractErrorMessages } from "@/lib/errorHandler";

export function useProfile() {
    const [user, setUser] = useState<ProfileResponse>({
      
        avatar: "",
        date_joined: "",
        email: "",
        first_name: "",
        last_name: "",
        role: ""
    })
    const [loading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("");

    const getProfile = async () => {
        try {
            setIsLoading(true)
            setErrorMessage("") // Clear previous errors
            const response = await get<ProfileResponse>(
                PROFILE_ENDPOINT,
                { isPrivate: true }
            )
            const data = response.data;
            console.log(data)
            setUser(data);
            
        } catch (e: any) {
            const msg = extractErrorMessages(e);
            setErrorMessage(Array.isArray(msg) ? msg.join(", ") : (msg ?? ""));
        } finally {
            setIsLoading(false);
        }
    }

    // Automatically fetch profile when the hook is first used
    useEffect(() => {
        getProfile();
    }, []); // Empty dependency array means this runs once on mount


const updateProfile = async (data: UpdateProfileData) => {
  try {
    setIsLoading(true);
    setErrorMessage("");

    // Create FormData for handling file uploads
    const formData = new FormData();
    if (data.first_name) formData.append("first_name", data.first_name);
    if (data.last_name) formData.append("last_name", data.last_name);
    if (data.bio) formData.append("bio", data.bio);
    if (data.time_zone) formData.append("time_zone", data.time_zone);
    if (data.role) formData.append("role", data.role.toString());
    if (data.avatar) formData.append("avatar", data.avatar);
    if (data.profile) {
      if (data.profile.phone_number) formData.append("profile.phone_number", data.profile.phone_number);
      if (data.profile.address) formData.append("profile.address", data.profile.address);
      if (data.profile.city) formData.append("profile.city", data.profile.city);
      if (data.profile.country) formData.append("profile.country", data.profile.country);
      if (data.profile.date_of_birth) formData.append("profile.date_of_birth", data.profile.date_of_birth);
      if (data.profile.gender) formData.append("profile.gender", data.profile.gender);
      if (data.profile.nationality) formData.append("profile.nationality", data.profile.nationality);
      if (data.profile.languages) formData.append("profile.languages", data.profile.languages);
      if (data.profile.occupation) formData.append("profile.occupation", data.profile.occupation);
      if (data.profile.company_name) formData.append("profile.company_name", data.profile.company_name);
      if (data.profile.education) formData.append("profile.education", data.profile.education);
      if (data.profile.license_number) formData.append("profile.license_number", data.profile.license_number);
      if (data.profile.bar_association) formData.append("profile.bar_association", data.profile.bar_association);
      if (data.profile.linkedin_url) formData.append("profile.linkedin_url", data.profile.linkedin_url);
      if (data.profile.twitter_url) formData.append("profile.twitter_url", data.profile.twitter_url);
      if (data.profile.website) formData.append("profile.website", data.profile.website);
    }

    const response = await put<{ message: string; data: ProfileResponse }, FormData>(
      PROFILE_UPDATE_ENDPOINT,
      formData,
      {
        isPrivate: true,
      }
    );
    setUser(response.data.data);
    return response.data.data;
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
        getProfile,
          updateProfile, // Add this

        loading,
        user
    }
}