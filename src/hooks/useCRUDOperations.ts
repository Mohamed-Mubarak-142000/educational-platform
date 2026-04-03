import { useMutation, useQuery } from '@tanstack/react-query';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useToast } from '@/components/ui/ToastProvider';
import { useTranslation } from 'react-i18next';

/**
 * Configuration for CRUD operations
 */
export interface CRUDConfig<TData, TCreateInput, TUpdateInput> {
  /** Query key for React Query */
  queryKey: string[];
  /** Function to fetch data */
  queryFn: () => Promise<TData[]>;
  /** Function to create a new item */
  createFn?: (data: TCreateInput) => Promise<unknown>;
  /** Function to update an existing item */
  updateFn?: (id: string, data: TUpdateInput) => Promise<unknown>;
  /** Function to delete an item */
  deleteFn?: (id: string) => Promise<unknown>;
  /** Custom success message for create operation */
  createSuccessMessage?: string;
  /** Custom success message for update operation */
  updateSuccessMessage?: string;
  /** Custom success message for delete operation */
  deleteSuccessMessage?: string;
  /** Custom error message for all operations */
  errorMessage?: string;
  /** Enable query by default */
  enabled?: boolean;
}

/**
 * Return type for useCRUDOperations hook
 */
export interface CRUDOperations<TData, TCreateInput, TUpdateInput> {
  /** Query result containing fetched data */
  query: UseQueryResult<TData[], Error>;
  /** Mutation for creating items */
  createMutation: UseMutationResult<unknown, Error, TCreateInput>;
  /** Mutation for updating items */
  updateMutation: UseMutationResult<unknown, Error, { id: string; data: TUpdateInput }>;
  /** Mutation for deleting items */
  deleteMutation: UseMutationResult<unknown, Error, string>;
  /** The fetched data array */
  data: TData[];
  /** Function to refetch data */
  refetch: () => void;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Custom hook to consolidate Create, Read, Update, Delete operations
 * Eliminates 200+ lines of duplicated mutation logic across admin pages
 * 
 * Features:
 * - Automatic toast notifications
 * - Automatic refetch after mutations
 * - Customizable success/error messages
 * - Type-safe operations
 * 
 * @example
 * ```tsx
 * const { data, createMutation, updateMutation, deleteMutation, refetch } = useCRUDOperations({
 *   queryKey: ['courses'],
 *   queryFn: getCourses,
 *   createFn: createCourse,
 *   updateFn: updateCourse,
 *   deleteFn: deleteCourse,
 * });
 * 
 * // Create
 * createMutation.mutate({ title: 'New Course' });
 * 
 * // Update
 * updateMutation.mutate({ id: '123', data: { title: 'Updated' } });
 * 
 * // Delete
 * deleteMutation.mutate('123');
 * ```
 */
export function useCRUDOperations<TData = unknown, TCreateInput = unknown, TUpdateInput = unknown>(
  config: CRUDConfig<TData, TCreateInput, TUpdateInput>
): CRUDOperations<TData, TCreateInput, TUpdateInput> {
  const { t } = useTranslation();
  const { pushToast } = useToast();

  const {
    queryKey,
    queryFn,
    createFn,
    updateFn,
    deleteFn,
    createSuccessMessage,
    updateSuccessMessage,
    deleteSuccessMessage,
    errorMessage,
    enabled = true,
  } = config;

  // Fetch data
  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
  });

  const data = query.data || [];
  const refetch = () => query.refetch();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createFn || (() => Promise.reject(new Error('Create function not provided'))),
    onSuccess: () => {
      pushToast({
        type: 'success',
        title: createSuccessMessage || t('toastCreated'),
      });
      refetch();
    },
    onError: () => {
      pushToast({
        type: 'error',
        title: errorMessage || t('toastActionFailed'),
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateFn
      ? ({ id, data }: { id: string; data: TUpdateInput }) => updateFn(id, data)
      : () => Promise.reject(new Error('Update function not provided')),
    onSuccess: () => {
      pushToast({
        type: 'success',
        title: updateSuccessMessage || t('toastUpdated'),
      });
      refetch();
    },
    onError: () => {
      pushToast({
        type: 'error',
        title: errorMessage || t('toastActionFailed'),
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFn || (() => Promise.reject(new Error('Delete function not provided'))),
    onSuccess: () => {
      pushToast({
        type: 'success',
        title: deleteSuccessMessage || t('toastDeleted'),
      });
      refetch();
    },
    onError: () => {
      pushToast({
        type: 'error',
        title: errorMessage || t('toastActionFailed'),
      });
    },
  });

  return {
    query,
    createMutation,
    updateMutation,
    deleteMutation,
    data,
    refetch,
    isLoading: query.isLoading,
  };
}
