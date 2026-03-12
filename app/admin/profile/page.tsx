'use client'

import { useState, useRef, useEffect } from 'react'
import { useAdminData } from '@/context/AdminDataContext'
import { useToast } from '@/components/admin/ui/AdminToast'
import MaterialIcon from '@/components/ui/MaterialIcon'
import RichTextEditor from '@/components/admin/ui/RichTextEditor'
import IconSelector from '@/components/admin/ui/IconSelector'
import type { AboutCard } from '@/types'

export default function ProfilePage() {
  const { profileImage, aboutBio, aboutCards, isLoading, updateProfile } = useAdminData()
  const { showToast } = useToast()

  const [image, setImage] = useState('')
  const [bio, setBio] = useState('')
  const [cards, setCards] = useState<AboutCard[]>([])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Sync state when context data loads
  useEffect(() => {
    if (!isLoading) {
      setImage(profileImage)
      setBio(aboutBio)
      setCards(aboutCards.map((c) => ({ ...c })))
    }
  }, [isLoading, profileImage, aboutBio, aboutCards])

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

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(image, bio, cards)
      setSaved(true)
      showToast('Profile saved successfully!', 'success')
      setTimeout(() => setSaved(false), 2000)
    } catch {
      showToast('Failed to save profile. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Show loading state
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
          Update your profile image and about section content.
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
          className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <MaterialIcon name={saved ? 'check' : 'save'} className="text-xl" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
