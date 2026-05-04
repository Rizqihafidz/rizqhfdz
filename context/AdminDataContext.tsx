'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Project, AboutCard, ProjectFormData } from '@/types'

interface ProfileUpdateInput {
  image: string
  heroDescription: string
  bio: string
  cards: AboutCard[]
  resumeEn?: string
  resumeId?: string
}

interface AdminDataContextType {
  projects: Project[]
  profileImage: string
  heroDescription: string
  aboutBio: string
  aboutCards: AboutCard[]
  hasResumeEn: boolean
  hasResumeId: boolean
  isLoading: boolean
  addProject: (data: ProjectFormData) => Promise<void>
  updateProject: (slug: string, data: ProjectFormData) => Promise<void>
  deleteProject: (slug: string) => Promise<void>
  updateProfile: (input: ProfileUpdateInput) => Promise<void>
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined)

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [profileImage, setProfileImage] = useState('/assets/profile-pic.jpeg')
  const [heroDescription, setHeroDescription] = useState('')
  const [aboutBio, setAboutBio] = useState('')
  const [aboutCards, setAboutCards] = useState<AboutCard[]>([])
  const [hasResumeEn, setHasResumeEn] = useState(false)
  const [hasResumeId, setHasResumeId] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch {
      // keep current state
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const data = await res.json()
        setProfileImage(data.profileImage)
        setHeroDescription(data.heroDescription || '')
        setAboutBio(data.aboutBio)
        setAboutCards(data.aboutCards)
        setHasResumeEn(Boolean(data.hasResumeEn))
        setHasResumeId(Boolean(data.hasResumeId))
      }
    } catch {
      // keep current state
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchProjects(), fetchProfile()]).finally(() => setIsLoading(false))
  }, [fetchProjects, fetchProfile])

  const addProject = useCallback(async (data: ProjectFormData) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to create project')
    await fetchProjects()
  }, [fetchProjects])

  const updateProject = useCallback(async (slug: string, data: ProjectFormData) => {
    const res = await fetch(`/api/projects/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Failed to update project')
    await fetchProjects()
  }, [fetchProjects])

  const deleteProject = useCallback(async (slug: string) => {
    const res = await fetch(`/api/projects/${slug}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete project')
    await fetchProjects()
  }, [fetchProjects])

  const updateProfile = useCallback(async ({ image, heroDescription, bio, cards, resumeEn, resumeId }: ProfileUpdateInput) => {
    const payload: Record<string, unknown> = {
      profileImage: image,
      heroDescription,
      aboutBio: bio,
      aboutCards: cards,
    }
    if (resumeEn !== undefined) payload.resumeEn = resumeEn
    if (resumeId !== undefined) payload.resumeId = resumeId

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error('Failed to update profile')
    await fetchProfile()
  }, [fetchProfile])

  return (
    <AdminDataContext.Provider
      value={{
        projects,
        profileImage,
        heroDescription,
        aboutBio,
        aboutCards,
        hasResumeEn,
        hasResumeId,
        isLoading,
        addProject,
        updateProject,
        deleteProject,
        updateProfile,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  )
}

export function useAdminData() {
  const context = useContext(AdminDataContext)
  if (context === undefined) {
    throw new Error('useAdminData must be used within an AdminDataProvider')
  }
  return context
}
