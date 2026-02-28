import 'server-only'
import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { SANITIZE_CONFIG } from '@/lib/sanitize'

/**
 * Server-side sanitize HTML content to prevent XSS attacks.
 * Uses jsdom to provide a DOM environment for DOMPurify.
 * Only use this in API routes / Server Components.
 */
export function sanitizeHtmlServer(dirty: string): string {
    const window = new JSDOM('').window
    const purify = DOMPurify(window as any)
    return purify.sanitize(dirty, SANITIZE_CONFIG)
}
