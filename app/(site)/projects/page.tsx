import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { serializeProject, projectInclude } from '@/lib/project-serialize'
import MaterialIcon from '@/components/ui/MaterialIcon'

export const metadata: Metadata = {
  title: 'All Projects',
  description:
    'Browse through all of my projects — game development, web development, and more.',
}

export const revalidate = 0

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
              <Link
                key={project.slug}
                href={`/projects/${project.slug}`}
                className="group bg-slate-800 rounded-3xl overflow-hidden border border-white/5 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all block"
              >
                {/* Card Image */}
                <div className="h-56 overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <span className="text-white font-bold text-sm bg-primary/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                      View Details
                    </span>
                  </div>
                  {/* Type Badge */}
                  <span
                    className={`absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ${project.type === 'game'
                      ? 'bg-red-500/80'
                      : 'bg-emerald-500/80'
                      }`}
                  >
                    {project.type === 'game'
                      ? 'Game Development'
                      : 'Web Development'}
                  </span>
                  <img
                    src={project.cardImage}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>

                {/* Card Content */}
                <div className="p-8">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-700 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {project.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
