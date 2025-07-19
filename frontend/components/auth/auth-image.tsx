"use client"

import { motion } from "framer-motion"

interface AuthImageProps {
  isLogin: boolean
}

export function AuthImage({ isLogin }: AuthImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full min-h-[400px] lg:min-h-screen overflow-hidden rounded-2xl lg:rounded-none"
    >
<div className="absolute inset-0 bg-gradient-to-br from-[#F5D76E] via-[#D4AF37] to-[#7B6314]" />

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center text-white px-8"
        >
          <motion.h2
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl lg:text-5xl font-bold mb-6"
          >
            {isLogin ? "مرحباً بعودتك!" : "انضم إلى مجتمعنا"}
          </motion.h2>

          <motion.p
            key={isLogin ? "login-desc" : "signup-desc"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl lg:text-2xl opacity-90 max-w-md mx-auto leading-relaxed"
          >
            {isLogin ? "نحن سعداء لرؤيتك مرة أخرى. تابع رحلتك معنا" : "ابدأ رحلة جديدة مليئة بالإمكانيات اللامحدودة"}
          </motion.p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5, type: "spring" }}
            className="mt-8 w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
          scale: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }}
        className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm"
      />

      <motion.div
        animate={{
          rotate: -360,
          y: [0, -20, 0],
        }}
        transition={{
          rotate: { duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
          y: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }}
        className="absolute bottom-20 left-10 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm"
      />
    </motion.div>
  )
}
