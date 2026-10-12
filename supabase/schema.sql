-- ====================================================================
-- Beetorial Complete Production-Ready Supabase / Postgres Schema
-- Server-enforced RBAC, Table-specific RLS, Audit Logging & Integrations
-- ====================================================================

create extension if not exists pgcrypto;

-- 1. ROLES & PERMISSIONS
create type public.app_role as enum ('parent','student','teacher','admin','super_admin','support');

-- Profiles table (keyed to Supabase Auth users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.app_role not null default 'parent',
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Student-Parent relationship mapping
create table if not exists public.student_parents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid not null references public.profiles(id) on delete cascade,
  relationship text not null default 'parent',
  created_at timestamptz not null default now(),
  unique(student_id, parent_id)
);

-- Organisations for multi-tenant / franchise academy support
create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

-- Courses catalogue
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete set null,
  title text not null,
  subject text not null,
  grade_level text,
  description text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Enquiries CRM
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  parent_name text not null,
  parent_email text not null,
  parent_phone text,
  student_grade text,
  subject text not null,
  notes text,
  status text not null default 'new' check (status in ('new','contacted','trial_booked','closed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Scheduled Classes
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  teacher_id uuid references public.profiles(id) on delete set null,
  student_id uuid references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  meeting_url text,
  meeting_provider text default 'unconfigured',
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

-- Class Attendance
create table if not exists public.class_attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('present','absent','late','excused')),
  notes text,
  recorded_by uuid references public.profiles(id) on delete set null,
  recorded_at timestamptz not null default now(),
  unique(class_id, student_id)
);

