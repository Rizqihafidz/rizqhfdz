import Link from 'next/link'
import { FaLinkedin, FaGithub, FaWhatsapp, FaInstagram } from 'react-icons/fa6'
import MaterialIcon from '@/components/ui/MaterialIcon'
import BackToTop from '@/components/layout/BackToTop'

const NAV_LINKS = [
    { label: 'Home', href: '/#home' },
    { label: 'About', href: '/#about' },
    { label: 'Projects', href: '/#projects' },
    { label: 'Skills', href: '/#tech' },
    { label: 'Contact', href: '/#contact' },
]

const SOCIAL_LINKS = [
    { icon: FaLinkedin, href: 'https://linkedin.com/in/qimau', label: 'LinkedIn', hoverColor: 'hover:text-[#0A66C2]' },
    { icon: FaGithub, href: 'https://github.com/Rizqihafidz', label: 'GitHub', hoverColor: 'hover:text-white' },
    { icon: FaWhatsapp, href: 'https://wa.me/6287884812509', label: 'WhatsApp', hoverColor: 'hover:text-[#25D366]' },
    { icon: FaInstagram, href: 'https://instagram.com/rizqihafidz', label: 'Instagram', hoverColor: 'hover:text-[#E4405F]' },
]

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-slate-900/50">
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="inline-flex items-center gap-3 mb-4">
                            <div className="size-9 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <MaterialIcon name="terminal" className="text-xl" />
                            </div>
                            <span className="text-lg font-black tracking-tighter uppercase">Rizqi M.H.</span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Game Developer & Designer based in Jakarta, Indonesia.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Links</h3>
                        <nav className="flex flex-col gap-2" aria-label="Footer navigation">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="text-sm text-slate-500 hover:text-primary transition-colors cursor-pointer"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Connect</h3>
                        <div className="flex items-center gap-3">
                            {SOCIAL_LINKS.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-2 text-slate-500 ${social.hoverColor} transition-colors cursor-pointer`}
                                    aria-label={social.label}
                                >
                                    <social.icon className="text-xl" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
                    <p className="text-xs text-slate-500">
                        &copy; {new Date().getFullYear()} Rizqi Maulana Hafidz. All rights reserved.
                    </p>
                    <BackToTop />
                </div>
            </div>
        </footer>
    )
}
