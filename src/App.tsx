import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useTranslation } from "react-i18next";
import { useEffect, lazy, Suspense } from "react";
import { SiteNavbar } from "@/components/ui/SiteNavbar";
import RequireAuth from "@/components/RequireAuth";
import { roleHome, type Role } from "@/utils/routes";
import DashboardLayout from "@/components/DashboardLayout";
import PageLoader from "@/components/PageLoader";
import SplashScreen from "@/components/SplashScreen";
import { SidebarProvider } from "@/context/SidebarContext";
import { PlatformConfigProvider } from "@/context/PlatformConfigContext";

const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const AdminOverview = lazy(() => import("./pages/AdminOverview"));
const AdminTeachers = lazy(() => import("./pages/AdminTeachers"));
const AdminStudents = lazy(() => import("./pages/AdminStudents"));
const AdminStages = lazy(() => import("./pages/AdminStages"));
const AdminSubjectDetail = lazy(() => import("./pages/AdminSubjectDetail"));
const AdminLessonForm = lazy(() => import("./pages/AdminLessonForm"));
const LessonView = lazy(() => import("./pages/LessonView"));
const AdminPayments = lazy(() => import("./pages/AdminPayments"));
const AdminTeacherDetail = lazy(() => import("./pages/AdminTeacherDetail"));
const AdminStudentDetail = lazy(() => import("./pages/AdminStudentDetail"));
const AdminTeacherRequests = lazy(() => import("./pages/AdminTeacherRequests"));
const TeacherForm = lazy(() => import("./pages/TeacherForm"));
const StudentForm = lazy(() => import("./pages/StudentForm"));
const TeacherOverview = lazy(() => import("./pages/TeacherOverview"));
const TeacherStudents = lazy(() => import("./pages/TeacherStudents"));
const TeacherPayments = lazy(() => import("./pages/TeacherPayments"));
const TeacherProfileEdit = lazy(() => import("./pages/TeacherProfileEdit"));
const TeacherStages = lazy(() => import("./pages/TeacherStages"));
const TeacherSubjects = lazy(() => import("./pages/TeacherSubjects"));
const TeacherSubjectDetail = lazy(() => import("./pages/TeacherSubjectDetail"));
const TeacherLessonForm = lazy(() => import("./pages/TeacherLessonForm"));
const StudentOverview = lazy(() => import("./pages/StudentOverview"));
const StudentPaymentsRecord = lazy(
  () => import("./pages/StudentPaymentsRecord"),
);
const StudentLearn = lazy(() => import("./pages/StudentLearn"));
const StudentSubjectDetail = lazy(() => import("./pages/StudentSubjectDetail"));
const StudentSchedule = lazy(() => import("./pages/StudentSchedule"));
const LiveClassroomPage = lazy(() => import("./pages/LiveClassroomPage"));
const SessionLobbyPage = lazy(() => import("./pages/SessionLobbyPage"));

