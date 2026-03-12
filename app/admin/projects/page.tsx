'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAdminData } from '@/context/AdminDataContext'
import { useToast } from '@/components/admin/ui/AdminToast'
import { getTypeBadgeClass } from '@/lib/utils'
import MaterialIcon from '@/components/ui/MaterialIcon'

export default function AdminProjectsPage() {
  const { projects, deleteProject } = useAdminData()
  const { showToast } = useToast()
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null)

  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (deleteSlug) {
      setDeleting(true)
      try {
        await deleteProject(deleteSlug)
        showToast('Project deleted successfully!', 'success')
      } catch {
        showToast('Failed to delete project.', 'error')
      } finally {
        setDeleting(false)
        setDeleteSlug(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-2">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your portfolio projects.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
        >
          <MaterialIcon name="add" className="text-xl" />
          Add New
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <MaterialIcon name="folder_open" className="text-6xl text-slate-300 dark:text-slate-600 block mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">No projects yet.</p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl text-sm"
          >
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="text-left text-xs font-bold uppercase text-slate-400 px-6 py-4">Project</th>
                  <th className="text-left text-xs font-bold uppercase text-slate-400 px-6 py-4">Type</th>
                  <th className="text-left text-xs font-bold uppercase text-slate-400 px-6 py-4">Status</th>
                  <th className="text-left text-xs font-bold uppercase text-slate-400 px-6 py-4">Tags</th>
                  <th className="text-right text-xs font-bold uppercase text-slate-400 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {projects.map((project) => (
                  <tr key={project.slug} className="hover:bg-slate-50 dark:hover:bg-white/[.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={project.cardImage} alt="" className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                        <span className="font-bold text-sm">{project.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${getTypeBadgeClass(project.type, 'inline')}`}
                      >
                        {project.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-sm">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            project.metadata.statusColor === 'green' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                        />
                        {project.metadata.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {project.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-700 rounded font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/projects/${project.slug}/edit`}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-primary transition-colors"
                        >
                          <MaterialIcon name="edit" className="text-xl" />
                        </Link>
                        <button
                          onClick={() => setDeleteSlug(project.slug)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          <MaterialIcon name="delete" className="text-xl" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5">
            {projects.map((project) => (
              <div key={project.slug} className="p-4 flex items-center gap-4">
                <img src={project.cardImage} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{project.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${getTypeBadgeClass(project.type, 'inline')}`}
                    >
                      {project.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Link href={`/admin/projects/${project.slug}/edit`} className="p-2 text-primary">
                    <MaterialIcon name="edit" className="text-xl" />
                  </Link>
                  <button onClick={() => setDeleteSlug(project.slug)} className="p-2 text-red-500">
                    <MaterialIcon name="delete" className="text-xl" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteSlug && (
        <DeleteModal
          projectTitle={projects.find((p) => p.slug === deleteSlug)?.title ?? ''}
          deleting={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteSlug(null)}
        />
      )}
    </div>
  )
}

/* ─── Accessible Delete Modal ─── */

interface DeleteModalProps {
  projectTitle: string
  deleting: boolean
  onConfirm: () => void
  onCancel: () => void
}

function DeleteModal({ projectTitle, deleting, onConfirm, onCancel }: DeleteModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<Element | null>(null)

  // Escape key + focus trap + body scroll lock
  useEffect(() => {
    previousFocus.current = document.activeElement
    cancelRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        if (document.activeElement === cancelRef.current) {
          confirmRef.current?.focus()
        } else {
          cancelRef.current?.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      if (previousFocus.current instanceof HTMLElement) {
        previousFocus.current.focus()
      }
    }
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h3 id="delete-modal-title" className="text-xl font-bold mb-2">Delete Project</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Are you sure you want to delete &ldquo;{projectTitle}&rdquo;? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 font-bold rounded-xl text-sm transition-all hover:bg-slate-300 dark:hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={deleting}
            className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl text-sm transition-all hover:bg-red-600 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
