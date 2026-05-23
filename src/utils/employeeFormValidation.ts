import type {
  EmployeeFormFieldErrors,
  EmployeeFormValues,
  EmployeeInput,
  EmploymentType,
} from '@/types/employee';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRequired(value: string, label: string): string | undefined {
  if (value.trim().length === 0) {
    return `${label} is required`;
  }

  return undefined;
}

function validateEmail(value: string): string | undefined {
  const requiredError = validateRequired(value, 'Email');
  if (requiredError) {
    return requiredError;
  }

  if (!EMAIL_PATTERN.test(value.trim())) {
    return 'Email must be a valid email address';
  }

  return undefined;
}

function validateSalary(value: string): string | undefined {
  const requiredError = validateRequired(value, 'Salary');
  if (requiredError) {
    return requiredError;
  }

  const salary = Number.parseFloat(value);
  if (Number.isNaN(salary) || salary <= 0) {
    return 'Salary must be a positive number';
  }

  return undefined;
}

export function validateEmployeeForm(
  values: EmployeeFormValues,
): EmployeeFormFieldErrors {
  const errors: EmployeeFormFieldErrors = {};

  const fullNameError = validateRequired(values.fullName, 'Full name');
  if (fullNameError) {
    errors.fullName = fullNameError;
  }

  const emailError = validateEmail(values.email);
  if (emailError) {
    errors.email = emailError;
  }

  const jobTitleError = validateRequired(values.jobTitle, 'Job title');
  if (jobTitleError) {
    errors.jobTitle = jobTitleError;
  }

  const departmentError = validateRequired(values.department, 'Department');
  if (departmentError) {
    errors.department = departmentError;
  }

  const countryError = validateRequired(values.country, 'Country');
  if (countryError) {
    errors.country = countryError;
  }

  const salaryError = validateSalary(values.salary);
  if (salaryError) {
    errors.salary = salaryError;
  }

  if (values.employmentType === '') {
    errors.employmentType = 'Employment type is required';
  }

  const startDateError = validateRequired(values.startDate, 'Start date');
  if (startDateError) {
    errors.startDate = startDateError;
  }

  return errors;
}

export function hasValidationErrors(errors: EmployeeFormFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function toEmployeeInput(values: EmployeeFormValues): EmployeeInput {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    jobTitle: values.jobTitle.trim(),
    department: values.department,
    country: values.country,
    salary: Number.parseFloat(values.salary),
    employmentType: values.employmentType as EmploymentType,
    startDate: values.startDate,
  };
}

export function createEmptyFormValues(): EmployeeFormValues {
  return {
    fullName: '',
    email: '',
    jobTitle: '',
    department: '',
    country: '',
    salary: '',
    employmentType: '',
    startDate: '',
  };
}

export function createFormValuesFromEmployee(
  employee: {
    fullName: string;
    email: string;
    jobTitle: string;
    department: string;
    country: string;
    salary: number;
    employmentType: EmployeeFormValues['employmentType'];
    startDate: string;
  },
): EmployeeFormValues {
  return {
    fullName: employee.fullName,
    email: employee.email,
    jobTitle: employee.jobTitle,
    department: employee.department,
    country: employee.country,
    salary: String(employee.salary),
    employmentType: employee.employmentType,
    startDate: employee.startDate,
  };
}
