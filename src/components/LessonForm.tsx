/**
 * LessonForm Component
 *
 * Supports two modes that adapt dynamically:
 *  1. Single Lesson (no parts) — title + description + full media options
 *  2. Lesson with Parts — each part has its own title, content, media section
 *     and an optional inline quiz.
 *
 * Media options (for both lesson-level and per-part):
 *   • Video: upload from device OR enter URL
 *   • PDF: upload from device only
 *   • Image: upload from device OR enter URL
 *   • 3D Model: upload/URL + written explanation + audio recording
 *
 * Fully localised via react-i18next (en + ar).
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared';
import {
  FileVideo,
  Image,
  Box,
  Mic,
  MicOff,
  Upload,
  Layers,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { inputVariants } from '@/lib/constants';
import { uploadLessonAsset } from '@/api/subjectApi';

// ── Types (exported so AdminLessonForm can map API data) ──────────

export type LessonMedia = {
  videoUrl: string;
  pdfUrl: string;
  imageUrl: string;
  modelUrl: string;
  modelExplanation: string;
  audioUrl: string;
};

export type PartQuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  /** Index of the correct option (0–3) */
  correctIndex: number;
};

export type LessonPart = {
  id: string;
  title: string;
  content: string;
  media: LessonMedia;
  quiz: PartQuizQuestion[];
};

export type LessonFormData = {
  title: string;
  description: string;
  media: LessonMedia;
  order: number;
  parts: LessonPart[];
};

type LessonFormProps = {
  initialData?: Partial<LessonFormData>;
  onSubmit: (data: LessonFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

// ── Helpers ────────────────────────────────────────────────────────

export const emptyMedia = (): LessonMedia => ({
  videoUrl: '',
  pdfUrl: '',
  imageUrl: '',
  modelUrl: '',
  modelExplanation: '',
  audioUrl: '',
});

function genId(prefix = 'tmp') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

async function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read audio blob'));
    reader.readAsDataURL(blob);
  });
}

function emptyPart(): LessonPart {
  return { id: genId('part'), title: '', content: '', media: emptyMedia(), quiz: [] };
}

function emptyQuestion(): PartQuizQuestion {
  return { id: genId('q'), question: '', options: ['', '', '', ''], correctIndex: 0 };
}

// ── MediaSection ───────────────────────────────────────────────────
// Self-contained: manages its own File references and audio recording.
// Propagates URL changes upward via `onChange`.

type MediaSectionProps = {
  media: LessonMedia;
  onChange: (m: LessonMedia) => void;
  /** Unique prefix used for <input id> attributes to avoid duplicates */
  idPrefix: string;
  onUploadStateChange?: (busy: boolean) => void;
};

