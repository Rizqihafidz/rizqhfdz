import Link from 'next/link'
import Image from 'next/image'
import { getTypeBadgeClass, getTypeLabel } from '@/lib/utils'
import type { Project } from '@/types'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group bg-slate-800 rounded-3xl overflow-hidden border border-white/5 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all block h-full cursor-pointer"
    >
      {/* Image */}
      <div className="h-48 md:h-56 overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
          <span className="text-white font-bold text-sm bg-primary/80 backdrop-blur-sm px-4 py-2 rounded-lg">
            View Details
          </span>
        </div>
        {/* Type Badge */}
        <span
          className={`absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ${getTypeBadgeClass(project.type, 'overlay')}`}
        >
          {getTypeLabel(project.type)}
        </span>
        {project.cardImage.startsWith('data:') ? (
          <img
            src={project.cardImage}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <Image
            src={project.cardImage}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 300px, 380px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
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
        <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
          {project.shortDescription}
        </p>
      </div>
    </Link>
  )
}
