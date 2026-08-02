import { createClient } from '@/lib/supabase/server';
import { UserManagementWorkspace } from '@/components/admin/UserManagementWorkspace';

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const [{ data: profiles }, { data: initiatives }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*, membership:initiative_memberships(initiative_id, initiative:initiatives(name))')
      .order('created_at', { ascending: false }),
    supabase.from('initiatives').select('id, name').eq('is_active', true).order('name'),
  ]);

  return (
    <UserManagementWorkspace
      profiles={(profiles as any) || []}
      initiatives={initiatives || []}
    />
  );
}
