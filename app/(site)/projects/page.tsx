import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { serializeProject, projectInclude } from '@/lib/project-serialize'
import MaterialIcon from '@/components/ui/MaterialIcon'
import ProjectCard from '@/components/ui/ProjectCard'

export const metadata: Metadata = {
  title: 'All Projects',
  description:
    'Browse through all of my projects — game development, web development, and more.',
}

export const dynamic = 'force-dynamic'

export default async function AllProjectsPage() {
  const dbProjects = await prisma.project.findMany({
    include: projectInclude,
    orderBy: { createdAt: 'desc' },
  })
  const projects = dbProjects.map(serializeProject)

  return (
    <main>
      {/* Page Header */}
      <section className="pt-32 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/#projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors mb-8 group"
          >
            <MaterialIcon
              name="arrow_back"
              className="text-lg transition-transform group-hover:-translate-x-1"
            />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black mb-4">All Projects</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Browse through all of my work and projects across game development,
            web development, and more.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