const AdminGrades = lazy(() => import("./pages/AdminGrades"));
const AdminPlatformConfig = lazy(() => import("./pages/AdminPlatformConfig"));
const AdminAuditLog = lazy(() => import("./pages/AdminAuditLog"));
const AdminTeacherPayouts = lazy(() => import("./pages/AdminTeacherPayouts"));
const TeacherEarnings = lazy(() => import("./pages/TeacherEarnings"));
const TeacherExams = lazy(() => import("./pages/TeacherExams"));
const TeacherExamForm = lazy(() => import("./pages/TeacherExamForm"));
const TeacherExamSubmissions = lazy(() => import("./pages/TeacherExamSubmissions"));
const StudentExams = lazy(() => import("./pages/StudentExams"));
const ExamView = lazy(() => import("./pages/ExamView"));
const AdminGradeSubjects = lazy(() => import("./pages/AdminGradeSubjects"));
const StudentLearnBrowser = lazy(() => import("./pages/StudentLearnBrowser"));
const StudentSubjectTeachers = lazy(
  () => import("./pages/StudentSubjectTeachers"),
);
const StudentQuizHistory = lazy(() => import("./pages/StudentQuizHistory"));
const PublicStageSubjects = lazy(() => import("./pages/PublicStageSubjects"));
const PublicSubjectTeachers = lazy(
  () => import("./pages/PublicSubjectTeachers"),
);
const PublicTeacherProfile = lazy(
  () => import("./pages/PublicTeacherProfile"),
);
const PublicAllStages = lazy(() => import("./pages/PublicAllStages"));
const PublicGradeSubjects = lazy(() => import("./pages/PublicGradeSubjects"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-violet-200 flex flex-col">
        <SiteNavbar variant="app" position="fixed" />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}

function App() {
  const { i18n } = useTranslation();
  const { user, isLoading } = useAuth();
  const role = user?.role;
  const normalizedRole: Role | undefined =
    role === "Admin" || role === "Teacher" || role === "Student"
      ? role
      : undefined;

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (isLoading) return <PageLoader />;

  return (
    <PlatformConfigProvider>
      <>
        <SplashScreen />
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/curriculums"
                element={<Navigate to="/stages" replace />}
              />
              <Route
                path="/login"
                element={
                  !user ? <Login /> : <Navigate to={roleHome(normalizedRole)} />
                }
              />
              <Route
                path="/register"
                element={
                  !user ? (
                    <Register />
                  ) : (
                    <Navigate to={roleHome(normalizedRole)} />
                  )
                }
              />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route
                path="/change-password"
                element={
                  <RequireAuth>
                    <ChangePassword />
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Navigate to={roleHome(normalizedRole)} />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminOverview />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/teachers"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminTeachers />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/teachers/new"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherForm />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/teachers/:id/edit"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherForm />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/teachers/:id"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminTeacherDetail />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/teacher-requests"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminTeacherRequests />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminStudents />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/students/new"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentForm />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/students/:id/edit"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentForm />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/students/:id"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminStudentDetail />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminPayments />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherOverview />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherStudents />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/payments"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherPayments />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/earnings"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherEarnings />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/exams"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherExams />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/exams/new"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherExamForm />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/exams/:examId/submissions"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherExamSubmissions />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/profile/edit"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherProfileEdit />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/subjects"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherStages />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/stages/:stageId/subjects"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherSubjects />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/subjects/:id"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherSubjectDetail />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/subjects/:subjectId/units/:unitId/lessons/new"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherLessonForm />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/teacher/subjects/:subjectId/units/:unitId/lessons/:lessonId/edit"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <TeacherLessonForm />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/student"
                element={
                  <RequireAuth allowedRoles={["Student"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentOverview />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/student/payments-record"
                element={
                  <RequireAuth allowedRoles={["Student"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentPaymentsRecord />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/student/learn"
                element={
                  <RequireAuth allowedRoles={["Student"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentLearn />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/student/subjects/:subjectId"
                element={
                  <RequireAuth allowedRoles={["Student"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentSubjectTeachers />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              {/* Teacher selection for a subject */}
              <Route
                path="/student/subjects/:subjectId/teachers"
                element={
                  <RequireAuth allowedRoles={["Student"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentSubjectTeachers />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              {/* Teacher-scoped subject course view */}
              <Route
                path="/student/subjects/:subjectId/teachers/:teacherId"
                element={
                  <RequireAuth allowedRoles={["Student"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentSubjectDetail />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/student/quiz-history"
                element={
                  <RequireAuth allowedRoles={["Student"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentQuizHistory />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/student/exams"
                element={
                  <RequireAuth allowedRoles={["Student"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentExams />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/student/schedule"
                element={
                  <RequireAuth allowedRoles={["Student"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentSchedule />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/subjects"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminStages />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/subjects/:id"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminSubjectDetail />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/subjects/:subjectId/units/:unitId/lessons/new"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminLessonForm />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/subjects/:subjectId/units/:unitId/lessons/:lessonId/edit"
                element={
                  <RequireAuth allowedRoles={["Teacher"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminLessonForm />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/lesson/:lessonId"
                element={
                  <RequireAuth>
                    <Layout>
                      <DashboardLayout>
                        <LessonView />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/exams/:examId"
                element={
                  <RequireAuth>
                    <Layout>
                      <DashboardLayout>
                        <ExamView />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />

              {/* ── New generic-platform routes ─────────────────────────── */}

              {/* Admin: Grade management */}
              <Route
                path="/admin/stages/:stageId/grades"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminGrades />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />

              {/* Admin: Grade-scoped subject management */}
              <Route
                path="/admin/stages/:stageId/grades/:gradeId/subjects"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminGradeSubjects />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />

              {/* Admin: Platform configuration */}
              <Route
                path="/admin/platform-config"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminPlatformConfig />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/audit-log"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminAuditLog />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/teacher-payouts"
                element={
                  <RequireAuth allowedRoles={["Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <AdminTeacherPayouts />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />

              {/* Public learn browser (also accessible via /learn) */}
              <Route
                path="/learn"
                element={
                  <RequireAuth allowedRoles={["Student", "Teacher", "Admin"]}>
                    <Layout>
                      <DashboardLayout>
                        <StudentLearnBrowser />
                      </DashboardLayout>
                    </Layout>
                  </RequireAuth>
                }
              />

              {/* Alias: /courses → /learn (backward compat redirect) */}
              <Route
                path="/courses"
                element={<Navigate to="/learn" replace />}
              />

              {/* ──────────────────────────────────────────────────────────
            PUBLIC: Home Page → Stages Explorer flow
            No auth required; accessible directly from the landing page.
            ────────────────────────────────────────────────────────── */}

              {/* All stages directory (from "View More" on landing) */}
              <Route path="/stages" element={<PublicAllStages />} />

              {/* Stage detail → all grades within that stage (from stage card on landing) */}
              <Route
                path="/stages/:stageId"
                element={<PublicStageSubjects />}
              />

              {/* Grade detail → subjects for that grade (click grade from stage page) */}
              <Route
                path="/stages/:stageId/grades/:gradeId"
                element={<PublicGradeSubjects />}
              />

              {/* Subject detail → teachers filtered by stage/grade/subject (click subject from grade page) */}
              <Route
                path="/stages/:stageId/grades/:gradeId/subjects/:subjectId"
                element={<PublicSubjectTeachers />}
              />

              {/* Teacher profile → public preview of a teacher's content (first lesson per unit free, no auth required) */}
              <Route
                path="/stages/:stageId/grades/:gradeId/subjects/:subjectId/teachers/:teacherId"
                element={<PublicTeacherProfile />}
              />

              {/* ──────────────────────────────────────────────────────────
            LIVE CLASSROOM: WebRTC-based virtual classroom
            Requires authentication. Accessible to teachers and students.
            ────────────────────────────────────────────────────────── */}

              {/* Session Lobby - Pre-join device testing and waiting room */}
              <Route
                path="/live-session/:roomId/lobby"
                element={
                  <RequireAuth allowedRoles={["Teacher", "Student"]}>
                    <SessionLobbyPage />
                  </RequireAuth>
                }
              />

              {/* Live Classroom - Active session with video, whiteboard, chat */}
              <Route
                path="/live-session/:roomId"
                element={
                  <RequireAuth allowedRoles={["Teacher", "Student"]}>
                    <LiveClassroomPage />
                  </RequireAuth>
                }
              />

              {/* Catch-all — any unmatched URL gets a real 404 instead of a blank page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </>
    </PlatformConfigProvider>
  );
}

export default App;
