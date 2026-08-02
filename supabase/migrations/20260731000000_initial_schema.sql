-- ====================================================================
-- SUPABASE INITIAL MIGRATION: المنصة التنظيمية للجنة الإعلامية
-- ====================================================================

-- 1. Create Enums
CREATE TYPE app_role AS ENUM ('super_admin', 'initiative');
CREATE TYPE account_status AS ENUM ('active', 'disabled');
CREATE TYPE request_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'changes_requested',
  'approved',
  'rejected',
  'scheduled',
  'published',
  'archived',
  'cancelled'
);
CREATE TYPE request_priority AS ENUM ('normal', 'urgent');
CREATE TYPE notification_type AS ENUM (
  'request_submitted',
  'status_changed',
  'comment_added',
  'sla_warning',
  'sla_breached',
  'system'
);
CREATE TYPE audit_action AS ENUM (
  'create',
  'update',
  'status_transition',
  'comment',
  'disable_user',
  'reset_password',
  'archive',
  'restore',
  'settings_update'
);

-- 2. Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Table: profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'initiative',
  full_name TEXT NULL,
  email TEXT NULL,
  phone TEXT NULL,
  avatar_path TEXT NULL,
  theme TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  account_status account_status NOT NULL DEFAULT 'active',
  last_sign_in_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 4. Table: initiatives
CREATE TABLE initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NULL,
  contact_email TEXT NULL,
  contact_phone TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_initiatives_updated_at
  BEFORE UPDATE ON initiatives
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 5. Table: initiative_memberships
CREATE TABLE initiative_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_initiative_memberships_updated_at
  BEFORE UPDATE ON initiative_memberships
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 6. Reference Table: platforms
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_platforms_updated_at
  BEFORE UPDATE ON platforms
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 7. Reference Table: media_types
CREATE TABLE media_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_media_types_updated_at
  BEFORE UPDATE ON media_types
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Seed Default Platforms
INSERT INTO platforms (id, name, code, is_active, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'منصة X (تويتر)', 'x', true, 1),
  ('a0000000-0000-0000-0000-000000000002', 'انستغرام (Instagram)', 'instagram', true, 2),
  ('a0000000-0000-0000-0000-000000000003', 'تيك توك (TikTok)', 'tiktok', true, 3),
  ('a0000000-0000-0000-0000-000000000004', 'لينكد إن (LinkedIn)', 'linkedin', true, 4),
  ('a0000000-0000-0000-0000-000000000005', 'يوتيوب (YouTube)', 'youtube', true, 5),
  ('a0000000-0000-0000-0000-000000000006', 'سناب شات (Snapchat)', 'snapchat', true, 6)
ON CONFLICT (code) DO NOTHING;

-- Seed Default Media Types
INSERT INTO media_types (id, name, code, is_active, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'تصميم جرافيك (Design)', 'design', true, 1),
  ('b0000000-0000-0000-0000-000000000002', 'فيديو مرئي (Video)', 'video', true, 2),
  ('b0000000-0000-0000-0000-000000000003', 'ريلز / ستوري (Reels)', 'reels', true, 3),
  ('b0000000-0000-0000-0000-000000000004', 'تغطية ميدانية (Coverage)', 'coverage', true, 4),
  ('b0000000-0000-0000-0000-000000000005', 'بيان / خبر إعلامي (Press)', 'press', true, 5)
ON CONFLICT (code) DO NOTHING;

