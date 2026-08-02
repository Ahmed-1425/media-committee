import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iqbfifotlccemgggeixe.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYmZpZm90bGNjZW1nZ2dlaXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDc4OTEsImV4cCI6MjEwMTA4Mzg5MX0.VJqgtR3Qsecd1dTVXltdGxfEz0koagjVsqRkzAHkuVU',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component context, ignored if read-only
          }
        },
      },
    }
  );
}

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iqbfifotlccemgggeixe.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYmZpZm90bGNjZW1nZ2dlaXhlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTUwNzg5MSwiZXhwIjoyMTAxMDgzODkxfQ.xP6v1RTyltpKTtA22_jiYj3HXLTI9wyXqy4jteYPaBA'
  );
}
