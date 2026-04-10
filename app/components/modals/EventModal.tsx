"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import dynamic from "next/dynamic"

const MapPicker = dynamic(() => import("../MapPicker"), { 
  ssr: false,
  loading: () => <div className="w-full h-[220px] bg-white/5 animate-pulse rounded-xl flex items-center justify-center text-gray-500 text-sm">Harita Yükleniyor...</div>
})

type EventModalProps = {
  isOpen: boolean
  onClose: () => void
  eventToEdit: any | null // null ise yeni oluştur varsa edit modunda aç
  onSuccess: () => void // işlem bitince listeyi yenilemek için
}

export default function EventModal({ isOpen, onClose, eventToEdit, onSuccess }: EventModalProps) {
  const [formData, setFormData] = useState({ id: "", name: "", locationName: "", latitude: "", longitude: "", date: "", time: "" });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapFocus, setMapFocus] = useState<[number, number] | null>(null);

  // modal açıldığında, eğer düzenleye basıldıysa içini doldur, yeni eklenecekse temizle
  useEffect(() => {
    if (isOpen) {
      setFormError("");
      if (eventToEdit) {
        const eventDateObj = new Date(eventToEdit.eventDate);
        const dateStr = eventDateObj.toISOString().split('T')[0];
        const timeStr = eventDateObj.toTimeString().substring(0, 5); 

        setFormData({ 
          id: eventToEdit.id, 
          name: eventToEdit.name, 
          locationName: eventToEdit.locationName || "",
          latitude: eventToEdit.latitude.toString(), 
          longitude: eventToEdit.longitude.toString(),
          date: dateStr,
          time: timeStr
        })
        setMapFocus([eventToEdit.latitude, eventToEdit.longitude]);
      } else {
        setFormData({ id: "", name: "", locationName: "", latitude: "", longitude: "", date: "", time: "" });
        setMapFocus(null)
      }
    }
  }, [isOpen, eventToEdit]);

  const todayStr = new Date().toISOString().split('T')[0];

  if (!isOpen) return null;

  const handleFlyToCoordinate = () => {
    setFormError("");
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) return setFormError("Geçersiz Koordinat");
    if (isNaN(lng) || lng < -180 || lng > 180) return setFormError("Geçersiz Koordinat");
    setMapFocus([lat, lng]);
  }

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!formData.latitude || !formData.longitude || !formData.date || !formData.time || !formData.locationName) {
      return setFormError("Tüm alanları doldurun.");
    }

    // geçmiş tarih ve saat kontrolü
    const selectedDateTime = new Date(`${formData.date}T${formData.time}:00`);
    if (selectedDateTime < new Date()) {
      return setFormError("Geçmiş tarihli veya saatli bir etkinlik oluşturamazsınız!");
    }

    // Her şey yolundaysa yükleme durumunu başlatıyorum
    setIsSubmitting(true);

    const payload = { ...formData, eventDate: selectedDateTime.toISOString() }

    try {
      if (eventToEdit) {
        await axios.put(`/api/admin/events/${formData.id}`, payload)
      } else {
        await axios.post("/api/admin/events", payload)
      }
      onSuccess() // Başarılı olunca ana sayfaya haber verip ve listeyi yeniliyorum
    } catch (error: any) {
      setFormError(error.response?.data?.error || "Hata oluştu.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1118] border border-indigo-500/30 rounded-3xl p-5 md:p-6 max-w-2xl w-full shadow-[0_0_50px_rgba(99,102,241,0.15)] max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-white">{eventToEdit ? "Etkinliği Düzenle" : "Yeni Etkinlik Oluştur"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all duration-300 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {formError && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">{formError}</div>
        )}

        <form onSubmit={handleSubmitEvent} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Etkinlik Adı</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" placeholder="Örn: Final Sınavı" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Etkinlik Mekanı</label>
              <input type="text" required value={formData.locationName} onChange={(e) => setFormData({...formData, locationName: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" placeholder="Örn: İTÜ Bilgisayar Fak." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="relative group block cursor-pointer">
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1 group-focus-within:text-indigo-400 transition-colors cursor-pointer">Etkinlik Tarihi</span>
              <div className="relative flex items-center cursor-pointer">
                <div className="absolute left-3.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <input 
                  type="date" 
                  min={todayStr} 
                  required 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})} 
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm shadow-inner cursor-pointer hover:cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-20 bg-transparent" 
                />
              </div>
            </label>

            <label className="relative group block cursor-pointer">
              <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 pl-1 group-focus-within:text-indigo-400 transition-colors cursor-pointer">Etkinlik Saati</span>
              <div className="relative flex items-center cursor-pointer">
                <div className="absolute left-3.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <input 
                  type="time" 
                  required 
                  value={formData.time} 
                  onChange={(e) => setFormData({...formData, time: e.target.value})} 
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm shadow-inner cursor-pointer hover:cursor-pointer [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-20 bg-transparent" 
                />
              </div>
            </label>
          </div>

          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Enlem (Latitude)</label>
                <input type="text" required value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: e.target.value.replace(/,/g, '.')})} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 font-mono text-xs" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Boylam (Longitude)</label>
                <input type="text" required value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: e.target.value.replace(/,/g, '.')})} className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-600 font-mono text-xs" />
              </div>
            </div>
            <button type="button" onClick={handleFlyToCoordinate} className="w-full mt-2 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border border-indigo-500/20 cursor-pointer">
              Girilen Koordinata Git
            </button>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Veya Haritadan Seçin</label>
            <MapPicker initialPosition={mapFocus} onLocationSelect={(lat, lng) => setFormData({...formData, latitude: lat.toString(), longitude: lng.toString()})} />
          </div>
          
          <button type="submit" disabled={isSubmitting} className={`w-full mt-1 px-4 py-4 rounded-xl text-white font-bold transition-all text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98] cursor-pointer ${eventToEdit ? "bg-amber-600 hover:bg-amber-500 disabled:bg-amber-600/50" : "bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50"}`}>
            {isSubmitting ? "İşleniyor..." : (eventToEdit ? "Değişiklikleri Kaydet" : "Etkinliği Kaydet")}
          </button>
        </form>
      </div>
    </div>
  )
}