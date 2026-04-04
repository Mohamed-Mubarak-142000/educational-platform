// ─────────────────────────────────────────────────────────────────
//  Mock Data — Biology Educational Platform
//  Matches the backend Mongoose model shapes as closely as possible.
//  When the real backend is restored, only the API files need to change.
// ─────────────────────────────────────────────────────────────────

export type Role = 'Admin' | 'Teacher' | 'Student';
export type UserStatus = 'Active' | 'Inactive';
export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected';
export type PaymentMethod = 'Vodafone Cash' | 'InstaPay';
export type SubscriptionStatus = 'Active' | 'Inactive' | 'Cancelled';
export type QuestionType = 'Multiple Choice' | 'True/False' | 'Short Answer';

// ── Users ────────────────────────────────────────────────────────

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  subject?: string;
  stageId?: string;            // for students
  subscribeLiveLessons?: boolean; // student live-lesson subscription
  parentEmail?: string;        // parent contact
  status: UserStatus;
  profileImage?: string;
  isVerified: boolean;
  mustChangePassword: boolean;
  createdAt: string;
}

// Credentials are kept separately and never sent to callers
export const MOCK_CREDENTIALS: Record<string, string> = {
  'admin@biology.com': 'Admin@123',
  'dr.ahmed@biology.com': 'Teacher@123',
  'dr.sarah@biology.com': 'Teacher@123',
  'student1@biology.com': 'Student@123',
  'student2@biology.com': 'Student@123',
  'student3@biology.com': 'Student@123',
  'student4@biology.com': 'Student@123',
};

export const MOCK_USERS: MockUser[] = [
  {
    _id: 'user-admin-001',
    name: 'Platform Admin',
    email: 'admin@biology.com',
    role: 'Admin',
    phone: '+20 100 000 0001',
    status: 'Active',
    isVerified: true,
    mustChangePassword: false,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'user-teacher-001',
    name: 'Dr. Ahmed Hassan',
    email: 'dr.ahmed@biology.com',
    role: 'Teacher',
    phone: '+20 100 000 0002',
    subject: 'Cell Biology & Genetics',
    status: 'Active',
    isVerified: true,
    mustChangePassword: false,
    createdAt: '2024-01-05T00:00:00.000Z',
  },
  {
    _id: 'user-teacher-002',
    name: 'Dr. Sarah Mostafa',
    email: 'dr.sarah@biology.com',
    role: 'Teacher',
    phone: '+20 100 000 0003',
    subject: 'Human Anatomy & Microbiology',
    status: 'Active',
    isVerified: true,
    mustChangePassword: false,
    createdAt: '2024-01-06T00:00:00.000Z',
  },
  {
    _id: 'user-student-001',
    name: 'Ali Mohamed',
    email: 'student1@biology.com',
    role: 'Student',
    phone: '+20 100 000 0010',
    stageId: 'stage-002',
    status: 'Active',
    isVerified: true,
    mustChangePassword: false,
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    _id: 'user-student-002',
    name: 'Nour Khalil',
    email: 'student2@biology.com',
    role: 'Student',
    phone: '+20 100 000 0011',
    stageId: 'stage-002',
    status: 'Active',
    isVerified: true,
    mustChangePassword: false,
    createdAt: '2024-02-05T00:00:00.000Z',
  },
  {
    _id: 'user-student-003',
    name: 'Omar Youssef',
    email: 'student3@biology.com',
    role: 'Student',
    phone: '+20 100 000 0012',
    stageId: 'stage-003',
    status: 'Inactive',
    isVerified: true,
    mustChangePassword: false,
    createdAt: '2024-02-10T00:00:00.000Z',
  },
  {
    _id: 'user-student-004',
    name: 'Layla Ibrahim',
    email: 'student4@biology.com',
    role: 'Student',
    phone: '+20 100 000 0013',
    stageId: 'stage-003',
    status: 'Active',
    isVerified: true,
    mustChangePassword: false,
    createdAt: '2024-02-15T00:00:00.000Z',
  },
];

// ── Courses ───────────────────────────────────────────────────────

export interface MockCourse {
  _id: string;
  title: string;
  description: string;
  teacherId: { _id: string; name: string } | string;
  price: number;
  thumbnail?: string;
  createdAt: string;
}

