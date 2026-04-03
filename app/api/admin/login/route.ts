import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json({ error: "Kullanıcı adı ve şifre alanları boş bırakılamaz." }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin) {
      return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 })
    }

    const token = await new SignJWT({ id: admin.id, username: admin.username, role: "admin" })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(JWT_SECRET)

    const response = NextResponse.json({ message: "Giriş başarılı" }, { status: 200 })

    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 8,
      path: "/",
    })

    return response

  } catch (error) {
    console.error("GİRİŞ HATASI:", error)
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}