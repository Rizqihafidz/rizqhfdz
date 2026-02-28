import DOMPurify from 'dompurify'

const SANITIZE_CONFIG = {
    ALLOWED_TAGS: [
        'p', 'br', 'b', 'i', 'u', 's', 'strong', 'em',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'a', 'span'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
}

export { SANITIZE_CONFIG }

/**
 * Client-side sanitize HTML content to prevent XSS attacks.
 * Only use this in Client Components (browser context).
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, SANITIZE_CONFIG)
}

/**
 * Sanitize plain text input to prevent XSS
 * Escapes all HTML entities
 */
export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (char) => map[char])
}

/**
 * Validate and sanitize email input
 */
export function sanitizeEmail(email: string): string {
    // Remove any potential script/HTML tags
    const cleaned = email.replace(/<[^>]*>/g, '').trim()
    return cleaned.toLowerCase()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Sanitize general text input (names, messages, etc.)
 */
export function sanitizeText(text: string): string {
    // Remove any HTML tags but preserve the text content
    return text.replace(/<[^>]*>/g, '').trim()
}
