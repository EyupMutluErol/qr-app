import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// etkinlik güncelleme
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const body = await request.json()
    const { name,locationName ,latitude, longitude ,eventDate} = body

    if (!name || !locationName || latitude === undefined || longitude === undefined || !eventDate) {
      return NextResponse.json({ error: "Lütfen tüm alanları doldurun." }, { status: 400 })
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        name,
        locationName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        eventDate:new Date(eventDate)
      }
    })

    return NextResponse.json({ message: "Etkinlik güncellendi", event: updatedEvent })
  } catch (error) {
    return NextResponse.json({ error: "Güncelleme sırasında bir hata oluştu." }, { status: 500 })
  }
}


// etkinlik silme
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.attendance.deleteMany({
      where: { eventId: id }
    })

    await prisma.event.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Etkinlik başarıyla silindi." })
  } catch (error) {
    return NextResponse.json({ error: "Silme işlemi sırasında bir hata oluştu." }, { status: 500 })
  }
}