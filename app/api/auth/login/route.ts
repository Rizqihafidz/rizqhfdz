import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { sanitizeEmail, sanitizeText } from '@/lib/sanitize'
import { loginRateLimiter, getIp } from '@/lib/rate-limit'

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(254),
  password: z.string().min(1, 'Password is required').max(128),
})

export async function POST(request: Request) {
  const ip = getIp(request)
  if (!loginRateLimiter.consume(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  try {
    const body = await request.json()

    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 })
    }

    // Sanitize email input
    const email = sanitizeEmail(result.data.email)
    const password = result.data.password // Don't sanitize password, just validate

    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, admin.password)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = signToken({ adminId: admin.id, email: admin.email })

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
