import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 });
    }

    // Tokenın içine etkinliğin id'sini koyuyorum
    const token = await new SignJWT({ eventId: event.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('90s') // 90 saniyede bir qr yenileme
      .sign(JWT_SECRET);

    return NextResponse.json({ token, event }, { status: 200 });
    
  } catch (error) {
    console.error("QR Üretim Hatası:", error);
    return NextResponse.json({ error: "QR kodu üretilirken bir hata oluştu." }, { status: 500 });
  }
}