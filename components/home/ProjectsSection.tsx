'use client'

import { useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MaterialIcon from '@/components/ui/MaterialIcon'
import { useContainerFit } from '@/hooks/useContainerFit'
import type { Project } from '@/types'

/* ───────────────────────── Card (reusable) ───────────────────────── */

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group bg-slate-800 rounded-3xl overflow-hidden border border-white/5 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all block h-full"
    >
      {/* Image */}
      <div className="h-48 md:h-56 overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
          <span className="text-white font-bold text-sm bg-primary/80 backdrop-blur-sm px-4 py-2 rounded-lg">
            View Details
          </span>
        </div>
        {/* Type Badge */}
        <span
          className={`absolute bottom-3 left-3 z-20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm ${project.type === 'game' ? 'bg-red-500/80' : 'bg-emerald-500/80'
            }`}
        >
          {project.type === 'game' ? 'Game Development' : 'Web Development'}
        </span>
        {project.cardImage.startsWith('data:') ? (
          <img
            src={project.cardImage}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <Image
            src={project.cardImage}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 300px, 380px"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-700 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
          {project.shortDescription}
        </p>
      </div>
    </Link>
  )
}

/* ────────────────────── Main Section Component ───────────────────── */

const AUTO_SCROLL_SPEED = 0.5 // pixels per frame (~30px/s at 60fps)
const RESUME_DELAY = 2000     // ms before auto-scroll resumes after drag
const DRAG_THRESHOLD = 5      // px — minimum movement to count as drag (not click)

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const featuredProjects = projects.slice(-6)

  /* ── adaptive layout ── */
  const containerRef = useRef<HTMLDivElement>(null)
  const fitsInRow = useContainerFit(containerRef, {
    itemCount: featuredProjects.length,
    cardWidthMobile: 300,
    cardWidthDesktop: 380,
    gapMobile: 24,
    gapDesktop: 32,
  })

  /* ── refs ── */
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetX = useRef(0)
  const halfWidth = useRef(0)
  const rafId = useRef(0)
  const isAutoScrolling = useRef(true)
  const isDragging = useRef(false)
  const hasMoved = useRef(false)
  const dragStartX = useRef(0)
  const dragStartOffset = useRef(0)
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── wrap offset into [0, halfWidth) for infinite loop ── */
  const wrapOffset = useCallback(() => {
    if (halfWidth.current > 0) {
      offsetX.current =
        ((offsetX.current % halfWidth.current) + halfWidth.current) %
        halfWidth.current
    }
  }, [])

  /* ── apply transform ── */
  const applyTransform = useCallback(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${offsetX.current}px)`
    }
  }, [])

  /* ── rAF tick ── */
  const tick = useCallback(() => {
    if (isAutoScrolling.current && halfWidth.current > 0) {
      offsetX.current += AUTO_SCROLL_SPEED
      wrapOffset()
      applyTransform()
    }
    rafId.current = requestAnimationFrame(tick)
  }, [wrapOffset, applyTransform])

  /* ── lifecycle: measure & start loop (only in carousel mode) ── */
  useEffect(() => {
    if (fitsInRow) {
      if (trackRef.current) {
        trackRef.current.style.transform = ''
      }
      offsetX.current = 0
      return
    }

    // Measure half-width (one set of projects) after first paint
    const measure = () => {
      if (trackRef.current) {
        halfWidth.current = trackRef.current.scrollWidth / 2
      }
    }
    measure()

    // Start animation loop
    rafId.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId.current)
      if (resumeTimer.current) clearTimeout(resumeTimer.current)
    }
  }, [tick, fitsInRow])

  /* ── pointer start (shared between mouse & touch) ── */
  const handlePointerStart = useCallback((clientX: number) => {
    isDragging.current = true
    hasMoved.current = false
    isAutoScrolling.current = false
    dragStartX.current = clientX
    dragStartOffset.current = offsetX.current
    if (resumeTimer.current) clearTimeout(resumeTimer.current)
  }, [])

  /* ── pointer move ── */
  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (!isDragging.current) return
      const delta = clientX - dragStartX.current

      // Only start dragging after threshold — preserves click navigation
      if (!hasMoved.current && Math.abs(delta) >= DRAG_THRESHOLD) {
        hasMoved.current = true
        trackRef.current?.classList.add('dragging')
      }

      if (hasMoved.current) {
        offsetX.current = dragStartOffset.current - delta
        wrapOffset()
        applyTransform()
      }
    },
    [wrapOffset, applyTransform],
  )

  /* ── pointer end ── */
  const handlePointerEnd = useCallback(() => {
    if (!isDragging.current) return
    isDragging.current = false

    // Only remove dragging class if user actually dragged
    if (hasMoved.current) {
      requestAnimationFrame(() => {
        trackRef.current?.classList.remove('dragging')
      })
    }

    // Resume auto-scroll after delay
    resumeTimer.current = setTimeout(() => {
      isAutoScrolling.current = true
    }, RESUME_DELAY)
  }, [])

  /* ── mouse event handlers ── */
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => handlePointerStart(e.clientX),
    [handlePointerStart],
  )
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging.current) e.preventDefault()
      handlePointerMove(e.clientX)
    },
    [handlePointerMove],
  )

  /* ── touch event handlers ── */
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => handlePointerStart(e.touches[0].clientX),
    [handlePointerStart],
  )
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => handlePointerMove(e.touches[0].clientX),
    [handlePointerMove],
  )

  /* ── duplicated list for seamless loop ── */
  const duplicated = [...featuredProjects, ...featuredProjects]

  return (
    <section className="py-20" id="projects">
      {/* Header */}
      <div ref={containerRef} className="max-w-5xl mx-auto px-6 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-black mb-4">Featured Work</h2>
            <p className="text-slate-400">
              A selection of my recent projects
            </p>
          </div>
        </div>
      </div>

      {fitsInRow ? (
        /* ── Static Grid ── */
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-center gap-6 md:gap-8">
            {featuredProjects.map((project) => (
              <div
                key={project.slug}
                className="flex-shrink-0 w-[300px] md:w-[380px]"
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Carousel ── */
        <div
          className="overflow-hidden select-none"
          onMouseUp={handlePointerEnd}
          onMouseLeave={handlePointerEnd}
        >
          <div
            ref={trackRef}
            className="carousel-track flex gap-6 md:gap-8 w-max will-change-transform cursor-grab active:cursor-grabbing"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={handlePointerEnd}
          >
            {duplicated.map((project, index) => (
              <div
                key={`${project.slug}-${index}`}
                className="flex-shrink-0 w-[300px] md:w-[380px]"
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* See All Projects Button */}
      <div className="max-w-5xl mx-auto px-6 mt-10">
        <div className="flex justify-end">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors group/btn"
          >
            See All Projects
            <MaterialIcon
              name="arrow_forward"
              className="text-lg transition-transform group-hover/btn:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
