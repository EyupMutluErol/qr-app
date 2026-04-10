import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { participantId } = await request.json(); // hangi etkinlikte hangi katılımcı var id sinden buluyorum
    
    const existing = await prisma.attendance.findUnique({
      where: {
        eventId_participantId: { eventId, participantId }
      }
    })

    // yoklamada var-yok işaretleme mantığı
    if (existing) {
      await prisma.attendance.delete({
        where: { id: existing.id }
      })
      return NextResponse.json({ status: "absent" });
    } else {
      await prisma.attendance.create({
        data: { eventId, participantId }
      })
      return NextResponse.json({ status: "present" });
    }
  } catch (error) {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}