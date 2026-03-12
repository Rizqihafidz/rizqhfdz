'use client'

import { usePathname } from 'next/navigation'
import MaterialIcon from '@/components/ui/MaterialIcon'

interface Props {
  onMenuToggle: () => void
}

function getPageTitle(pathname: string): string {
  if (pathname === '/admin') return 'Dashboard'
  if (pathname === '/admin/profile') return 'Profile'
  if (pathname === '/admin/projects/new') return 'Projects / New'
  if (pathname.match(/^\/admin\/projects\/.+\/edit$/)) return 'Projects / Edit'
  if (pathname.startsWith('/admin/projects')) return 'Projects'
  if (pathname === '/admin/settings') return 'Settings'
  return 'Admin'
}

export default function AdminHeader({ onMenuToggle }: Props) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-30 h-16 bg-background-dark/80 backdrop-blur-sm border-b border-white/5 flex items-center px-6 gap-4">
      <button
        onClick={onMenuToggle}
        className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-label="Toggle sidebar menu"
      >
        <MaterialIcon name="menu" className="text-2xl" />
      </button>

      <h2 className="text-sm font-bold text-slate-400 hidden md:block">{pageTitle}</h2>

      <div className="flex-1" />
    </header>
  )
}
