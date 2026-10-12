-- ====================================================================
-- Beetorial Local Development & Verification Seed Data
-- Provides verified accounts and sample records across all 6 roles
-- ====================================================================

-- 1. Organizations
insert into public.organisations (id, name, slug, status)
values
  ('11111111-1111-1111-1111-111111111111', 'Beetorial Academy Main', 'beetorial-main', 'active')
on conflict (slug) do nothing;

-- 2. Mock profiles (corresponds to local development seeds)
-- Note: When connecting to Supabase Auth, these UUIDs match auth.users.id
insert into public.profiles (id, full_name, role, avatar_url, phone)
values
  ('a0000000-0000-0000-0000-000000000001', 'Ananya Raman (Parent)', 'parent', null, '+91 98765 43210'),
  ('b0000000-0000-0000-0000-000000000002', 'Aditi Raman (Student)', 'student', null, '+91 98765 43211'),
  ('c0000000-0000-0000-0000-000000000003', 'Ms. Priya Sharma (Teacher)', 'teacher', null, '+91 98765 43212'),
  ('d0000000-0000-0000-0000-000000000004', 'Vikram Patel (Admin)', 'admin', null, '+91 98765 43213'),
  ('e0000000-0000-0000-0000-000000000005', 'Kavita Sundaram (Super Admin)', 'super_admin', null, '+91 98765 43214'),
  ('f0000000-0000-0000-0000-000000000006', 'Rohan Verma (Support)', 'support', null, '+91 98765 43215')
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role;

-- 3. Parent-Student Link
insert into public.student_parents (student_id, parent_id, relationship)
values
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Mother')
on conflict (student_id, parent_id) do nothing;

-- 4. Sample Courses
insert into public.courses (id, organisation_id, title, subject, grade_level, description, status, created_by)
values
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Mastering Fractions & Ratios', 'Mathematics', 'Grade 8', 'Foundational clarity in fractional arithmetic and ratio problem solving.', 'published', 'c0000000-0000-0000-0000-000000000003'),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Cell Biology & Living Systems', 'Science', 'Grade 8', 'Interactive understanding of cellular structures and organisms.', 'published', 'c0000000-0000-0000-0000-000000000003'),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Advanced Algebraic Expressions', 'Mathematics', 'Grade 9', 'Linear equations and factorization methods.', 'draft', 'c0000000-0000-0000-0000-000000000003')
on conflict (id) do nothing;

-- 5. Sample Scheduled Classes
insert into public.classes (id, course_id, teacher_id, student_id, starts_at, ends_at, meeting_url, meeting_provider, status)
values
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', now() + interval '1 day', now() + interval '1 day 45 minutes', 'https://meet.google.com/demo-beetorial-class', 'google_meet', 'scheduled'),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222222', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', now() - interval '2 days', now() - interval '2 days' + interval '45 minutes', null, 'unconfigured', 'completed')
on conflict (id) do nothing;

-- 6. Class Attendance
insert into public.class_attendance (class_id, student_id, status, notes, recorded_by)
values
  ('33333333-3333-3333-3333-333333333332', 'b0000000-0000-0000-0000-000000000002', 'present', 'Active engagement and good question asking during session.', 'c0000000-0000-0000-0000-000000000003')
on conflict (class_id, student_id) do nothing;

-- 7. Homework & Submissions
insert into public.homework (id, class_id, title, instructions, due_at, created_by)
values
  ('44444444-4444-4444-4444-444444444441', '33333333-3333-3333-3333-333333333331', 'Fractions Practice Sheet #4', 'Complete problems 1 to 12 in the workbook. Submit photo or PDF.', now() + interval '3 days', 'c0000000-0000-0000-0000-000000000003')
on conflict (id) do nothing;

insert into public.homework_submissions (id, homework_id, student_id, submission_url, notes, score, feedback)
values
  ('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 'b0000000-0000-0000-0000-000000000002', 'https://beetorial-docs.example/submissions/hw4.pdf', 'Completed all questions.', 92, 'Excellent work on the mixed numbers problem.')
on conflict (homework_id, student_id) do nothing;

-- 8. Sample Enquiries
insert into public.enquiries (id, parent_name, parent_email, parent_phone, student_grade, subject, notes, status, assigned_to)
values
  ('66666666-6666-6666-6666-666666666661', 'Ananya R.', 'ananya@example.com', '+91 98765 11111', 'Grade 8', 'Mathematics', 'Needs help with ratio word problems and algebra foundations.', 'new', 'd0000000-0000-0000-0000-000000000004'),
  ('66666666-6666-6666-6666-666666666662', 'Rahul K.', 'rahul@example.com', '+91 98765 22222', 'Grade 6', 'Science', 'Exploring tutoring for weekly science concept reinforcement.', 'contacted', 'd0000000-0000-0000-0000-000000000004'),
  ('66666666-6666-6666-6666-666666666663', 'Meera S.', 'meera@example.com', '+91 98765 33333', 'Grade 5', 'English', 'Trial class booked for reading comprehension and writing.', 'trial_booked', 'f0000000-0000-0000-0000-000000000006')
on conflict (id) do nothing;

-- 9. Sample Payments
insert into public.payments (id, payer_id, amount_paise, currency, provider, provider_reference, description, status, is_verified)
values
  ('77777777-7777-7777-7777-777777777771', 'a0000000-0000-0000-0000-000000000001', 450000, 'INR', 'sandbox', 'PAY_DEMO_1042', 'Monthly Tutoring Package (8 Sessions)', 'paid', true),
  ('77777777-7777-7777-7777-777777777772', 'a0000000-0000-0000-0000-000000000001', 250000, 'INR', 'sandbox', 'PAY_DEMO_1043', 'Science Lab Concept Prep Pack', 'pending', false)
on conflict (id) do nothing;

-- 10. Sample Support Tickets
insert into public.support_tickets (id, user_id, subject, description, priority, status, assigned_to)
values
  ('88888888-8888-8888-8888-888888888881', 'a0000000-0000-0000-0000-000000000001', 'Rescheduling Tuesday session', 'Need to shift Tuesday 5 PM session to Wednesday due to school exam.', 'medium', 'open', 'f0000000-0000-0000-0000-000000000006')
on conflict (id) do nothing;

-- 11. Initial Audit Log Entry
insert into public.audit_logs (actor_id, action, resource_type, resource_id, metadata)
values
  ('e0000000-0000-0000-0000-000000000005', 'SYSTEM_INITIALIZE', 'schema', 'v1.0', '{"environment": "development", "seeded": true}'::jsonb);
