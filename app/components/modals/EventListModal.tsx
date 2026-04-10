"use client"

import { useState } from "react"

type EventListModalProps = {
  isOpen: boolean
  onClose: () => void
  events: any[]
  onEdit: (event: any) => void
  onDelete: (eventId: string) => void
}

export default function EventListModal({ isOpen, onClose, events, onEdit, onDelete }: EventListModalProps) {
  // arama ve filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  if (!isOpen) return null

  const filteredEvents = events.filter((event) => {
    // isim veya mekanda arama (Büyük/küçük harf duyarsız)
    const matchesSearch = 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      event.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = filterDate 
      ? new Date(event.eventDate).toISOString().startsWith(filterDate) 
      : true

    return matchesSearch && matchesDate;
  })

  // filtreleri temizleme fonksiyonu
  const clearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1118] border border-amber-500/30 rounded-3xl p-6 md:p-8 max-w-5xl w-full shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">Etkinlik Yönetimi</h3>
            <p className="text-sm text-gray-400 mt-1">Sistemdeki tüm etkinlikleri yönetin ve filtreleyin.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all duration-300 cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {events.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="flex-1 relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="Etkinlik veya Mekan ara..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all text-sm shadow-inner"
              />
            </div>
            
            <label className="w-full sm:w-48 relative block cursor-pointer group shrink-0">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-500 transition-colors pointer-events-none z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                onClick={(e) => {
                  try {
                    if (typeof e.currentTarget.showPicker === 'function') {
                      e.currentTarget.showPicker();
                    }
                  } catch (error) {}
                }}
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-all text-sm [color-scheme:dark] cursor-pointer relative z-20 [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </label>

            {(searchTerm || filterDate) && (
              <button 
                onClick={clearFilters}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-lg transition-all border border-red-500/20 whitespace-nowrap cursor-pointer active:scale-95"
              >
                Filtreleri Sıfırla
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {events.length === 0 ? (
            <div className="text-center py-10 text-gray-500 border border-white/5 rounded-xl flex flex-col items-center justify-center">
              <svg className="w-12 h-12 mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Sistemde henüz etkinlik bulunmuyor.
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-10 text-amber-500/70 border border-amber-500/10 bg-amber-500/5 rounded-xl flex flex-col items-center justify-center">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Arama kriterlerinize uygun etkinlik bulunamadı.
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-amber-500/30 transition-all duration-300">
                <div>
                  <h4 className="text-lg font-bold text-white">{event.name}</h4>
                  <p className="text-sm font-medium text-indigo-400 mt-1 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {event.locationName}
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {new Date(event.eventDate).toLocaleDateString('tr-TR')} - {new Date(event.eventDate).toLocaleTimeString('tr-TR').substring(0,5)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                  <button onClick={() => window.open(`/qr/${event.id}`, '_blank')} className="flex-1 lg:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    QR GÖSTER
                  </button>
                  <button onClick={() => onEdit(event)} className="flex-1 lg:flex-none px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer">
                    Düzenle
                  </button>
                  <button onClick={() => onDelete(event.id)} className="flex-1 lg:flex-none px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-xl transition-all duration-300 cursor-pointer">
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}