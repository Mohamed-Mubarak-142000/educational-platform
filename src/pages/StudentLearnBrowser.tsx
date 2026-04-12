/**
 * StudentLearnBrowser.tsx
 *
 * The primary learning navigation for students.
 * Flow: Stage → Grade → Subject → Units → Lessons
 *
 * Route: /learn
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocalizedName } from '@/lib/localeUtils';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getStages } from '@/api/subjectApi';
import { getGrades, getSubjectsByGrade } from '@/api/gradeApi';
import { getUnitsBySubject } from '@/api/subjectApi';

type Step = 'stage' | 'grade' | 'subject' | 'unit';

export default function StudentLearnBrowser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('stage');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const { data: stages = [], isLoading: stagesLoading } = useQuery({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const { data: grades = [], isLoading: gradesLoading } = useQuery({
    queryKey: ['grades', selectedStageId],
    queryFn: () => getGrades(selectedStageId),
    enabled: !!selectedStageId,
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['gradeSubjects', selectedGradeId],
    queryFn: () => getSubjectsByGrade(selectedGradeId),
    enabled: !!selectedGradeId,
  });

  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: ['units', selectedSubjectId],
    queryFn: () => getUnitsBySubject(selectedSubjectId),
    enabled: !!selectedSubjectId,
  });

  function selectStage(id: string) {
    setSelectedStageId(id);
    setSelectedGradeId('');
    setSelectedSubjectId('');
    setStep('grade');
  }

  function selectGrade(id: string) {
    setSelectedGradeId(id);
    setSelectedSubjectId('');
    setStep('subject');
  }

  function selectSubject(id: string) {
    setSelectedSubjectId(id);
    setStep('unit');
  }

  const breadcrumbs: { label: string; onClick: () => void }[] = [];
  if (step !== 'stage') {
    const stage = stages.find((s) => s._id === selectedStageId);
    breadcrumbs.push({ label: stage?.name ?? t('stageLabel'), onClick: () => setStep('stage') });
  }
  if (step === 'subject' || step === 'unit') {
    const grade = grades.find((g) => g._id === selectedGradeId);
    breadcrumbs.push({ label: grade?.name ?? t('gradeLabel'), onClick: () => setStep('grade') });
  }
  if (step === 'unit') {
    const subject = subjects.find((s) => s._id === selectedSubjectId);
    breadcrumbs.push({ label: subject?.name ?? t('subjectLabel'), onClick: () => setStep('subject') });
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('browseContent')}</h1>

      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <button className="hover:text-foreground" onClick={() => setStep('stage')}>{t('allStages')}</button>
          {breadcrumbs.map((bc, i) => (
            <span key={i} className="flex items-center gap-2">
              <span>/</span>
              <button className="hover:text-foreground" onClick={bc.onClick}>{bc.label}</button>
            </span>
          ))}
        </nav>
      )}

      {/* Step: Stage */}
      {step === 'stage' && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{t('selectAStage')}</h2>
          {stagesLoading ? (
            <p className="text-muted-foreground">{t('loadingStages')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stages.map((stage) => (
                <button
                  key={stage._id}
                  onClick={() => selectStage(stage._id)}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 text-left transition-colors"
                >
                  <span className="text-3xl">{stage.icon}</span>
                  <div>
                    <p className="font-semibold">{getLocalizedName(stage, i18n.language)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Step: Grade */}
      {step === 'grade' && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{t('selectAGrade')}</h2>
          {gradesLoading ? (
            <p className="text-muted-foreground">{t('loadingGrades')}</p>
          ) : grades.length === 0 ? (
            <p className="text-muted-foreground">{t('noGradesYet')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {grades.map((grade) => (
                <button
                  key={grade._id}
                  onClick={() => selectGrade(grade._id)}
                  className="p-4 rounded-xl border bg-card hover:bg-muted/50 text-left transition-colors"
                >
                  <p className="font-semibold">{getLocalizedName(grade, i18n.language)}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Step: Subject */}
      {step === 'subject' && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{t('selectASubject')}</h2>
          {subjectsLoading ? (
            <p className="text-muted-foreground">{t('loadingSubjects')}</p>
          ) : subjects.length === 0 ? (
            <p className="text-muted-foreground">{t('noSubjectsYet')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <button
                  key={subject._id}
                  onClick={() => selectSubject(subject._id)}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 text-left transition-colors"
                >
                  <span className="text-3xl">{subject.icon}</span>
                  <div>
                    <p className="font-semibold">{getLocalizedName(subject, i18n.language)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Step: Units */}
      {step === 'unit' && (
        <section>
          <h2 className="text-lg font-semibold mb-3">{t('units')}</h2>
          {unitsLoading ? (
            <p className="text-muted-foreground">{t('loadingUnits')}</p>
          ) : units.length === 0 ? (
            <p className="text-muted-foreground">{t('noUnitsYet')}</p>
          ) : (
            <div className="space-y-3">
              {units.map((unit, idx) => (
                <button
                  key={unit._id}
                  onClick={() => navigate(`/learn/units/${unit._id}`)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 text-left transition-colors"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{unit.title}</p>
                    {unit.description && <p className="text-sm text-muted-foreground line-clamp-2">{unit.description}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
