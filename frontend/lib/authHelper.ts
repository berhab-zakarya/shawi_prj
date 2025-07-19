export function getDashboardRedirect(role: string): URL {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  switch (role) {
    case 'Admin':
      return new URL('/admin', base)
    case 'Client':
      return new URL('/dashboard/client', base)
    case 'Lawyer':
      return new URL('/dashboard/lawyer', base)
    default:
      return new URL('/login', base)
  }
}

export function getDashboardPath(role: string): string {
  switch (role) {
    case 'Admin':
      return '/admin'
    case 'Client':
      return '/dashboard/client'
    case 'Lawyer':
      return '/dashboard/lawyer'
    default:
      return '/'
  }
}

export async function tryRefresh(refreshToken: string): Promise<{
  success: boolean
  data?: {
    access: string
    refresh: string
    user: { role: 'Client' | 'Lawyer' | 'Admin' }
  }
}> {
  try {
    const res = await fetch(`http://127.0.0.1:8000/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!res.ok) return { success: false }

    const data = await res.json()
    return {
      success: true,
      data,
    }
  } catch {
    return { success: false }
  }
}
