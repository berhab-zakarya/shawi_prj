"use client"

import {  useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AuthForm } from "@/components/auth/auth-form"
import { AuthImage } from "@/components/auth/auth-image"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false)
 
 

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  return (

    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div>
        <motion.div
          layout
          className="flex flex-col lg:flex-row min-h-screen lg:min-h-[calc(100vh-4rem)] overflow-hidden shadow-2xl bg-white"
        >
          <AnimatePresence mode="wait">
            {isLogin ? (
              // Login mode: Form on right, Image on left
              <motion.div
                key="login-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col lg:flex-row w-full"
              >
                <motion.div layout className="lg:w-1/2 order-2 lg:order-1">
                  <AuthImage isLogin={isLogin} />
                </motion.div>

                <motion.div layout className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 order-1 lg:order-2">
                  <AuthForm isLogin={isLogin} onToggleMode={toggleMode} />
                </motion.div>
              </motion.div>
            ) : (
              // Signup mode: Image on right, Form on left
              <motion.div
                key="signup-layout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col lg:flex-row w-full"
              >
                <motion.div layout className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 order-1">
                  <AuthForm isLogin={isLogin} onToggleMode={toggleMode} />
                </motion.div>

                <motion.div layout className="lg:w-1/2 order-2">
                  <AuthImage isLogin={isLogin} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
