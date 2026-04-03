import { useState, useCallback } from 'react';

/**
 * Configuration for form dialog hook
 */
export interface FormDialogConfig<TFormState> {
  /** Initial state for the form */
  initialFormState: TFormState;
  /** Callback when form dialog opens for create */
  onOpenCreate?: () => void;
  /** Callback when form dialog opens for edit */
  onOpenEdit?: (item: unknown) => void;
}

/**
 * Confirmation action type
 */
export type ConfirmAction = 'create' | 'update' | 'delete' | null;

/**
 * Return type for useFormDialog hook
 */
export interface FormDialogState<TFormState> {
  /** Whether the form dialog is open */
  openForm: boolean;
  /** Set form dialog open state */
  setOpenForm: (open: boolean) => void;
  /** Current form state */
  formState: TFormState;
  /** Update form state */
  setFormState: (state: TFormState | ((prev: TFormState) => TFormState)) => void;
  /** Selected item ID for edit/delete */
  selectedId: string | null;
  /** Set selected item ID */
  setSelectedId: (id: string | null) => void;
  /** Current confirmation action */
  confirmAction: ConfirmAction;
  /** Set confirmation action */
  setConfirmAction: (action: ConfirmAction) => void;
  /** Open form dialog for creating new item */
  openCreate: () => void;
  /** Open form dialog for editing existing item */
  openEdit: (item: unknown, mapToFormState: (item: unknown) => TFormState) => void;
  /** Request delete confirmation */
  requestDelete: (id: string) => void;
  /** Close form dialog and reset state */
  closeForm: () => void;
  /** Check if form is in edit mode */
  isEditMode: boolean;
}

/**
 * Custom hook to manage form dialog state and operations
 * Eliminates 150+ lines of duplicated dialog state management
 * 
 * Features:
 * - Form open/close state
 * - Form data state
 * - Selected item tracking
 * - Confirmation action tracking
 * - Helper functions for common operations
 * 
 * @example
 * ```tsx
 * const {
 *   openForm,
 *   setOpenForm,
 *   formState,
 *   setFormState,
 *   selectedId,
 *   confirmAction,
 *   setConfirmAction,
 *   openCreate,
 *   openEdit,
 *   requestDelete,
 *   isEditMode
 * } = useFormDialog({
 *   initialFormState: { title: '', description: '' }
 * });
 * 
 * // Open for creating
 * <Button onClick={openCreate}>Add New</Button>
 * 
 * // Open for editing
 * <Button onClick={() => openEdit(course, (c) => ({ 
 *   title: c.title, 
 *   description: c.description 
 * }))}>Edit</Button>
 * 
 * // Request delete
 * <Button onClick={() => requestDelete(course._id)}>Delete</Button>
 * 
 * // Handle form submit
 * const onSubmit = () => {
 *   setConfirmAction(isEditMode ? 'update' : 'create');
 * };
 * ```
 */
export function useFormDialog<TFormState>(
  config: FormDialogConfig<TFormState>
): FormDialogState<TFormState> {
  const { initialFormState, onOpenCreate, onOpenEdit } = config;

  const [openForm, setOpenForm] = useState(false);
  const [formState, setFormState] = useState<TFormState>(initialFormState);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  /**
   * Open form dialog for creating a new item
   */
  const openCreate = useCallback(() => {
    setSelectedId(null);
    setFormState(initialFormState);
    setOpenForm(true);
    onOpenCreate?.();
  }, [initialFormState, onOpenCreate]);

  /**
   * Open form dialog for editing an existing item
   * @param item - The item to edit
   * @param mapToFormState - Function to map item to form state
   */
  const openEdit = useCallback(
    (item: unknown, mapToFormState: (item: unknown) => TFormState) => {
      const itemWithId = item as { _id?: string; id?: string };
      setSelectedId(itemWithId._id || itemWithId.id || null);
      setFormState(mapToFormState(item));
      setOpenForm(true);
      onOpenEdit?.(item);
    },
    [onOpenEdit]
  );

  /**
   * Request delete confirmation for an item
   * @param id - The ID of the item to delete
   */
  const requestDelete = useCallback((id: string) => {
    setSelectedId(id);
    setConfirmAction('delete');
  }, []);

  /**
   * Close form dialog and reset state
   */
  const closeForm = useCallback(() => {
    setOpenForm(false);
    setSelectedId(null);
    setFormState(initialFormState);
  }, [initialFormState]);

  /**
   * Check if form is in edit mode (vs create mode)
   */
  const isEditMode = selectedId !== null;

  return {
    openForm,
    setOpenForm,
    formState,
    setFormState,
    selectedId,
    setSelectedId,
    confirmAction,
    setConfirmAction,
    openCreate,
    openEdit,
    requestDelete,
    closeForm,
    isEditMode,
  };
}
