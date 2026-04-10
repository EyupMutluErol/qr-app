"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import ParticipantManagerModal from "./modals/ParticipantManagerModal"
import AttendanceModal from "./modals/AttendanceModal"
import EventModal from "./modals/EventModal"
import EventListModal from "./modals/EventListModal"
import QrDisplayModal from "./modals/QrDisplayModal" 
export const dynamic = "force-dynamic";


type DashboardProps = {
  activeEvents: number
  totalAttendances: number
  events: any[]
  attendances: any[]
}

export default function AdminDashboard({ activeEvents, totalAttendances, events, attendances }: DashboardProps) {
  const router = useRouter()

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // hangi pencerenin görüneceği
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventsListModal, setShowEventsListModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // katılımcı yönetimi state'leri
  const [showParticipantManager, setShowParticipantManager] = useState(false);
  const [allParticipants, setAllParticipants] = useState<any[]>([]);

  // etkinlik yönetimi state'leri
  const [eventToEdit, setEventToEdit] = useState<any | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [qrEvent, setQrEvent] = useState<any>(null);

  useEffect(() => {
    fetchParticipants();
  }, [])

  // katılımcı listesini çekiyorum
  const fetchParticipants = async () => {
    try {
      const res = await axios.get(`/api/admin/participants?t=${new Date().getTime()}`)
      setAllParticipants(res.data);
    } catch (error) {
      console.error("Katılımcılar çekilemedi", error);
    }
  }

  // çıkış yapma
  const confirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await axios.post("/api/admin/logout")
      window.location.href = "/admin/login"
    } catch (error) {
      setIsLoggingOut(false)
    }
  }

  // etkinlik oluşturma modal'ı
  const openCreateModal = () => {
    setEventToEdit(null);
    setShowEventModal(true);
  }

  // etkinlik düzenleme modal'ı
  const openEditModal = (event: any) => {
    setEventToEdit(event);
    setShowEventsListModal(false);
    setShowEventModal(true); 
  }

  // etkinlik silme onayı
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/admin/events/${eventToDelete}`);
      setEventToDelete(null);
      router.refresh();
    } catch (error) {
      alert("Silme işlemi başarısız oldu.");
    } finally {
      setIsDeleting(false);
    }
  }


  return (
    <div className="min-h-screen bg-[#0a0c10] text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <ParticipantManagerModal
        isOpen={showParticipantManager}
        onClose={() => setShowParticipantManager(false)}
        participants={allParticipants}
        onRefresh={fetchParticipants}
      />

      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        events={events}
        attendances={attendances}
        allParticipants={allParticipants}
      />

      <EventModal 
        isOpen={showEventModal}
        eventToEdit={eventToEdit}
        onClose={() => {
          setShowEventModal(false); 
          if(eventToEdit) setShowEventsListModal(true); // Düzenleme iptal edilirse listeye dön
        }}
        onSuccess={() => {
          setShowEventModal(false);
          if(eventToEdit) setShowEventsListModal(true); // Düzenleme biterse listeye dön
          router.refresh(); // Sunucudan yeni verileri çekiyorum
        }}
      />

      <QrDisplayModal 
        event={qrEvent} 
        onClose={() => setQrEvent(null)} 
      />

      {eventToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1118] border border-red-500/30 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.15)] transform animate-formReveal">
            <h3 className="text-xl font-bold text-center text-white mb-2">Etkinliği Sil</h3>
            <p className="text-gray-400 text-center text-sm mb-8">Emin misiniz?</p>
            <div className="flex gap-4">
              <button onClick={() => setEventToDelete(null)} disabled={isDeleting} className="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">İptal</button>
              <button onClick={confirmDeleteEvent} disabled={isDeleting} className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold transition-colors cursor-pointer">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0f1118] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] transform animate-formReveal">
            <h3 className="text-xl font-bold text-center text-white mb-2">Çıkış Yapılacak</h3>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 cursor-pointer">Vazgeç</button>
              <button onClick={confirmLogout} className="flex-1 px-4 py-3 rounded-xl bg-red-500 cursor-pointer">Evet, Çık</button>
            </div>
          </div>
        </div>
      )}

      <EventListModal 
        isOpen={showEventsListModal}
        onClose={() => setShowEventsListModal(false)}
        events={events}
        onEdit={openEditModal}
        onDelete={setEventToDelete}
      />

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
            <button onClick={openCreateModal} className="px-5 py-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500 hover:text-white transition-all font-bold text-sm cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.15)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]">
              YENİ ETKİNLİK
            </button>
            <button onClick={() => setShowLogoutModal(true)} className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-black transition-all font-bold text-sm cursor-pointer hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]">
              ÇIKIŞ YAP
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div onClick={() => setShowEventsListModal(true)} className="bg-[#0f1118]/80 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <h3 className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Toplam Etkinlik</h3>
              <svg className="w-5 h-5 text-gray-600 group-hover:text-amber-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>
            <p className="text-5xl font-extrabold text-white">{activeEvents}</p>
          </div>

          <div onClick={() => setShowAttendanceModal(true)} className="bg-[#0f1118]/80 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <h3 className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest group-hover:text-emerald-500 transition-colors">Toplam Yoklama</h3>
              <svg className="w-5 h-5 text-gray-600 group-hover:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </div>
            <p className="text-5xl font-extrabold text-white">{totalAttendances}</p>
          </div>

          <div onClick={() => setShowParticipantManager(true)} className="bg-[#0f1118]/80 backdrop-blur-xl border border-white/5 p-8 rounded-2xl hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <h3 className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Öğrenci Listesi</h3>
              <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <p className="text-5xl font-extrabold text-white">{allParticipants.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}