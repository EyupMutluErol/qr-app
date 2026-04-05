"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import dynamic from "next/dynamic"

const MapPicker = dynamic(() => import("./MapPicker"), { 
  ssr: false,
  loading: () => <div className="w-full h-[220px] bg-white/5 animate-pulse rounded-xl flex items-center justify-center text-gray-500 text-sm">Harita Yükleniyor...</div>
})

type DashboardProps = {
  activeEvents: number
  totalAttendances: number
}

export default function AdminDashboard({ activeEvents, totalAttendances }: DashboardProps) {
  const router = useRouter();
  
  // çıkış state'leri
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // etkinlik state'leri
  const [showEventModal, setShowEventModal] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  
  // etkinlik veri state'leri
  const [formData, setFormData] = useState({ name: "", latitude: "", longitude: "" });
  const [formError, setFormError] = useState("");
  const [mapFocus, setMapFocus] = useState<[number, number] | null>(null);

  const confirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await axios.post("/api/admin/logout");
      window.location.href = "/";
    } catch (error) {
      setIsLoggingOut(false);
    }
  }

  // manuel girilen enlem-boylamdan haritaya gitme
  const handleFlyToCoordinate = () => {
    setFormError("");
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setFormError("Geçersiz Koordinat: Enlem (Latitude) -90 ile 90 arasında olmalıdır.");
      return
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setFormError("Geçersiz Koordinat: Boylam (Longitude) -180 ile 180 arasında olmalıdır.");
      return
    }

    setMapFocus([lat, lng]);
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.latitude || !formData.longitude) {
      setFormError("Lütfen haritadan veya elle geçerli bir konum girin.");
      return
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setFormError("Geçersiz Koordinat: Enlem -90 ile 90 arasında olmalıdır.");
      return
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setFormError("Geçersiz Koordinat: Boylam -180 ile 180 arasında olmalıdır.");
      return
    }

    setIsCreatingEvent(true);

    try {
      await axios.post("/api/admin/events", formData);
      
      setFormData({ name: "", latitude: "", longitude: "" });
      setShowEventModal(false);
      setMapFocus(null);
      
      router.refresh();
      
    } catch (error: any) {
      setFormError(error.response?.data?.error || "Bir hata oluştu.");
    } finally {
      setIsCreatingEvent(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] text-white relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1118] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h3 className="text-xl font-bold text-center text-white mb-2">Çıkış Yapılacak</h3>
            <p className="text-gray-400 text-center text-sm mb-8">Sistemden çıkmak istediğinize emin misiniz?</p>
            <div className="flex gap-4">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-300 cursor-pointer">Vazgeç</button>
              <button onClick={confirmLogout} disabled={isLoggingOut} className="flex-1 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 font-bold transition-colors duration-300 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                {isLoggingOut ? "Çıkılıyor..." : "Evet, Çık"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1118] border border-indigo-500/30 rounded-3xl p-5 md:p-6 max-w-2xl w-full shadow-[0_0_50px_rgba(99,102,241,0.15)] max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-bold text-white">Yeni Etkinlik Oluştur</h3>
              <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all duration-300 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {formError && (
              <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Etkinlik Adı</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 text-sm"
                  placeholder="Örn: Yazılım Mimarisi Dersi"
                />
              </div>

              <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Enlem (Latitude)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value.replace(/,/g, '.')})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 font-mono text-xs"
                      placeholder="Örn: 40.75"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Boylam (Longitude)</label>
                    <input 
                      type="text" 
                      required
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value.replace(/,/g, '.')})}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 font-mono text-xs"
                      placeholder="Örn: 30.37"
                    />
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={handleFlyToCoordinate}
                  className="w-full mt-2 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer border border-indigo-500/20"
                >
                  Girilen Koordinata Git
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Veya Haritadan Seçin</label>
                <MapPicker 
                  initialPosition={mapFocus}
                  onLocationSelect={(lat, lng) => setFormData({...formData, latitude: lat.toString(), longitude: lng.toString()})} 
                />
              </div>

              <button 
                type="submit" 
                disabled={isCreatingEvent}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold transition-all duration-300 cursor-pointer flex justify-center items-center text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98]"
              >
                {isCreatingEvent ? "Oluşturuluyor..." : "Etkinliği Kaydet"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto p-8 animate-fadeInUp">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/10 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0f1118] border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-widest uppercase text-white">Sistem Paneli</h1>
              <p className="text-gray-400 text-sm mt-1">Hoş geldiniz, tüm sistemler aktif.</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setShowEventModal(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all duration-300 cursor-pointer font-bold text-sm tracking-wide shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]"
            >
              YENİ ETKİNLİK
            </button>

            <button 
              onClick={() => setShowLogoutModal(true)}
              className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-black transition-all duration-300 cursor-pointer font-bold text-sm tracking-wide hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            >
              ÇIKIŞ YAP
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#0f1118]/80 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300 cursor-default">
            <h3 className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest">Aktif Etkinlikler</h3>
            <p className="text-5xl font-extrabold text-white">{activeEvents}</p>
          </div>
          <div className="bg-[#0f1118]/80 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all duration-300 cursor-default">
            <h3 className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest">Toplam Yoklama</h3>
            <p className="text-5xl font-extrabold text-white">{totalAttendances}</p>
          </div>
          <div className="bg-[#0f1118]/80 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-emerald-500/50 transition-all duration-300 cursor-default">
            <h3 className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest">Sistem Durumu</h3>
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