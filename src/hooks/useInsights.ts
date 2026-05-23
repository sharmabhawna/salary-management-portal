import { useCallback, useEffect, useState } from 'react';
import {
  getAverageSalaryByJobTitle,
  getHeadcountByCountry,
  getSalaryByDepartment,
  getSalaryStatsByCountry,
} from '@/services/insightsService';
import type {
  CountryHeadcountInsight,
  CountrySalaryInsight,
  DepartmentSalaryInsight,
  JobTitleSalaryInsight,
} from '@/types/insights';

export interface UseInsightsResult {
  countryStatsCountry: string;
  setCountryStatsCountry: (country: string) => void;
  countryStats: CountrySalaryInsight | null;
  countryStatsMessage: string | null;
  countryStatsLoading: boolean;
  countryStatsError: string | null;
  fetchCountryStats: () => Promise<void>;
  jobTitleInput: string;
  setJobTitleInput: (jobTitle: string) => void;
  jobTitleCountry: string;
  setJobTitleCountry: (country: string) => void;
  jobTitleInsight: JobTitleSalaryInsight | null;
  jobTitleMessage: string | null;
  jobTitleLoading: boolean;
  jobTitleError: string | null;
  fetchJobTitleInsight: () => Promise<void>;
  departmentStats: DepartmentSalaryInsight[];
  departmentLoading: boolean;
  departmentError: string | null;
  headcountStats: CountryHeadcountInsight[];
  headcountLoading: boolean;
  headcountError: string | null;
}

function sortDepartments(
  stats: DepartmentSalaryInsight[],
): DepartmentSalaryInsight[] {
  return [...stats].sort((left, right) =>
    left.department.localeCompare(right.department),
  );
}

function sortHeadcounts(
  stats: CountryHeadcountInsight[],
): CountryHeadcountInsight[] {
  return [...stats].sort((left, right) => right.headcount - left.headcount);
}

export function useInsights(): UseInsightsResult {
  const [countryStatsCountry, setCountryStatsCountry] = useState('');
  const [countryStats, setCountryStats] = useState<CountrySalaryInsight | null>(
    null,
  );
  const [countryStatsMessage, setCountryStatsMessage] = useState<string | null>(
    null,
  );
  const [countryStatsLoading, setCountryStatsLoading] = useState(false);
  const [countryStatsError, setCountryStatsError] = useState<string | null>(null);

  const [jobTitleInput, setJobTitleInput] = useState('');
  const [jobTitleCountry, setJobTitleCountry] = useState('');
  const [jobTitleInsight, setJobTitleInsight] =
    useState<JobTitleSalaryInsight | null>(null);
  const [jobTitleMessage, setJobTitleMessage] = useState<string | null>(null);
  const [jobTitleLoading, setJobTitleLoading] = useState(false);
  const [jobTitleError, setJobTitleError] = useState<string | null>(null);

  const [departmentStats, setDepartmentStats] = useState<
    DepartmentSalaryInsight[]
  >([]);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  const [headcountStats, setHeadcountStats] = useState<CountryHeadcountInsight[]>(
    [],
  );
  const [headcountLoading, setHeadcountLoading] = useState(true);
  const [headcountError, setHeadcountError] = useState<string | null>(null);

  const fetchCountryStats = useCallback(async () => {
    if (!countryStatsCountry) {
      return;
    }

    setCountryStatsLoading(true);
    setCountryStatsError(null);
    setCountryStats(null);
    setCountryStatsMessage(null);

    try {
      const result = await getSalaryStatsByCountry(countryStatsCountry);
      setCountryStats(result.data);
      setCountryStatsMessage(result.message ?? null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load country stats';
      setCountryStatsError(message);
    } finally {
      setCountryStatsLoading(false);
    }
  }, [countryStatsCountry]);

  const fetchJobTitleInsight = useCallback(async () => {
    if (!jobTitleInput || !jobTitleCountry) {
      return;
    }

    setJobTitleLoading(true);
    setJobTitleError(null);
    setJobTitleInsight(null);
    setJobTitleMessage(null);

    try {
      const result = await getAverageSalaryByJobTitle(
        jobTitleInput,
        jobTitleCountry,
      );
      setJobTitleInsight(result.data);
      setJobTitleMessage(result.message ?? null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load job title insight';
      setJobTitleError(message);
    } finally {
      setJobTitleLoading(false);
    }
  }, [jobTitleCountry, jobTitleInput]);

  useEffect(() => {
    let isActive = true;

    async function loadDepartmentStats(): Promise<void> {
      setDepartmentLoading(true);
      setDepartmentError(null);

      try {
        const result = await getSalaryByDepartment();
        if (!isActive) {
          return;
        }

        setDepartmentStats(sortDepartments(result.data));
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Failed to load department salaries';
        setDepartmentError(message);
        setDepartmentStats([]);
      } finally {
        if (isActive) {
          setDepartmentLoading(false);
        }
      }
    }

    void loadDepartmentStats();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadHeadcountStats(): Promise<void> {
      setHeadcountLoading(true);
      setHeadcountError(null);

      try {
        const result = await getHeadcountByCountry();
        if (!isActive) {
          return;
        }

        setHeadcountStats(sortHeadcounts(result.data));
      } catch (error) {
        if (!isActive) {
          return;
        }

        const message =
          error instanceof Error ? error.message : 'Failed to load headcount';
        setHeadcountError(message);
        setHeadcountStats([]);
      } finally {
        if (isActive) {
          setHeadcountLoading(false);
        }
      }
    }

    void loadHeadcountStats();

    return () => {
      isActive = false;
    };
  }, []);

  return {
    countryStatsCountry,
    setCountryStatsCountry,
    countryStats,
    countryStatsMessage,
    countryStatsLoading,
    countryStatsError,
    fetchCountryStats,
    jobTitleInput,
    setJobTitleInput,
    jobTitleCountry,
    setJobTitleCountry,
    jobTitleInsight,
    jobTitleMessage,
    jobTitleLoading,
    jobTitleError,
    fetchJobTitleInsight,
    departmentStats,
    departmentLoading,
    departmentError,
    headcountStats,
    headcountLoading,
    headcountError,
  };
}
