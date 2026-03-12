import MaterialIcon from '@/components/ui/MaterialIcon'
import SafeHtml from '@/components/ui/SafeHtml'

interface AboutData {
  bio: string
  cards: { icon: string; title: string; description: string }[]
  profileImage: string
}

const defaultCards = [
  {
    icon: 'school',
    title: 'Education',
    description: 'S1 Informatics Engineering from Brawijaya University with 3.66 GPA.',
  },
  {
    icon: 'group',
    title: 'Leadership',
    description: 'Led Game Designer Division in Raion Community for 1 year.',
  },
  {
    icon: 'sports_esports',
    title: 'Game Dev',
    description: 'Developed games in Unity & C# including thesis research project.',
  },
  {
    icon: 'web',
    title: 'Web Dev',
    description: 'Developed this portfolio website using Next.js 16, React 19, and Tailwind CSS.',
  },
]

const defaultBio = '<p>I am Rizqi Maulana Hafidz, an Informatics Engineering graduate from Brawijaya University with a GPA of 3.66. I aspire to have a career as a game developer, combining my passion for gaming with strong technical skills in Unity and C# programming.</p><p>My thesis focused on dynamic difficulty adjustment in a 2D endless runner game, published in J-PTIIK journal. I\'ve also led the Game Designer Division in Raion Community, where I mentored new members and organized game development workshops. I\'m currently seeking opportunities to grow as a developer.</p>'

interface Props {
  data?: AboutData
}

export default function AboutSection({ data }: Props) {
  const cards = data?.cards ?? defaultCards
  const bio = data?.bio ?? defaultBio

  return (
    <section className="py-20 px-6 bg-slate-800/40" id="about">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Bio */}
          <div>
            <h2 className="text-4xl font-black mb-8 tracking-tight">About Me</h2>
            <SafeHtml
              html={bio}
              className="space-y-4 text-lg text-slate-400 leading-relaxed"
            />
          </div>

          {/* Cards - aligned with bio paragraph, not title */}
          <div className="lg:mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map((card, index) => {
              const gradients = [
                'from-purple-500 to-indigo-500',
                'from-blue-500 to-cyan-500',
                'from-green-500 to-emerald-500',
                'from-orange-500 to-red-500',
              ]
              const gradient = gradients[index % gradients.length]

              return (
                <div
                  key={card.title}
                  className="relative p-8 rounded-2xl bg-slate-800/50 border border-white/5 shadow-sm overflow-hidden"
                >
                  {/* Subtle gradient accent */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03]`} />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <MaterialIcon name={card.icon} className="text-3xl text-primary" />
                      <h3 className="text-xl font-bold">{card.title}</h3>
                    </div>
                    <p className="text-sm text-slate-400">{card.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
