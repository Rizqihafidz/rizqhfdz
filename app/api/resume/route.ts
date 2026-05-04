import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const FALLBACK_PATH = '/assets/resume.pdf'

export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang') === 'id' ? 'id' : 'en'

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: 'singleton' },
      select: { resumeEn: true, resumeId: true },
    })

    const dataUrl = lang === 'id' ? profile?.resumeId : profile?.resumeEn

    if (!dataUrl) {
      return NextResponse.redirect(new URL(FALLBACK_PATH, request.url))
    }

    const base64 = dataUrl.replace(/^data:application\/pdf;base64,/, '')
    const buffer = Buffer.from(base64, 'base64')

    const filename = `Rizqi_Maulana_Hafidz_CV_${lang.toUpperCase()}.pdf`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Resume download error:', error)
    return NextResponse.redirect(new URL(FALLBACK_PATH, request.url))
  }
}
