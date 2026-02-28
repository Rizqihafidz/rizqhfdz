import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import { sanitizeText } from '@/lib/sanitize'
import { sanitizeHtmlServer } from '@/lib/sanitize-server'
import { revalidateProfile } from '@/lib/revalidate'

// Validation schema for profile update
const cardSchema = z.object({
  icon: z.string().max(50),
  title: z.string().max(100),
  description: z.string().max(500),
})

const profileSchema = z.object({
  profileImage: z.string().optional(),
  aboutBio: z.string().max(10000),
  aboutCards: z.array(cardSchema).max(10),
})

export async function GET() {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: 'singleton' },
      include: {
        aboutCards: { orderBy: { order: 'asc' } },
      },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({
      profileImage: profile.profileImage,
      aboutBio: profile.aboutBio,
      aboutCards: profile.aboutCards.map((c) => ({
        icon: c.icon,
        title: c.title,
        description: c.description,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate input
    const result = profileSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues }, { status: 400 })
    }

    const { profileImage, aboutBio, aboutCards } = result.data

    // Sanitize HTML content (aboutBio can contain rich text)
    const sanitizedBio = sanitizeHtmlServer(aboutBio)

    // Delete old cards and recreate
    await prisma.aboutCard.deleteMany({ where: { profileId: 'singleton' } })

    const profile = await prisma.profile.update({
      where: { id: 'singleton' },
      data: {
        profileImage,
        aboutBio: sanitizedBio,
        aboutCards: {
          create: aboutCards.map((card, i) => ({
            icon: sanitizeText(card.icon),
            title: sanitizeText(card.title),
            description: sanitizeText(card.description),
            order: i,
          })),
        },
      },
      include: {
        aboutCards: { orderBy: { order: 'asc' } },
      },
    })

    revalidateProfile()

    return NextResponse.json({
      profileImage: profile.profileImage,
      aboutBio: profile.aboutBio,
      aboutCards: profile.aboutCards.map((c) => ({
        icon: c.icon,
        title: c.title,
        description: c.description,
      })),
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
