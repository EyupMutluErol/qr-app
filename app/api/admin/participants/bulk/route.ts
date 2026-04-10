import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Toplu katılımcı bilgisi ekleme
export async function POST(request: Request) {
  try {
    const participants = await request.json();

    // format kontrolü
    if (!Array.isArray(participants)) {
      return NextResponse.json({ error: "Geçersiz veri formatı." }, { status: 400 });
    }

    const results = await prisma.participant.createMany({
      data: participants.map(p => ({
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        phone: p.phone || null,
        isRegistered: true
      })),
      skipDuplicates: true // katılımcı varsa bir şey yapmıyorum yoksa ekliyorum
    })

    return NextResponse.json({ message: `${results.count} yeni katılımcı eklendi.` });
  } catch (error) {
    return NextResponse.json({ error: "Toplu kayıt işlemi başarısız." }, { status: 500 });
  }
}