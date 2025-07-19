/* eslint-disable */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { redirect } from "next/navigation";
import { LoginResponse } from "@/types/auth";
import { UserRole } from "@/types";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getImageUrl(imagePath: string | null | undefined): string { 
  if (!imagePath) return "/placeholder.svg"
  // Assuming the imagePath is a relative path, prepend the base URL
  const baseUrl =  "http://localhost:8000"
  if(imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    // If the imagePath is already a full URL, return it as is
      console.log("Image imagePath:", imagePath)
    return imagePath
  }
  const img = `${baseUrl}/${imagePath}`
  console.log("Image URL:", img)
  // Return the full URL for the image
  return img
}



export function startHome(user:LoginResponse) {

    const roleRedirects: Record<UserRole, string> = {
      Admin: '/admin',
      Client: '/client',
      Lawyer: '/lawyer',
    }

    const role = user.role as UserRole
    const expectedPath = "/dashboard" + roleRedirects[role] + "/"

    console.log("User role:", role)
    console.log("Redirecting to:", expectedPath)
    return expectedPath
  }


  export function downloadFile(file_url: string | null) {
  if (!file_url) {
    console.error("No file URL provided for download")
    return
  }
  fetch(file_url)
  .then((response) => response.blob())
  .then((blob) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = file_url.split("/").pop() || "document"
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  })
  .catch((err) => {
    console.error("Failed to download file:", err)
  })

}