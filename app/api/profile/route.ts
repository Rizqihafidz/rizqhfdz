import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'
import { sanitizeText } from '@/lib/sanitize'
import { sanitizeHtmlServer } from '@/lib/sanitize-server'
import { revalidateProfile } from '@/lib/revalidate'

// ~7 MB cap per file (base64 of a ~5 MB PDF). Keeps requests under Vercel's 4.5 MB body limit
// when only one file is sent at a time, and prevents accidental DB bloat.
const RESUME_MAX_LENGTH = 7_500_000

const cardSchema = z.object({
  icon: z.string().max(50),
  title: z.string().max(100),
  description: z.string().max(500),
})

const resumeSchema = z
  .string()
  .max(RESUME_MAX_LENGTH, 'Resume file is too large')
  .refine(
    (s) => s === '' || s.startsWith('data:application/pdf;base64,'),
    'Resume must be a PDF data URL',
  )

const profileSchema = z.object({
  profileImage: z.string().optional(),
  heroDescription: z.string().max(500).optional(),
  aboutBio: z.string().max(10000),
  aboutCards: z.array(cardSchema).max(10),
  resumeEn: resumeSchema.optional(),
  resumeId: resumeSchema.optional(),
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
      heroDescription: profile.heroDescription,
      aboutBio: profile.aboutBio,
      aboutCards: profile.aboutCards.map((c) => ({
        icon: c.icon,
        title: c.title,
        description: c.description,
      })),
      hasResumeEn: Boolean(profile.resumeEn),
      hasResumeId: Boolean(profile.resumeId),
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

    const result = profileSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues }, { status: 400 })
    }

    const { profileImage, heroDescription, aboutBio, aboutCards, resumeEn, resumeId } = result.data

    const sanitizedBio = sanitizeHtmlServer(aboutBio)

    await prisma.aboutCard.deleteMany({ where: { profileId: 'singleton' } })

    const profile = await prisma.profile.update({
      where: { id: 'singleton' },
      data: {
        profileImage,
        aboutBio: sanitizedBio,
        ...(heroDescription !== undefined ? { heroDescription: sanitizeText(heroDescription) } : {}),
        // Only update resume fields when explicitly sent. Empty string clears.
        ...(resumeEn !== undefined ? { resumeEn: resumeEn === '' ? null : resumeEn } : {}),
        ...(resumeId !== undefined ? { resumeId: resumeId === '' ? null : resumeId } : {}),
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
      heroDescription: profile.heroDescription,
      aboutBio: profile.aboutBio,
      aboutCards: profile.aboutCards.map((c) => ({
        icon: c.icon,
        title: c.title,
        description: c.description,
      })),
      hasResumeEn: Boolean(profile.resumeEn),
      hasResumeId: Boolean(profile.resumeId),
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
