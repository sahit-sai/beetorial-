# Beetorial — Modern Multi-Role Online Tutoring Platform

Beetorial is a production-engineered multi-role tutoring platform connecting parents, students, teachers, administrators, super administrators, and support agents. Built with a responsive glassmorphism UI, a deep blue/purple palette (`--ink: #242746`, `--purple: #5546e8`), and restrained lime accents (`--lime: #d8fa75`).

---

## 1. Quick Start & Localhost Execution

### Requirements
- Node.js 20+ (Node 22 or 26 recommended)
- npm 10+

### Install & Run
```bash
# 1. Install dependencies
npm install

# 2. Run unit and integration tests
npm test

# 3. Build for production (TypeScript check + Vite bundle)
npm run build

# 4. Start the local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 2. Core Security & Server-Enforced RBAC

Beetorial guarantees that **roles are never trusted from the browser** and **service-role credentials are never exposed in frontend code**.

### 2.1 Role-Based Access Control (RBAC)
Supported system roles:
- `parent`: Inspects children's concept mastery, tracks attendance, manages schedule, generates invoices, messages assigned tutors.
- `student`: Accesses timetable with video classroom launchers, submits homework solutions, views teacher grades and feedback, accesses study guides.
- `teacher`: Schedules lessons, inspects student rosters, creates assignments, assesses homework with 0-100 grading, records attendance with participation notes, communicates with parents.
- `admin`: Oversees enrolled students, tutors faculty, curriculum catalogue, admissions enquiries CRM desk, schedule timetable, payments ledger, and operational reports.
- `super_admin`: Platform governance, cross-role user directory, tutor accreditation approvals, server-enforced role assignments, security policy controls, and immutable audit activity CSV export.
- `support`: Help desk ticketing queue for account assistance, diagnostic enquiry routing, and platform audit trail access.

### 2.2 Server-Enforced Role Modification
Users cannot update their own role directly. PostgreSQL security trigger `prevent_direct_role_update` rejects direct updates to `profiles.role`. Privileged role assignments require the trusted `assign_user_role` stored procedure:
```sql
-- Executed with SECURITY DEFINER
SELECT public.assign_user_role('user-uuid-here', 'teacher'::public.app_role);
```
Every role change automatically writes an audit record to `public.audit_logs`.

---

## 3. Database Architecture & Table-Specific RLS

The database schema (`supabase/schema.sql`) enforces **table-specific Row Level Security (RLS)** with fail-closed security across all 12 tables:

1. `profiles`: Keyed to `auth.users(id)`. Users can view their own profile; teachers view assigned students/parents; parents view assigned children and teachers; admins/super_admins view all.
2. `student_parents`: Maps guardian-child relationships to guarantee parental oversight access.
3. `organisations`: Multi-tenant organization records.
4. `courses`: Subject curriculum units. Published units viewable by all; drafts restricted to staff.
5. `classes`: Scheduled lesson sessions. Viewable only by participating student, parent, assigned teacher, and admins.
6. `class_attendance`: Session presence logging (`present`, `absent`, `late`, `excused`).
7. `homework`: Lesson assignments created by teachers.
8. `homework_submissions`: Submissions and scores. Graded only by assigned teacher and admins.
9. `enquiries`: Admissions CRM leads with status tracking (`new`, `contacted`, `trial_booked`, `closed`).
10. `payments`: Payment records and invoices. Status can **never** be updated to `'paid'` by client direct mutation.
11. `support_tickets`: Ticketing queue for parents, students, and support agents.
12. `audit_logs`: Immutable security audit logs accessible only to `admin` and `super_admin`.

### Applying Migrations & Seed Data to Supabase
```bash
# In your Supabase project SQL Editor:
# 1. Run schema and policies:
supabase/schema.sql

