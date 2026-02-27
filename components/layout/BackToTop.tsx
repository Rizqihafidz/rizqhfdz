'use client'

import MaterialIcon from '@/components/ui/MaterialIcon'

export default function BackToTop() {
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary transition-colors cursor-pointer"
            aria-label="Scroll back to top"
        >
            <MaterialIcon name="arrow_upward" className="text-sm" />
            Back to top
        </button>
    )
}
