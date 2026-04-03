/**
 * Custom Hooks Index
 * 
 * Central export point for all custom hooks in the application
 * These hooks eliminate code duplication and provide reusable logic
 */

export { useRTL } from './useRTL';
export { useCRUDOperations } from './useCRUDOperations';
export type { CRUDConfig, CRUDOperations } from './useCRUDOperations';
export { useFormDialog } from './useFormDialog';
export type { FormDialogConfig, FormDialogState, ConfirmAction } from './useFormDialog';
export { useAuthForm } from './useAuthForm';
export type { AuthFormConfig, AuthFormState } from './useAuthForm';