export const MOCK_COURSES: MockCourse[] = [
  {
    _id: 'course-001',
    title: 'Cell Biology Fundamentals',
    description:
      'A comprehensive introduction to the building blocks of life. Learn about cell structure, organelles, cell division, and cellular processes including respiration and photosynthesis.',
    teacherId: { _id: 'user-teacher-001', name: 'Dr. Ahmed Hassan' },
    price: 299,
    createdAt: '2024-03-01T00:00:00.000Z',
  },
  {
    _id: 'course-002',
    title: 'Human Anatomy',
    description:
      'Explore the structure and function of the human body from head to toe. Covers all major organ systems: skeletal, muscular, cardiovascular, respiratory, and more.',
    teacherId: { _id: 'user-teacher-002', name: 'Dr. Sarah Mostafa' },
    price: 349,
    createdAt: '2024-03-05T00:00:00.000Z',
  },
  {
    _id: 'course-003',
    title: 'Genetics & Evolution',
    description:
      'Dive into the mechanisms of heredity and the principles of evolution. Topics include Mendelian genetics, molecular genetics, natural selection, and speciation.',
    teacherId: { _id: 'user-teacher-001', name: 'Dr. Ahmed Hassan' },
    price: 329,
    createdAt: '2024-03-10T00:00:00.000Z',
  },
  {
    _id: 'course-004',
    title: 'Microbiology Basics',
    description:
      'An introduction to the microbial world: bacteria, viruses, fungi, and protozoa. Understand infection, immunity, and the role of microorganisms in health and disease.',
    teacherId: { _id: 'user-teacher-002', name: 'Dr. Sarah Mostafa' },
    price: 279,
    createdAt: '2024-03-15T00:00:00.000Z',
  },
];

// ── Sections ──────────────────────────────────────────────────────

export interface MockSection {
  _id: string;
  courseId: string;
  title: string;
  order: number;
  createdAt: string;
}

export const MOCK_SECTIONS: MockSection[] = [
  // Cell Biology
  { _id: 'sec-001', courseId: 'course-001', title: 'Introduction to Cells', order: 1, createdAt: '2024-03-02T00:00:00.000Z' },
  { _id: 'sec-002', courseId: 'course-001', title: 'Cell Organelles', order: 2, createdAt: '2024-03-02T00:00:00.000Z' },
  { _id: 'sec-003', courseId: 'course-001', title: 'Cell Division', order: 3, createdAt: '2024-03-02T00:00:00.000Z' },
  // Human Anatomy
  { _id: 'sec-004', courseId: 'course-002', title: 'The Skeletal System', order: 1, createdAt: '2024-03-06T00:00:00.000Z' },
  { _id: 'sec-005', courseId: 'course-002', title: 'The Muscular System', order: 2, createdAt: '2024-03-06T00:00:00.000Z' },
  // Genetics
  { _id: 'sec-006', courseId: 'course-003', title: 'Mendelian Genetics', order: 1, createdAt: '2024-03-11T00:00:00.000Z' },
  { _id: 'sec-007', courseId: 'course-003', title: 'Molecular Genetics', order: 2, createdAt: '2024-03-11T00:00:00.000Z' },
];

// ── Lessons ───────────────────────────────────────────────────────

export interface MockLesson {
  _id: string;
  sectionId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  imageUrl?: string;
  modelUrl?: string;
  order: number;
  duration?: number;
  createdAt: string;
}

export const MOCK_LESSONS: MockLesson[] = [
  // Section 1: Introduction to Cells
  { _id: 'lesson-001', sectionId: 'sec-001', title: 'What is a Cell?', description: 'The fundamental unit of life.', order: 1, duration: 25, createdAt: '2024-03-03T00:00:00.000Z' },
  { _id: 'lesson-002', sectionId: 'sec-001', title: 'Prokaryotic vs Eukaryotic Cells', description: 'Key differences between cell types.', order: 2, duration: 30, createdAt: '2024-03-03T00:00:00.000Z' },
  { _id: 'lesson-003', sectionId: 'sec-001', title: 'Cell Theory', description: 'Historical development and the three tenets.', order: 3, duration: 20, createdAt: '2024-03-03T00:00:00.000Z' },
  // Section 2: Cell Organelles
  { _id: 'lesson-004', sectionId: 'sec-002', title: 'The Nucleus', description: 'Control centre of the cell.', order: 1, duration: 35, createdAt: '2024-03-04T00:00:00.000Z' },
  { _id: 'lesson-005', sectionId: 'sec-002', title: 'Mitochondria & Energy', description: 'ATP production and cellular respiration.', order: 2, duration: 40, createdAt: '2024-03-04T00:00:00.000Z' },
  // Section 4: Skeletal System
  { _id: 'lesson-006', sectionId: 'sec-004', title: 'Bones and Cartilage', description: 'Structure and composition of the skeletal system.', order: 1, duration: 45, createdAt: '2024-03-07T00:00:00.000Z' },
];

