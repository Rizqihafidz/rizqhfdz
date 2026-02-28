/**
 * Simple in-memory rate limiter (sliding window).
 * No external dependencies required.
 */
class RateLimiter {
    private requests = new Map<string, number[]>()

    constructor(
        private readonly maxRequests: number,
        private readonly windowMs: number,
    ) { }

    consume(key: string): boolean {
        const now = Date.now()
        const timestamps = this.requests.get(key) ?? []
        const valid = timestamps.filter((t) => now - t < this.windowMs)

        if (valid.length >= this.maxRequests) {
            this.requests.set(key, valid)
            return false // rate limited
        }

        valid.push(now)
        this.requests.set(key, valid)
        return true // allowed
    }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 req per 15 min
export const contactRateLimiter = new RateLimiter(3, 60 * 60 * 1000) // 3 req per hour

export function getIp(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for')
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim()
    }
    return request.headers.get('x-real-ip') || 'unknown'
}