-- 8. Table: requests
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
  initiative_id UUID NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  caption TEXT NOT NULL,
  platform_id UUID NOT NULL REFERENCES platforms(id),
  media_type_id UUID NOT NULL REFERENCES media_types(id),
  priority request_priority NOT NULL DEFAULT 'normal',
  drive_link TEXT NOT NULL,
  notes TEXT NULL,
  requested_publish_at TIMESTAMPTZ NULL,
  status request_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ NULL,
  review_started_at TIMESTAMPTZ NULL,
  reviewed_at TIMESTAMPTZ NULL,
  approved_at TIMESTAMPTZ NULL,
  scheduled_at TIMESTAMPTZ NULL,
  published_at TIMESTAMPTZ NULL,
  archived_at TIMESTAMPTZ NULL,
  submitted_by UUID REFERENCES profiles(id),
  reviewed_by UUID REFERENCES profiles(id),
  rejection_reason TEXT NULL,
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 9. Table: request_versions
CREATE TABLE request_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  caption TEXT NOT NULL,
  platform_id UUID NOT NULL REFERENCES platforms(id),
  media_type_id UUID NOT NULL REFERENCES media_types(id),
  priority request_priority NOT NULL,
  drive_link TEXT NOT NULL,
  notes TEXT NULL,
  requested_publish_at TIMESTAMPTZ NULL,
  status request_status NOT NULL,
  resubmission_reason TEXT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Table: request_status_history
CREATE TABLE request_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  from_status request_status NULL,
  to_status request_status NOT NULL,
  reason TEXT NULL,
  changed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Table: request_comments
CREATE TABLE request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ NULL
);

CREATE TRIGGER set_request_comments_updated_at
  BEFORE UPDATE ON request_comments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 12. Table: notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Table: sla_policies
CREATE TABLE sla_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  priority request_priority NOT NULL UNIQUE,
  target_review_minutes INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_sla_policies_updated_at
  BEFORE UPDATE ON sla_policies
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 14. Table: request_sla
CREATE TABLE request_sla (
  request_id UUID PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES sla_policies(id),
  due_at TIMESTAMPTZ NULL,
  first_response_at TIMESTAMPTZ NULL,
  resolved_at TIMESTAMPTZ NULL,
  state TEXT NOT NULL DEFAULT 'not_configured' CHECK (state IN ('on_track', 'at_risk', 'breached', 'not_configured')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_request_sla_updated_at
  BEFORE UPDATE ON request_sla
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- 15. Table: audit_logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_data JSONB NULL,
  new_data JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Table: app_settings
CREATE TABLE app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- ====================================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================================

CREATE INDEX idx_requests_initiative_status ON requests(initiative_id, status, created_at DESC);
CREATE INDEX idx_requests_requested_publish ON requests(requested_publish_at) WHERE requested_publish_at IS NOT NULL;
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_comments_request_created ON request_comments(request_id, created_at ASC);
CREATE INDEX idx_history_request_created ON request_status_history(request_id, created_at ASC);
CREATE INDEX idx_audit_created_actor ON audit_logs(created_at DESC, actor_id);

-- ====================================================================
-- SECURITY DEFINER HELPERS
-- ====================================================================

CREATE OR REPLACE FUNCTION current_app_role()
RETURNS app_role
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_role app_role;
BEGIN
  SELECT role INTO v_role FROM profiles WHERE id = auth.uid();
  RETURN v_role;
END;
$$;

CREATE OR REPLACE FUNCTION current_initiative_id()
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_initiative_id UUID;
BEGIN
  SELECT initiative_id INTO v_initiative_id FROM initiative_memberships WHERE profile_id = auth.uid();
  RETURN v_initiative_id;
END;
$$;

-- Automatically create profile on new user signup if provisioning function used
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name, email, account_status)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'initiative'),
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiative_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_sla ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
CREATE POLICY "Super admin can select all profiles" ON profiles
  FOR SELECT TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "User can select own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "User can update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. INITIATIVES
CREATE POLICY "Super admin can manage all initiatives" ON initiatives
  FOR ALL TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "Initiative user can view own initiative" ON initiatives
  FOR SELECT TO authenticated USING (id = current_initiative_id());

-- 3. INITIATIVE MEMBERSHIPS
CREATE POLICY "Super admin can manage all memberships" ON initiative_memberships
  FOR ALL TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "User can view own membership" ON initiative_memberships
  FOR SELECT TO authenticated USING (profile_id = auth.uid());

