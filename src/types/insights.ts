export interface CountrySalaryInsight {
  country: string;
  min: number;
  max: number;
  average: number;
}

export interface JobTitleSalaryInsight {
  country: string;
  jobTitle: string;
  average: number;
}

export interface DepartmentSalaryInsight {
  department: string;
  average: number;
}

export interface CountryHeadcountInsight {
  country: string;
  headcount: number;
}

export interface FilteredInsightResponse<T> {
  data: T | null;
  message?: string;
}

export interface OrgWideInsightResponse<T> {
  data: T[];
}