# 2. Run initial development seed data:
supabase/seed.sql
```

---

## 4. Provider Integrations & Gating Safeguards

Beetorial adheres to strict data integrity principles:

### 4.1 Payment Gateway (Razorpay / Stripe)
- Evaluated via `isPaymentProviderConfigured()` using `VITE_PAYMENT_PROVIDER` and `VITE_PAYMENT_KEY_ID`.
- **Integrity Rule**: When keys are unconfigured, transactions are clearly badged as **"Test Sandbox — Provider Credentials Not Configured"**. Test transactions are tagged with sandbox metadata and **never faked as real bank settlements**.

### 4.2 Video Classrooms (Google Meet / Zoom / Jitsi)
- Evaluated via `validateMeetingUrl()`.
- Valid HTTPS links to authorized providers launch video sessions with audit logging.
- Unconfigured classes display **"Provider Unconfigured"** with a prompt to set meeting links.

### 4.3 Verified Local Sandbox Mode
When running without Supabase credentials (`VITE_SUPABASE_URL`), Beetorial operates in a **Verified Sandbox Mode** with complete persistence in localStorage and IndexedDB. It simulates all server RLS and RBAC constraints, allowing instant role switching between all 6 roles (`Parent`, `Student`, `Teacher`, `Admin`, `Super Admin`, `Support`) for thorough testing.

---

## 5. Routes Matrix

- **Public Marketing & Auth**:
  - `/` — Homepage with glassmorphism UI, concept snapshot, trust strip, and curriculum chips
  - `/login` — Supabase Auth sign-in/sign-up + verified sandbox role switcher
- **Parent Workspace**:
  - `/parent` — Dashboard with weekly rhythm, upcoming class, and skill meters
  - `/parent/progress` — Diagnostic concept breakdown and teacher feedback
  - `/parent/schedule` — Calendar timetable and video class launcher
  - `/parent/payments` — Tuition ledger, invoice generation, and sandbox checkout
  - `/parent/messages` — Direct messaging with assigned tutor
- **Student Workspace**:
  - `/student` — Learning dashboard and daily focus checklist
  - `/student/classes` — Scheduled lessons and video classroom launcher
  - `/student/homework` — Homework submission portal with Zod validation
  - `/student/materials` — Curated study guides and worksheets library
- **Teacher Workspace**:
  - `/teacher` — Teacher overview, upcoming sessions, and pending grading
  - `/teacher/classes` — Class scheduling modal with validated datetime and video URLs
  - `/teacher/students` — Student roster with guardian contact info and attendance %
  - `/teacher/homework` — Assignment creation and 0-100 scoring with feedback
  - `/teacher/attendance` — Session attendance register with participation notes
  - `/teacher/messages` — Direct parent communications
- **Admin Workspace**:
  - `/admin` — Academy metrics, recent admissions leads, operational shortcuts
  - `/admin/students` — Student directory and enrollment registration
  - `/admin/tutors` — Faculty directory with qualifications and ratings
  - `/admin/courses` — Curriculum units management with draft/publish toggle
  - `/admin/enquiries` — Inbound parent enquiries CRM with status updater
  - `/admin/schedule` — Master timetable across all tutors and learners
  - `/admin/payments` — Tuition receipts ledger and revenue summaries
  - `/admin/reports` — Academic cohort progress and tutor hours utilization
  - `/admin/settings` — Academy operational parameters, timezone and currency
- **Super Admin Workspace**:
  - `/super-admin` — Governance dashboard and platform metrics
  - `/super-admin/users` — Cross-role user directory
  - `/super-admin/tutors` — Educator accreditation approval queue
  - `/super-admin/access-controls` — Server RBAC matrix, admin invites, and policy toggles
  - `/super-admin/audit` — Immutable audit logs with CSV export
  - `/super-admin/settings` — Provider connection health and security policies
- **Support Workspace**:
  - `/support` — Help desk overview, active tickets, and lead routing
  - `/support/tickets` — Complete ticketing queue with status management

---

## 6. What Is Genuinely Working vs Remaining Setup Steps

### Genuinely Working (Ready & Verified):
- [x] Complete TypeScript architecture with zero build errors (`tsc -b && vite build` passing).
- [x] Comprehensive test suite with Vitest passing 100% of tests.
- [x] 100% preservation of visual identity: DM Sans & Manrope fonts, glassmorphism cards, deep blue/purple palette, restrained lime accents.
- [x] Complete route preservation with RBAC route protection.
- [x] Server-enforced RBAC schema with table-specific RLS policies for all 6 roles.
- [x] Security triggers preventing direct client promotion.
- [x] Full module workflows with persistent database storage, Zod input validation, loading spinners, and accessible empty/error states.
- [x] Verified Demo Sandbox mode with prominent status labeling and instant role switching.
- [x] Provider gating guards for Razorpay/Stripe payments and Zoom/Google Meet video classes.
- [x] Audit activity logging with CSV export.

### Remaining Production Setup Steps:
1. **Connect Live Supabase Project**:
   - In `.env`, populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - Run `supabase/schema.sql` in the Supabase SQL editor.
2. **Connect Payment Gateway Webhook**:
   - In `.env`, populate `VITE_PAYMENT_PROVIDER=razorpay` and `VITE_PAYMENT_KEY_ID=rzp_live_...`.
   - Configure a backend serverless function or webhook handler to verify transaction signatures before marking invoices as `'paid'`.
3. **Configure Video Conferencing Integration**:
   - When scheduling classes, input active Google Meet or Zoom meeting links.