// ── Quizzes / Exams ───────────────────────────────────────────────

export interface MockQuiz {
  _id: string;
  lessonId: string;
  title: string;
  timeLimit: number;
  createdAt: string;
}

export const MOCK_QUIZZES: MockQuiz[] = [
  { _id: 'quiz-001', lessonId: 'lesson-001', title: 'Cell Basics Quiz', timeLimit: 15, createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'quiz-002', lessonId: 'lesson-004', title: 'Cell Organelles Quiz', timeLimit: 20, createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'quiz-003', lessonId: 'lesson-006', title: 'Anatomy Midterm', timeLimit: 45, createdAt: '2024-03-08T00:00:00.000Z' },
  { _id: 'quiz-004', lessonId: 'lesson-002', title: 'Prokaryote & Eukaryote Assessment', timeLimit: 25, createdAt: '2024-03-09T00:00:00.000Z' },
];

// ── Questions ─────────────────────────────────────────────────────

export interface MockQuestion {
  _id: string;
  quizId: string;
  question: string;
  type: QuestionType;
  createdAt: string;
}

export const MOCK_QUESTIONS: MockQuestion[] = [
  { _id: 'q-001', quizId: 'quiz-001', question: 'What is the powerhouse of the cell?', type: 'Multiple Choice', createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'q-002', quizId: 'quiz-001', question: 'All cells have a nucleus.', type: 'True/False', createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'q-003', quizId: 'quiz-001', question: 'Name the organelle that carries out protein synthesis.', type: 'Short Answer', createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'q-004', quizId: 'quiz-002', question: 'Which organelle contains the cell\'s DNA?', type: 'Multiple Choice', createdAt: '2024-03-05T00:00:00.000Z' },
];

// ── Answers ───────────────────────────────────────────────────────

export interface MockAnswer {
  _id: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
  createdAt: string;
}

export const MOCK_ANSWERS: MockAnswer[] = [
  { _id: 'ans-001', questionId: 'q-001', answerText: 'Mitochondria', isCorrect: true, createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'ans-002', questionId: 'q-001', answerText: 'Nucleus', isCorrect: false, createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'ans-003', questionId: 'q-001', answerText: 'Ribosome', isCorrect: false, createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'ans-004', questionId: 'q-001', answerText: 'Golgi Apparatus', isCorrect: false, createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'ans-005', questionId: 'q-002', answerText: 'False', isCorrect: true, createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'ans-006', questionId: 'q-002', answerText: 'True', isCorrect: false, createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'ans-007', questionId: 'q-004', answerText: 'Nucleus', isCorrect: true, createdAt: '2024-03-05T00:00:00.000Z' },
  { _id: 'ans-008', questionId: 'q-004', answerText: 'Mitochondria', isCorrect: false, createdAt: '2024-03-05T00:00:00.000Z' },
];

// ── Results ───────────────────────────────────────────────────────

export interface MockResult {
  _id: string;
  studentId: { _id: string; name: string; email: string };
  quizId: string;
  score: number;
  createdAt: string;
}

export const MOCK_RESULTS: MockResult[] = [
  {
    _id: 'result-001',
    studentId: { _id: 'user-student-001', name: 'Ali Mohamed', email: 'student1@biology.com' },
    quizId: 'quiz-001',
    score: 85,
    createdAt: '2024-03-10T00:00:00.000Z',
  },
  {
    _id: 'result-002',
    studentId: { _id: 'user-student-002', name: 'Nour Khalil', email: 'student2@biology.com' },
    quizId: 'quiz-001',
    score: 90,
    createdAt: '2024-03-10T00:00:00.000Z',
  },
  {
    _id: 'result-003',
    studentId: { _id: 'user-student-001', name: 'Ali Mohamed', email: 'student1@biology.com' },
    quizId: 'quiz-003',
    score: 78,
    createdAt: '2024-03-12T00:00:00.000Z',
  },
];

// ── Enrollments ───────────────────────────────────────────────────

export interface MockEnrollment {
  _id: string;
  studentId: string;
  courseId: string;
  createdAt: string;
}

export const MOCK_ENROLLMENTS: MockEnrollment[] = [
  { _id: 'enroll-001', studentId: 'user-student-001', courseId: 'course-001', createdAt: '2024-03-10T00:00:00.000Z' },
  { _id: 'enroll-002', studentId: 'user-student-001', courseId: 'course-002', createdAt: '2024-03-11T00:00:00.000Z' },
  { _id: 'enroll-003', studentId: 'user-student-002', courseId: 'course-001', createdAt: '2024-03-12T00:00:00.000Z' },
  { _id: 'enroll-004', studentId: 'user-student-003', courseId: 'course-003', createdAt: '2024-03-13T00:00:00.000Z' },
];

