import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public routes - allow access without authentication
  const publicRoutes = [
    '/',
    '/campaigns',
    '/transparansi',
    '/organization',
    '/login',
    '/register',
    '/auth',
    '/forgot-password',
    '/reset-password',
  ]

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // If no user and trying to access protected route
  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated, check role-based access
  if (user) {
    // Fetch user profile to get role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role || 'user'

    // Protect /org routes - only for organization role
    if (pathname.startsWith('/org')) {
      if (userRole !== 'org') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/'
        return NextResponse.redirect(redirectUrl)
      }

      // Check organization status
      const { data: organization } = await supabase
        .from('organizations')
        .select('status, is_verified')
        .eq('id', user.id)
        .single()

      // If organization not found, redirect to register-org
      if (!organization) {
        if (pathname !== '/register-org') {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/register-org'
          return NextResponse.redirect(redirectUrl)
        }
      } else {
        // If organization is pending or rejected, restrict access to certain routes
        const restrictedRoutes = ['/org/campaigns/create', '/org/distributions']
        const isRestrictedRoute = restrictedRoutes.some(route => pathname.startsWith(route))

        if (organization.status !== 'approved' && isRestrictedRoute) {
          const redirectUrl = request.nextUrl.clone()
          redirectUrl.pathname = '/org'
          redirectUrl.searchParams.set('error', 'organization_not_approved')
          return NextResponse.redirect(redirectUrl)
        }
      }
    }

    // Protect /admin routes - only for admin role
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/'
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Redirect to appropriate dashboard if accessing login/register while authenticated
    if (pathname === '/login' || pathname === '/register') {
      const redirectUrl = request.nextUrl.clone()
      if (userRole === 'admin') {
        redirectUrl.pathname = '/admin'
      } else if (userRole === 'org') {
        redirectUrl.pathname = '/org'
      } else {
        redirectUrl.pathname = '/profile'
      }
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}
