import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const adminCount = await prisma.admin.count()

    if (adminCount > 0) {
      return NextResponse.json(
        { message: "Sistemde zaten bir yönetici mevcut." },
        { status: 400 }
      )
    }

    const initialPassword = process.env.INITIAL_ADMIN_PASSWORD

    if (!initialPassword) {
      return NextResponse.json(
        { error: "Sistem kurulum şifresi (.env) bulunamadı!" },
        { status: 500 }
      )
    }

    const hashedPassword = await bcrypt.hash(initialPassword, 10)

    const admin = await prisma.admin.create({
      data: {
        username: "admin",
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      { message: "İlk yönetici başarıyla oluşturuldu.", username: admin.username },
      { status: 201 }
    )

  } catch (error) {

    console.error("VERİTABANI VEYA KURULUM HATASI:", error);
    
    return NextResponse.json(
      { error: "Yönetici oluşturulurken teknik bir hata meydana geldi." },
      { status: 500 }
    )
  }
}