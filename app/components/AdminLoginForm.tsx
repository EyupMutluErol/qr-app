"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import axios from "axios"

type LoginFormData = {
  username: string
  password: string
}

export default function AdminLoginForm() {
  const router = useRouter()
  const [globalError, setGlobalError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setGlobalError("")

    try {
      await axios.post("/api/admin/login", data)
      window.location.href = "/admin"
    } catch (error: any) {
      if (error.response) {
        setGlobalError(error.response.data.error || "Giriş işlemi başarısız oldu.")
      } else {
        setGlobalError("Sunucuya bağlanılamadı. Lütfen tekrar deneyin.")
      }
    }
  }

  return (
    <div className="bg-[#0f1118]/80 backdrop-blur-2xl rounded-2xl shadow-[0_0_50px_rgb(0,0,0,0.6)] overflow-hidden border border-white/5 animate-formReveal">
      
      <div className="p-10 border-b border-white/5">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white tracking-widest uppercase">
            Yönetici Portalı
          </h2>
        </div>
        <p className="text-sm text-gray-500 text-center">Devam etmek için kimlik bilgilerinizi doğrulayın.</p>
      </div>

      <div className="p-10">
        {globalError && (
          <div className="bg-red-500/5 border border-red-500/30 text-red-200 p-4 rounded-xl mb-8 text-sm flex items-center shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <svg className="w-5 h-5 mr-3 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{globalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7" autoComplete="off">
          <div className="group">
            <label className="block text-gray-400 text-xs font-semibold mb-2.5 uppercase tracking-wide group-focus-within:text-amber-500 transition-colors" htmlFor="username">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              {...register("username", { required: "Kullanıcı adı zorunludur" })}
              className={`w-full px-5 py-3.5 rounded-xl border bg-black/30 text-white focus:bg-black/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/70 transition-all duration-300 outline-none placeholder:text-gray-700 ${
                errors.username ? "border-red-500 focus:ring-red-500/50" : "border-white/10"
              }`}
              placeholder="Kullanıcı Adı"
            />
            {errors.username && (
               <p className="text-red-400 text-xs font-medium mt-1.5 ml-1">{errors.username.message}</p>
            )}
          </div>

          <div className="group">
            <label className="block text-gray-400 text-xs font-semibold mb-2.5 uppercase tracking-wide group-focus-within:text-amber-500 transition-colors" htmlFor="password">
              Erişim Şifresi
            </label>
            <input
              id="password"
              type="password"
              {...register("password", { required: "Şifre zorunludur" })}
              className={`w-full px-5 py-3.5 rounded-xl border bg-black/30 text-white focus:bg-black/50 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/70 transition-all duration-300 outline-none placeholder:text-gray-700 ${
                errors.password ? "border-red-500 focus:ring-red-500/50" : "border-white/10"
              }`}
              placeholder="••••••••••••"
            />
            {errors.password && (
              <p className="text-red-400 text-xs font-medium mt-1.5 ml-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full text-black font-extrabold py-4 px-4 rounded-xl transition-all duration-300 transform flex justify-center items-center gap-3 active:scale-[0.98] ${
              isSubmitting
                ? "bg-amber-700 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] cursor-pointer"
            }`}
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isSubmitting ? "SİSTEME BAĞLANILIYOR..." : "PORTALA GİRİŞ YAP"}
          </button>
        </form>
      </div>
    </div>
  )
}