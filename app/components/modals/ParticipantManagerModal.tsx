"use client"

import { useState } from "react"
import axios from "axios"

type ParticipantManagerModalProps = {
  isOpen: boolean
  onClose: () => void
  participants: any[]
  onRefresh: () => void
}

export default function ParticipantManagerModal({ isOpen, onClose, participants, onRefresh }: ParticipantManagerModalProps) {
  const [participantForm, setParticipantForm] = useState({ firstName: "", lastName: "", email: "", phone: "" })
  
  const [searchTerm, setSearchTerm] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", phone: "" })
  const [isUpdating, setIsUpdating] = useState(false)
  
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error', isVisible: boolean }>({ message: "", type: "success", isVisible: false })

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true })
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }))
    }, 3000)
  }

  if (!isOpen) return null

  const filteredParticipants = participants.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeCount = participants.filter(p => p.isActive !== false).length

  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    const aActive = a.isActive !== false ? 1 : 0
    const bActive = b.isActive !== false ? 1 : 0
    return bActive - aActive
  })

  const startEditing = (participant: any) => {
    setEditingId(participant.id)
    setEditForm({
      firstName: participant.firstName,
      lastName: participant.lastName,
      email: participant.email,
      phone: participant.phone || ""
    })
  }

  const handleUpdate = async () => {
    if (!editForm.firstName || !editForm.lastName || !editForm.email) return
    setIsUpdating(true)
    try {
      await axios.put(`/api/admin/participants/${editingId}`, editForm)
      setEditingId(null)
      onRefresh()
      showToast("Öğrenci bilgileri başarıyla güncellendi.", "success")
    } catch (error) {
      showToast("Güncelleme başarısız oldu.", "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      await axios.delete(`/api/admin/participants/${id}`)
      setDeletingId(null)
      onRefresh()
      showToast("Öğrenci sistemden başarıyla kaldırıldı.", "success")
    } catch (error) {
      showToast("Silme işlemi başarısız oldu.", "error")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReactivate = async (p: any) => {
    try {
      await axios.post("/api/admin/participants", {
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone || ""
      })
      onRefresh()
      showToast("Öğrenci başarıyla sisteme geri alındı ve aktif edildi.", "success")
    } catch (error) {
      showToast("Geri alma işlemi başarısız oldu.", "error")
    }
  }

  const downloadCSVTemplate = () => {
    const headers = ["Ad", "Soyad", "Email", "Telefon"]
    const sampleRow = ["ÖrnekAd", "ÖrnekSoyad", "ornek@mail.com", "05551234567"]
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(";") + "\n" + sampleRow.join(";")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "Ogrenci_Yukleme_Sablonu.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const text = event.target?.result as string
      const lines = text.split("\n")
      
      const data = lines.slice(1).filter(line => line.trim()).map(line => {
        const delimiter = line.includes(";") ? ";" : ","
        const [firstName, lastName, email, phone] = line.split(delimiter)
        return { 
          firstName: firstName?.trim(), 
          lastName: lastName?.trim(), 
          email: email?.trim(), 
          phone: phone?.trim() 
        }
      }).filter(p => p.firstName && p.lastName && p.email)

      if (data.length === 0) {
        showToast("Geçerli veri bulunamadı. Lütfen örnek şablonu kullanın.", "error")
        return
      }

      try {
        await axios.post("/api/admin/participants/bulk", data)
        onRefresh()
        showToast(`${data.length} öğrenci başarıyla yüklendi/güncellendi.`, "success")
      } catch (error) {
        showToast("Yükleme başarısız. Lütfen örnek şablon formatına uyduğunuzdan emin olun.", "error")
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleManualParticipantAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post("/api/admin/participants", participantForm)
      setParticipantForm({ firstName: "", lastName: "", email: "", phone: "" })
      onRefresh()
      showToast("Katılımcı başarıyla eklendi/güncellendi.", "success")
    } catch (error: any) {
      showToast(error.response?.data?.error || "Hata oluştu.", "error")
    }
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      {toast.isVisible && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-fadeIn ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          <p className="text-sm font-bold tracking-wide">{toast.message}</p>
        </div>
      )}

      <div className="bg-[#0f1118] border border-indigo-500/30 rounded-3xl p-6 md:p-8 max-w-5xl w-full shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col max-h-[90vh] relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Öğrenci Yönetimi</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
          <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2">
            <div className="bg-white/5 p-5 rounded-xl border border-white/10">
              <h4 className="text-sm font-bold text-indigo-400 mb-4 uppercase tracking-widest">Manuel Öğrenci Ekle</h4>
              <form onSubmit={handleManualParticipantAdd} className="space-y-3">
                <input type="text" placeholder="Ad" value={participantForm.firstName} onChange={e => setParticipantForm({...participantForm, firstName: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" required />
                <input type="text" placeholder="Soyad" value={participantForm.lastName} onChange={e => setParticipantForm({...participantForm, lastName: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" required />
                <input type="email" placeholder="E-Posta" value={participantForm.email} onChange={e => setParticipantForm({...participantForm, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" required />
                <input type="tel" placeholder="Telefon (Opsiyonel)" value={participantForm.phone} onChange={e => setParticipantForm({...participantForm, phone: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none" />
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all text-sm cursor-pointer mt-2">Sisteme Kaydet</button>
              </form>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/10 flex flex-col items-center justify-center">
              <div className="flex justify-between items-center w-full mb-2">
                <h4 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Toplu CSV Yükle</h4>
                <button onClick={downloadCSVTemplate} className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-1 rounded hover:bg-amber-500/20 transition-all border border-amber-500/20">
                  Şablon İndir
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4 w-full text-left">Excel'den CSV olarak dışa aktarılmış dosyanızı seçin veya yandaki örnek şablonu doldurun.</p>
              <label className="block w-full py-6 border-2 border-dashed border-white/20 rounded-xl text-center text-sm font-medium text-gray-400 hover:border-amber-500 hover:text-amber-500 transition-all cursor-pointer">
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                CSV Dosyası Seç
                <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex flex-col h-full overflow-hidden">
            <div className="mb-4 sticky top-0 bg-[#0f1118] z-10">
              <div className="flex items-center justify-between mb-3 pr-2">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Öğrenci Listesi</h4>
                <div className="text-[10px] font-bold text-gray-500 bg-black/50 px-2.5 py-1 rounded-full border border-white/5">
                  <span className="text-emerald-400">{activeCount} Aktif</span> / {participants.length} Toplam
                </div>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input type="text" placeholder="İsim veya E-posta ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-all text-sm" />
              </div>
            </div>

            <div className="overflow-y-auto pr-2 custom-scrollbar space-y-2 pb-4">
              {sortedParticipants.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm border border-white/5 rounded-xl">Sistemde aranan kriterde öğrenci bulunamadı.</div>
              ) : (
                sortedParticipants.map(p => (
                  <div key={p.id} className={`p-3 rounded-xl flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 group transition-all border ${p.isActive !== false ? "bg-white/5 border-white/5 hover:border-indigo-500/30" : "bg-black/20 border-white/5 opacity-60 grayscale-[0.5]"}`}>
                    {editingId === p.id ? (
                      <div className="w-full space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input type="text" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="bg-black/50 border border-indigo-500/50 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none" placeholder="Ad" />
                          <input type="text" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="bg-black/50 border border-indigo-500/50 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none" placeholder="Soyad" />
                          <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="bg-black/50 border border-indigo-500/50 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none" placeholder="E-posta" />
                          <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="bg-black/50 border border-indigo-500/50 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none" placeholder="Telefon" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleUpdate} disabled={isUpdating} className="flex-1 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 transition-all cursor-pointer">Kaydet</button>
                          <button onClick={() => setEditingId(null)} className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-lg transition-all cursor-pointer">İptal</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 overflow-hidden w-full">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-bold truncate transition-colors ${p.isActive !== false ? "text-white group-hover:text-indigo-400" : "text-gray-500 line-through"}`}>{p.firstName} {p.lastName}</p>
                            {p.isActive === false && (
                              <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded uppercase">Pasif</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{p.email} {p.phone ? `• ${p.phone}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-2 self-end xl:self-auto shrink-0">
                          {deletingId === p.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-red-400 font-bold hidden sm:inline">Emin misin?</span>
                              <button onClick={() => handleDelete(p.id)} disabled={isDeleting} className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer">Sil</button>
                              <button onClick={() => setDeletingId(null)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-[10px] font-bold rounded-lg transition-all cursor-pointer">İptal</button>
                            </div>
                          ) : (
                            p.isActive !== false ? (
                              <div className="flex gap-1">
                                <button onClick={() => startEditing(p)} className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-all border border-indigo-500/20 cursor-pointer">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => setDeletingId(p.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all border border-red-500/20 cursor-pointer">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            ) : (
                              <button onClick={() => handleReactivate(p)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 transition-all cursor-pointer">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                SİSTEME GERİ AL
                              </button>
                            )
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}