-- Homework assignments
create table if not exists public.homework (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references public.classes(id) on delete cascade,
  title text not null,
  instructions text,
  due_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Homework Submissions & Grading
create table if not exists public.homework_submissions (
  id uuid primary key default gen_random_uuid(),
  homework_id uuid not null references public.homework(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  submission_url text,
  notes text,
  score numeric check (score >= 0 and score <= 100),
  feedback text,
  submitted_at timestamptz not null default now(),
  unique(homework_id, student_id)
);

-- Payments & Invoicing
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  payer_id uuid not null references public.profiles(id) on delete restrict,
  amount_paise bigint not null check (amount_paise >= 0),
  currency text not null default 'INR',
  provider text not null default 'sandbox',
  provider_reference text unique,
  description text,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded')),
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

-- Support Tickets
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  subject text not null,
  description text not null,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Immutable Security & Operational Audit Logs
create table if not exists public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes for performant lookups
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_student_parents_student on public.student_parents(student_id);
create index if not exists idx_student_parents_parent on public.student_parents(parent_id);
create index if not exists idx_courses_status on public.courses(status);
create index if not exists idx_enquiries_status_created on public.enquiries(status, created_at desc);
create index if not exists idx_classes_teacher_time on public.classes(teacher_id, starts_at);
create index if not exists idx_classes_student_time on public.classes(student_id, starts_at);
create index if not exists idx_attendance_class on public.class_attendance(class_id);
create index if not exists idx_payments_payer on public.payments(payer_id);
create index if not exists idx_support_tickets_status on public.support_tickets(status);
create index if not exists idx_audit_created on public.audit_logs(created_at desc);

-- ====================================================================
-- 2. SERVER-SIDE FUNCTIONS & TRIGGERS
-- ====================================================================

-- Helper: Get caller's verified role
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Helper: Check if caller has any of the specified roles
create or replace function public.has_role(roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = any(roles)
  );
$$;

-- Automatic profile creation on auth.users signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'parent'::public.app_role, -- safe default
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Role assignment RPC (strict server-side RBAC)
create or replace function public.assign_user_role(target_user_id uuid, new_role public.app_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_role public.app_role;
begin
  select role into caller_role from public.profiles where id = auth.uid();

  if caller_role is null or caller_role not in ('admin', 'super_admin') then
    raise exception 'Permission denied: caller must be an admin or super_admin';
  end if;

  if new_role in ('admin', 'super_admin') and caller_role <> 'super_admin' then
    raise exception 'Permission denied: only super_admin can grant administrative roles';
  end if;

  update public.profiles
  set role = new_role, updated_at = now()
  where id = target_user_id;

  insert into public.audit_logs (actor_id, action, resource_type, resource_id, metadata)
  values (
    auth.uid(),
    'ASSIGN_ROLE',
    'profiles',
    target_user_id::text,
    jsonb_build_object('new_role', new_role::text)
  );
end;
$$;

-- Logging RPC for trusted client action audit logging
create or replace function public.log_audit_event(
  p_action text,
  p_resource_type text,
  p_resource_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_log_id bigint;
begin
  insert into public.audit_logs (actor_id, action, resource_type, resource_id, metadata)
  values (auth.uid(), p_action, p_resource_type, p_resource_id, p_metadata)
  returning id into v_log_id;
  return v_log_id;
end;
$$;

-- Trigger to prevent client from updating their own role directly
create or replace function public.prevent_direct_role_update()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role then
    -- Allow only if session is executing via security definer (e.g. assign_user_role)
    if current_setting('role') <> 'postgres' and current_setting('request.jwt.claim.sub', true) is not null then
      raise exception 'Direct role modification forbidden. Use assign_user_role RPC.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_direct_role_update on public.profiles;
create trigger trg_prevent_direct_role_update
  before update on public.profiles
  for each row execute function public.prevent_direct_role_update();

-- ====================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.profiles enable row level security;
alter table public.student_parents enable row level security;
alter table public.organisations enable row level security;
alter table public.courses enable row level security;
alter table public.enquiries enable row level security;
alter table public.classes enable row level security;
alter table public.class_attendance enable row level security;
alter table public.homework enable row level security;
alter table public.homework_submissions enable row level security;
alter table public.payments enable row level security;
alter table public.support_tickets enable row level security;
alter table public.audit_logs enable row level security;

-- PROFILES POLICIES
create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Admins and Support can view all profiles"
  on public.profiles for select
  using (public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role, 'support'::public.app_role]));

create policy "Teachers can view assigned students and parents"
  on public.profiles for select
  using (
    public.has_role(array['teacher'::public.app_role]) and (
      id in (select student_id from public.classes where teacher_id = auth.uid()) or
      id in (select parent_id from public.student_parents where student_id in (select student_id from public.classes where teacher_id = auth.uid()))
    )
  );

create policy "Parents can view linked children and their teachers"
  on public.profiles for select
  using (
    public.has_role(array['parent'::public.app_role]) and (
      id in (select student_id from public.student_parents where parent_id = auth.uid()) or
      id in (select teacher_id from public.classes where student_id in (select student_id from public.student_parents where parent_id = auth.uid()))
    )
  );

create policy "Users can update own non-role fields"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- STUDENT_PARENTS POLICIES
create policy "Parents can view their student links"
  on public.student_parents for select
  using (parent_id = auth.uid() or student_id = auth.uid());

create policy "Admins manage student parent links"
  on public.student_parents for all
  using (public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role]));

-- ORGANISATIONS POLICIES
create policy "Authenticated users can view active organisations"
  on public.organisations for select
  using (status = 'active');

create policy "Super admin can manage organisations"
  on public.organisations for all
  using (public.has_role(array['super_admin'::public.app_role]));

-- COURSES POLICIES
create policy "Published courses viewable by authenticated users"
  on public.courses for select
  using (status = 'published' or public.has_role(array['teacher'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role]));

create policy "Staff can manage courses"
  on public.courses for all
  using (public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role]));

-- ENQUIRIES POLICIES
create policy "Anyone can submit enquiry"
  on public.enquiries for insert
  with check (true);

create policy "Staff can view and update enquiries"
  on public.enquiries for select
  using (public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role, 'support'::public.app_role]));

