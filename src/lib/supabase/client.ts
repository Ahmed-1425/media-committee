import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iqbfifotlccemgggeixe.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYmZpZm90bGNjZW1nZ2dlaXhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MDc4OTEsImV4cCI6MjEwMTA4Mzg5MX0.VJqgtR3Qsecd1dTVXltdGxfEz0koagjVsqRkzAHkuVU'
  );
}
