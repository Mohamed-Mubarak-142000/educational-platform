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

function GridCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border bg-card animate-pulse">
      <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

function ListItemSkeleton() {
  return (
    <div className="w-full flex items-center gap-4 p-4 rounded-xl border bg-card animate-pulse">
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
      <div className="space-y-2">
        <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-52 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}

export default function StudentLearnBrowser() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('stage');
  const [selectedStageId, setSelectedStageId] = useState<string>('');
  const [selectedGradeId, setSelectedGradeId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const { data: stages, isLoading: stagesLoading } = useQuery({
    queryKey: ['stages'],
    queryFn: getStages,
  });

  const { data: grades, isLoading: gradesLoading } = useQuery({
    queryKey: ['grades', selectedStageId],
    queryFn: () => getGrades(selectedStageId),
    enabled: !!selectedStageId,
  });

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['gradeSubjects', selectedGradeId],
    queryFn: () => getSubjectsByGrade(selectedGradeId),
    enabled: !!selectedGradeId,
  });

  const { data: units, isLoading: unitsLoading } = useQuery({
    queryKey: ['units', selectedSubjectId],
    queryFn: () => getUnitsBySubject(selectedSubjectId),
    enabled: !!selectedSubjectId,
  });

  const resolvedStages = stages ?? [];
  const resolvedGrades = grades ?? [];
  const resolvedSubjects = subjects ?? [];
  const resolvedUnits = units ?? [];

  const showStagesSkeleton = stagesLoading || stages === undefined;
  const showGradesSkeleton = gradesLoading || grades === undefined;
  const showSubjectsSkeleton = subjectsLoading || subjects === undefined;
  const showUnitsSkeleton = unitsLoading || units === undefined;

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
    const stage = resolvedStages.find((s) => s._id === selectedStageId);
    breadcrumbs.push({
      label: stage ? getLocalizedName(stage, i18n.language) : t('stageLabel'),
      onClick: () => setStep('stage'),
    });
  }
  if (step === 'subject' || step === 'unit') {
    const grade = resolvedGrades.find((g) => g._id === selectedGradeId);
    breadcrumbs.push({
      label: grade ? getLocalizedName(grade, i18n.language) : t('gradeLabel'),
      onClick: () => setStep('grade'),
    });
  }
  if (step === 'unit') {
    const subject = resolvedSubjects.find((s) => s._id === selectedSubjectId);
    breadcrumbs.push({
      label: subject ? getLocalizedName(subject, i18n.language) : t('subjectLabel'),
      onClick: () => setStep('subject'),
    });
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
          {showStagesSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <GridCardSkeleton key={i} />
              ))}
            </div>
          ) : resolvedStages.length === 0 ? (
            <p className="text-muted-foreground">{t('noStagesAvailable')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resolvedStages.map((stage) => (
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
          {showGradesSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <GridCardSkeleton key={i} />
              ))}
            </div>
          ) : resolvedGrades.length === 0 ? (
            <p className="text-muted-foreground">{t('noGradesInStage')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resolvedGrades.map((grade) => (
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
          {showSubjectsSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <GridCardSkeleton key={i} />
              ))}
            </div>
          ) : resolvedSubjects.length === 0 ? (
            <p className="text-muted-foreground">{t('noSubjectsInGrade')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resolvedSubjects.map((subject) => (
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
          <h2 className="text-lg font-semibold mb-3">{t('unitPlural')}</h2>
          {showUnitsSkeleton ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <ListItemSkeleton key={i} />
              ))}
            </div>
          ) : resolvedUnits.length === 0 ? (
            <p className="text-muted-foreground">{t('noUnitsYet')}</p>
          ) : (
            <div className="space-y-3">
              {resolvedUnits.map((unit, idx) => (
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
