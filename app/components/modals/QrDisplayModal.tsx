"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { QRCodeSVG } from "qrcode.react"

type QrDisplayModalProps = {
  event: any | null
  onClose: () => void
} 

export default function QrDisplayModal({ event, onClose }: QrDisplayModalProps) {
  const [qrToken, setQrToken] = useState<string>("")
  const [qrCountdown, setQrCountdown] = useState(90)

  // QR Token'ı API'den çeken fonksiyon
  const loadQrToken = async (eventId: string) => {
    try {
      const res = await axios.get(`/api/admin/events/${eventId}/qr`)
      setQrToken(res.data.token)
      setQrCountdown(90)
    } catch (error) {
      console.error(error)
    }
  }

  // Modal açıldığında sayacı başlatan ve bitince yenileyen sistem
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (event) {
      loadQrToken(event.id)
      timer = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            loadQrToken(event.id)
            return 90
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [event])

  if (!event) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f1118] border border-indigo-500/30 rounded-3xl p-8 max-w-md w-full shadow-[0_0_80px_rgba(99,102,241,0.2)] flex flex-col items-center relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all duration-300 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h3 className="text-2xl font-black text-center text-white mb-2 uppercase tracking-wider">{event.name}</h3>
        <p className="text-indigo-400 text-sm mb-8 font-medium">Yoklama için bu kodu okutun</p>
        <div 
          className="bg-white rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] relative aspect-square flex items-center justify-center p-[5%] shrink-0"
          style={{
            width: "100%",
            maxWidth: "calc(100vw - 6rem)", 
            minWidth: "0", 
          }}
        >
          {qrToken ? (
            <QRCodeSVG 
              value={`${process.env.NEXT_PUBLIC_SITE_URL}/attend?token=${qrToken}`}
              size={undefined} 
              style={{ 
                display: "block",
                height: "auto", 
                maxWidth: "100%", 
                width: "100%", 
              }}
              level="H" 
              includeMargin={false} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-xl">
              <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          )}
        </div>
        <div className="w-full mt-8">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
            <span>Güvenlik Süresi</span>
            <span className={qrCountdown <= 10 ? "text-red-400" : "text-indigo-400"}>{qrCountdown} Saniye</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${qrCountdown <= 10 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" : "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]"}`} style={{ width: `${(qrCountdown / 90) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}