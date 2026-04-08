import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseView from './pages/CourseView';
import Curriculums from './pages/Curriculums';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';
import VerifyEmail from './pages/VerifyEmail';
import AdminOverview from './pages/AdminOverview';
import AdminTeachers from './pages/AdminTeachers';
import AdminStudents from './pages/AdminStudents';
import AdminCourses from './pages/AdminCourses';
import AdminSubjects from './pages/AdminSubjects';
import AdminStages from './pages/AdminStages';
import AdminSubjectDetail from './pages/AdminSubjectDetail';
import AdminLessonForm from './pages/AdminLessonForm';
import LessonView from './pages/LessonView';
import AdminExams from './pages/AdminExams';
import AdminPayments from './pages/AdminPayments';
import AdminTeacherDetail from './pages/AdminTeacherDetail';
import AdminStudentDetail from './pages/AdminStudentDetail';
import AdminCourseDetail from './pages/AdminCourseDetail';
import AdminExamDetail from './pages/AdminExamDetail';
import AdminTeacherRequests from './pages/AdminTeacherRequests';
import CourseForm from './pages/CourseForm';
import ExamForm from './pages/ExamForm';
import TeacherForm from './pages/TeacherForm';
import StudentForm from './pages/StudentForm';
import TeacherOverview from './pages/TeacherOverview';
import TeacherCourses from './pages/TeacherCourses';
import TeacherExams from './pages/TeacherExams';
import TeacherSettings from './pages/TeacherSettings';
import StudentOverview from './pages/StudentOverview';
import StudentSubscriptions from './pages/StudentSubscriptions';
import StudentPaymentsRecord from './pages/StudentPaymentsRecord';
import StudentCourses from './pages/StudentCourses';
import StudentLearn from './pages/StudentLearn';
import StudentSubjectDetail from './pages/StudentSubjectDetail';
import StudentSchedule from './pages/StudentSchedule';
import StudentGrades from './pages/StudentGrades';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import RequireAuth, { roleHome } from '@/components/RequireAuth';
import DashboardLayout from '@/components/DashboardLayout';
import PageLoader from '@/components/PageLoader';
import SplashScreen from '@/components/SplashScreen';
import { SidebarProvider } from '@/context/SidebarContext';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-200 flex flex-col">
        <SiteNavbar variant="app" position="fixed" />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

import Landing from './pages/Landing';

function App() {
  const { i18n } = useTranslation();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (isLoading) return <PageLoader />;

  return (
    <>
      <SplashScreen />
      <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/curriculums" element={<Curriculums />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to={roleHome(user?.role)} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={roleHome(user?.role)} />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/change-password" element={
          <RequireAuth>
            <ChangePassword />
          </RequireAuth>
        } />
        <Route path="/dashboard" element={
          <RequireAuth>
            <Navigate to={roleHome(user?.role)} />
          </RequireAuth>
        } />
        <Route path="/admin" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminOverview />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/teachers" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminTeachers />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/teachers/new" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/teachers/:id/edit" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/teachers/:id" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminTeacherDetail />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/teacher-requests" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminTeacherRequests />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/students" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminStudents />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/students/new" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/students/:id/edit" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/students/:id" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminStudentDetail />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/courses" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminCourses />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/courses/new" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <CourseForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/courses/:id/edit" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <CourseForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/courses/:id" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminCourseDetail />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/exams" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminExams />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/exams/new" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <ExamForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/exams/:id/edit" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <ExamForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/exams/:id" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminExamDetail />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/payments" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminPayments />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/teacher" element={
          <RequireAuth allowedRoles={['Teacher', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherOverview />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/teacher/courses" element={
          <RequireAuth allowedRoles={['Teacher', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherCourses />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/teacher/exams" element={
          <RequireAuth allowedRoles={['Teacher', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherExams />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/teacher/settings" element={
          <RequireAuth allowedRoles={['Teacher', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherSettings />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/student" element={
          <RequireAuth allowedRoles={['Student', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentOverview />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/student/subscriptions" element={
          <RequireAuth allowedRoles={['Student', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentSubscriptions />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/student/payments-record" element={
          <RequireAuth allowedRoles={['Student', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentPaymentsRecord />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/student/courses" element={
          <RequireAuth allowedRoles={['Student', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentCourses />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/student/learn" element={
          <RequireAuth allowedRoles={['Student', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentLearn />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/student/subjects/:id" element={
          <RequireAuth allowedRoles={['Student', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentSubjectDetail />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/student/schedule" element={
          <RequireAuth allowedRoles={['Student', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentSchedule />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/student/grades" element={
          <RequireAuth allowedRoles={['Student', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentGrades />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/courses/:id" element={
          <RequireAuth allowedRoles={['Student', 'Teacher', 'Admin']}>
            <Layout><CourseView /></Layout>
          </RequireAuth>
        } />
        <Route path="/admin/subjects" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminStages />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/stages/:stageId/subjects" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminSubjects />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/subjects/:id" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminSubjectDetail />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/subjects/:subjectId/units/:unitId/lessons/new" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminLessonForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/subjects/:subjectId/units/:unitId/lessons/:lessonId/edit" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminLessonForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/lesson/:lessonId" element={
          <RequireAuth>
            <Layout>
              <DashboardLayout>
                <LessonView />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
      </Routes>
    </Router>
    </>
  );
}

export default App;
