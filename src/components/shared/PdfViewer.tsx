import { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface PdfViewerProps {
  url: string;
  className?: string;
  initialPage?: number;
}

const DOC_EXTENSIONS = new Set(['doc', 'docx', 'xls', 'xlsx']);

const getFileExtension = (value: string) => {
  const cleanValue = value.split('#')[0].split('?')[0].trim();
  const parts = cleanValue.split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1].toLowerCase();
};

export function PdfViewer({ url, className, initialPage = 1 }: PdfViewerProps) {
  return <PdfViewerBody key={url} url={url} className={className} initialPage={initialPage} />;
}

interface PdfViewerBodyProps {
  url: string;
  className?: string;
  initialPage: number;
}

function PdfViewerBody({ url, className, initialPage }: PdfViewerBodyProps) {
  const { t } = useTranslation();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState<string>('');
  const [docError, setDocError] = useState<string>('');
  const [pageWidth, setPageWidth] = useState<number | null>(null);
  const pageContainerRef = useRef<HTMLDivElement | null>(null);
  const [pdfFallback, setPdfFallback] = useState(false);

  const extension = useMemo(() => getFileExtension(url), [url]);
  const isDoc = useMemo(() => DOC_EXTENSIONS.has(extension), [extension]);
  const viewerMode = useMemo(() => (isDoc ? 'doc' : 'pdf'), [isDoc]);
  const pdfFile = useMemo(() => ({ url }), [url]);

  const handleLoadSuccess = ({ numPages: pages }: { numPages: number }) => {
    setNumPages(pages);
    setPageNumber((current) => Math.min(Math.max(1, current), pages));
    setError('');
  };

  const handleError = (err: Error) => {
    if (viewerMode === 'doc') {
      setDocError(t('errDisplayDoc'));
      return;
    }
    setError(err.message || t('errDisplayDoc'));
    setPdfFallback(true);
  };

  useEffect(() => {
    if (!pageContainerRef.current) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextWidth = Math.max(280, Math.floor(entry.contentRect.width));
      setPageWidth(nextWidth);
    });

    observer.observe(pageContainerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!url) {
    return (
      <div className={cn('rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600', className)}>
        {t('noPdfUrl')}
      </div>
    );
  }

  if (viewerMode === 'doc') {
    return (
      <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 text-sm">
          <span className="text-slate-600">{t('googleDocsViewer')}</span>
        </div>
        <div className="min-h-[60vh] bg-slate-50 p-4">
          {docError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {docError}
            </div>
          ) : (
            <iframe
              title={t('documentPreview')}
              src={`https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}`}
              className="h-[70vh] w-full rounded-xl border border-slate-200"
              onLoad={() => setDocError('')}
              onError={() => setDocError(t('errDisplayDocOrigin'))}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={!numPages || pageNumber <= 1}
          >
            {t('prev')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((p) => (numPages ? Math.min(numPages, p + 1) : p))}
            disabled={!numPages || pageNumber >= (numPages || 1)}
          >
            {t('next')}
          </Button>
          <span className="text-slate-600">
            {t('page')} {pageNumber}{numPages ? ` / ${numPages}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setScale((s) => Math.max(0.6, Number((s - 0.1).toFixed(2))))}
          >
            -
          </Button>
          <span className="text-slate-600">{Math.round(scale * 100)}%</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setScale((s) => Math.min(2, Number((s + 0.1).toFixed(2))))}
          >
            +
          </Button>
        </div>
      </div>

      <div ref={pageContainerRef} className="min-h-[60vh] bg-slate-50 p-4">
        {pdfFallback ? (
          <iframe
            title={t('pdfPreview')}
            src={url}
            className="h-[70vh] w-full rounded-xl border border-slate-200"
          />
        ) : error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        ) : (
          <Document
            file={pdfFile}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleError}
            loading={<div className="text-sm text-slate-500">{t('loadingPdf')}</div>}
            className="flex justify-center"
          >
            <Page
              pageNumber={pageNumber}
              width={pageWidth ? Math.floor(pageWidth * scale) : undefined}
              renderAnnotationLayer
              renderTextLayer
            />
          </Document>
        )}
      </div>
    </div>
  );
}
