import { apiGet } from '@/services/apiClient';
import type {
  CountryHeadcountInsight,
  CountrySalaryInsight,
  DepartmentSalaryInsight,
  FilteredInsightResponse,
  JobTitleSalaryInsight,
  OrgWideInsightResponse,
} from '@/types/insights';

export async function getSalaryStatsByCountry(
  country: string,
): Promise<FilteredInsightResponse<CountrySalaryInsight>> {
  return apiGet<FilteredInsightResponse<CountrySalaryInsight>>(
    '/insights/salary/country',
    { country },
  );
}

export async function getAverageSalaryByJobTitle(
  jobTitle: string,
  country: string,
): Promise<FilteredInsightResponse<JobTitleSalaryInsight>> {
  return apiGet<FilteredInsightResponse<JobTitleSalaryInsight>>(
    '/insights/salary/job-title',
    { jobTitle, country },
  );
}

export async function getSalaryByDepartment(): Promise<
  OrgWideInsightResponse<DepartmentSalaryInsight>
> {
  return apiGet<OrgWideInsightResponse<DepartmentSalaryInsight>>(
    '/insights/salary/department',
  );
}

export async function getHeadcountByCountry(): Promise<
  OrgWideInsightResponse<CountryHeadcountInsight>
> {
  return apiGet<OrgWideInsightResponse<CountryHeadcountInsight>>(
    '/insights/headcount/country',
  );
}
