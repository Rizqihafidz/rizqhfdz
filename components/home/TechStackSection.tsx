import { SiUnity, SiSharp, SiFigma, SiHtml5, SiGit, SiNotion, SiPostgresql, SiReact, SiNextdotjs, SiTailwindcss, SiTypescript, SiPrisma } from 'react-icons/si'
import type { IconType } from 'react-icons'

interface TechItem {
  icon: IconType
  name: string
  color: string // Brand color
}

const techItems: TechItem[] = [
  { icon: SiUnity, name: 'Unity', color: '#000000' },
  { icon: SiSharp, name: 'C#', color: '#512BD4' },
  { icon: SiFigma, name: 'Figma', color: '#F24E1E' },
  { icon: SiHtml5, name: 'HTML/CSS', color: '#E34F26' },
  { icon: SiGit, name: 'Git', color: '#F05032' },
  { icon: SiNotion, name: 'Notion', color: '#000000' },
  { icon: SiPostgresql, name: 'PostgreSQL', color: '#4169E1' },
  { icon: SiReact, name: 'React', color: '#61DAFB' },
  { icon: SiNextdotjs, name: 'Next.js', color: '#000000' },
  { icon: SiTailwindcss, name: 'Tailwind', color: '#06B6D4' },
  { icon: SiTypescript, name: 'TypeScript', color: '#3178C6' },
  { icon: SiPrisma, name: 'Prisma', color: '#2D3748' },
]

export default function TechStackSection() {
  return (
    <section className="py-20 px-6 bg-slate-800/40" id="tech">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">Tech Stack</h2>
          <p className="text-slate-400">
            The core tools I use to bring ideas to life
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {techItems.map((item) => (
            <div
              key={item.name}
              className="flex flex-col items-center p-6 rounded-2xl bg-slate-800/50 border border-transparent hover:border-primary/30 transition-all group"
            >
              <div className="size-16 rounded-xl bg-slate-700 flex items-center justify-center mb-4 shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:bg-slate-600 transition-all">
                <item.icon
                  className="text-3xl transition-colors"
                  style={{ color: item.color }}
                />
              </div>
              <span className="font-bold text-sm">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
