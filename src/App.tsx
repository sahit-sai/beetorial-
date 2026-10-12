// ====================================================================
// Beetorial Main Application Router & Server-Enforced RBAC
// ====================================================================

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/authContext'
import { AppRole } from './types'

// Marketing & Auth
import { Home } from './modules/marketing/Home'
import { Login } from './modules/auth/Login'

// Parent Views
import { ParentDashboard } from './modules/parent/ParentDashboard'
import { ChildProgress } from './modules/parent/ChildProgress'
import { ScheduleView } from './modules/parent/ScheduleView'
import { PaymentsView } from './modules/parent/PaymentsView'
import { MessagesView } from './modules/parent/MessagesView'

// Student Views
import { StudentDashboard } from './modules/student/StudentDashboard'
import { StudentClasses } from './modules/student/StudentClasses'
import { HomeworkView } from './modules/student/HomeworkView'
import { MaterialsView } from './modules/student/MaterialsView'

// Teacher Views
import { TeacherDashboard } from './modules/teacher/TeacherDashboard'
import { TeacherClasses } from './modules/teacher/TeacherClasses'
import { TeacherStudents } from './modules/teacher/TeacherStudents'
import { HomeworkGrading } from './modules/teacher/HomeworkGrading'
import { AttendanceView } from './modules/teacher/AttendanceView'
import { TeacherMessages } from './modules/teacher/TeacherMessages'

// Admin Views
import { AdminDashboard } from './modules/admin/AdminDashboard'
import { StudentDirectory } from './modules/admin/StudentDirectory'
import { TutorDirectory } from './modules/admin/TutorDirectory'
import { CourseManagement } from './modules/admin/CourseManagement'
import { EnquiriesCrm } from './modules/admin/EnquiriesCrm'
import { AdminSchedule } from './modules/admin/AdminSchedule'
import { AdminPayments } from './modules/admin/AdminPayments'
import { AdminReports } from './modules/admin/AdminReports'
import { AdminSettings } from './modules/admin/AdminSettings'

// Super Admin Views
import { SuperAdminDashboard } from './modules/super-admin/SuperAdminDashboard'
import { UserManagement } from './modules/super-admin/UserManagement'
import { TutorApprovals } from './modules/super-admin/TutorApprovals'
import { AccessControls } from './modules/super-admin/AccessControls'
import { AuditActivity } from './modules/super-admin/AuditActivity'
import { PlatformSettings } from './modules/super-admin/PlatformSettings'

// Support Views
import { SupportDashboard } from './modules/support/SupportDashboard'
import { TicketDesk } from './modules/support/TicketDesk'

// Loading State
import { LoadingSpinner } from './components/common/LoadingSpinner'

/**
 * Route Gate enforcing server-loaded verified role access.
 */
const ProtectedRoute: React.FC<{
  allowedRoles: AppRole[]
  children: React.ReactElement
}> = ({ allowedRoles, children }) => {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner message="Verifying session authorization..." />
  }

  if (!user || !role) {
    return <Navigate to="/login" replace />
  }

  // Super admin can inspect all workspaces
  if (role === 'super_admin' || allowedRoles.includes(role)) {
    return children
  }

  // Fallback to role's designated home workspace
  const homePath = `/${role}`
  return <Navigate to={homePath} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Parent Workspace */}
        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/progress"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ChildProgress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/schedule"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ScheduleView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/payments"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <PaymentsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent/messages"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <MessagesView />
            </ProtectedRoute>
          }
        />

        {/* Student Workspace */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/classes"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/homework"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <HomeworkView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/materials"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <MaterialsView />
            </ProtectedRoute>
          }
        />

        {/* Teacher Workspace */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/classes"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherClasses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/students"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/homework"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <HomeworkGrading />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AttendanceView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/messages"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherMessages />
            </ProtectedRoute>
          }
        />

        {/* Admin Workspace */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StudentDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tutors"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TutorDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CourseManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/enquiries"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EnquiriesCrm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/schedule"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        {/* Super Admin Workspace */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/users"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/tutors"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <TutorApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/courses"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <CourseManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/organisations"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/subscriptions"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/revenue"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/reports"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/access-controls"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AccessControls />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/audit"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AuditActivity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/settings"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <PlatformSettings />
            </ProtectedRoute>
          }
        />

        {/* Support Workspace */}
        <Route
          path="/support"
          element={
            <ProtectedRoute allowedRoles={['support']}>
              <SupportDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/enquiries"
          element={
            <ProtectedRoute allowedRoles={['support']}>
              <EnquiriesCrm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/tickets"
          element={
            <ProtectedRoute allowedRoles={['support']}>
              <TicketDesk />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/audit"
          element={
            <ProtectedRoute allowedRoles={['support']}>
              <AuditActivity />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </AuthProvider>
  )
}
