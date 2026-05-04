'use client'

import { useState, useRef, useEffect } from 'react'
import { useAdminData } from '@/context/AdminDataContext'
import { useToast } from '@/components/admin/ui/AdminToast'
import MaterialIcon from '@/components/ui/MaterialIcon'
import RichTextEditor from '@/components/admin/ui/RichTextEditor'
import IconSelector from '@/components/admin/ui/IconSelector'
import type { AboutCard } from '@/types'

const RESUME_MAX_BYTES = 5 * 1024 * 1024 // 5 MB raw PDF cap

interface ResumeFileState {
  base64: string
  filename: string
  size: number
}

const HERO_DESCRIPTION_MAX = 500

export default function ProfilePage() {
  const {
    profileImage,
    heroDescription,
    aboutBio,
    aboutCards,
    hasResumeEn,
    hasResumeId,
    isLoading,
    updateProfile,
  } = useAdminData()
  const { showToast } = useToast()

  const [image, setImage] = useState('')
  const [hero, setHero] = useState('')
  const [bio, setBio] = useState('')
  const [cards, setCards] = useState<AboutCard[]>([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Resume state — only set when admin uploads in this session
  const [resumeEn, setResumeEn] = useState<ResumeFileState | null>(null)
  const [resumeId, setResumeId] = useState<ResumeFileState | null>(null)
  const [removeResumeEn, setRemoveResumeEn] = useState(false)
  const [removeResumeId, setRemoveResumeId] = useState(false)
  const resumeEnRef = useRef<HTMLInputElement>(null)
  const resumeIdRef = useRef<HTMLInputElement>(null)

  // Sync state when context data loads
  useEffect(() => {
    if (!isLoading) {
      setImage(profileImage)
      setHero(heroDescription)
      setBio(aboutBio)
      setCards(aboutCards.map((c) => ({ ...c })))
    }
  }, [isLoading, profileImage, heroDescription, aboutBio, aboutCards])

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const base64 = await convertToBase64(file)
      setImage(base64)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) {
      const base64 = await convertToBase64(file)
      setImage(base64)
    }
  }

  const handleResumeUpload = async (
    file: File | undefined,
    lang: 'en' | 'id',
  ) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      showToast('Resume must be a PDF file', 'error')
      return
    }
    if (file.size > RESUME_MAX_BYTES) {
      showToast(`File too large. Max ${RESUME_MAX_BYTES / 1024 / 1024} MB.`, 'error')
      return
    }
    const base64 = await convertToBase64(file)
    const state: ResumeFileState = { base64, filename: file.name, size: file.size }
    if (lang === 'en') {
      setResumeEn(state)
      setRemoveResumeEn(false)
    } else {
      setResumeId(state)
      setRemoveResumeId(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({
        image,
        heroDescription: hero,
        bio,
        cards,
        resumeEn: resumeEn ? resumeEn.base64 : removeResumeEn ? '' : undefined,
        resumeId: resumeId ? resumeId.base64 : removeResumeId ? '' : undefined,
      })
      setResumeEn(null)
      setResumeId(null)
      setRemoveResumeEn(false)
      setRemoveResumeId(false)
      if (resumeEnRef.current) resumeEnRef.current.value = ''
      if (resumeIdRef.current) resumeIdRef.current.value = ''
      setSaved(true)
      showToast('Profile saved successfully!', 'success')
      setTimeout(() => setSaved(false), 2000)
    } catch {
      showToast('Failed to save profile. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span className="size-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin block mx-auto mb-4" />
          <p className="text-slate-500">Loading profile data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black mb-2">Profile Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Update your profile image, about section, and CV files.
        </p>
      </div>

      {/* Profile Image */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <h2 className="text-lg font-bold">Profile Image</h2>
        <div className="flex items-start gap-6">
          {image ? (
            <img
              src={image}
              alt="Profile"
              className="w-32 h-32 rounded-2xl object-cover border-2 border-slate-200 dark:border-white/10"
            />
          ) : (
            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800">
              <MaterialIcon name="person" className="text-4xl text-slate-300 dark:text-slate-600" />
            </div>
          )}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary rounded-xl p-8 text-center cursor-pointer transition-colors"
          >
            <MaterialIcon name="cloud_upload" className="text-4xl text-slate-400 block mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Drag & drop an image, or click to browse
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Hero Description */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold">Hero Description</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Short paragraph shown under the headline on the homepage hero. Plain text only.
          </p>
        </div>
        <textarea
          value={hero}
          onChange={(e) => setHero(e.target.value.slice(0, HERO_DESCRIPTION_MAX))}
          rows={3}
          maxLength={HERO_DESCRIPTION_MAX}
          placeholder="e.g. Informatics Engineering Graduate from Brawijaya University..."
          className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none leading-relaxed"
        />
        <div className="flex justify-end">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {hero.length} / {HERO_DESCRIPTION_MAX}
          </span>
        </div>
      </div>

      {/* CV Files */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold">CV Files</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Upload your resume in PDF format for each language. Max 5 MB per file.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <ResumeUploadCard
            label="English CV"
            sublabel="Resume in English"
            inputRef={resumeEnRef}
            uploaded={resumeEn}
            existing={hasResumeEn && !removeResumeEn}
            removed={removeResumeEn}
            onUpload={(file) => handleResumeUpload(file, 'en')}
            onClear={() => {
              setResumeEn(null)
              if (resumeEnRef.current) resumeEnRef.current.value = ''
            }}
            onRemoveExisting={() => {
              setRemoveResumeEn(true)
              setResumeEn(null)
              if (resumeEnRef.current) resumeEnRef.current.value = ''
            }}
            onUndoRemove={() => setRemoveResumeEn(false)}
          />
          <ResumeUploadCard
            label="Indonesian CV"
            sublabel="Resume in Bahasa Indonesia"
            inputRef={resumeIdRef}
            uploaded={resumeId}
            existing={hasResumeId && !removeResumeId}
            removed={removeResumeId}
            onUpload={(file) => handleResumeUpload(file, 'id')}
            onClear={() => {
              setResumeId(null)
              if (resumeIdRef.current) resumeIdRef.current.value = ''
            }}
            onRemoveExisting={() => {
              setRemoveResumeId(true)
              setResumeId(null)
              if (resumeIdRef.current) resumeIdRef.current.value = ''
            }}
            onUndoRemove={() => setRemoveResumeId(false)}
          />
        </div>
      </div>

      {/* About Bio */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold">About Bio</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Write your bio using the rich text editor. You can use multiple paragraphs, bold, italic, and more.
          </p>
        </div>
        <RichTextEditor
          value={bio}
          onChange={setBio}
          placeholder="Write your bio here..."
        />
      </div>

      {/* Info Cards */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Info Cards</h2>
          <button
            onClick={() => setCards([...cards, { icon: 'star', title: '', description: '' }])}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary font-bold text-sm rounded-lg hover:bg-primary/20 transition-colors"
          >
            <MaterialIcon name="add" className="text-lg" />
            Add Card
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {cards.map((card, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200 dark:border-white/10 space-y-3 relative">
              <button
                onClick={() => setCards(cards.filter((_, idx) => idx !== i))}
                className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                title="Remove card"
              >
                <MaterialIcon name="close" className="text-lg" />
              </button>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  Icon
                </label>
                <IconSelector
                  value={card.icon}
                  onChange={(icon) => {
                    const next = [...cards]
                    next[i] = { ...next[i], icon }
                    setCards(next)
                  }}
                />
              </div>
              <input
                id={`card-title-${i}`}
                value={card.title}
                onChange={(e) => {
                  const next = [...cards]
                  next[i] = { ...next[i], title: e.target.value }
                  setCards(next)
                }}
                placeholder="Title"
                aria-label={`Card ${i + 1} title`}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold"
              />
              <textarea
                id={`card-desc-${i}`}
                value={card.description}
                onChange={(e) => {
                  const next = [...cards]
                  next[i] = { ...next[i], description: e.target.value }
                  setCards(next)
                }}
                rows={2}
                placeholder="Description"
                aria-label={`Card ${i + 1} description`}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
              />
            </div>
          ))}
          {cards.length === 0 && (
            <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl col-span-2">
              <MaterialIcon name="dashboard" className="text-4xl block mx-auto mb-2" />
              <p>No info cards yet. Click &quot;Add Card&quot; to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <MaterialIcon name={saved ? 'check' : 'save'} className="text-xl" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

interface ResumeUploadCardProps {
  label: string
  sublabel: string
  inputRef: React.RefObject<HTMLInputElement | null>
  uploaded: ResumeFileState | null
  existing: boolean
  removed: boolean
  onUpload: (file: File | undefined) => void
  onClear: () => void
  onRemoveExisting: () => void
  onUndoRemove: () => void
}

function ResumeUploadCard({
  label,
  sublabel,
  inputRef,
  uploaded,
  existing,
  removed,
  onUpload,
  onClear,
  onRemoveExisting,
  onUndoRemove,
}: ResumeUploadCardProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.type === 'application/pdf') {
      onUpload(file)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  return (
    <div className="border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm">{label}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{sublabel}</p>
        </div>
        {uploaded ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase">
            <MaterialIcon name="upload_file" className="text-sm" />
            New
          </span>
        ) : existing ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">
            <MaterialIcon name="check_circle" className="text-sm" />
            Uploaded
          </span>
        ) : removed ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase">
            <MaterialIcon name="delete" className="text-sm" />
            Will remove
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 text-[10px] font-bold uppercase">
            None
          </span>
        )}
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary rounded-lg p-5 text-center cursor-pointer transition-colors"
      >
        <MaterialIcon name="picture_as_pdf" className="text-3xl text-slate-400 block mx-auto mb-1" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {uploaded ? 'Click to replace' : 'Drag & drop a PDF, or click to browse'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => onUpload(e.target.files?.[0])}
          className="hidden"
        />
      </div>

      {uploaded && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/40">
          <div className="min-w-0">
            <p className="text-xs font-bold truncate">{uploaded.filename}</p>
            <p className="text-[10px] text-slate-500">{formatBytes(uploaded.size)} — pending save</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Cancel upload"
          >
            <MaterialIcon name="close" className="text-lg" />
          </button>
        </div>
      )}

      {!uploaded && existing && (
        <button
          type="button"
          onClick={onRemoveExisting}
          className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
        >
          <MaterialIcon name="delete" className="text-base" />
          Remove uploaded file
        </button>
      )}

      {removed && (
        <button
          type="button"
          onClick={onUndoRemove}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <MaterialIcon name="undo" className="text-base" />
          Undo remove
        </button>
      )}
    </div>
  )
}
