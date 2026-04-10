"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import { QRCodeSVG } from "qrcode.react"

export default function ProjectorQRPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [qrToken, setQrToken] = useState<string>("");
  const [eventName, setEventName] = useState<string>("Yükleniyor...");
  const [qrCountdown, setQrCountdown] = useState(90);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const fetchToken = async () => {
      try {
        const res = await axios.get(`/api/admin/events/${eventId}/qr`);
        setQrToken(res.data.token);
        setEventName(res.data.event.name);
        setQrCountdown(90); // Qr'ı 90 saniyede bir yeniliyorum
      } catch (error) {
        console.error(error);
        setEventName("Hata! Geçersiz Etkinlik.");
      }
    }

    fetchToken();

    // qr'ı yenilemek için 90 saniyelik sayaç oluşturuyorum
    timer = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          fetchToken();
          return 90;
        }
        return prev - 1;
      })
    }, 1000)

    return () => clearInterval(timer);
  }, [eventId])

  return (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
    <div className="text-center mb-8 md:mb-10 w-full px-4">
      <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest mb-3 md:mb-4 truncate">
        {eventName}
      </h1>
      <p className="text-sm md:text-xl text-indigo-400 font-medium tracking-wide">
        Yoklama için bu QR kodu okutunuz
      </p>
    </div>

    <div 
      className="bg-white rounded-3xl shadow-[0_0_80px_rgba(255,255,255,0.15)] mb-8 md:mb-12 aspect-square flex items-center justify-center p-[5%] md:p-6 shrink-0"
      style={{
        width: "100%",
        maxWidth: "min(450px, calc(100vw - 3rem))",
        minWidth: "0"
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
            width: "100%"
          }}
          level="H" 
          includeMargin={false} 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
          <svg className="animate-spin h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        </div>
      )}
    </div>

    <div className="w-full max-w-[calc(100vw-3rem)] sm:max-w-xl">
      <div className="flex justify-between text-xs md:text-sm font-bold text-gray-400 mb-3 uppercase tracking-widest">
        <span>Güvenlik Güncellemesi</span>
        <span className={qrCountdown <= 10 ? "text-red-400" : "text-indigo-400"}>{qrCountdown} Saniye</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${qrCountdown <= 10 ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" : "bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"}`} 
          style={{ width: `${(qrCountdown / 90) * 100}%` }}
        />
      </div>
    </div>
  </div>
)
}