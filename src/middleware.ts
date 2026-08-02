import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const path = request.nextUrl.pathname;

  // Protected route definitions
  const isPortalProtected = path.startsWith('/portal');
  const isDashboardProtected = path.startsWith('/dashboard') && path !== '/dashboard/login' && path !== '/dashboard/forgot-password' && path !== '/dashboard/reset-password';

  // If path is a login or public page, never block or redirect in middleware
  if (!isPortalProtected && !isDashboardProtected) {
    return supabaseResponse;
  }

  // Fetch current authenticated user for protected routes only
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Unauthenticated user trying to reach protected routes -> redirect to appropriate login page
  if (!user) {
    if (isPortalProtected) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    if (isDashboardProtected) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/login';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // 2. Fetch user profile role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, account_status')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.account_status === 'disabled') {
    await supabase.auth.signOut();
    const url = request.nextUrl.clone();
    url.pathname = isDashboardProtected ? '/dashboard/login' : '/login';
    url.searchParams.set('error', 'disabled');
    return NextResponse.redirect(url);
  }

  const role = profile?.role;

  // 3. Role Protection Enforcement:
  // - Initiative user trying to access /dashboard protected routes -> redirect to /portal
  if (isDashboardProtected && role === 'initiative') {
    const url = request.nextUrl.clone();
    url.pathname = '/portal';
    return NextResponse.redirect(url);
  }

  // - Super Admin user trying to access /portal protected routes -> redirect to /dashboard
  if (isPortalProtected && role === 'super_admin') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