function MediaSection({ media, onChange, idPrefix, onUploadStateChange }: MediaSectionProps) {
  const { t } = useTranslation();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelUploading, setModelUploading] = useState(false);
  const [modelUploadError, setModelUploadError] = useState('');
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfUploadError, setPdfUploadError] = useState('');
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(media.audioUrl);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const set = (key: keyof LessonMedia, value: string) => onChange({ ...media, [key]: value });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'pdf' | 'image' | 'model') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    switch (type) {
      case 'video':
        setVideoFile(file);
        setVideoUploadError('');
        setVideoUploading(true);
        onUploadStateChange?.(true);
        try {
          const upload = await uploadLessonAsset(file);
          onChange({ ...media, videoUrl: upload.url });
        } catch {
          setVideoUploadError(t('toastUploadFailed'));
        } finally {
          setVideoUploading(false);
          onUploadStateChange?.(false);
        }
        break;
      case 'pdf':
        setPdfFile(file);
        setPdfUploadError('');
        setPdfUploading(true);
        onUploadStateChange?.(true);
        try {
          const upload = await uploadLessonAsset(file);
          onChange({ ...media, pdfUrl: upload.url });
        } catch {
          setPdfUploadError(t('toastUploadFailed'));
        } finally {
          setPdfUploading(false);
          onUploadStateChange?.(false);
        }
        break;
      case 'image':
        setImageFile(file);
        setImageUploadError('');
        setImageUploading(true);
        onUploadStateChange?.(true);
        try {
          const upload = await uploadLessonAsset(file);
          onChange({ ...media, imageUrl: upload.url });
        } catch {
          setImageUploadError(t('toastUploadFailed'));
        } finally {
          setImageUploading(false);
          onUploadStateChange?.(false);
        }
        break;
      case 'model':
        setModelFile(file);
        setModelUploadError('');
        setModelUploading(true);
        onUploadStateChange?.(true);
        try {
          const upload = await uploadLessonAsset(file);
          onChange({ ...media, modelUrl: upload.url });
        } catch {
          setModelUploadError(t('toastUploadFailed'));
        } finally {
          setModelUploading(false);
          onUploadStateChange?.(false);
        }
        break;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        try {
          const dataUrl = await blobToDataUrl(blob);
          setAudioPreviewUrl(dataUrl);
          onChange({ ...media, audioUrl: dataUrl });
        } finally {
          stream.getTracks().forEach((t) => t.stop());
        }
      };
      recorder.start();
      setIsRecording(true);
    } catch {
      alert(t('microphoneError'));
    }
  };

  const stopRecording = () => { recorderRef.current?.stop(); setIsRecording(false); };
  const clearAudio = () => { setAudioPreviewUrl(''); onChange({ ...media, audioUrl: '' }); };

  return (
    <div className="space-y-4">

      {/* Video */}
      <FormField label={t('videoContent')} helpText={t('uploadVideoOrEnterUrl')}>
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept="video/*" id={`${idPrefix}-video`}
              className="hidden" onChange={(e) => handleFile(e, 'video')} />
            <label htmlFor={`${idPrefix}-video`}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium">
              <FileVideo className="w-3.5 h-3.5" />{t('uploadVideo')}
            </label>
            {videoFile && (
              <span className="text-xs text-slate-500 truncate max-w-[180px]">
                {videoFile.name}{videoUploading ? ` — ${t('uploadingMedia')}` : ''}
              </span>
            )}
          </div>
          {!videoFile && (
            <Input placeholder={t('orEnterVideoUrl')} value={media.videoUrl}
              onChange={(e) => set('videoUrl', e.target.value)} />
          )}
          {media.videoUrl && !videoFile && (
            <p className="text-xs text-blue-600">{t('videoUploaded')}</p>
          )}
          {videoUploadError && (
            <p className="text-xs text-red-500">{videoUploadError}</p>
          )}
        </div>
      </FormField>

      {/* PDF — device upload only */}
      <FormField label={t('pdfContent')} helpText={t('uploadPdfFromDevice')}>
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept=".pdf" id={`${idPrefix}-pdf`}
              className="hidden" onChange={(e) => handleFile(e, 'pdf')} />
            <label htmlFor={`${idPrefix}-pdf`}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-xs font-medium">
              <Upload className="w-3.5 h-3.5" />{pdfFile ? t('changePdf') : t('uploadPdf')}
            </label>
            {pdfFile && (
              <span className="text-xs text-slate-500 truncate max-w-[180px]">
                {pdfFile.name}{pdfUploading ? ` — ${t('uploadingMedia')}` : ''}
              </span>
            )}
          </div>
          {media.pdfUrl && !pdfFile && (
            <a href={media.pdfUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-emerald-600 underline block">{t('currentPdf')}</a>
          )}
          {pdfUploadError && (
            <p className="text-xs text-red-500">{pdfUploadError}</p>
          )}
        </div>
      </FormField>

      {/* Image */}
      <FormField label={t('imageContent')} helpText={t('uploadImageOrEnterUrl')}>
        <div className="space-y-2">
          {media.imageUrl && (
            <img src={media.imageUrl} alt={t('imagePreviewAlt')}
              className="max-w-xs max-h-32 rounded-lg border border-slate-200 dark:border-slate-700 object-cover" />
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept="image/*" id={`${idPrefix}-image`}
              className="hidden" onChange={(e) => handleFile(e, 'image')} />
            <label htmlFor={`${idPrefix}-image`}
              className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium">
              <Image className="w-3.5 h-3.5" />{t('uploadImage')}
            </label>
            {imageFile && (
              <span className="text-xs text-slate-500 truncate max-w-[180px]">
                {imageFile.name}{imageUploading ? ` — ${t('uploadingMedia')}` : ''}
              </span>
            )}
          </div>
          {!imageFile && !media.imageUrl && (
            <Input placeholder={t('orEnterImageUrl')} value={media.imageUrl}
              onChange={(e) => set('imageUrl', e.target.value)} />
          )}
          {imageUploadError && (
            <p className="text-xs text-red-500">{imageUploadError}</p>
          )}
        </div>
      </FormField>

      {/* 3D Model + Written Explanation + Audio */}
      <div className="border border-purple-200 dark:border-purple-800/40 rounded-xl p-4 space-y-4 bg-purple-50/40 dark:bg-purple-900/10">
        <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          <Box className="w-3.5 h-3.5 text-purple-600" />{t('model3dSection')}
        </h4>

        {/* 3D model file / URL */}
        <FormField label={t('model3dSection')} helpText={t('model3dHint')}>
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <input type="file" accept=".glb,.gltf,.obj,.fbx" id={`${idPrefix}-model`}
                className="hidden" onChange={(e) => handleFile(e, 'model')} />
              <label htmlFor={`${idPrefix}-model`}
                className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-xs font-medium">
                <Box className="w-3.5 h-3.5" />{t('uploadModel3d')}
              </label>
              {modelFile && (
                <span className="text-xs text-slate-500 truncate max-w-[180px]">
                  {modelFile.name}{modelUploading ? ` — ${t('uploadingMedia')}` : ''}
                </span>
              )}
            </div>
            <Input placeholder={t('orEnterModelUrl')} value={media.modelUrl}
              onChange={(e) => set('modelUrl', e.target.value)} />
            {modelUploadError && (
              <p className="text-xs text-red-500">{modelUploadError}</p>
            )}
          </div>
        </FormField>

        {/* Written explanation */}
        <FormField label={t('modelExplanationLabel')} helpText={t('modelExplanationHint')}>
          <textarea placeholder={t('modelExplanationPlaceholder')} value={media.modelExplanation}
            onChange={(e) => set('modelExplanation', e.target.value)}
            className={`${inputVariants.default} min-h-[70px]`} rows={3} />
        </FormField>

        {/* Audio recording / URL */}
        <FormField label={t('audioRecordingLabel')} helpText={t('audioRecordingHint')}>
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              {!isRecording ? (
                <button type="button" onClick={startRecording}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition text-xs font-medium">
                  <Mic className="w-3.5 h-3.5" />{audioPreviewUrl ? t('reRecord') : t('startRecording')}
                </button>
              ) : (
                <button type="button" onClick={stopRecording}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-white rounded-lg transition text-xs font-medium animate-pulse">
                  <MicOff className="w-3.5 h-3.5" />{t('stopRecording')}
                </button>
              )}
              {audioPreviewUrl && (
                <button type="button" onClick={clearAudio} className="text-xs text-red-500 underline">
                  {t('removeAudio')}
                </button>
              )}
            </div>
            {audioPreviewUrl
              ? <audio src={audioPreviewUrl} controls className="w-full h-9" />
              : <Input placeholder={t('orEnterAudioUrl')} value={media.audioUrl}
                  onChange={(e) => set('audioUrl', e.target.value)} />}
          </div>
        </FormField>
      </div>

    </div>
  );
}

// ── PartQuizSection ────────────────────────────────────────────────

function PartQuizSection({
  quiz,
  onChange,
}: {
  quiz: PartQuizQuestion[];
  onChange: (q: PartQuizQuestion[]) => void;
}) {
  const { t } = useTranslation();

  const addQuestion = () => onChange([...quiz, emptyQuestion()]);

  const updateQuestion = (id: string, patch: Partial<PartQuizQuestion>) =>
    onChange(quiz.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const updateOption = (id: string, idx: number, value: string) =>
    onChange(quiz.map((q) => {
      if (q.id !== id) return q;
      const options = [...q.options] as [string, string, string, string];
      options[idx] = value;
      return { ...q, options };
    }));

  const removeQuestion = (id: string) => onChange(quiz.filter((q) => q.id !== id));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
          <HelpCircle className="w-3.5 h-3.5 text-amber-500" />{t('partQuizSection')}
        </h5>
        <Button type="button" size="sm" onClick={addQuestion}
          className="bg-amber-500 hover:bg-amber-600 text-white gap-1 h-7 text-xs px-2">
          <Plus className="w-3 h-3" />{t('addQuestion')}
        </Button>
      </div>

      {quiz.length === 0 ? (
        <EmptyState description={t('noQuestionsYet')} className="py-6" />
      ) : (
        <div className="space-y-3">
          {quiz.map((q, qi) => (
            <div key={q.id}
              className="bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  {t('questionNumber', { num: qi + 1 })}
                </span>
                <button type="button" onClick={() => removeQuestion(q.id)}
                  className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <Input placeholder={t('questionPlaceholder')} value={q.question}
                onChange={(e) => updateQuestion(q.id, { question: e.target.value })} />

              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-1.5">
                    <input type="radio" name={`correct-${q.id}`} checked={q.correctIndex === oi}
                      onChange={() => updateQuestion(q.id, { correctIndex: oi })}
                      className="flex-shrink-0 accent-amber-500" />
                    <Input placeholder={t('option', { num: oi + 1 })} value={opt}
                      onChange={(e) => updateOption(q.id, oi, e.target.value)}
                      className="text-xs h-8" />
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Check className="w-3 h-3 text-green-500" />{t('correctAnswerHint')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── PartCard ───────────────────────────────────────────────────────

function PartCard({
  part,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
  onUploadStateChange,
}: {
  part: LessonPart;
  index: number;
  total: number;
  onUpdate: (updated: LessonPart) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
  onUploadStateChange: (busy: boolean) => void;
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">

      {/* Header (always visible) */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
        <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <Input
          placeholder={t('enterPartTitle')}
          value={part.title}
          onChange={(e) => onUpdate({ ...part, title: e.target.value })}
          className="flex-1 h-8 text-sm"
        />
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button type="button" disabled={index === 0} onClick={() => onMove('up')}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition">
            <ChevronUp className="w-4 h-4 text-slate-500" />
          </button>
          <button type="button" disabled={index === total - 1} onClick={() => onMove('down')}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition">
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>
          <button type="button" onClick={onRemove}
            className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title={t('removePart')}>
            <Trash2 className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            title={expanded ? t('collapse') : t('expand')}>
            <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expandable body */}
      {expanded && (
        <div className="p-4 space-y-4">

          {/* Part content */}
          <FormField label={t('partContent')}>
            <textarea
              placeholder={t('enterPartContent')}
              value={part.content}
              onChange={(e) => onUpdate({ ...part, content: e.target.value })}
              className={`${inputVariants.default} min-h-[80px]`}
              rows={3}
            />
          </FormField>

          {/* Collapsible media section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <button type="button" onClick={() => setMediaOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />{t('partMedia')}
              </span>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${mediaOpen ? 'rotate-90' : ''}`} />
            </button>
            {mediaOpen && (
              <div className="p-4">
                <MediaSection
                  media={part.media}
                  onChange={(m) => onUpdate({ ...part, media: m })}
                  idPrefix={`part-${part.id}`}
                  onUploadStateChange={onUploadStateChange}
                />
              </div>
            )}
          </div>

          {/* Collapsible quiz section */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <button type="button" onClick={() => setQuizOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                {t('partQuizSection')}
                {part.quiz.length > 0 && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full px-1.5 py-0.5 font-semibold">
                    {part.quiz.length}
                  </span>
                )}
              </span>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${quizOpen ? 'rotate-90' : ''}`} />
            </button>
            {quizOpen && (
              <div className="p-4">
                <PartQuizSection
                  quiz={part.quiz}
                  onChange={(q) => onUpdate({ ...part, quiz: q })}
                />
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// ── LessonForm ─────────────────────────────────────────────────────

export default function LessonForm({ initialData, onSubmit, onCancel, isLoading }: LessonFormProps) {
  const { t } = useTranslation();
  const [uploadingCount, setUploadingCount] = useState(0);

  const [formData, setFormData] = useState<LessonFormData>({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    media: initialData?.media ?? emptyMedia(),
    order: initialData?.order ?? 1,
    parts: initialData?.parts ?? [],
  });

  const hasParts = formData.parts.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData });
  };

  const handleUploadStateChange = (busy: boolean) => {
    setUploadingCount((count) => Math.max(0, count + (busy ? 1 : -1)));
  };

  const addPart = () =>
    setFormData((prev) => ({ ...prev, parts: [...prev.parts, emptyPart()] }));

  const updatePart = (id: string, updated: LessonPart) =>
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.map((p) => (p.id === id ? updated : p)),
    }));

  const removePart = (id: string) =>
    setFormData((prev) => ({ ...prev, parts: prev.parts.filter((p) => p.id !== id) }));

  const movePart = (id: string, dir: 'up' | 'down') =>
    setFormData((prev) => {
      const idx = prev.parts.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= prev.parts.length) return prev;
      const parts = [...prev.parts];
      [parts[idx], parts[swap]] = [parts[swap], parts[idx]];
      return { ...prev, parts };
    });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Title */}
      <FormField label={t('lessonTitle')} required>
        <Input
          placeholder={t('enterLessonTitle')}
          value={formData.title}
          onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
          required
        />
      </FormField>

      {/* Description */}
      <FormField label={t('description')}>
        <textarea
          placeholder={t('enterLessonDescription')}
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          className={`${inputVariants.default} min-h-[90px]`}
          rows={3}
        />
      </FormField>

      {/* ── Single-lesson media (hidden when parts are added) ── */}
      {!hasParts && (
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-500" />{t('lessonMedia')}
          </h3>
          <MediaSection
            media={formData.media}
            onChange={(m) => setFormData((p) => ({ ...p, media: m }))}
            idPrefix="main"
            onUploadStateChange={handleUploadStateChange}
          />
        </div>
      )}

      {/* ── Lesson Parts ── */}
      <div className="border border-blue-200 dark:border-blue-800/40 rounded-xl p-5 space-y-4 bg-blue-50/40 dark:bg-blue-900/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Layers className="w-4 h-4 text-blue-600" />{t('lessonParts')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('lessonPartsHint')}
            </p>
          </div>
          <Button type="button" size="sm" onClick={addPart}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 flex-shrink-0">
            <Plus className="w-3.5 h-3.5" />{t('addPart')}
          </Button>
        </div>

        {!hasParts ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            {t('noPartsYet')}
          </p>
        ) : (
          <div className="space-y-3">
            {formData.parts.map((part, idx) => (
              <PartCard
                key={part.id}
                part={part}
                index={idx}
                total={formData.parts.length}
                onUpdate={(updated) => updatePart(part.id, updated)}
                onRemove={() => removePart(part.id)}
                onMove={(dir) => movePart(part.id, dir)}
                onUploadStateChange={handleUploadStateChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Order */}
      <FormField label={t('order')} helpText={t('lessonOrder')}>
        <Input
          type="number"
          placeholder={t('orderPlaceholder')}
          value={formData.order}
          onChange={(e) => setFormData((p) => ({ ...p, order: parseInt(e.target.value) || 1 }))}
          min="1"
          required
          className="max-w-[120px]"
        />
      </FormField>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          disabled={isLoading || uploadingCount > 0 || !formData.title.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isLoading ? t('saving') : t('saveLesson')}
        </Button>
      </div>

    </form>
  );
}
