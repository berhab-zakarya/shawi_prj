import { clearTokens } from "@/lib/jwtService"

export function logoutUser() {
  clearTokens()
  
  // Clear all storage
  if (typeof window !== 'undefined') {
    localStorage.clear()
    sessionStorage.clear()
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.substr(0, eqPos) : c
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    })
  }
  
  // Redirect to auth page
  window.location.href = '/auth'
}