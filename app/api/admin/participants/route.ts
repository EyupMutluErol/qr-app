import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
export const dynamic = "force-dynamic";

// katılımcıları listeleme 
export async function GET() {
  try {
    const participants = await prisma.participant.findMany({
      orderBy:[
        {isActive:'desc'},
        {firstName:'asc'}
      ]
    })
    return NextResponse.json(participants);
  } catch (error) {
    return NextResponse.json({ error: "Katılımcılar alınamadı." }, { status: 500 });
  }
}

// katılımcı ekleme 
export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, phone } = await req.json();

    // upsert kullanarak varsa güncelliyorum (isActive: true), yoksa yeni oluşturuyorum
    const participant = await prisma.participant.upsert({
      where: { email: email },
      update: {
        firstName,
        lastName,
        phone,
        isActive: true, // tekrar girerse aktif yap
      },
      create: {
        firstName,
        lastName,
        email,
        phone,
        isActive: true,
      },
    });

    return NextResponse.json(participant);
  } catch (error) {
    return NextResponse.json({ error: "İşlem başarısız." }, { status: 500 });
  }
}