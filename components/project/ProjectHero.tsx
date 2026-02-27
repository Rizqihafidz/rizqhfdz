import Image from 'next/image'
import type { Project } from '@/types'

interface Props {
  project: Project
}

export default function ProjectHero({ project }: Props) {
  const isBase64 = project.heroImage.startsWith('data:')

  return (
    <section className="relative w-full min-h-[60vh] lg:h-[65vh] overflow-hidden bg-slate-900">
      {/* Background Image */}
      {isBase64 ? (
        <img
          src={project.heroImage}
          alt={`${project.title} hero image`}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <Image
          src={project.heroImage}
          alt={`${project.title} hero image`}
          fill
          priority
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAQABgDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUH/8QAJBAAAgEDAwQDAQAAAAAAAAAAAQIDBAURAAYhEhMxQRRRYXH/xAAVAQEBAAAAAAAAAAAAAAAAAAAFBv/EAB8RAAIBAwUBAAAAAAAAAAAAAAECAAMRIQQFEjFBYf/aAAwDAQACEQMRAD8AMtG0LVtW7RXa5VFVJHDGzx0sMnajdgAMcHwMgc+M6ltW/Le2re6SZBNHUSGKOplj5hYkAgE8EEeOeNJbu3DV7gu0lxqmVS3CRr4RfwD++z+6P7huNFabdUXCvlSCmp42klkf+VUZJ/Oh0tSm1Vyw4zKKlSiH8S+1xRe5j//Z"
          sizes="100vw"
          className="object-cover"
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/60 to-transparent z-10" />

      {/* Content */}
      <div className="absolute inset-0 z-20 px-6 pt-28 pb-12 lg:pt-0 lg:pb-16 flex items-end">
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex flex-col gap-4 max-w-3xl">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit border ${project.type === 'game'
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
            >
              {project.badge}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter">
              {project.title}
            </h1>
            <p className="text-lg lg:text-xl text-slate-400 font-medium leading-relaxed">
              {project.shortDescription}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
