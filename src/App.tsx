import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useEffect, lazy, Suspense } from 'react';
import { SiteNavbar } from '@/components/ui/SiteNavbar';
import RequireAuth from '@/components/RequireAuth';
import { roleHome, type Role } from '@/utils/routes';
import DashboardLayout from '@/components/DashboardLayout';
import PageLoader from '@/components/PageLoader';
import SplashScreen from '@/components/SplashScreen';
import { SidebarProvider } from '@/context/SidebarContext';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CourseView = lazy(() => import('./pages/CourseView'));
const Curriculums = lazy(() => import('./pages/Curriculums'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const AdminOverview = lazy(() => import('./pages/AdminOverview'));
const AdminTeachers = lazy(() => import('./pages/AdminTeachers'));
const AdminStudents = lazy(() => import('./pages/AdminStudents'));
const AdminCourses = lazy(() => import('./pages/AdminCourses'));
const AdminStages = lazy(() => import('./pages/AdminStages'));
const AdminSubjectDetail = lazy(() => import('./pages/AdminSubjectDetail'));
const AdminLessonForm = lazy(() => import('./pages/AdminLessonForm'));
const LessonView = lazy(() => import('./pages/LessonView'));
const AdminExams = lazy(() => import('./pages/AdminExams'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const AdminTeacherDetail = lazy(() => import('./pages/AdminTeacherDetail'));
const AdminStudentDetail = lazy(() => import('./pages/AdminStudentDetail'));
const AdminCourseDetail = lazy(() => import('./pages/AdminCourseDetail'));
const AdminExamDetail = lazy(() => import('./pages/AdminExamDetail'));
const AdminTeacherRequests = lazy(() => import('./pages/AdminTeacherRequests'));
const CourseForm = lazy(() => import('./pages/CourseForm'));
const ExamForm = lazy(() => import('./pages/ExamForm'));
const TeacherForm = lazy(() => import('./pages/TeacherForm'));
const StudentForm = lazy(() => import('./pages/StudentForm'));
const TeacherOverview = lazy(() => import('./pages/TeacherOverview'));
const CourseLessonForm = lazy(() => import('./pages/CourseLessonForm'));
const TeacherStudents = lazy(() => import('./pages/TeacherStudents'));
const TeacherExams = lazy(() => import('./pages/TeacherExams'));
const TeacherSettings = lazy(() => import('./pages/TeacherSettings'));
const TeacherStages = lazy(() => import('./pages/TeacherStages'));
const TeacherSubjects = lazy(() => import('./pages/TeacherSubjects'));
const TeacherSubjectDetail = lazy(() => import('./pages/TeacherSubjectDetail'));
const TeacherLessonForm = lazy(() => import('./pages/TeacherLessonForm'));
const StudentOverview = lazy(() => import('./pages/StudentOverview'));
const StudentSubscriptions = lazy(() => import('./pages/StudentSubscriptions'));
const StudentPaymentsRecord = lazy(() => import('./pages/StudentPaymentsRecord'));
const StudentCourses = lazy(() => import('./pages/StudentCourses'));
const StudentLearn = lazy(() => import('./pages/StudentLearn'));
const StudentSubjectDetail = lazy(() => import('./pages/StudentSubjectDetail'));
const StudentSchedule = lazy(() => import('./pages/StudentSchedule'));
const StudentGrades = lazy(() => import('./pages/StudentGrades'));
const StudentTeachers = lazy(() => import('./pages/StudentTeachers'));
const StudentTeacherProfile = lazy(() => import('./pages/StudentTeacherProfile'));

const AdminGrades = lazy(() => import('./pages/AdminGrades'));
const AdminGradeSubjects = lazy(() => import('./pages/AdminGradeSubjects'));
const StudentLearnBrowser = lazy(() => import('./pages/StudentLearnBrowser'));
const PublicStageSubjects = lazy(() => import('./pages/PublicStageSubjects'));
const PublicSubjectTeachers = lazy(() => import('./pages/PublicSubjectTeachers'));
const PublicAllStages = lazy(() => import('./pages/PublicAllStages'));
const PublicGradeSubjects = lazy(() => import('./pages/PublicGradeSubjects'));

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

function App() {
  const { i18n } = useTranslation();
  const { user, isLoading } = useAuth();
  const role = user?.role;
  const normalizedRole: Role | undefined = role === 'Admin' || role === 'Teacher' || role === 'Student' ? role : undefined;
  
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (isLoading) return <PageLoader />;

  return (
    <>
      <SplashScreen />
      <Router>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/curriculums" element={<Curriculums />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to={roleHome(normalizedRole)} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={roleHome(normalizedRole)} />} />
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
            <Navigate to={roleHome(normalizedRole)} />
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
        <Route path="/admin/courses/:courseId/lessons/new" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <CourseLessonForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/admin/courses/:courseId/lessons/:lessonId/edit" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <CourseLessonForm />
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
        <Route path="/teacher/students" element={
          <RequireAuth allowedRoles={['Teacher', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherStudents />
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
        <Route path="/teacher/subjects" element={
          <RequireAuth allowedRoles={['Teacher', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherStages />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/teacher/stages/:stageId/subjects" element={
          <RequireAuth allowedRoles={['Teacher', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherSubjects />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/teacher/subjects/:id" element={
          <RequireAuth allowedRoles={['Teacher', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherSubjectDetail />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/teacher/subjects/:subjectId/units/:unitId/lessons/new" element={
          <RequireAuth allowedRoles={['Teacher', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherLessonForm />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/teacher/subjects/:subjectId/units/:unitId/lessons/:lessonId/edit" element={
          <RequireAuth allowedRoles={['Teacher', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <TeacherLessonForm />
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
        <Route path="/student/teachers" element={
          <RequireAuth allowedRoles={['Student', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentTeachers />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />
        <Route path="/student/teachers/:id" element={
          <RequireAuth allowedRoles={['Student', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentTeacherProfile />
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

        {/* ── New generic-platform routes ─────────────────────────── */}

        {/* Admin: Grade management */}
        <Route path="/admin/stages/:stageId/grades" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminGrades />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />

        {/* Admin: Grade-scoped subject management */}
        <Route path="/admin/stages/:stageId/grades/:gradeId/subjects" element={
          <RequireAuth allowedRoles={['Admin']}>
            <Layout>
              <DashboardLayout>
                <AdminGradeSubjects />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />

        {/* Public learn browser (also accessible via /learn) */}
        <Route path="/learn" element={
          <RequireAuth allowedRoles={['Student', 'Teacher', 'Admin']}>
            <Layout>
              <DashboardLayout>
                <StudentLearnBrowser />
              </DashboardLayout>
            </Layout>
          </RequireAuth>
        } />

        {/* Alias: /courses → /learn (backward compat redirect) */}
        <Route path="/courses" element={<Navigate to="/learn" replace />} />

        {/* ──────────────────────────────────────────────────────────
            PUBLIC: Home Page → Stages Explorer flow
            No auth required; accessible directly from the landing page.
            ────────────────────────────────────────────────────────── */}

        {/* All stages directory (from "View More" on landing) */}
        <Route path="/stages" element={<PublicAllStages />} />

        {/* Stage detail → all grades within that stage (from stage card on landing) */}
        <Route path="/stages/:stageId" element={<PublicStageSubjects />} />

        {/* Grade detail → subjects for that grade (click grade from stage page) */}
        <Route path="/stages/:stageId/grades/:gradeId" element={<PublicGradeSubjects />} />

        {/* Subject detail → teachers filtered by stage/grade/subject (click subject from grade page) */}
        <Route
          path="/stages/:stageId/grades/:gradeId/subjects/:subjectId"
          element={<PublicSubjectTeachers />}
        />


      </Routes>
      </Suspense>
    </Router>
    </>
  );
}

export default App;
