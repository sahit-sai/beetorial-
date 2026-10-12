# Beetorial Platform Architecture & Security Specification

**Date:** 2026-10-12  
**Target Environment:** Node 20+, Vite, React 18, TypeScript, Supabase/PostgreSQL, Vitest  
**Status:** Approved

---

## 1. Executive Summary & Goals

Beetorial is a multi-role online tutoring platform serving parents, students, teachers, administrators, super administrators, and support agents. The platform emphasizes parental visibility, structured learning goals, and trustworthy tutor engagement.

This specification details the transition from the frontend demo starter to a verified, persistent application with:
1. Complete preservation of Beetorial's visual identity (glassmorphism UI, `--ink: #242746`, `--purple: #5546e8`, `--lime: #d8fa75`, DM Sans & Manrope typography).
2. Preservation of all current routes: `/`, `/login`, `/parent/*`, `/student/*`, `/teacher/*`, `/admin/*`, `/super-admin/*`, plus `/support/*`.
3. Server-enforced Role-Based Access Control (RBAC) and table-specific Row Level Security (RLS) in PostgreSQL.
4. Supabase Auth integration with strict server verification — roles are never trusted from the browser.
5. Service-role keys strictly omitted from the client bundle (only `anon` key used on client).
6. Persistent workflows for each module (courses, classes, homework, enquiries, payments, audit logs, support tickets, and attendance).
7. Strict gating for external providers: Razorpay/Stripe payments and Zoom/Google Meet video classes require verified credentials; unconfigured integrations operate in an explicitly labeled sandbox mode without faking payment confirmation.
8. Comprehensive test suite and zero-error production build.

---

## 2. Security Architecture & Server-Enforced RBAC

### 2.1 Roles & Identity Model
Roles supported:
- `parent`: Views assigned children, tracks attendance & progress, schedules classes, pays verified invoices, messages teachers.
- `student`: Accesses assigned classes with verified video launch, submits homework, browses study materials.
- `teacher`: Manages classes, views assigned students, assigns/grades homework, records attendance, messages students/parents.
- `admin`: Manages courses, tutors, student enrollments, enquiries CRM, schedules, payment records, operational reports.
- `super_admin`: Platform-wide governance, user management, tutor approval, organization management, access controls, audit log export.
- `support`: Handles incoming parent/student enquiries, platform support tickets, and account assistance.

### 2.2 PostgreSQL Enum & Profile Binding
```sql
CREATE TYPE public.app_role AS ENUM (
  'parent', 'student', 'teacher', 'admin', 'super_admin', 'support'
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role public.app_role NOT NULL DEFAULT 'parent',
  avatar_url text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

### 2.3 Role Modification Security Rule
Users cannot change their own `role`. A security trigger `check_role_change_privilege` and RLS `WITH CHECK` reject any direct `UPDATE profiles SET role = ...` unless called through the trusted Postgres RPC function:
```sql
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id uuid, new_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller is admin or super_admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Access Denied: Privileged role required to assign roles.';
  END IF;

  -- Only super_admin can grant admin or super_admin
  IF new_role IN ('admin', 'super_admin') AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access Denied: Only super_admin can promote to administrative roles.';
  END IF;

  UPDATE public.profiles SET role = new_role, updated_at = now() WHERE id = target_user_id;

  INSERT INTO public.audit_logs (actor_id, action, resource_type, resource_id, metadata)
  VALUES (auth.uid(), 'ASSIGN_ROLE', 'profiles', target_user_id::text, jsonb_build_object('new_role', new_role));