create policy "Staff can modify enquiries"
  on public.enquiries for update
  using (public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role, 'support'::public.app_role]));

-- CLASSES POLICIES
create policy "Participants can view their classes"
  on public.classes for select
  using (
    student_id = auth.uid() or
    teacher_id = auth.uid() or
    exists (select 1 from public.student_parents where parent_id = auth.uid() and student_id = classes.student_id) or
    public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role])
  );

create policy "Teachers and Admins can create classes"
  on public.classes for insert
  with check (public.has_role(array['teacher'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role]));

create policy "Teachers and Admins can update classes"
  on public.classes for update
  using (
    (teacher_id = auth.uid() and public.has_role(array['teacher'::public.app_role])) or
    public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role])
  );

-- CLASS ATTENDANCE POLICIES
create policy "Participants can view attendance"
  on public.class_attendance for select
  using (
    student_id = auth.uid() or
    exists (select 1 from public.student_parents where parent_id = auth.uid() and student_id = class_attendance.student_id) or
    exists (select 1 from public.classes where id = class_attendance.class_id and teacher_id = auth.uid()) or
    public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role])
  );

create policy "Teachers and Admins record attendance"
  on public.class_attendance for insert
  with check (public.has_role(array['teacher'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role]));

create policy "Teachers and Admins update attendance"
  on public.class_attendance for update
  using (public.has_role(array['teacher'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role]));

-- HOMEWORK POLICIES
create policy "Class participants view homework"
  on public.homework for select
  using (
    exists (
      select 1 from public.classes c
      where c.id = homework.class_id and (
        c.student_id = auth.uid() or
        c.teacher_id = auth.uid() or
        exists (select 1 from public.student_parents sp where sp.parent_id = auth.uid() and sp.student_id = c.student_id)
      )
    ) or public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role])
  );

create policy "Teachers and admins manage homework"
  on public.homework for all
  using (public.has_role(array['teacher'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role]));

-- HOMEWORK SUBMISSIONS POLICIES
create policy "Participants view homework submissions"
  on public.homework_submissions for select
  using (
    student_id = auth.uid() or
    exists (select 1 from public.student_parents where parent_id = auth.uid() and student_id = homework_submissions.student_id) or
    exists (
      select 1 from public.homework h
      join public.classes c on c.id = h.class_id
      where h.id = homework_submissions.homework_id and c.teacher_id = auth.uid()
    ) or
    public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role])
  );

create policy "Students submit their own homework"
  on public.homework_submissions for insert
  with check (student_id = auth.uid());

create policy "Students can update their submission content"
  on public.homework_submissions for update
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

create policy "Teachers score and provide feedback"
  on public.homework_submissions for update
  using (
    exists (
      select 1 from public.homework h
      join public.classes c on c.id = h.class_id
      where h.id = homework_submissions.homework_id and c.teacher_id = auth.uid()
    ) or public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role])
  );

-- PAYMENTS POLICIES
create policy "Payers view their payments"
  on public.payments for select
  using (payer_id = auth.uid() or public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role]));

create policy "Payers create pending payment orders"
  on public.payments for insert
  with check (payer_id = auth.uid() and status = 'pending' and is_verified = false);

-- Note: payment confirmation is intentionally restricted from direct client update.
-- Status changes to 'paid' occur only through verified backend/webhook procedures.

-- SUPPORT TICKETS POLICIES
create policy "Users view own tickets"
  on public.support_tickets for select
  using (user_id = auth.uid() or public.has_role(array['support'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role]));

create policy "Users create tickets"
  on public.support_tickets for insert
  with check (user_id = auth.uid());

create policy "Support agents update tickets"
  on public.support_tickets for update
  using (public.has_role(array['support'::public.app_role, 'admin'::public.app_role, 'super_admin'::public.app_role]));

-- AUDIT LOGS POLICIES
create policy "Admins and Super Admins view audit logs"
  on public.audit_logs for select
  using (public.has_role(array['admin'::public.app_role, 'super_admin'::public.app_role]));