// ── Payments ──────────────────────────────────────────────────────

export interface MockPayment {
  _id: string;
  studentId: { _id: string; name: string; email: string };
  plan: string;
  amount: number;
  method: PaymentMethod;
  screenshotUrl: string;
  status: PaymentStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export const MOCK_PAYMENTS: MockPayment[] = [
  {
    _id: 'pay-001',
    studentId: { _id: 'user-student-001', name: 'Ali Mohamed', email: 'student1@biology.com' },
    plan: 'Monthly',
    amount: 150,
    method: 'Vodafone Cash',
    screenshotUrl: 'https://placehold.co/400x300?text=Payment+Screenshot',
    status: 'Pending',
    createdAt: '2024-04-01T08:00:00.000Z',
  },
  {
    _id: 'pay-002',
    studentId: { _id: 'user-student-002', name: 'Nour Khalil', email: 'student2@biology.com' },
    plan: 'Annual',
    amount: 1200,
    method: 'InstaPay',
    screenshotUrl: 'https://placehold.co/400x300?text=Payment+Screenshot',
    status: 'Pending',
    createdAt: '2024-04-01T09:30:00.000Z',
  },
  {
    _id: 'pay-003',
    studentId: { _id: 'user-student-003', name: 'Omar Youssef', email: 'student3@biology.com' },
    plan: 'Monthly',
    amount: 150,
    method: 'Vodafone Cash',
    screenshotUrl: 'https://placehold.co/400x300?text=Payment+Screenshot',
    status: 'Approved',
    reviewedBy: 'user-admin-001',
    reviewedAt: '2024-04-01T10:00:00.000Z',
    createdAt: '2024-03-28T12:00:00.000Z',
  },
];

// ── Subscriptions ─────────────────────────────────────────────────

export interface MockSubscription {
  _id: string;
  studentId: { _id: string; name: string } | string;
  plan: string;
  status: SubscriptionStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export const MOCK_SUBSCRIPTIONS: MockSubscription[] = [
  {
    _id: 'sub-001',
    studentId: { _id: 'user-student-001', name: 'Ali Mohamed' },
    plan: 'Monthly',
    status: 'Active',
    startDate: '2024-03-01T00:00:00.000Z',
    endDate: '2024-04-01T00:00:00.000Z',
    createdAt: '2024-03-01T00:00:00.000Z',
  },
  {
    _id: 'sub-002',
    studentId: { _id: 'user-student-002', name: 'Nour Khalil' },
    plan: 'Annual',
    status: 'Active',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2025-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'sub-003',
    studentId: { _id: 'user-student-003', name: 'Omar Youssef' },
    plan: 'Monthly',
    status: 'Inactive',
    createdAt: '2024-02-10T00:00:00.000Z',
  },
  {
    _id: 'sub-004',
    studentId: { _id: 'user-student-004', name: 'Layla Ibrahim' },
    plan: 'Monthly',
    status: 'Cancelled',
    startDate: '2024-02-15T00:00:00.000Z',
    endDate: '2024-03-15T00:00:00.000Z',
    createdAt: '2024-02-15T00:00:00.000Z',
  },
];

// ── Comments / Discussions ────────────────────────────────────────

export interface MockComment {
  _id: string;
  lessonId: string;
  userId: { _id: string; name: string };
  text: string;
  createdAt: string;
}

export const MOCK_COMMENTS: MockComment[] = [
  {
    _id: 'comment-001',
    lessonId: 'lesson-001',
    userId: { _id: 'user-student-001', name: 'Ali Mohamed' },
    text: 'Great explanation! Really helped me understand the basics.',
    createdAt: '2024-03-11T10:00:00.000Z',
  },
  {
    _id: 'comment-002',
    lessonId: 'lesson-001',
    userId: { _id: 'user-student-002', name: 'Nour Khalil' },
    text: 'Could you add more examples of prokaryotic organisms?',
    createdAt: '2024-03-11T11:00:00.000Z',
  },
];

// ── Education Stages ──────────────────────────────────────────────

export interface MockStage {
  _id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  createdAt: string;
}

export const MOCK_STAGES: MockStage[] = [
  {
    _id: 'stage-001',
    name: 'Primary Stage',
    description: 'Foundation level education for young learners covering essential science and mathematics.',
    icon: '🌱',
    color: 'emerald',
    order: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'stage-002',
    name: 'Middle School',
    description: 'Intermediate education building on core concepts with a broader range of subjects.',
    icon: '📖',
    color: 'blue',
    order: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'stage-003',
    name: 'High School',
    description: 'Advanced academic preparation for higher education across all major disciplines.',
    icon: '🎓',
    color: 'violet',
    order: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// ── Subjects ──────────────────────────────────────────────────────

export interface MockSubject {
  _id: string;
  stageId: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  teacherId: { _id: string; name: string } | string;
  createdAt: string;
}

export const MOCK_SUBJECTS: MockSubject[] = [
  {
    _id: 'subject-001',
    stageId: 'stage-002',
    name: 'Biology',
    description: 'Study of life, living organisms, and their vital processes including cell biology, genetics, evolution, and ecology.',
    color: 'emerald',
    icon: '🧬',
    teacherId: { _id: 'user-teacher-001', name: 'Dr. Ahmed Hassan' },
    createdAt: '2024-01-10T00:00:00.000Z',
  },
  {
    _id: 'subject-002',
    stageId: 'stage-002',
    name: 'Chemistry',
    description: 'Exploration of matter, its properties, composition, and transformations. Covers organic, inorganic, and physical chemistry.',
    color: 'blue',
    icon: '⚗️',
    teacherId: { _id: 'user-teacher-002', name: 'Dr. Sarah Mostafa' },
    createdAt: '2024-01-12T00:00:00.000Z',
  },
  {
    _id: 'subject-003',
    stageId: 'stage-003',
    name: 'Physics',
    description: 'Understanding of matter, energy, and their interactions. Topics include mechanics, thermodynamics, electromagnetism, and optics.',
    color: 'violet',
    icon: '⚛️',
    teacherId: { _id: 'user-teacher-001', name: 'Dr. Ahmed Hassan' },
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    _id: 'subject-004',
    stageId: 'stage-003',
    name: 'Mathematics',
    description: 'Comprehensive study of numbers, algebra, calculus, geometry, and statistics applied to science and engineering.',
    color: 'amber',
    icon: '📐',
    teacherId: { _id: 'user-teacher-002', name: 'Dr. Sarah Mostafa' },
    createdAt: '2024-01-18T00:00:00.000Z',
  },
  {
    _id: 'subject-005',
    stageId: 'stage-001',
    name: 'Science',
    description: 'Introduction to natural sciences covering basic life science, earth science, and physical science concepts.',
    color: 'emerald',
    icon: '🔬',
    teacherId: { _id: 'user-teacher-001', name: 'Dr. Ahmed Hassan' },
    createdAt: '2024-01-08T00:00:00.000Z',
  },
  {
    _id: 'subject-006',
    stageId: 'stage-001',
    name: 'Math',
    description: 'Foundational math skills including arithmetic, fractions, basic geometry, and introductory algebra.',
    color: 'amber',
    icon: '➕',
    teacherId: { _id: 'user-teacher-002', name: 'Dr. Sarah Mostafa' },
    createdAt: '2024-01-09T00:00:00.000Z',
  },
  {
    _id: 'subject-007',
    stageId: 'stage-003',
    name: 'Chemistry (Advanced)',
    description: 'Advanced study of chemical reactions, organic chemistry, thermodynamics, and electrochemistry.',
    color: 'blue',
    icon: '⚗️',
    teacherId: { _id: 'user-teacher-002', name: 'Dr. Sarah Mostafa' },
    createdAt: '2024-01-20T00:00:00.000Z',
  },
];

// ── Units ─────────────────────────────────────────────────────────

export interface MockUnit {
  _id: string;
  subjectId: string;
  title: string;
  description?: string;
  order: number;
  createdAt: string;
}

export const MOCK_UNITS: MockUnit[] = [
  // Biology
  { _id: 'unit-001', subjectId: 'subject-001', title: 'Unit 1: Introduction to Cells', description: 'The building blocks of all living things.', order: 1, createdAt: '2024-01-11T00:00:00.000Z' },
  { _id: 'unit-002', subjectId: 'subject-001', title: 'Unit 2: Cell Organelles', description: 'Specialized structures within cells and their functions.', order: 2, createdAt: '2024-01-11T00:00:00.000Z' },
  { _id: 'unit-003', subjectId: 'subject-001', title: 'Unit 3: Human Body Systems', description: 'Overview of major organ systems and how they work together.', order: 3, createdAt: '2024-01-11T00:00:00.000Z' },
  // Chemistry
  { _id: 'unit-004', subjectId: 'subject-002', title: 'Unit 1: Atomic Structure', description: 'Atoms, elements, and the periodic table.', order: 1, createdAt: '2024-01-13T00:00:00.000Z' },
  { _id: 'unit-005', subjectId: 'subject-002', title: 'Unit 2: Chemical Bonding', description: 'Ionic, covalent, and metallic bonds.', order: 2, createdAt: '2024-01-13T00:00:00.000Z' },
  // Physics
  { _id: 'unit-006', subjectId: 'subject-003', title: 'Unit 1: Mechanics', description: 'Motion, forces, and Newton\'s laws.', order: 1, createdAt: '2024-01-16T00:00:00.000Z' },
  { _id: 'unit-007', subjectId: 'subject-003', title: 'Unit 2: Waves & Sound', description: 'Properties of waves, sound, and light.', order: 2, createdAt: '2024-01-16T00:00:00.000Z' },
  // Math
  { _id: 'unit-008', subjectId: 'subject-004', title: 'Unit 1: Algebra', description: 'Equations, functions, and algebraic manipulation.', order: 1, createdAt: '2024-01-19T00:00:00.000Z' },
  { _id: 'unit-009', subjectId: 'subject-004', title: 'Unit 2: Calculus', description: 'Limits, derivatives, and integrals.', order: 2, createdAt: '2024-01-19T00:00:00.000Z' },
];

// ── Subject Lessons ───────────────────────────────────────────────
// These lessons use unitId (different from section-based lessons above)

export interface MockUnitLesson {
  _id: string;
  unitId: string;
  title: string;
  description?: string;
  videoUrl?: string;
  pdfUrl?: string;
  imageUrl?: string;
  modelUrl?: string;
  modelExplanation?: string;  // written explanation linked to 3D model
  audioUrl?: string;         // recorded audio for the lesson
  attachments?: { name: string; url: string; type: 'pdf' | 'doc' | 'image' }[];
  duration?: number;
  order: number;
  createdAt: string;
}

export const MOCK_UNIT_LESSONS: MockUnitLesson[] = [
  // Unit 1: Intro to Cells
  { _id: 'ul-001', unitId: 'unit-001', title: 'What is a Cell?', description: 'The fundamental unit of life — discover the structure and function of cells, and why every living organism depends on them.', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8', order: 1, createdAt: '2024-01-12T00:00:00.000Z' },
  { _id: 'ul-002', unitId: 'unit-001', title: 'Prokaryotic vs Eukaryotic Cells', description: 'Compare the two fundamental types of cells, their key differences, and examples in nature.', order: 2, createdAt: '2024-01-12T00:00:00.000Z' },
  { _id: 'ul-003', unitId: 'unit-001', title: 'Cell Theory', description: 'Historical development of cell theory and its three core tenets.', order: 3, createdAt: '2024-01-12T00:00:00.000Z' },
  // Unit 2: Cell Organelles
  { _id: 'ul-004', unitId: 'unit-002', title: 'The Nucleus', description: 'The control centre of the cell — structure, function, and role in DNA replication.', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8', order: 1, createdAt: '2024-01-13T00:00:00.000Z' },
  { _id: 'ul-005', unitId: 'unit-002', title: 'Mitochondria & Energy', description: 'Understanding ATP production, the electron transport chain, and cellular respiration.', order: 2, createdAt: '2024-01-13T00:00:00.000Z' },
  { _id: 'ul-006', unitId: 'unit-002', title: 'Endoplasmic Reticulum & Golgi', description: 'Protein synthesis, folding, and the secretory pathway in eukaryotic cells.', order: 3, createdAt: '2024-01-13T00:00:00.000Z' },
  // Unit 3: Human Body
  { _id: 'ul-007', unitId: 'unit-003', title: 'The Skeletal System', description: 'Bones, cartilage, joints, and the support structures of the human body.', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8', order: 1, createdAt: '2024-01-14T00:00:00.000Z' },
  { _id: 'ul-008', unitId: 'unit-003', title: 'The Cardiovascular System', description: 'How the heart, blood vessels, and blood work together to sustain life.', order: 2, createdAt: '2024-01-14T00:00:00.000Z' },
  // Unit 4: Atomic Structure
  { _id: 'ul-009', unitId: 'unit-004', title: 'Atoms and Elements', description: 'Building blocks of matter — protons, neutrons, electrons, and atomic number.', order: 1, createdAt: '2024-01-14T00:00:00.000Z' },
  { _id: 'ul-010', unitId: 'unit-004', title: 'The Periodic Table', description: 'Organisation of elements, periods, groups, and trends in the periodic table.', order: 2, createdAt: '2024-01-14T00:00:00.000Z' },
  // Unit 6: Mechanics
  { _id: 'ul-011', unitId: 'unit-006', title: "Newton's Laws of Motion", description: "An in-depth look at Isaac Newton's three laws and their applications.", videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8', order: 1, createdAt: '2024-01-17T00:00:00.000Z' },
  { _id: 'ul-012', unitId: 'unit-006', title: 'Kinematics', description: 'Describing motion using displacement, velocity, acceleration, and time.', order: 2, createdAt: '2024-01-17T00:00:00.000Z' },
];

// ── Subject Comments ────────────────────────────────────────────
// Comments tied to unit lessons

export const MOCK_UNIT_COMMENTS: MockComment[] = [
  {
    _id: 'uc-001',
    lessonId: 'ul-001',
    userId: { _id: 'user-student-001', name: 'Ali Mohamed' },
    text: 'This lesson really clarified the difference between cell types for me. Thank you!',
    createdAt: '2024-01-15T10:00:00.000Z',
  },
  {
    _id: 'uc-002',
    lessonId: 'ul-001',
    userId: { _id: 'user-student-002', name: 'Nour Khalil' },
    text: 'Could you add a diagram comparing prokaryotic and eukaryotic cells?',
    createdAt: '2024-01-15T11:30:00.000Z',
  },
  {
    _id: 'uc-003',
    lessonId: 'ul-004',
    userId: { _id: 'user-student-001', name: 'Ali Mohamed' },
    text: 'The explanation of DNA replication was very clear. Looking forward to the next lesson!',
    createdAt: '2024-01-16T09:00:00.000Z',
  },
];

// ── Unit / Lesson Quizzes ─────────────────────────────────────────

export interface MockUnitQuiz {
  _id: string;
  attachedTo: 'unit' | 'lesson' | 'part';
  attachedToId: string;
  title: string;
  createdAt: string;
}

export interface MockMCQQuestion {
  _id: string;
  quizId: string;
  text: string;
  options: [string, string, string, string];
  correctAnswer: 0 | 1 | 2 | 3;
  createdAt: string;
}

export const MOCK_UNIT_QUIZZES: MockUnitQuiz[] = [];
export const MOCK_MCQ_QUESTIONS: MockMCQQuestion[] = [];

// ── Student Quiz Grades ───────────────────────────────────────────

export interface MockQuizGrade {
  _id: string;
  studentId: string;
  quizId: string;
  score: number;         // 0-100
  correctCount: number;
  totalQuestions: number;
  completedAt: string;
}

export const MOCK_QUIZ_GRADES: MockQuizGrade[] = [];

// ── Lesson Parts ──────────────────────────────────────────────────
// A lesson can be divided into ordered parts; each can optionally have a quiz.

export interface MockLessonPart {
  _id: string;
  lessonId: string;
  title: string;
  content?: string;
  media?: {
    videoUrl?: string;
    pdfUrl?: string;
    imageUrl?: string;
    modelUrl?: string;
    modelExplanation?: string;
    audioUrl?: string;
  };
  quiz?: Array<{
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
  }>;
  order: number;
  createdAt: string;
}

export const MOCK_LESSON_PARTS: MockLessonPart[] = [
  {
    _id: 'part-001',
    lessonId: 'ul-001',
    title: 'Part 1: Cell Structure Overview',
    content: 'Cells are the smallest structural and functional units of all living organisms. Every cell contains genetic material, a membrane, and cytoplasm.',
    order: 1,
    createdAt: '2024-01-12T00:00:00.000Z',
  },
  {
    _id: 'part-002',
    lessonId: 'ul-001',
    title: 'Part 2: Types of Cells',
    content: 'There are two primary categories of cells: prokaryotic (no membrane-bound nucleus) and eukaryotic (with a nucleus). Animals, plants, and fungi are eukaryotes; bacteria are prokaryotes.',
    order: 2,
    createdAt: '2024-01-12T00:00:00.000Z',
  },
];

// ── Unit Availability ─────────────────────────────────────────────
// Controls which units are accessible by month and/or academic stage.

export type AvailabilityStatus = 'available' | 'locked' | 'upcoming';

export interface MockUnitAvailability {
  _id: string;
  unitId: string;
  availableMonth?: number;    // 1-12, if set unit is only available from this month onward
  availableYear?: number;     // e.g. 2024
  status: AvailabilityStatus;
  note?: string;
  updatedAt: string;
}

export const MOCK_UNIT_AVAILABILITY: MockUnitAvailability[] = [
  { _id: 'av-001', unitId: 'unit-001', status: 'available', updatedAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'av-002', unitId: 'unit-002', status: 'available', updatedAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'av-003', unitId: 'unit-003', status: 'upcoming', availableMonth: 5, availableYear: 2026, updatedAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'av-004', unitId: 'unit-004', status: 'available', updatedAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'av-005', unitId: 'unit-005', status: 'locked',   updatedAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'av-006', unitId: 'unit-006', status: 'available', updatedAt: '2024-01-01T00:00:00.000Z' },
  { _id: 'av-007', unitId: 'unit-007', status: 'upcoming', availableMonth: 6, availableYear: 2026, updatedAt: '2024-01-01T00:00:00.000Z' },
];

// ── Live Lessons / Teacher Schedules ──────────────────────────────

export type DayOfWeek = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface MockTeacherSchedule {
  _id: string;
  teacherId: string;
  subjectId: string;
  day: DayOfWeek;
  startTime: string;   // e.g. "15:00"
  endTime: string;     // e.g. "17:00"
  maxStudents: number;
  enrolledStudents: string[];   // student IDs
  isActive: boolean;
  createdAt: string;
}

export const MOCK_TEACHER_SCHEDULES: MockTeacherSchedule[] = [
  {
    _id: 'sched-001',
    teacherId: 'user-teacher-001',
    subjectId: 'subject-001',
    day: 'Monday',
    startTime: '15:00',
    endTime: '17:00',
    maxStudents: 5,
    enrolledStudents: ['user-student-001', 'user-student-002'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'sched-002',
    teacherId: 'user-teacher-001',
    subjectId: 'subject-001',
    day: 'Wednesday',
    startTime: '15:00',
    endTime: '17:00',
    maxStudents: 5,
    enrolledStudents: ['user-student-001'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'sched-003',
    teacherId: 'user-teacher-002',
    subjectId: 'subject-002',
    day: 'Tuesday',
    startTime: '16:00',
    endTime: '18:00',
    maxStudents: 5,
    enrolledStudents: ['user-student-002', 'user-student-003', 'user-student-004', 'extra-1', 'extra-2'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'sched-004',
    teacherId: 'user-teacher-002',
    subjectId: 'subject-002',
    day: 'Thursday',
    startTime: '16:00',
    endTime: '18:00',
    maxStudents: 5,
    enrolledStudents: [],
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

// ── Teacher Applications (from landing page) ──────────────────────

export type ApplicationStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface MockTeacherApplication {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
  cvUrl?: string;
  availableDays: DayOfWeek[];
  availableHours: Record<DayOfWeek, { start: string; end: string }>;
  status: ApplicationStatus;
  zoomLink?: string;
  rejectionReason?: string;
  createdAt: string;
}

export const MOCK_TEACHER_APPLICATIONS: MockTeacherApplication[] = [
  {
    _id: 'app-001',
    name: 'Dr. Khalid Mansour',
    email: 'khalid.m@example.com',
    phone: '+20 111 222 3344',
    availableDays: ['Monday', 'Wednesday', 'Saturday'],
    availableHours: {
      Monday:    { start: '10:00', end: '12:00' },
      Wednesday: { start: '14:00', end: '16:00' },
      Saturday:  { start: '09:00', end: '11:00' },
    } as Record<DayOfWeek, { start: string; end: string }>,
    status: 'Pending',
    createdAt: '2026-03-28T08:00:00.000Z',
  },
  {
    _id: 'app-002',
    name: 'Ms. Rania Farouk',
    email: 'rania.f@example.com',
    phone: '+20 100 987 6543',
    availableDays: ['Sunday', 'Tuesday'],
    availableHours: {
      Sunday:  { start: '13:00', end: '15:00' },
      Tuesday: { start: '17:00', end: '19:00' },
    } as Record<DayOfWeek, { start: string; end: string }>,
    status: 'Pending',
    createdAt: '2026-04-01T10:00:00.000Z',
  },
];

// ── Unit Enrollments ──────────────────────────────────────────────────────────
// Tracks which units a student is enrolled/subscribed to.

export interface MockUnitEnrollment {
  _id: string;
  studentId: string;
  unitId: string;
  createdAt: string;
}

export const MOCK_UNIT_ENROLLMENTS: MockUnitEnrollment[] = [
  // student-001 (Ali, stage-002) enrolled in Biology unit 1 & 2
  { _id: 'ue-001', studentId: 'user-student-001', unitId: 'unit-001', createdAt: '2024-02-10T00:00:00.000Z' },
  { _id: 'ue-002', studentId: 'user-student-001', unitId: 'unit-002', createdAt: '2024-02-10T00:00:00.000Z' },
];

// ── ID generator ─────────────────────────────────────────────────

export const generateId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
