import { useForm } from 'react-hook-form';
import type { UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ZodType } from 'zod';

/**
 * Configuration for auth form hook
 */
export interface AuthFormConfig<TFormData extends FieldValues> {
  /** Zod validation schema */
  schema: ZodType<TFormData>;
  /** React Query mutation for form submission */
  mutation: UseMutationResult<unknown, Error, TFormData>;
  /** Callback on successful submission */
  onSuccess?: (data: unknown) => void;
  /** Callback on failed submission */
  onError?: (error: Error) => void;
  /** Default form values */
  defaultValues?: Partial<TFormData>;
}

/**
 * Return type for useAuthForm hook
 */
export interface AuthFormState<TFormData extends FieldValues> {
  /** React Hook Form instance */
  form: UseFormReturn<TFormData>;
  /** Form submission handler */
  onSubmit: (data: TFormData) => void;
  /** Whether form is submitting */
  isSubmitting: boolean;
  /** Form errors */
  errors: Partial<Record<keyof TFormData, unknown>>;
}

/**
 * Custom hook to handle authentication forms with validation
 * Consolidates form setup, validation, and mutation handling
 * Eliminates 100+ lines of duplicated auth form logic
 * 
 * Features:
 * - Automatic Zod validation integration
 * - Mutation handling with callbacks
 * - Error state management
 * - Loading state tracking
 * 
 * @example
 * ```tsx
 * const { form, onSubmit, isSubmitting } = useAuthForm({
 *   schema: loginSchema,
 *   mutation: loginMutation,
 *   onSuccess: (response) => {
 *     navigate(roleHome(response?.role));
 *   }
 * });
 * 
 * <form onSubmit={form.handleSubmit(onSubmit)}>
 *   <Input {...form.register('email')} />
 *   <Input {...form.register('password')} type="password" />
 *   <Button type="submit" disabled={isSubmitting}>
 *     {isSubmitting ? 'Loading...' : 'Login'}
 *   </Button>
 * </form>
 * ```
 */
export function useAuthForm<TFormData extends FieldValues>(
  config: AuthFormConfig<TFormData>
): AuthFormState<TFormData> {
  const { schema, mutation, onSuccess, onError, defaultValues } = config;

  const form = useForm<TFormData>({
    // @ts-ignore - Complex type interaction between zod and react-hook-form generics
    resolver: zodResolver(schema),
    // @ts-ignore - DefaultValues type incompatibility
    defaultValues,
  });

  const onSubmit = (data: TFormData) => {
    mutation.mutate(data, {
      onSuccess: (response) => {
        onSuccess?.(response);
      },
      onError: (error) => {
        onError?.(error);
      },
    });
  };

  return {
    // @ts-ignore - Generic form return type mismatch
    form,
    onSubmit,
    isSubmitting: mutation.isPending,
    errors: form.formState.errors,
  };
}
