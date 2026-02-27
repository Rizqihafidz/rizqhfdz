'use client'

import { useState } from 'react'
import { z } from 'zod'
import { FaWhatsapp, FaInstagram, FaDiscord, FaYoutube } from 'react-icons/fa6'
import MaterialIcon from '@/components/ui/MaterialIcon'

// Validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>
type FormErrors = Partial<Record<keyof ContactFormData, string>>

type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')
  const [serverError, setServerError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name as keyof ContactFormData]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')

    // Validate form
    const result = contactSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: FormErrors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ContactFormData
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setStatus('loading')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send message')
      }

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })

      // Reset to idle after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    } catch (err) {
      setStatus('error')
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  const inputClass = (field: keyof ContactFormData) =>
    `w-full px-5 py-4 bg-slate-900 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors[field]
      ? 'border-red-500 focus:ring-red-500'
      : 'border-white/10'
    }`

  return (
    <section className="py-20 px-6" id="contact">
      <div className="max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Contact Info */}
          <div>
            <h2 className="text-5xl font-black mb-8 tracking-tighter">
              Let's work <br />
              <span className="text-primary">together.</span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-md">
              Have a project in mind or just want to say hi? I'm always open to discussing new
              opportunities and creative ideas.
            </p>

            <div className="space-y-6 mb-12">
              <a
                href="mailto:rizqimaulanahafidz156@gmail.com"
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <MaterialIcon name="mail" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Email Me
                  </p>
                  <p className="font-bold">rizqimaulanahafidz156@gmail.com</p>
                </div>
              </a>

              <a
                href="https://maps.google.com/?q=Jakarta,Indonesia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <MaterialIcon name="location_on" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Location
                  </p>
                  <p className="font-bold group-hover:text-primary transition-colors">Jakarta, Indonesia</p>
                </div>
              </a>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                className="size-12 min-w-12 min-h-12 rounded-xl border border-white/10 flex items-center justify-center hover:border-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/5 transition-all"
                href="https://wa.me/6287884812509"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-xl" />
              </a>
              <a
                className="size-12 min-w-12 min-h-12 rounded-xl border border-white/10 flex items-center justify-center hover:border-[#E4405F] hover:text-[#E4405F] hover:bg-[#E4405F]/5 transition-all"
                href="https://instagram.com/rizqihafidz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a
                className="size-12 min-w-12 min-h-12 rounded-xl border border-white/10 flex items-center justify-center hover:border-[#5865F2] hover:text-[#5865F2] hover:bg-[#5865F2]/5 transition-all"
                href="https://discordapp.com/users/aractorz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
              >
                <FaDiscord className="text-xl" />
              </a>
              <a
                className="size-12 min-w-12 min-h-12 rounded-xl border border-white/10 flex items-center justify-center hover:border-[#FF0000] hover:text-[#FF0000] hover:bg-[#FF0000]/5 transition-all"
                href="https://www.youtube.com/@aractorz"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <FaYoutube className="text-xl" />
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800/50 p-8 md:p-12 rounded-3xl border border-white/5">
            {/* Success Message */}
            {status === 'success' && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                <div className="size-10 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                  <MaterialIcon name="check" />
                </div>
                <div>
                  <p className="font-bold text-green-400">Message sent!</p>
                  <p className="text-sm text-green-500">
                    Thank you for reaching out. I'll get back to you soon.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {status === 'error' && serverError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                <div className="size-10 rounded-full bg-red-500 flex items-center justify-center text-white flex-shrink-0">
                  <MaterialIcon name="error" />
                </div>
                <div>
                  <p className="font-bold text-red-400">Failed to send</p>
                  <p className="text-sm text-red-500">{serverError}</p>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass('name')}
                    placeholder="Enter your name"
                    type="text"
                    disabled={status === 'loading'}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <MaterialIcon name="error" className="text-sm" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClass('email')}
                    placeholder="Enter your email"
                    type="email"
                    disabled={status === 'loading'}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <MaterialIcon name="error" className="text-sm" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-bold mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={inputClass('message')}
                  placeholder="How can I help you?"
                  rows={4}
                  disabled={status === 'loading'}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <MaterialIcon name="error" className="text-sm" />
                    {errors.message}
                  </p>
                )}
              </div>
              <button
                className="w-full py-4 bg-primary text-white font-black rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                type="submit"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <>
                    <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MaterialIcon name="send" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
