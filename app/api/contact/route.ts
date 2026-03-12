import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { escapeHtml, sanitizeEmail } from '@/lib/sanitize'
import { contactRateLimiter, getIp } from '@/lib/rate-limit'

const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').max(254),
    message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
})

export async function POST(request: Request) {
    const ip = getIp(request)
    if (!contactRateLimiter.consume(ip)) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        )
    }

    try {
        const body = await request.json()

        // Validate request body
        const result = contactSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.issues },
                { status: 400 }
            )
        }

        // Initialize Resend client lazily (not at module level) to avoid build-time errors
        const resend = new Resend(process.env.RESEND_API_KEY)

        // Sanitize input to prevent XSS
        const name = escapeHtml(result.data.name.trim())
        const email = sanitizeEmail(result.data.email)
        const message = escapeHtml(result.data.message.trim())

        // Send email using Resend
        const { error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'rizqimaulanahafidz156@gmail.com',
            subject: `Portfolio Contact: New message from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #0ea5e9; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px;">
                        New Contact Form Submission
                    </h2>
                    <div style="margin: 20px 0;">
                        <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
                        <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #334155;">Message:</h3>
                        <p style="white-space: pre-wrap; color: #475569;">${message}</p>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                    <p style="color: #94a3b8; font-size: 12px;">
                        This message was sent from your portfolio website contact form.
                    </p>
                </div>
            `,
        })

        if (error) {
            console.error('Resend error:', error)
            return NextResponse.json(
                { error: 'Failed to send email. Please try again.' },
                { status: 500 }
            )
        }

        console.log('📧 Email sent successfully to rizqimaulanahafidz156@gmail.com')

        return NextResponse.json({
            success: true,
            message: 'Message sent! I will get back to you soon.'
        })
    } catch (error) {
        console.error('Contact form error:', error)
        return NextResponse.json(
            { error: 'Failed to process your message. Please try again.' },
            { status: 500 }
        )
    }
}
