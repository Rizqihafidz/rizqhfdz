import { prisma } from '@/lib/prisma'
import { serializeProject, projectInclude } from '@/lib/project-serialize'
import HeroSection from '@/components/home/HeroSection'
import AboutSection from '@/components/home/AboutSection'
import TechStackSection from '@/components/home/TechStackSection'
import ProjectsSection from '@/components/home/ProjectsSection'
import ContactSection from '@/components/home/ContactSection'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [dbProjects, profile] = await Promise.all([
    prisma.project.findMany({
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.profile.findUnique({
      where: { id: 'singleton' },
      include: { aboutCards: { orderBy: { order: 'asc' } } },
    }),
  ])

  const projects = dbProjects.map(serializeProject)

  const aboutData = profile
    ? {
      bio: profile.aboutBio,
      cards: profile.aboutCards.map((c) => ({
        icon: c.icon,
        title: c.title,
        description: c.description,
      })),
      profileImage: profile.profileImage,
    }
    : undefined

  return (
    <>
      <HeroSection profileImage={aboutData?.profileImage} />
      <AboutSection data={aboutData} />
      <ProjectsSection projects={projects} />
      <TechStackSection />
      <ContactSection />
    </>
  )
}
