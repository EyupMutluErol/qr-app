import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { prisma } from "@/lib/prisma"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Mesafe hesaplama fonksiyonu
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, latitude, longitude, email, firstName, lastName, phone } = body

    if (!token || !latitude || !longitude || !email) {
      return NextResponse.json({ error: "Eksik bilgi gönderildi." }, { status: 400 })
    }

    let payload
    try {
      const verified = await jwtVerify(token, JWT_SECRET)
      payload = verified.payload
    } catch (err) {
      return NextResponse.json({ error: "QR kodun süresi dolmuş veya geçersiz." }, { status: 401 })
    }

    const eventId = payload.eventId as string

    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 })
    }

    const eventTimeMs = new Date((event as any).eventDate).getTime()
    const nowMs = Date.now()
    const diffHours = (nowMs - eventTimeMs) / (1000 * 60 * 60) 

    if (diffHours < -1 || diffHours > 3) {
      return NextResponse.json({ 
        error: "Bu etkinliğin yoklama süresi şu an aktif değil. Lütfen etkinlik saatini bekleyin." 
      }, { status: 403 })
    }

    const distance = getDistanceFromLatLonInMeters(
      parseFloat(latitude),
      parseFloat(longitude),
      event.latitude,
      event.longitude
    )

    if (distance > 150) {
      return NextResponse.json({ error: `Etkinlik alanından çok uzaksınız. Mesafe: ${Math.round(distance)} metre.` }, { status: 403 })
    }

    let participant = await prisma.participant.findUnique({
      where: { email }
    })

    if (!participant) {
      if (!firstName || !lastName) {
        return NextResponse.json({ error: "Sistemde kaydınız bulunamadı. Lütfen formu eksiksiz doldurun." }, { status: 400 })
      }
      participant = await prisma.participant.create({
        data: {
          email,
          firstName,
          lastName,
          phone: phone || null,
          isRegistered: true
        }
      })
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        eventId_participantId: {
          eventId: event.id,
          participantId: participant.id
        }
      }
    })

    if (existingAttendance) {
      return NextResponse.json({ error: "Bu etkinliğe zaten katıldınız." }, { status: 400 })
    }

    const attendance = await prisma.attendance.create({
      data: {
        eventId: event.id,
        participantId: participant.id
      }
    })

    return NextResponse.json({ message: "Yoklama başarıyla alındı!", attendance }, { status: 201 })

  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 })
  }
}