END;
$$;
```

---

## 3. Database Schema, Relationships & Table-Specific RLS

### 3.1 Tables
1. `profiles`: User information & verified role.
2. `student_parents`: Maps parent `parent_id` to student `student_id`.
3. `organisations`: Multi-tenant organization records.
4. `courses`: Subject curriculum units.
5. `classes`: Scheduled lesson sessions connecting teacher, student, course, and meeting URLs.
6. `class_attendance`: Session attendance tracking (`present`, `absent`, `late`, `excused`).
7. `homework`: Assignments created by teachers.
8. `homework_submissions`: Submissions, scores, and teacher feedback.
9. `enquiries`: CRM leads for parents seeking tutoring.
10. `payments`: Payment records, invoices, provider references, and states (`pending`, `paid`, `failed`, `refunded`).
11. `support_tickets`: Support requests handled by support/admin staff.
12. `audit_logs`: Immutable security audit events.

### 3.2 RLS Policy Matrix
- `profiles`: All can SELECT own profile. `admin`/`super_admin`/`support` can SELECT all. `teacher` can SELECT students enrolled in their classes. `parent` can SELECT linked children and their teachers.
- `classes`: SELECT permitted if `auth.uid() IN (student_id, teacher_id)` OR linked parent of `student_id` OR caller is `admin`/`super_admin`. INSERT/UPDATE restricted to `teacher`/`admin`/`super_admin`.
- `homework`: Read by enrolled student, their parent, assigned teacher, and admin.
- `homework_submissions`: Inserted only by student for self; graded only by assigned teacher; read by student, parent, teacher, admin.
- `payments`: SELECT permitted for `payer_id = auth.uid()` or `admin`/`super_admin`. Status can NEVER be updated directly to `paid` by client.
- `audit_logs`: INSERT handled via `SECURITY DEFINER` procedures; SELECT restricted to `admin` and `super_admin`.

---

## 4. Frontend Architecture & Modularization

The application is decomposed into clean, type-safe modules while keeping `src/styles.css` completely intact:

```text
src/
├── types/
│   ├── index.ts              # Domain entities, roles, auth types, provider types
├── lib/
│   ├── supabase.ts           # Supabase client singleton & credentials detector
│   ├── authContext.tsx       # Auth provider, session handling, user state
│   ├── validation.ts         # Zod schemas for enquiries, courses, homework, login
│   ├── audit.ts              # Audit logging client
│   └── dataService.ts        # Unified data layer (Supabase live + Verified Sandbox fallback)
├── components/
│   ├── common/
│   │   ├── AppShell.tsx      # Sidebar, topbar, user badge, breadcrumb, demo flag
│   │   ├── Stat.tsx          # Metric cards
│   │   ├── Panel.tsx         # Card panel wrapper
│   │   ├── Logo.tsx          # Beetorial branding
│   │   ├── EmptyState.tsx    # Accessible empty state UI
│   │   └── LoadingSpinner.tsx# Glassmorphic loader
│   ├── providers/
│   │   ├── PaymentModal.tsx  # Gated payment drawer with configuration indicator
│   │   └── MeetingLauncher.tsx# Gated video class launcher with provider checks
├── modules/
│   ├── marketing/
│   │   └── Home.tsx          # Public marketing page
│   ├── auth/
│   │   └── Login.tsx         # Supabase Auth login/signup + verified sandbox demo switcher
│   ├── parent/
│   │   ├── ParentDashboard.tsx
│   │   ├── ChildProgress.tsx
│   │   ├── ScheduleView.tsx
│   │   ├── PaymentsView.tsx
│   │   └── MessagesView.tsx
│   ├── student/
│   │   ├── StudentDashboard.tsx
│   │   ├── StudentClasses.tsx
│   │   ├── HomeworkView.tsx
│   │   └── MaterialsView.tsx
│   ├── teacher/
│   │   ├── TeacherDashboard.tsx
│   │   ├── TeacherClasses.tsx
│   │   ├── TeacherStudents.tsx
│   │   ├── HomeworkGrading.tsx
│   │   └── AttendanceView.tsx
│   │   └── TeacherMessages.tsx
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── StudentDirectory.tsx
│   │   ├── TutorDirectory.tsx
│   │   ├── CourseManagement.tsx
│   │   ├── EnquiriesCrm.tsx
│   │   ├── AdminSchedule.tsx
│   │   ├── AdminPayments.tsx
│   │   ├── AdminReports.tsx
│   │   └── AdminSettings.tsx
│   ├── super-admin/
│   │   ├── SuperAdminDashboard.tsx
│   │   ├── UserManagement.tsx
│   │   ├── TutorApprovals.tsx
│   │   ├── AccessControls.tsx
│   │   ├── AuditActivity.tsx
│   │   └── PlatformSettings.tsx
│   └── support/
│       ├── SupportDashboard.tsx
│       └── TicketDesk.tsx
├── App.tsx                   # Central router preserving all paths
└── main.tsx                  # Root entrypoint
```

---

## 5. Provider Integration & Gating Rules

1. **Payments (Razorpay / Stripe)**:
   - Evaluated via `isPaymentProviderConfigured()`.
   - If not configured: Displays prominent badge: *"Test Sandbox — Provider Credentials Not Configured"*. Transactions are strictly marked as sandbox mock orders and never marked as real bank settlements.
2. **Video Classes (Zoom / Google Meet)**:
   - Evaluated via `isVideoProviderConfigured(meetingUrl)`.
   - If no valid meeting provider is configured, the launch button displays: *"Configure meeting link to join live session"* with instructions.
3. **Demo Mode Integrity**:
   - The UI clearly banners whether it is connected to a live Supabase backend or running in the local verified sandbox.

---

## 6. Testing & Quality Standards

- **Vitest**: Unit & integration tests for:
  - Auth context and RBAC role gating.
  - Zod validation schemas for all user inputs.
  - RLS logic and mock service permission checks.
  - Provider gating safeguards.
- **Production Build**: `npm run build` (`tsc -b && vite build`) executes cleanly with zero warnings or errors.
