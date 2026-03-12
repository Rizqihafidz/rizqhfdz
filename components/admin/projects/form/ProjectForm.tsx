'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminData } from '@/context/AdminDataContext'
import MaterialIcon from '@/components/ui/MaterialIcon'
import TagInput from '@/components/admin/ui/TagInput'
import RichTextEditor from '@/components/admin/ui/RichTextEditor'
import type { ProjectFormData, GalleryFormItem, MechanicFormItem } from '@/types'

const emptyForm: ProjectFormData = {
  type: 'game',
  title: '',
  shortDescription: '',
  tags: [],
  fullDescription: '',
  year: '',
  role: '',
  platform: '',
  status: 'In Development',
  gallery: [],
  mechanics: [],
  techStack: [],
  highlights: [''],
  projectLinkUrl: '',
  githubUrl: '',
  hasPublication: false,
  publicationUrl: '',
}

interface Props {
  initialData?: ProjectFormData
  editSlug?: string
}

export default function ProjectForm({ initialData, editSlug }: Props) {
  const [form, setForm] = useState<ProjectFormData>(initialData ?? emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const { addProject, updateProject } = useAdminData()
  const router = useRouter()
  const galleryRef = useRef<HTMLInputElement>(null)

  const isEdit = !!editSlug

  const set = <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (form.title.length > 100) e.title = 'Title must be under 100 characters'
    if (!form.shortDescription.trim()) e.shortDescription = 'Short description is required'
    if (form.tags.length < 1) e.tags = 'At least 1 tag required'
    if (form.tags.length > 3) e.tags = 'Maximum 3 tags'
    const fullDesc = typeof form.fullDescription === 'string' ? form.fullDescription : ''
    if (!fullDesc.trim()) e.fullDescription = 'Full description is required'
    if (!form.year.trim()) e.year = 'Year is required'
    if (!form.role.trim()) e.role = 'Role is required'
    if (!form.platform.trim()) e.platform = 'Platform is required'
    if (form.gallery.length < 1) e.gallery = 'At least 1 image required'
    if (form.gallery.length > 10) e.gallery = 'Maximum 10 images'
    if (form.techStack.length < 1) e.techStack = 'At least 1 tech required'
    if (form.highlights.filter((h) => h.trim()).length < 1) e.highlights = 'At least 1 highlight required'
    if (!form.projectLinkUrl.trim()) e.projectLinkUrl = 'Project link is required'
    if (!form.githubUrl.trim()) e.githubUrl = 'GitHub URL is required'
    if (form.hasPublication && !form.publicationUrl.trim()) e.publicationUrl = 'Publication URL is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!validate()) return
    // Clean empty entries
    const cleaned: ProjectFormData = {
      ...form,
      highlights: form.highlights.filter((h) => h.trim()),
    }
    setSubmitting(true)
    try {
      if (isEdit) {
        await updateProject(editSlug, cleaned)
      } else {
        await addProject(cleaned)
      }
      setSaved(true)
      setTimeout(() => router.push('/admin/projects'), 500)
    } catch {
      setErrors({ submit: 'Failed to save project. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleGalleryUpload = async (files: FileList | null) => {
    if (!files) return
    const remaining = 10 - form.gallery.length
    const filesToProcess = Array.from(files).slice(0, remaining)

    // Convert files to base64
    const newItems: GalleryFormItem[] = await Promise.all(
      filesToProcess.map(async (file) => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
        return {
          file,
          previewUrl: base64, // Use base64 instead of blob URL
          caption: '',
        }
      })
    )
    set('gallery', [...form.gallery, ...newItems])
  }

  const removeGalleryItem = (index: number) => {
    set('gallery', form.gallery.filter((_, i) => i !== index))
  }

  const updateGalleryCaption = (index: number, caption: string) => {
    const next = [...form.gallery]
    next[index] = { ...next[index], caption }
    set('gallery', next)
  }

  const addMechanic = () => {
    set('mechanics', [...form.mechanics, { title: '', description: '', tech: '' }])
  }

  const removeMechanic = (index: number) => {
    set('mechanics', form.mechanics.filter((_, i) => i !== index))
  }

  const updateMechanic = (index: number, field: keyof MechanicFormItem, value: string) => {
    const next = [...form.mechanics]
    next[index] = { ...next[index], [field]: value }
    set('mechanics', next)
  }

  const inputClass = 'w-full px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all'
  const errorClass = 'border-red-500 focus:ring-red-500'
  const sectionClass = 'p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm space-y-4'

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-2">{isEdit ? 'Edit Project' : 'Create Project'}</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isEdit ? 'Update your project details.' : 'Fill in the details for your new project.'}
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/projects')}
          className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* [1] Project Type */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">Project Type</h2>
        <div className="grid grid-cols-2 gap-4">
          {(['game', 'web'] as const).map((type) => (
            <button
              key={type}
              onClick={() => set('type', type)}
              className={`p-6 rounded-xl border-2 transition-all flex items-center justify-center gap-3 ${form.type === type
                ? 'border-primary bg-primary/5'
                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
            >
              <MaterialIcon
                name={type === 'game' ? 'sports_esports' : 'web'}
                className={`text-3xl ${form.type === type ? 'text-primary' : 'text-slate-400'}`}
              />
              <span className="font-bold text-sm">
                {type === 'game' ? 'Game Development' : 'Web Development'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* [2] Basic Info */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">Basic Information</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Project title"
            className={`${inputClass} ${errors.title ? errorClass : ''}`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Short Description *</label>
          <textarea
            value={form.shortDescription}
            onChange={(e) => set('shortDescription', e.target.value)}
            rows={3}
            placeholder="Brief description for the project card"
            className={`${inputClass} resize-none ${errors.shortDescription ? errorClass : ''}`}
          />
          {errors.shortDescription && <p className="text-red-500 text-xs mt-1">{errors.shortDescription}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tags * (1-3)</label>
          <TagInput value={form.tags} onChange={(tags) => set('tags', tags)} maxTags={3} placeholder="Add a tag" />
          {errors.tags && <p className="text-red-500 text-xs mt-1">{errors.tags}</p>}
        </div>
      </div>

      {/* [3] Full Description */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">Full Description</h2>
        <RichTextEditor
          value={form.fullDescription}
          onChange={(html) => set('fullDescription', html)}
          placeholder="Write your full project description here..."
        />
        {errors.fullDescription && <p className="text-red-500 text-xs mt-2">{errors.fullDescription}</p>}
      </div>

      {/* [4] Metadata */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">Project Metadata</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Year *</label>
            <input value={form.year} onChange={(e) => set('year', e.target.value)} placeholder="e.g., 2025 or Mar 2025 - Jan 2026" className={`${inputClass} ${errors.year ? errorClass : ''}`} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <input value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g., Solo Developer" className={`${inputClass} ${errors.role ? errorClass : ''}`} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Platform *</label>
            <input value={form.platform} onChange={(e) => set('platform', e.target.value)} placeholder="e.g., PC (Unity)" className={`${inputClass} ${errors.platform ? errorClass : ''}`} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value as ProjectFormData['status'])}
              className={inputClass}
            >
              <option value="In Development">In Development</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* [5] Gallery */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">Gallery (1-10 images)</h2>
        <div
          onDrop={(e) => { e.preventDefault(); handleGalleryUpload(e.dataTransfer.files) }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => galleryRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary rounded-xl p-8 text-center cursor-pointer transition-colors"
        >
          <MaterialIcon name="cloud_upload" className="text-4xl text-slate-400 block mx-auto mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Drag & drop images here, or click to browse ({form.gallery.length}/10)
          </p>
          <input ref={galleryRef} type="file" accept="image/*" multiple onChange={(e) => handleGalleryUpload(e.target.files)} className="hidden" />
        </div>
        {errors.gallery && <p className="text-red-500 text-xs">{errors.gallery}</p>}
        {form.gallery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {form.gallery.map((item, i) => (
              <div key={i} className="relative group">
                <div className="aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                  <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                </div>
                {i === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
                    Hero / Card Image
                  </span>
                )}
                <button
                  onClick={() => removeGalleryItem(i)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MaterialIcon name="close" className="text-sm" />
                </button>
                <input
                  value={item.caption}
                  onChange={(e) => updateGalleryCaption(i, e.target.value)}
                  placeholder="Caption"
                  className="mt-2 w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* [6] Mechanics */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">Key Features & Mechanics</h2>
        {form.mechanics.map((m, i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-3 relative">
            <button
              onClick={() => removeMechanic(i)}
              className="absolute top-3 right-3 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <MaterialIcon name="close" className="text-lg" />
            </button>
            <input value={m.title} onChange={(e) => updateMechanic(i, 'title', e.target.value)} placeholder="Feature title" className={`${inputClass} text-sm`} />
            <textarea value={m.description} onChange={(e) => updateMechanic(i, 'description', e.target.value)} rows={3} placeholder="Description" className={`${inputClass} text-sm resize-none`} />
            <input value={m.tech} onChange={(e) => updateMechanic(i, 'tech', e.target.value)} placeholder="Technology used" className={`${inputClass} text-sm`} />
          </div>
        ))}
        <button onClick={addMechanic} className="inline-flex items-center gap-2 text-sm text-primary font-bold hover:text-primary/80 transition-colors">
          <MaterialIcon name="add" className="text-xl" />
          Add Mechanic
        </button>
      </div>

      {/* [7] Tech Stack */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">Tech Stack</h2>
        <TagInput value={form.techStack} onChange={(ts) => set('techStack', ts)} placeholder="Add technology" />
        {errors.techStack && <p className="text-red-500 text-xs">{errors.techStack}</p>}
      </div>

      {/* [8] Highlights */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">Development Highlights</h2>
        {form.highlights.map((h, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={h}
              onChange={(e) => {
                const next = [...form.highlights]
                next[i] = e.target.value
                set('highlights', next)
              }}
              placeholder={`Highlight ${i + 1}`}
              className={`${inputClass} text-sm flex-1`}
            />
            {form.highlights.length > 1 && (
              <button
                onClick={() => set('highlights', form.highlights.filter((_, idx) => idx !== i))}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <MaterialIcon name="close" className="text-xl" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => set('highlights', [...form.highlights, ''])}
          className="inline-flex items-center gap-2 text-sm text-primary font-bold hover:text-primary/80 transition-colors"
        >
          <MaterialIcon name="add" className="text-xl" />
          Add Highlight
        </button>
        {errors.highlights && <p className="text-red-500 text-xs">{errors.highlights}</p>}
      </div>

      {/* [9] Links */}
      <div className={sectionClass}>
        <h2 className="text-lg font-bold">Project Links</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Project Link *</label>
          <input
            value={form.projectLinkUrl}
            onChange={(e) => set('projectLinkUrl', e.target.value)}
            placeholder="https://..."
            className={`${inputClass} ${errors.projectLinkUrl ? errorClass : ''}`}
          />
          <p className="text-xs text-slate-400 mt-1">
            Will display as &ldquo;{form.type === 'game' ? 'Play Game' : 'Visit Website'}&rdquo; on the project page.
          </p>
          {errors.projectLinkUrl && <p className="text-red-500 text-xs mt-1">{errors.projectLinkUrl}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">GitHub Repository *</label>
          <input
            value={form.githubUrl}
            onChange={(e) => set('githubUrl', e.target.value)}
            placeholder="https://github.com/..."
            className={`${inputClass} ${errors.githubUrl ? errorClass : ''}`}
          />
          {errors.githubUrl && <p className="text-red-500 text-xs mt-1">{errors.githubUrl}</p>}
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.hasPublication}
              onChange={(e) => set('hasPublication', e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium">Has Publication</span>
          </label>
          {form.hasPublication && (
            <div>
              <input
                value={form.publicationUrl}
                onChange={(e) => set('publicationUrl', e.target.value)}
                placeholder="https://..."
                className={`${inputClass} ${errors.publicationUrl ? errorClass : ''}`}
              />
              {errors.publicationUrl && <p className="text-red-500 text-xs mt-1">{errors.publicationUrl}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push('/admin/projects')}
          className="px-8 py-4 bg-slate-200 dark:bg-slate-800 font-bold rounded-xl text-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MaterialIcon name={saved ? 'check' : 'save'} className="text-xl" />
          {submitting ? 'Saving...' : saved ? 'Saved!' : isEdit ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </div>
  )
}
