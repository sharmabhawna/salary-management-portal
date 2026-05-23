import { useCallback, useState, type SubmitEvent } from 'react';
import { createEmployee, updateEmployee } from '@/services/employeeService';
import type {
  Employee,
  EmployeeFormField,
  EmployeeFormFieldErrors,
  EmployeeFormValues,
} from '@/types/employee';
import {
  createEmptyFormValues,
  createFormValuesFromEmployee,
  hasValidationErrors,
  toEmployeeInput,
  validateEmployeeForm,
} from '@/utils/employeeFormValidation';

export interface UseEmployeeFormOptions {
  employee?: Employee;
  onSuccess: (employee: Employee) => void;
}

export interface UseEmployeeFormResult {
  values: EmployeeFormValues;
  fieldErrors: EmployeeFormFieldErrors;
  submitError: string | null;
  isSubmitting: boolean;
  setField: (field: EmployeeFormField, value: string) => void;
  handleSubmit: (event: SubmitEvent<HTMLFormElement>) => Promise<void>;
}

export function useEmployeeForm(
  options: UseEmployeeFormOptions,
): UseEmployeeFormResult {
  const [values, setValues] = useState<EmployeeFormValues>(() =>
    options.employee
      ? createFormValuesFromEmployee(options.employee)
      : createEmptyFormValues(),
  );
  const [fieldErrors, setFieldErrors] = useState<EmployeeFormFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback((field: EmployeeFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      return Object.fromEntries(
        Object.entries(current).filter(([key]) => key !== field),
      );
    });
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      const validationErrors = validateEmployeeForm(values);
      setFieldErrors(validationErrors);

      if (hasValidationErrors(validationErrors)) {
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const payload = toEmployeeInput(values);
        const savedEmployee = options.employee
          ? await updateEmployee(options.employee.id, payload)
          : await createEmployee(payload);

        options.onSuccess(savedEmployee);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to save employee';
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [options, values],
  );

  return {
    values,
    fieldErrors,
    submitError,
    isSubmitting,
    setField,
    handleSubmit,
  };
}
