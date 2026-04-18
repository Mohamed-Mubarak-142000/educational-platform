/**
 * Shared Components Index
 * 
 * Central export point for all reusable shared components
 */

export { PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

export { DataTable } from './DataTable';
export type { DataTableProps, TableColumn } from './DataTable';

export { FormField } from './FormField';
export type { FormFieldProps } from './FormField';

export { StatsCard } from './StatsCard';
export type { StatsCardProps } from './StatsCard';

export { FormPageLayout } from './FormPageLayout';
export type { FormPageLayoutProps } from './FormPageLayout';

export { LoadingState } from './LoadingState';
export type { LoadingStateProps } from './LoadingState';

export {
	SkeletonBlock,
	SkeletonTable,
	SkeletonCardGrid,
	SkeletonStatsGrid,
	SkeletonDetailSection,
} from './Skeletons';
export type {
	SkeletonBlockProps,
	SkeletonTableProps,
	SkeletonCardGridProps,
	SkeletonStatsGridProps,
	SkeletonDetailSectionProps,
} from './Skeletons';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { RenderIfExists } from './RenderIfExists';

export { ErrorState } from './ErrorState';
export type { ErrorStateProps } from './ErrorState';

export { PdfViewer } from './PdfViewer';
export type { PdfViewerProps } from './PdfViewer';

export { AccessRestricted } from './AccessRestricted';
export type { AccessRestrictedProps } from './AccessRestricted';

export { EntityCard } from './EntityCard';
export type { EntityCardProps } from './EntityCard';

export { ENTITY_COLORS, getEntityColor } from './entityCardColors';
export type { ColorConfig } from './entityCardColors';
