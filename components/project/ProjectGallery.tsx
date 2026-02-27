'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { GalleryItem } from '@/types'
import MaterialIcon from '@/components/ui/MaterialIcon'
import Lightbox from '@/components/ui/Lightbox'

const DISPLAY_LIMIT = 4

interface Props {
  gallery: GalleryItem[]
}

export default function ProjectGallery({ gallery }: Props) {
  const [showAll, setShowAll] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (gallery.length === 0) return null

  const visibleGallery = showAll ? gallery : gallery.slice(0, DISPLAY_LIMIT)
  const hasMore = gallery.length > DISPLAY_LIMIT

  const handleImageClick = (visibleIndex: number) => {
    // If showing limited, map visible index to full gallery index
    const fullIndex = showAll ? visibleIndex : visibleIndex
    setLightboxIndex(fullIndex)
  }

  // Helper to render image based on source type
  const renderImage = (src: string, alt: string) => {
    const isBase64 = src.startsWith('data:')

    if (isBase64) {
      return (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )
    }

    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    )
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold tracking-tight">Project Gallery</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleGallery.map((item, index) => {
          const isWide =
            index === visibleGallery.length - 1 && visibleGallery.length % 2 !== 0
          return (
            <button
              key={index}
              onClick={() => handleImageClick(index)}
              className={`group relative overflow-hidden rounded-xl bg-slate-800 shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isWide ? 'md:col-span-2 aspect-[21/9]' : 'aspect-video'
                }`}
              aria-label={`View ${item.caption} in fullscreen`}
            >
              {renderImage(item.src, item.caption)}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                <MaterialIcon
                  name="zoom_in"
                  className="text-4xl text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
                />
              </div>
              <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-sm font-bold text-left">{item.caption}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* See More / Show Less toggle */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg px-3 py-2"
            aria-expanded={showAll}
            aria-label={showAll ? 'Show fewer gallery images' : 'Show all gallery images'}
          >
            {showAll
              ? 'Show Less'
              : `See More (${gallery.length - DISPLAY_LIMIT} more images)`}
            <MaterialIcon
              name={showAll ? 'expand_less' : 'expand_more'}
              className="text-xl"
            />
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={showAll ? gallery : visibleGallery}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}
