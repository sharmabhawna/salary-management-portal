import { useEmployeeForm } from '@/hooks/useEmployeeForm';
import type { Employee } from '@/types/employee';
import {
  COUNTRIES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  JOB_TITLES,
} from '@/features/employees/employeeOptions';

type Props = {
  employee?: Employee;
  onCancel: () => void;
  onSuccess: (employee: Employee) => void;
};

function SubmitSpinner() {
  return (
    <span
      role="status"
      aria-label="Submitting employee form"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
    />
  );
}

export function EmployeeForm({ employee, onCancel, onSuccess }: Props) {
  const {
    values,
    fieldErrors,
    submitError,
    isSubmitting,
    setField,
    handleSubmit,
  } = useEmployeeForm({ employee, onSuccess });

  const dialogTitle = employee ? 'Edit employee' : 'Add employee';
  const submitLabel = employee ? 'Save changes' : 'Add employee';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
        <h2 id="employee-form-title" className="text-lg font-semibold text-gray-900">
          {dialogTitle}
        </h2>

        <form
          className="mt-6 grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          noValidate
        >
          <div className="md:col-span-2">
            <label htmlFor="employee-full-name" className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="employee-full-name"
              type="text"
              value={values.fullName}
              onChange={(event) => {
                setField('fullName', event.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.fullName}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="employee-email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="employee-email"
              type="email"
              value={values.email}
              onChange={(event) => {
                setField('email', event.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="employee-job-title" className="mb-1 block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <select
              id="employee-job-title"
              value={values.jobTitle}
              onChange={(event) => {
                setField('jobTitle', event.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select job title</option>
              {JOB_TITLES.map((jobTitle) => (
                <option key={jobTitle} value={jobTitle}>
                  {jobTitle}
                </option>
              ))}
            </select>
            {fieldErrors.jobTitle && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.jobTitle}</p>
            )}
          </div>

          <div>
            <label htmlFor="employee-department" className="mb-1 block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="employee-department"
              value={values.department}
              onChange={(event) => {
                setField('department', event.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
            {fieldErrors.department && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.department}</p>
            )}
          </div>

          <div>
            <label htmlFor="employee-country" className="mb-1 block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              id="employee-country"
              value={values.country}
              onChange={(event) => {
                setField('country', event.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {fieldErrors.country && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.country}</p>
            )}
          </div>

          <div>
            <label htmlFor="employee-salary" className="mb-1 block text-sm font-medium text-gray-700">
              Salary (USD)
            </label>
            <input
              id="employee-salary"
              type="number"
              min="0"
              step="0.01"
              value={values.salary}
              onChange={(event) => {
                setField('salary', event.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.salary && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.salary}</p>
            )}
          </div>

          <div>
            <label htmlFor="employee-employment-type" className="mb-1 block text-sm font-medium text-gray-700">
              Employment Type
            </label>
            <select
              id="employee-employment-type"
              value={values.employmentType}
              onChange={(event) => {
                setField('employmentType', event.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select employment type</option>
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {fieldErrors.employmentType && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.employmentType}</p>
            )}
          </div>

          <div>
            <label htmlFor="employee-start-date" className="mb-1 block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              id="employee-start-date"
              type="date"
              value={values.startDate}
              onChange={(event) => {
                setField('startDate', event.target.value);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {fieldErrors.startDate && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.startDate}</p>
            )}
          </div>

          {submitError && (
            <div
              role="alert"
              className="md:col-span-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {submitError}
            </div>
          )}

          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? <SubmitSpinner /> : null}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
