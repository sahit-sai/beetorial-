# Beetorial Platform Continuation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Beetorial online tutoring platform with Supabase Auth, server-enforced RBAC and table-specific RLS for all 6 roles, persistent database workflows, external provider gating, tests, and production build while completely preserving its glassmorphism visual identity.

**Architecture:** Implement a modular TypeScript architecture with `@supabase/supabase-js`, server-enforced RLS/RPC security in PostgreSQL, and an authenticated dual-mode data service (connecting to Supabase when configured, falling back to a persistent verified sandbox when running standalone locally). Strict provider guards for payments and video conferencing enforce data integrity and prevent spoofing.

**Tech Stack:** React 18, Vite 6, TypeScript 5.7, `@supabase/supabase-js`, Zod, Lucide-React, Vitest, PostgreSQL.

**Spec:** `docs/superpowers/specs/2026-10-12-beetorial-architecture-design.md`

## Global Constraints
- Preserve 100% of the visual identity: DM Sans + Manrope, glassmorphic cards, deep blue/purple palette (`--ink: #242746`, `--purple: #5546e8`, `--lime: #d8fa75`).
- Preserve all existing routes: `/`, `/login`, `/parent/*`, `/student/*`, `/teacher/*`, `/admin/*`, `/super-admin/*`, plus `/support/*`.
- Never trust browser-stored roles or client-side role claims.
- Never bundle or expose Supabase service-role keys in frontend code.
- Never fake payment confirmations; gate payment and video providers with explicit verification checks.
- Keep demo sandbox mode clearly labelled with a status badge until live Supabase credentials are confirmed.

---

### Task 1: Dependencies, Environment & Project Scaffolding
**Files:**
- Modify: `package.json`
- Modify: `.env.example`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

**Interfaces:**
- Produces: Installed dependencies (`@supabase/supabase-js`, `zod`, `vitest`, `@testing-library/react`, `jsdom`), test runner configuration, and environment documentation.

- [ ] **Step 1: Update package.json with dependencies & test scripts**
- [ ] **Step 2: Run npm install**
- [ ] **Step 3: Create vitest.config.ts and test setup**
- [ ] **Step 4: Verify test runner works with a smoke test**

---

### Task 2: Supabase Schema, Security Policies & Seed Data
**Files:**
- Modify: `supabase/schema.sql`
- Create: `supabase/seed.sql`

**Interfaces:**
- Produces: Complete PostgreSQL schema with `public.app_role`, `student_parents`, `class_attendance`, `support_tickets`, `assign_user_role` RPC, table-specific RLS policies, and realistic seed data for all roles.

- [ ] **Step 1: Write expanded schema.sql with RLS policies and SECURITY DEFINER RPCs**
- [ ] **Step 2: Write seed.sql with sample parent, student, teacher, admin, super_admin, and support accounts**
- [ ] **Step 3: Verify SQL syntax and policy definitions**

---

### Task 3: Core Types, Validation & Audit Logging
**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/validation.ts`
- Create: `src/lib/audit.ts`
- Create: `tests/validation.test.ts`

**Interfaces:**
- Produces: Type definitions for all entities, Zod validation schemas for forms, audit log service, and validation unit tests.

- [ ] **Step 1: Write failing validation unit tests**
- [ ] **Step 2: Implement domain types in src/types/index.ts**
- [ ] **Step 3: Implement Zod schemas in src/lib/validation.ts**
- [ ] **Step 4: Implement audit logging in src/lib/audit.ts**
- [ ] **Step 5: Run tests to verify they pass**

---

### Task 4: Supabase Client, Auth Context & Server RBAC Guards
**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/lib/authContext.tsx`
- Create: `tests/auth.test.ts`

**Interfaces:**
- Produces: Supabase client, AuthContext, `useAuth` hook enforcing role verification, sign-in, sign-up, sign-out, and auth tests.

- [ ] **Step 1: Write failing auth context unit tests**
- [ ] **Step 2: Implement src/lib/supabase.ts client singleton**
- [ ] **Step 3: Implement src/lib/authContext.tsx with verified role loading**
- [ ] **Step 4: Run auth tests to verify they pass**

---

### Task 5: Persistent Data Service & Provider Integrity Layer
**Files:**
- Create: `src/lib/dataService.ts`
- Create: `src/lib/providers.ts`
- Create: `tests/providers.test.ts`

**Interfaces:**
- Produces: Persistent data operations for courses, classes, enquiries, homework, payments, attendance, and support tickets with dual Supabase/Sandbox support, plus payment/video provider verification guards.

- [ ] **Step 1: Write failing provider gating unit tests**
- [ ] **Step 2: Implement provider verification in src/lib/providers.ts**
- [ ] **Step 3: Implement dataService.ts with full persistence and audit hooks**
- [ ] **Step 4: Run provider tests to verify they pass**

---

