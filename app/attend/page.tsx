"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import axios from "axios"

function AttendContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"locating" | "form" | "submitting" | "success" | "error">("locating"); // sayfa durumu
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const autoSubmitAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Geçersiz veya eksik QR kod (Token bulunamadı).");
      return
    }

    // konumu alma
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          
          const savedEmail = localStorage.getItem("registeredEmail"); // maili localstorage'da var mı bakıp kullanıcıyı tanıyorum
          if (savedEmail && !autoSubmitAttempted.current) {
            autoSubmitAttempted.current = true;
            handleAutoSubmit(savedEmail, position.coords.latitude, position.coords.longitude);
          } else {
            setStatus("form");
          }
        },
        (error) => {
          setStatus("error");
          setErrorMessage("Yoklama verebilmek için konum izni vermeniz zorunludur. Lütfen tarayıcı ayarlarından konum izni verin.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      setStatus("error");
      setErrorMessage("Cihazınız konum özelliğini desteklemiyor.");
    }
  }, [token])

  // Kullanıcı daha önce sisteme kayıt olmuşsa form göstermeden otomatik yoklamaya katıyorum
  const handleAutoSubmit = async (email: string, lat: number, lng: number) => {
    setStatus("submitting");
    try {
      await axios.post("/api/attend", { token, latitude: lat, longitude: lng, email });
      setStatus("success");
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.error.includes("Sistemde kaydınız bulunamadı")) {
        localStorage.removeItem("registeredEmail");
        setStatus("form")
      } else {
        setStatus("error");
        setErrorMessage(error.response?.data?.error || "Yoklama alınırken bir hata oluştu.");
      }
    }
  }

  // İlk kez kayıt oluyorsa form doldurtuyorum
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors: string[] = []
    if (formData.firstName.trim().length < 2) errors.push("Adınız en az 2 karakter olmalıdır.")
    if (formData.lastName.trim().length < 2) errors.push("Soyadınız en az 2 karakter olmalıdır.")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email.trim())) errors.push("Lütfen geçerli bir e-posta adresi giriniz.")

    if (formData.phone.trim()) {
      const cleanPhone = formData.phone.replace(/[\s()-]/g, "")
      const phoneRegex = /^0?5[0-9]{9}$/ 
      if (!phoneRegex.test(cleanPhone)) errors.push("Lütfen geçerli bir telefon numarası giriniz (Örn: 05xx xxx xx xx).")
    }

    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setValidationErrors([])
    setStatus("submitting")
    setErrorMessage("")

    try {
      await axios.post("/api/attend", {
        token,
        latitude: location?.latitude,
        longitude: location?.longitude,
        ...formData
      })
      localStorage.setItem("registeredEmail", formData.email.trim())
      setStatus("success")
    } catch (error: any) {
      setStatus("error")
      setErrorMessage(error.response?.data?.error || "Yoklama alınırken bir hata oluştu.")
    }
  }

  const resetIdentity = () => {
    localStorage.removeItem("registeredEmail")
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="bg-[#0f1118] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(99,102,241,0.1)] relative z-10 animate-fadeInUp">
        
        {status === "locating" && (
          <div className="text-center py-8">
            <div className="inline-block relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Konum Aranıyor...</h2>
            <p className="text-gray-400 text-sm">Yoklama verebilmek için lütfen tarayıcınızın konum izni isteğini onaylayın.</p>
          </div>
        )}

        {status === "form" && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">İlk Kayıt Formu</h2>
              <p className="text-gray-400 text-sm">Cihazınız bir sonraki yoklamalarda sizi otomatik tanıyacaktır.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Adınız</label>
                  <input type="text" value={formData.firstName} onChange={(e) => {setFormData({...formData, firstName: e.target.value}); setValidationErrors([])}} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Soyadınız</label>
                  <input type="text" value={formData.lastName} onChange={(e) => {setFormData({...formData, lastName: e.target.value}); setValidationErrors([])}} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">E-Posta Adresiniz</label>
                <input type="text" value={formData.email} onChange={(e) => {setFormData({...formData, email: e.target.value}); setValidationErrors([])}} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" />
              </div>

              <div>
  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 pl-1">Telefon (Opsiyonel)</label>
  <input type="tel" value={formData.phone} onChange={(e) => {setFormData({...formData, phone: e.target.value}); setValidationErrors([])}} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm" placeholder="Örn: 05xx xxx xx xx" />
  <p className="text-[10px] text-gray-500 mt-1.5 pl-1">Başında 0 ile (11 hane) veya 0 olmadan (10 hane) girebilirsiniz. Boşluk bırakmanız sorun oluşturmaz.</p>
</div>

              {validationErrors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 animate-fadeIn">
                  <ul className="list-disc list-inside text-xs text-red-400 space-y-1">
                    {validationErrors.map((err, index) => <li key={index}>{err}</li>)}
                  </ul>
                </div>
              )}

              <button type="submit" className="w-full mt-2 px-4 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-[0.98] cursor-pointer">
                Yoklamaya Katıl
              </button>
            </form>
          </>
        )}

        {status === "submitting" && (
          <div className="text-center py-8">
            <div className="inline-block relative w-16 h-16 mb-6">
              <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Otomatik Kaydediliyor...</h2>
            <p className="text-gray-400 text-sm">Cihazınız tanındı, konumunuz doğrulanıyor.</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-emerald-400 mb-2">Başarılı!</h2>
            <p className="text-gray-400 text-sm mb-6">Yoklamanız sisteme başarıyla işlendi. Pencereyi kapatabilirsiniz.</p>
            <button onClick={resetIdentity} className="text-[10px] text-gray-500 hover:text-gray-300 underline cursor-pointer">
              Ben değilim (Kullanıcıyı Değiştir)
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 text-red-500 mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-red-400 mb-2">İşlem Başarısız</h2>
            <p className="text-gray-400 text-sm mb-6">{errorMessage}</p>
            {errorMessage.includes("katıldınız") && (
               <button onClick={resetIdentity} className="text-[10px] text-gray-500 hover:text-gray-300 underline cursor-pointer">Kullanıcıyı Değiştir</button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default function AttendPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0c10] flex items-center justify-center text-white">Yükleniyor...</div>}>
      <AttendContent />
    </Suspense>
  )
}