import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { formDataToPrismaInput } from '@/lib/project-transform'
import { serializeProject, projectInclude } from '@/lib/project-serialize'
import { revalidateProjects } from '@/lib/revalidate'
import { z } from 'zod'

const gallerySchema = z.object({
  previewUrl: z.string(),
  caption: z.string(),
});

const mechanicSchema = z.object({
  title: z.string(),
  description: z.string(),
  tech: z.string(),
});

const projectSchema = z.object({
  title: z.string().min(1),
  shortDescription: z.string(),
  tags: z.array(z.string()),
  type: z.string(),
  fullDescription: z.string(),
  techStack: z.array(z.string()),
  highlights: z.array(z.string()),
  year: z.string(),
  role: z.string(),
  platform: z.string(),
  status: z.string(),
  projectLinkUrl: z.string(),
  githubUrl: z.string(),
  hasPublication: z.boolean().optional(),
  publicationUrl: z.string().optional(),
  gallery: z.array(gallerySchema),
  mechanics: z.array(mechanicSchema)
});

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params
    const project = await prisma.project.findUnique({
      where: { slug },
      include: projectInclude,
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(serializeProject(project))
  } catch {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await params
    const data = await request.json()

    const result = projectSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.issues }, { status: 400 })
    }

    const input = formDataToPrismaInput(result.data as any)

    // Delete old relations
    await prisma.galleryItem.deleteMany({ where: { projectSlug: slug } })
    await prisma.mechanic.deleteMany({ where: { projectSlug: slug } })
    await prisma.projectLink.deleteMany({ where: { projectSlug: slug } })

    // Update project with new data
    const project = await prisma.project.update({
      where: { slug },
      data: {
        title: input.title,
        shortDescription: input.shortDescription,
        tags: input.tags,
        cardImage: input.cardImage,
        type: input.type,
        heroImage: input.heroImage,
        badge: input.badge,
        fullDescription: input.fullDescription,
        techStack: input.techStack,
        highlights: input.highlights,
        metaYear: input.metaYear,
        metaRole: input.metaRole,
        metaPlatform: input.metaPlatform,
        metaStatus: input.metaStatus,
        metaStatusColor: input.metaStatusColor,
        gallery: { create: input.gallery },
        mechanics: { create: input.mechanics },
        links: { create: input.links },
      },
      include: projectInclude,
    })

    revalidateProjects(slug)

    return NextResponse.json(serializeProject(project))
  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { slug } = await params
    await prisma.project.delete({ where: { slug } })
    revalidateProjects(slug)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