-- 4. PLATFORMS & MEDIA TYPES
CREATE POLICY "Authenticated users can select active platforms" ON platforms
  FOR SELECT TO authenticated USING (is_active = true OR current_app_role() = 'super_admin');

CREATE POLICY "Super admin can manage platforms" ON platforms
  FOR ALL TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "Authenticated users can select active media types" ON media_types
  FOR SELECT TO authenticated USING (is_active = true OR current_app_role() = 'super_admin');

CREATE POLICY "Super admin can manage media types" ON media_types
  FOR ALL TO authenticated USING (current_app_role() = 'super_admin');

-- 5. REQUESTS
CREATE POLICY "Super admin can manage all requests" ON requests
  FOR ALL TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "Initiative user can select own requests" ON requests
  FOR SELECT TO authenticated USING (initiative_id = current_initiative_id());

CREATE POLICY "Initiative user can insert own requests" ON requests
  FOR INSERT TO authenticated WITH CHECK (
    initiative_id = current_initiative_id() AND
    current_app_role() = 'initiative'
  );

CREATE POLICY "Initiative user can update own draft or changes_requested requests" ON requests
  FOR UPDATE TO authenticated USING (
    initiative_id = current_initiative_id() AND
    status IN ('draft', 'changes_requested')
  ) WITH CHECK (
    initiative_id = current_initiative_id() AND
    status IN ('draft', 'submitted', 'cancelled')
  );

-- 6. REQUEST VERSIONS & STATUS HISTORY
CREATE POLICY "Super admin can select all request versions" ON request_versions
  FOR SELECT TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "Initiative user can select request versions for own request" ON request_versions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM requests WHERE requests.id = request_versions.request_id AND requests.initiative_id = current_initiative_id())
  );

CREATE POLICY "Super admin can select all status history" ON request_status_history
  FOR SELECT TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "Initiative user can select status history for own request" ON request_status_history
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM requests WHERE requests.id = request_status_history.request_id AND requests.initiative_id = current_initiative_id())
  );

-- 7. REQUEST COMMENTS
CREATE POLICY "Super admin can manage all request comments" ON request_comments
  FOR ALL TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "Initiative user can view comments on own request" ON request_comments
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM requests WHERE requests.id = request_comments.request_id AND requests.initiative_id = current_initiative_id())
  );

CREATE POLICY "Initiative user can insert comment on own request" ON request_comments
  FOR INSERT TO authenticated WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (SELECT 1 FROM requests WHERE requests.id = request_comments.request_id AND requests.initiative_id = current_initiative_id())
  );

-- 8. NOTIFICATIONS
CREATE POLICY "User can view own notifications" ON notifications
  FOR SELECT TO authenticated USING (recipient_id = auth.uid());

CREATE POLICY "User can update own notifications" ON notifications
  FOR UPDATE TO authenticated USING (recipient_id = auth.uid());

-- 9. SLA POLICIES & REQUEST SLA
CREATE POLICY "Super admin can manage SLA policies" ON sla_policies
  FOR ALL TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "Authenticated users can select active SLA policies" ON sla_policies
  FOR SELECT TO authenticated USING (is_active = true OR current_app_role() = 'super_admin');

CREATE POLICY "Super admin can manage request SLA" ON request_sla
  FOR ALL TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "Initiative user can select SLA for own request" ON request_sla
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM requests WHERE requests.id = request_sla.request_id AND requests.initiative_id = current_initiative_id())
  );

-- 10. AUDIT LOGS & APP SETTINGS
CREATE POLICY "Super admin can view audit logs" ON audit_logs
  FOR SELECT TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "Super admin can manage app settings" ON app_settings
  FOR ALL TO authenticated USING (current_app_role() = 'super_admin');

CREATE POLICY "Authenticated users can read public app settings" ON app_settings
  FOR SELECT TO authenticated USING (key IN ('contact_info', 'branding'));

-- Realtime Publication for comments and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE request_comments, notifications;
