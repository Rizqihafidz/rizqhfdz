import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Allow GET requests through — these are public reads used by ISR pages
    if (request.method === 'GET') {
        return NextResponse.next()
    }

    // All non-GET (POST, PUT, DELETE) require auth
    const token = request.cookies.get('admin-session')
    if (!token) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/api/projects/:path*',
        '/api/profile/:path*',
        '/api/auth/logout',
        '/api/auth/change-credentials',
    ],
}
