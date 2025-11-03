import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // 1. Get the session token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 2. Define the path being accessed
  const { pathname } = req.nextUrl;

  // 3. If the user is trying to access a protected hospital route
  if (pathname.startsWith('/hospital')) {
    // 3a. If they are not logged in OR they are not hospital staff, redirect them
    if (!token || token.role !== 'HOSPITAL_STAFF') {
      // Redirect to the main landing page or a generic login page
      const url = new URL('/', req.url);
      return NextResponse.redirect(url);
    }
  }

  // 4. If all checks pass, allow the request to continue
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/hospital/:path*'], // This ensures the middleware only runs on hospital routes
};
