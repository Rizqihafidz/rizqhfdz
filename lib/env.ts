import { z } from 'zod'

/**
 * Environment variable validation schema.
 * Validates required environment variables at startup time.
 */
const envSchema = z.object({
    JWT_SECRET: z
        .string()
        .min(32, 'JWT_SECRET must be at least 32 characters'),
    DATABASE_URL: z
        .string()
        .url('DATABASE_URL must be a valid URL'),
    ADMIN_EMAIL: z
        .string()
        .email('ADMIN_EMAIL must be a valid email'),
    ADMIN_PASSWORD: z
        .string()
        .min(8, 'ADMIN_PASSWORD must be at least 8 characters'),
    RESEND_API_KEY: z
        .string()
        .min(1, 'RESEND_API_KEY is required'),
})

/**
 * Parse and validate environment variables.
 * Throws descriptive error if validation fails.
 * Uses lazy evaluation so validation only runs at runtime (not during build).
 */
function validateEnv() {
    const result = envSchema.safeParse(process.env)

    if (!result.success) {
        const errors = result.error.issues
            .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
            .join('\n')
        throw new Error(`Environment variable validation failed:\n${errors}`)
    }

    return result.data
}

let _env: z.infer<typeof envSchema> | undefined

export const env = new Proxy({} as z.infer<typeof envSchema>, {
    get(_target, prop: string) {
        if (!_env) {
            _env = validateEnv()
        }
        return _env[prop as keyof typeof _env]
    },
})
