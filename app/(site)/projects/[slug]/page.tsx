import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serializeProject, projectInclude } from '@/lib/project-serialize'
import Breadcrumb from '@/components/ui/Breadcrumb'
import ProjectHero from '@/components/project/ProjectHero'
import ProjectMetadata from '@/components/project/ProjectMetadata'
import ProjectOverview from '@/components/project/ProjectOverview'
import ProjectGallery from '@/components/project/ProjectGallery'
import ProjectMechanics from '@/components/project/ProjectMechanics'
import ProjectSidebar from '@/components/project/ProjectSidebar'
import ProjectNavigation from '@/components/project/ProjectNavigation'

interface PageProps {
    params: Promise<{ slug: string }>
}

export const revalidate = 0

export async function generateStaticParams() {
    const projects = await prisma.project.findMany({ select: { slug: true } })
    return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const dbProject = await prisma.project.findUnique({
        where: { slug },
        select: { title: true, shortDescription: true, heroImage: true },
    })

    if (!dbProject) {
        return { title: 'Project Not Found' }
    }

    return {
        title: dbProject.title,
        description: dbProject.shortDescription,
        openGraph: {
            title: dbProject.title,
            description: dbProject.shortDescription,
            images: [dbProject.heroImage],
        },
    }
}

export default async function ProjectPage({ params }: PageProps) {
    const { slug } = await params
    const dbProject = await prisma.project.findUnique({
        where: { slug },
        include: projectInclude,
    })

    if (!dbProject) {
        notFound()
    }

    const project = serializeProject(dbProject)

    return (
        <>
            <ProjectHero project={project} />
            <ProjectMetadata metadata={project.metadata} />

            <section className="max-w-5xl mx-auto px-6 py-20">
                <Breadcrumb items={[
                    { label: 'Projects', href: '/#projects' },
                    { label: project.title }
                ]} />
                <ProjectNavigation />

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Main Content */}
                    <div className="flex-1 space-y-20">
                        <ProjectOverview project={project} />
                        <ProjectGallery gallery={project.gallery} />
                        <ProjectMechanics mechanics={project.mechanics} />
                    </div>

                    {/* Sidebar */}
                    <ProjectSidebar project={project} />
                </div>
            </section>
        </>
    )
}
