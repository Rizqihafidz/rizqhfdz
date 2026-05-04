'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import MaterialIcon from '@/components/ui/MaterialIcon'

interface Props {
  className?: string
  ariaLabel?: string
  children: React.ReactNode
  onSelect?: () => void
}

export default function CvDownloadButton({ className, ariaLabel, children, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handlePick = () => {
    setOpen(false)
    onSelect?.()
  }

  const dialogNode = (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-dialog-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 size-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close dialog"
        >
          <MaterialIcon name="close" className="text-xl" />
        </button>

        <div className="mb-6">
          <h2 id="cv-dialog-title" className="text-2xl font-black tracking-tight mb-2">
            Choose Language
          </h2>
          <p className="text-sm text-slate-400">
            Select the CV language you&apos;d like to download.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/api/resume?lang=en"
            onClick={handlePick}
            className="group flex flex-col items-start gap-2 p-5 rounded-xl bg-slate-800/60 border border-white/10 hover:border-primary hover:bg-primary/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>🇬🇧</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">
                English
              </span>
            </div>
            <span className="font-bold">Download CV (EN)</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <MaterialIcon name="picture_as_pdf" className="text-sm" />
              PDF
            </span>
          </a>

          <a
            href="/api/resume?lang=id"
            onClick={handlePick}
            className="group flex flex-col items-start gap-2 p-5 rounded-xl bg-slate-800/60 border border-white/10 hover:border-primary hover:bg-primary/5 transition-all focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>🇮🇩</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">
                Indonesia
              </span>
            </div>
            <span className="font-bold">Download CV (ID)</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
              <MaterialIcon name="picture_as_pdf" className="text-sm" />
              PDF
            </span>
          </a>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
      >
        {children}
      </button>
      {mounted && open ? createPortal(dialogNode, document.body) : null}
    </>
  )
}