### Task 6: Shared Components & Design System Polish
**Files:**
- Create: `src/components/common/Logo.tsx`
- Create: `src/components/common/Stat.tsx`
- Create: `src/components/common/Panel.tsx`
- Create: `src/components/common/AppShell.tsx`
- Create: `src/components/common/LoadingSpinner.tsx`
- Create: `src/components/common/EmptyState.tsx`
- Create: `src/components/providers/PaymentModal.tsx`
- Create: `src/components/providers/MeetingLauncher.tsx`

**Interfaces:**
- Produces: Reusable UI components matching Beetorial's glassmorphism style, responsive sidebar, provider modal with configuration checks, and accessible notifications.

- [ ] **Step 1: Implement Logo, Stat, Panel, and EmptyState components**
- [ ] **Step 2: Implement responsive AppShell with role navigation and environment badge**
- [ ] **Step 3: Implement PaymentModal and MeetingLauncher with provider gating**

---

### Task 7: Role Modules (Parent, Student, Teacher)
**Files:**
- Create: `src/modules/parent/ParentDashboard.tsx`
- Create: `src/modules/parent/ChildProgress.tsx`
- Create: `src/modules/parent/ScheduleView.tsx`
- Create: `src/modules/parent/PaymentsView.tsx`
- Create: `src/modules/parent/MessagesView.tsx`
- Create: `src/modules/student/StudentDashboard.tsx`
- Create: `src/modules/student/StudentClasses.tsx`
- Create: `src/modules/student/HomeworkView.tsx`
- Create: `src/modules/student/MaterialsView.tsx`
- Create: `src/modules/teacher/TeacherDashboard.tsx`
- Create: `src/modules/teacher/TeacherClasses.tsx`
- Create: `src/modules/teacher/TeacherStudents.tsx`
- Create: `src/modules/teacher/HomeworkGrading.tsx`
- Create: `src/modules/teacher/AttendanceView.tsx`
- Create: `src/modules/teacher/TeacherMessages.tsx`

**Interfaces:**
- Produces: Complete, interactive workflows for Parent, Student, and Teacher with loading/error states, form validation, and persistent storage.

- [ ] **Step 1: Implement Parent views (Dashboard, Progress, Schedule, Payments, Messages)**
- [ ] **Step 2: Implement Student views (Dashboard, Classes, Homework submission, Materials)**
- [ ] **Step 3: Implement Teacher views (Dashboard, Classes, Students, Homework grading, Attendance, Messages)**

---

### Task 8: Role Modules (Admin, Super Admin, Support) & Auth Pages
**Files:**
- Create: `src/modules/marketing/Home.tsx`
- Create: `src/modules/auth/Login.tsx`
- Create: `src/modules/admin/AdminDashboard.tsx`
- Create: `src/modules/admin/StudentDirectory.tsx`
- Create: `src/modules/admin/TutorDirectory.tsx`
- Create: `src/modules/admin/CourseManagement.tsx`
- Create: `src/modules/admin/EnquiriesCrm.tsx`
- Create: `src/modules/admin/AdminSchedule.tsx`
- Create: `src/modules/admin/AdminPayments.tsx`
- Create: `src/modules/admin/AdminReports.tsx`
- Create: `src/modules/admin/AdminSettings.tsx`
- Create: `src/modules/super-admin/SuperAdminDashboard.tsx`
- Create: `src/modules/super-admin/UserManagement.tsx`
- Create: `src/modules/super-admin/TutorApprovals.tsx`
- Create: `src/modules/super-admin/AccessControls.tsx`
- Create: `src/modules/super-admin/AuditActivity.tsx`
- Create: `src/modules/super-admin/PlatformSettings.tsx`
- Create: `src/modules/support/SupportDashboard.tsx`
- Create: `src/modules/support/TicketDesk.tsx`

**Interfaces:**
- Produces: Complete Admin CRM, Super Admin security controls with RPC role assignment, Support ticket workspace, and Marketing/Login pages.

- [ ] **Step 1: Implement Marketing Home and Login pages with Supabase Auth + Sandbox switch**
- [ ] **Step 2: Implement Admin module workflows**
- [ ] **Step 3: Implement Super Admin module workflows (Access Controls, User Management, Audit CSV export)**
- [ ] **Step 4: Implement Support module workflows**

---

### Task 9: Main Router Integration, End-to-End Verification & Build
**Files:**
- Modify: `src/App.tsx`
- Modify: `README.md`

**Interfaces:**
- Produces: Assembled router preserving all routes, passing test suite, passing `npm run build`, and comprehensive README documentation.

- [ ] **Step 1: Update src/App.tsx with route tree and RBAC ProtectedRoute gates**
- [ ] **Step 2: Run test suite with vitest and confirm all tests pass**
- [ ] **Step 3: Run npm run build and verify zero TypeScript or bundler errors**
- [ ] **Step 4: Update README.md with complete setup instructions, migrations guide, and provider setup**
