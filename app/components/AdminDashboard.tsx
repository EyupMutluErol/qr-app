"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"


type DashboardProps = {
  activeEvents: number
  totalAttendances: number
}

export default function AdminDashboard({activeEvents,totalAttendances}:DashboardProps) {
  const router = useRouter()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const confirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await axios.post("/api/admin/logout")
      router.push("/admin/login")
    } catch (error) {
      console.error("Çıkış işlemi başarısız oldu:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1118] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-formReveal">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center text-white mb-2">Çıkış Yapılacak</h3>
            <p className="text-gray-400 text-center text-sm mb-8">
              Sistemden çıkmak istediğinize emin misiniz? Aktif oturumunuz sonlandırılacak.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors transition-all duration-1000 ease-in-out cursor-pointer" 
              >
                Vazgeç
              </button>
              <button
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors flex justify-center items-center shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all duration-1000 ease-in-out cursor-pointer"
              >
                {isLoggingOut ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Evet, Çık"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto p-8 animate-fadeInUp">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0f1118] border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-widest uppercase text-white">Sistem Paneli</h1>
              <p className="text-gray-400 text-sm mt-1">Hoş geldiniz, tüm sistemler aktif.</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-black hover:border-red-500 transition-all duration-1000 ease-in-out cursor-pointer font-bold text-sm tracking-wide shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] active:scale-[0.97]"
          >
            SİSTEMDEN ÇIK
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-[#0f1118]/80 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300 cursor-pointer group">
            <h3 className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Aktif Etkinlikler</h3>
            <p className="text-5xl font-extrabold text-white">{activeEvents}</p>
          </div>
          
          <div className="bg-[#0f1118]/80 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300 cursor-pointer group">
            <h3 className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Toplam Yoklama</h3>
            <p className="text-5xl font-extrabold text-white">{totalAttendances}</p>
          </div>
          
          <div className="bg-[#0f1118]/80 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-300 cursor-pointer group">
            <h3 className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Sistem Durumu</h3>
            <div className="flex items-center gap-3 mt-4">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
              <span className="text-xl font-bold text-emerald-400 tracking-wider">GÜVENLİ</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}