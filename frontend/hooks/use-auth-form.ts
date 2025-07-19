"use client"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { post } from "../lib/api"
import { LOGIN_ENDPOINT, REGISTER_ENDPOINT } from "../lib/apiConstants"
import { clearTokens, setTokens } from "@/lib/jwtService"
import { extractErrorMessages } from "@/lib/errorHandler"
import { LoginResponse } from "@/types/auth"

export interface FormData {
  first_name?: string
  last_name?: string
  email: string
  password: string
  confirmPassword?: string
  role?: number
}

export interface FormErrors {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  confirmPassword?: string
  role?: string
  general?: string
}

interface RegisterResponse {
  message: string
}

export function useAuthForm(isLogin: boolean) {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: 2,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string>("")
  const [user, setUser] = useState<LoginResponse | null>(null)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): boolean => {
    return password.length >= 4
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = "البريد الإلكتروني مطلوب"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح"
    }

    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة"
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
    }

    if (!isLogin) {
      if (!formData.first_name) {
        newErrors.first_name = "الاسم الأول مطلوب"
      }
      if (!formData.last_name) {
        newErrors.last_name = "الاسم الأخير مطلوب"
      }
      if (!formData.role) {
        newErrors.role = "الدور (role) مطلوب"
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "تأكيد كلمة المرور مطلوب"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "كلمات المرور غير متطابقة"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }))
    }
  }

  const getDashboardPath = (role: string): string => {
    switch (role) {
      case 'Admin':
        return '/dashboard/admin'
      case 'Client':
        return '/dashboard/client'
      case 'Lawyer':
        return '/dashboard/lawyer'
      default:
        return '/auth'
    }
  }

  const handleLogin = async () => {
    try {
      const response = await post<LoginResponse, { email: string; password: string }>(
        LOGIN_ENDPOINT,
        {
          email: formData.email,
          password: formData.password,
        },
        { isPrivate: false }
      )
      
      const { access, refresh, role } = response.data
      
      setTokens(access, refresh)
      setUser(response.data)
      setIsSuccess(true)
      setSuccessMessage("تم تسجيل الدخول بنجاح")
      
      // Redirect to appropriate dashboard
      const dashboardPath = getDashboardPath(role)
      router.push(dashboardPath)
      
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        const errorMessages = extractErrorMessages(error.response.data)
        setErrors((prev) => ({
          ...prev,
          general: errorMessages.join('. ') || "خطأ في تسجيل الدخول"
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "خطأ في الاتصال. يرجى المحاولة مرة أخرى"
        }))
      }
      throw error
    }
  }

  const handleRegister = async () => {
    try {
      const response = await post<RegisterResponse, { 
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        role: number;
      }>(
        REGISTER_ENDPOINT,
        {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name!,
          last_name: formData.last_name!,
          role: formData.role!,
        },
        { isPrivate: false }
      )

      setIsSuccess(true)
      setSuccessMessage(response.data.message)
      
      return { data: response.data, message: response.data.message }
    } catch (error: any) {
      if (error.response?.data) {
        const errorMessages = extractErrorMessages(error.response.data)
        setErrors((prev) => ({
          ...prev,
          general: errorMessages.join('. ') || "خطأ في إنشاء الحساب"
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "خطأ في الاتصال. يرجى المحاولة مرة أخرى"
        }))
      }
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setIsSuccess(false)
    setSuccessMessage("")

    try {
      if (isLogin) {
        const data = await handleLogin()
        return { data, message: "تم تسجيل الدخول بنجاح" }
      } else {
        const result = await handleRegister()
        return result
      }
    } catch (error) {
      return { message: null }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    clearTokens()
    resetForm()
    setIsSuccess(false)
    setSuccessMessage("")
    setUser(null)
    router.push('/auth')
  }

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: 2,
    })
    setErrors({})
    setIsSuccess(false)
    setSuccessMessage("")
  }

  return {
    formData,
    errors,
    isLoading,
    isSuccess,
    successMessage,
    user,
    handleInputChange,
    handleSubmit,
    handleLogout,
    resetForm,
  }
}