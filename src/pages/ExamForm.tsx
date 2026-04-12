/**
 * ExamForm Page
 * 
 * Dedicated page for creating and editing exams
 * Replaces the dialog-based form with a full page experience
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createExam, getExams, updateExam } from '@/api/examApi';
import { getCourses, getSections, getLessons } from '@/api/courseApi';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { useCRUDOperations, useFormDialog } from '@/hooks';
import { buttonVariants, formClasses, inputVariants } from '@/lib/constants';
import {  FormPageLayout, FormField } from '@/components/shared';
import { Plus, Trash2, CheckCircle } from 'lucide-react';

type Course = Record<string, unknown> & { _id: string; title: string };
type Section = Record<string, unknown> & { _id: string; title: string };
type Lesson = Record<string, unknown> & { _id: string; title: string };
type Exam = { _id: string; title: string; lessonId?: { _id?: string } | string; timeLimit: number; [key: string]: unknown };

type Answer = {
  id: string;
  answerText: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  question: string;
  type: 'Multiple Choice' | 'True/False';
  answers: Answer[];
};

export default function ExamForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  // CRUD operations
  const { createMutation, updateMutation } = useCRUDOperations({
    queryKey: ['exams'],
    queryFn: getExams,
    createFn: createExam,
    updateFn: updateExam,
    createSuccessMessage: t('toastExamCreated'),
    updateSuccessMessage: t('toastExamUpdated'),
  });

  // Form state
  const { formState, setFormState } = useFormDialog({
    initialFormState: { lessonId: '', title: '', timeLimit: '' },
  });

  // Fetch courses
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: getCourses as unknown as () => Promise<Course[]>,
  });

  // Fetch sections based on selected course
  const { data: sections = [] } = useQuery<Section[]>({
    queryKey: ['sections', selectedCourseId],
    queryFn: () => getSections(selectedCourseId) as unknown as Promise<Section[]>,
    enabled: !!selectedCourseId,
  });

  // Fetch lessons based on selected section
  const { data: lessons = [] } = useQuery<Lesson[]>({
    queryKey: ['lessons', selectedSectionId],
    queryFn: () => getLessons(selectedSectionId) as unknown as Promise<Lesson[]>,
    enabled: !!selectedSectionId,
  });

  // Fetch exam data for edit mode
  const { data: exams = [] } = useQuery<Exam[]>({
    queryKey: ['exams'],
    queryFn: getExams as unknown as () => Promise<Exam[]>,
    enabled: isEditMode,
  });

  // Populate form in edit mode
  useEffect(() => {
    if (isEditMode && (exams as Exam[]).length > 0) {
      const exam = (exams as Exam[]).find((e: Exam) => e._id === id);
      if (exam) {
        const lessonIdValue = typeof exam.lessonId === 'string' ? exam.lessonId : exam.lessonId?._id || '';
        setFormState({
          lessonId: lessonIdValue,
          title: exam.title || '',
          timeLimit: String(exam.timeLimit || 0),
        });
      }
    }
  }, [isEditMode, id, exams, setFormState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      lessonId: formState.lessonId,
      title: formState.title,
      timeLimit: Number(formState.timeLimit || 0),
      questions: questions.map(q => ({
        question: q.question,
        type: q.type,
        answers: q.answers.map(a => ({
          answerText: a.answerText,
          isCorrect: a.isCorrect,
        })),
      })),
    };

    if (isEditMode && id) {
      updateMutation.mutate(
        { id, data },
        {
          onSuccess: () => navigate('/admin/exams'),
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => navigate('/admin/exams'),
      });
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      type: 'Multiple Choice',
      answers: [
        { id: '1', answerText: '', isCorrect: false },
        { id: '2', answerText: '', isCorrect: false },
        { id: '3', answerText: '', isCorrect: false },
        { id: '4', answerText: '', isCorrect: false },
      ],
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = (questionId: string, field: string, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        if (field === 'type' && value === 'True/False') {
          return {
            ...q,
            [field]: value,
            answers: [
              { id: '1', answerText: t('trueLabel'), isCorrect: false },
              { id: '2', answerText: t('falseLabel'), isCorrect: false },
            ],
          };
        }
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const updateAnswer = (questionId: string, answerId: string, field: string, value: string | boolean) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.map(a => {
            if (a.id === answerId) {
              // If marking as correct, unmark others
              if (field === 'isCorrect' && value === true) {
                return { ...a, [field]: value };
              }
              return { ...a, [field]: value };
            } else if (field === 'isCorrect' && value === true) {
              // Unmark other answers when one is marked correct
              return { ...a, isCorrect: false };
            }
            return a;
          }),
        };
      }
      return q;
    }));
  };

  const addAnswer = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.type === 'Multiple Choice') {
        return {
          ...q,
          answers: [...q.answers, { id: Date.now().toString(), answerText: '', isCorrect: false }],
        };
      }
      return q;
    }));
  };

  const removeAnswer = (questionId: string, answerId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: q.answers.filter(a => a.id !== answerId),
        };
      }
      return q;
    }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <FormPageLayout
      title={isEditMode ? t('editExam') : t('addExam')}
      subtitle={isEditMode ? t('editExamSubtitle') : t('addExamSubtitle')}
      backTo="/admin/exams"
      backLabel={t('backToExams')}
    >
      <form onSubmit={handleSubmit} className={formClasses.container}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label={t('title')} required>
            <Input
              placeholder={t('examTitle')}
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              required
            />
          </FormField>

          <FormField label={t('timeLimit')} required>
            <Input
              type="number"
              placeholder={t('timeLimitMinutes')}
              value={formState.timeLimit}
              onChange={(e) => setFormState({ ...formState, timeLimit: e.target.value })}
              required
              min="1"
            />
          </FormField>

          <FormField label={t('course')} required helpText={t('selectCourseFirst')}>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedSectionId('');
                setFormState({ ...formState, lessonId: '' });
              }}
              className={inputVariants.default}
            >
              <option value="">{t('selectCourse')}</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.title}
                </option>
              ))}
            </select>
          </FormField>

          {selectedCourseId && (
            <FormField label={t('section')} required helpText={t('selectSectionForLesson')}>
              <select
                value={selectedSectionId}
                onChange={(e) => {
                  setSelectedSectionId(e.target.value);
                  setFormState({ ...formState, lessonId: '' });
                }}
                className={inputVariants.default}
              >
                <option value="">{t('selectSection')}</option>
                {sections.map((section) => (
                  <option key={section._id} value={section._id}>
                    {section.title}
                  </option>
                ))}
              </select>
            </FormField>
          )}

          {selectedSectionId && (
            <FormField label={t('lesson')} required helpText={t('lessonForExam')}>
              <select
                value={formState.lessonId}
                onChange={(e) => setFormState({ ...formState, lessonId: e.target.value })}
                className={inputVariants.default}
              >
                <option value="">{t('selectLesson')}</option>
                {lessons.map((lesson) => (
                  <option key={lesson._id} value={lesson._id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </FormField>
          )}
        </div>

        {/* Questions Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('questions')}</h3>
            <Button type="button" onClick={addQuestion} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              {t('addQuestion')}
            </Button>
          </div>

          {questions.length === 0 && (
            <EmptyState description={t('noQuestionsYet')} className="py-8" />
          )}

          {questions.map((question, qIndex) => (
            <div key={question.id} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium">{t('question')} {qIndex + 1}</h4>
                <Button 
                  type="button" 
                  onClick={() => removeQuestion(question.id)} 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <FormField label={t('questionText')} required>
                <Input
                  placeholder={t('enterQuestionText')}
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  required
                />
              </FormField>

              <FormField label={t('questionType')} required>
                <select
                  value={question.type}
                  onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                  className={inputVariants.default}
                >
                  <option value="Multiple Choice">{t('multipleChoice')}</option>
                  <option value="True/False">{t('trueFalse')}</option>
                </select>
              </FormField>

              {/* Answers */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">{t('answers')}</label>
                  {question.type === 'Multiple Choice' && (
                    <Button 
                      type="button" 
                      onClick={() => addAnswer(question.id)} 
                      variant="ghost" 
                      size="sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {t('addAnswer')}
                    </Button>
                  )}
                </div>

                {question.answers.map((answer, aIndex) => (
                  <div key={answer.id} className="flex items-center gap-2 mb-2">
                    <Button
                      type="button"
                      onClick={() => updateAnswer(question.id, answer.id, 'isCorrect', !answer.isCorrect)}
                      variant={answer.isCorrect ? 'default' : 'outline'}
                      size="sm"
                      className={answer.isCorrect ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                    <Input
                      placeholder={`${t('answer')} ${aIndex + 1}`}
                      value={answer.answerText}
                      onChange={(e) => updateAnswer(question.id, answer.id, 'answerText', e.target.value)}
                      required
                      className="flex-1"
                    />
                    {question.type === 'Multiple Choice' && question.answers.length > 2 && (
                      <Button
                        type="button"
                        onClick={() => removeAnswer(question.id, answer.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={formClasses.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/exams')}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" className={buttonVariants.primary} disabled={isLoading}>
            {isLoading ? t('saving') : isEditMode ? t('updateExam') : t('createExam')}
          </Button>
        </div>
      </form>
    </FormPageLayout>
  );
}
