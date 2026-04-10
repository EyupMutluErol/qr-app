"use client" 

import Link from "next/link"
import { useState } from "react"

export default function Home() {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white flex flex-col items-center justify-center relative overflow-hidden">
      
      {showAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1118] border border-indigo-500/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(99,102,241,0.15)] transform animate-formReveal text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 mb-6 border border-indigo-500/20">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nasıl Katılabilirim?</h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Yoklamaya katılmak için lütfen etkinlik sırasında ekrana yansıtılan <b>QR kodu kameranızla okutunuz.</b> Buradan manuel giriş yapılamamaktadır.
            </p>
            <button 
              onClick={() => setShowAlert(false)} 
              className="w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-[0.98] cursor-pointer"
            >
              Anladım
            </button>
          </div>
        </div>
      )}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center px-4 animate-fadeInUp max-w-3xl mx-auto">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Sistem Aktif ve Yayında
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
          Yeni Nesil <br /> Yoklama Sistemi
        </h1>

        <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
          Etkinliklerinizi güvenle yönetin, QR kod ile saniyeler içinde yoklama alın ve katılımcı verilerini anlık olarak analiz edin.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            href="/admin"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            YÖNETİCİ PORTALI
          </Link>

          <button
            onClick={() => setShowAlert(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#0f1118] border border-white/10 hover:border-indigo-500/50 hover:bg-white/5 text-gray-300 hover:text-white font-bold transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            KATILIMCI / YOKLAMA
          </button>
        </div>
      </div>
    </div>
  )
}