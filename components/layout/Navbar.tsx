'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import MaterialIcon from '@/components/ui/MaterialIcon'
import CvDownloadButton from '@/components/layout/CvDownloadButton'

const NAV_LINKS = [
    { label: 'Home', href: 'home' },
    { label: 'About', href: 'about' },
    { label: 'Projects', href: 'projects' },
    { label: 'Skills', href: 'tech' },
    { label: 'Contact', href: 'contact' },
]

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [activeSection, setActiveSection] = useState('home')
    const [scrollProgress, setScrollProgress] = useState(0)
    const pathname = usePathname()
    const isHome = pathname === '/'

    // Scroll-based active section detection
    useEffect(() => {
        if (!isHome) return

        const sectionIds = NAV_LINKS.map((l) => l.href)

        const handleScroll = () => {
            const scrollY = window.scrollY
            const windowHeight = window.innerHeight
            const docHeight = document.documentElement.scrollHeight

            // If at the bottom of the page, activate the last section
            if (scrollY + windowHeight >= docHeight - 50) {
                setActiveSection(sectionIds[sectionIds.length - 1])
                return
            }

            // Find the section that is currently in view
            let currentSection = sectionIds[0]
            const offset = 100 // Offset from top to consider section as active

            for (const id of sectionIds) {
                const el = document.getElementById(id)
                if (el) {
                    const rect = el.getBoundingClientRect()
                    // If the section's top is above the offset point, it's the current section
                    if (rect.top <= offset) {
                        currentSection = id
                    }
                }
            }

            setActiveSection(currentSection)
        }

        // Run once on mount
        handleScroll()

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isHome])

    // Scroll progress indicator
    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
            const progress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0
            setScrollProgress(progress)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const getHref = (hash: string) => (isHome ? `#${hash}` : `/#${hash}`)

    const handleNavClick = () => setMobileOpen(false)

    return (
        <>
            <nav
                role="navigation"
                aria-label="Main navigation"
                className="fixed top-0 left-0 w-full z-50 glass-nav bg-background-dark/80 border-b border-white/5"
            >
                <div className="max-w-5xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3" onClick={handleNavClick}>
                        <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <MaterialIcon name="terminal" className="text-2xl" />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase">Rizqi M.H.</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={getHref(link.href)}
                                className={`text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-2 py-1 ${isHome && activeSection === link.href
                                    ? 'text-primary'
                                    : 'hover:text-primary'
                                    }`}
                                aria-label={`Navigate to ${link.label} section`}
                                aria-current={isHome && activeSection === link.href ? 'true' : undefined}
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <CvDownloadButton
                            className="hidden md:flex items-center px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            ariaLabel="Download my resume in PDF format"
                        >
                            Download CV
                        </CvDownloadButton>
                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden size-10 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={mobileOpen}
                        >
                            <MaterialIcon name={mobileOpen ? 'close' : 'menu'} className="text-2xl" />
                        </button>
                    </div>
                </div>

                {/* Scroll Progress Bar */}
                <div
                    className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-150"
                    style={{ width: `${scrollProgress}%` }}
                />
            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-background-dark pt-20 transition-all duration-300 ${mobileOpen
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none'
                    }`}
            >
                <div className={`flex flex-col items-center gap-8 py-12 transition-transform duration-300 ${mobileOpen ? 'translate-y-0' : '-translate-y-4'
                    }`}>
                    {NAV_LINKS.map((link, index) => (
                        <a
                            key={link.href}
                            href={getHref(link.href)}
                            className={`text-2xl font-bold transition-all ${isHome && activeSection === link.href
                                ? 'text-primary'
                                : 'hover:text-primary'
                                }`}
                            onClick={handleNavClick}
                            style={{ transitionDelay: mobileOpen ? `${index * 50}ms` : '0ms' }}
                        >
                            {link.label}
                        </a>
                    ))}
                    <CvDownloadButton
                        className="mt-4 px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/25"
                        onSelect={handleNavClick}
                    >
                        Download CV
                    </CvDownloadButton>
                </div>
            </div>
        </>
    )
}
