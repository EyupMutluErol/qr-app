import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'


const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/admin/setup') || pathname.startsWith('/api/admin/login') || pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Bu işlem için yetkiniz bulunmamaktadır.' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      await jwtVerify(token, JWT_SECRET)
      
      return NextResponse.next()

    } catch (error) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Oturum süreniz dolmuş veya geçersiz. Lütfen tekrar giriş yapın.' }, 
          { status: 401 }
        )
      }
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}