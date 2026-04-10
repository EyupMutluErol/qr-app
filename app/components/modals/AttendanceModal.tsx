"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

type AttendanceModalProps = {
  isOpen: boolean
  onClose: () => void
  events: any[]
  attendances: any[]
  allParticipants: any[]
}

export default function AttendanceModal({ isOpen, onClose, events, attendances, allParticipants }: AttendanceModalProps) {
  const router = useRouter();
  const [selectedEventForAttendance, setSelectedEventForAttendance] = useState<any | null>(null);

  if (!isOpen) return null;

  // manuel yoklama (var/yok işaretleme) İşlemi
  const handleManualToggle = async (participantId: string) => {
    if (!selectedEventForAttendance) return;
    try {
      await axios.post(`/api/admin/events/${selectedEventForAttendance.id}/toggle-attendance`, { participantId });
      router.refresh(); // sunucuyu tetikleyip listeyi güncelleme işlemi
    } catch (error) {
      alert("İşlem başarısız.");
    }
  }

  // excel'e aktarma işlemi
  const exportToCSV = () => {
    const filteredAttendances = attendances.filter(a => a.eventId === selectedEventForAttendance?.id);

    if (!filteredAttendances || filteredAttendances.length === 0) return alert("İndirilecek veri yok.");

    const headers = ["Etkinlik Adi", "Mekan", "Katilimci Adi", "Katilimci Soyadi", "E-Posta", "Telefon", "Tarih", "Saat"];
    
    const rows = filteredAttendances.map(record => [
      record.event.name,
      record.event.locationName,
      record.participant.firstName,
      record.participant.lastName,
      record.participant.email,
      record.participant.phone || "Belirtilmemiş",
      new Date(record.timestamp).toLocaleDateString('tr-TR'),
      new Date(record.timestamp).toLocaleTimeString('tr-TR')
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(";") + "\n" + rows.map(e => e.join(";")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedEventForAttendance.name}_Yoklama_Raporu.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleClose = () => {
    setSelectedEventForAttendance(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0f1118] border border-emerald-500/30 rounded-3xl p-6 md:p-8 max-w-5xl w-full shadow-[0_0_50px_rgba(16,185,129,0.15)] flex flex-col max-h-[90vh]">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            {selectedEventForAttendance ? (
              <>
                <button onClick={() => setSelectedEventForAttendance(null)} className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-sm font-bold mb-2 transition-colors cursor-pointer">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  Etkinliklere Dön
                </button>
                <h3 className="text-2xl font-bold text-white">{selectedEventForAttendance.name} - Yoklama</h3>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-white">Yoklama Kayıtları</h3>
                <p className="text-gray-400 text-sm mt-1">Hangi etkinliğin yoklamasını yönetmek istiyorsunuz?</p>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {selectedEventForAttendance && (
              <button onClick={exportToCSV} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-xl transition-all duration-300 border border-emerald-500/30 flex items-center gap-2 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Excel İndir
              </button>
            )}
            <button onClick={handleClose} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all duration-300 cursor-pointer">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {!selectedEventForAttendance ? (
            <div className="space-y-3">
              {events.map((event) => {
                const eventAttendances = attendances.filter(a => a.eventId === event.id).length
                return (
                  <div key={event.id} onClick={() => setSelectedEventForAttendance(event)} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer group flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{event.name}</h4>
                      <p className="text-xs text-indigo-400 font-medium mt-1">{event.locationName}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(event.eventDate).toLocaleDateString('tr-TR')} - {new Date(event.eventDate).toLocaleTimeString('tr-TR').substring(0,5)}</p>
                    </div>
                    <div className="bg-emerald-500/20 text-emerald-400 font-bold px-4 py-2 rounded-lg text-sm border border-emerald-500/20">
                      {eventAttendances} Kişi
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {allParticipants.length === 0 ? (
                <div className="text-center py-10 text-gray-500 border border-white/5 rounded-xl">Sistemde öğrenci yok. Lütfen "Öğrenci Listesi" bölümünden öğrenci ekleyin.</div>
              ) : (
                allParticipants.map((participant) => {
                  const record = attendances.find(a => a.eventId === selectedEventForAttendance.id && a.participantId === participant.id)
                  
                  return (
                    <div key={participant.id} className={`bg-white/5 border p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all duration-300 group ${record ? 'border-emerald-500/30' : 'border-white/10'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase border transition-colors ${record ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                          {participant.firstName.charAt(0)}{participant.lastName.charAt(0)}
                        </div>
                        <div>
                          <h4 className={`text-md font-bold transition-colors ${record ? 'text-emerald-400' : 'text-gray-300'}`}>
                            {participant.firstName} {participant.lastName}
                          </h4>
                          <p className="text-xs text-gray-400 mt-0.5">{participant.email} | {participant.phone || "Tel Yok"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        {record && (
                          <p className="text-xs text-gray-500 font-mono hidden md:block">
                            {new Date(record.timestamp).toLocaleTimeString('tr-TR')}
                          </p>
                        )}
                        <button 
                          onClick={() => handleManualToggle(participant.id)}
                          className={`w-full md:w-auto px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer border ${record ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30'}`}
                        >
                          {record ? 'VAR (İptal Et)' : 'YOK (Var Olarak İşaretle)'}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}