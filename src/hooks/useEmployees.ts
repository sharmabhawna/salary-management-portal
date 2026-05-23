import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { deleteEmployee, getEmployees } from '@/services/employeeService';
import type {
  Employee,
  EmployeeSortField,
  EmploymentType,
  SortOrder,
} from '@/types/employee';

const DEFAULT_LIMIT = 20;

export interface EmployeeFilters {
  search: string;
  country: string;
  department: string;
  employmentType: string;
}

export interface UseEmployeesOptions {
  pageSize?: number;
}

export interface UseEmployeesResult {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy: EmployeeSortField;
  sortOrder: SortOrder;
  filters: EmployeeFilters;
  isLoading: boolean;
  error: string | null;
  setPage: (page: number) => void;
  setFilters: (filters: Partial<EmployeeFilters>) => void;
  toggleSort: (field: EmployeeSortField) => void;
  deleteEmployeeById: (id: string) => Promise<void>;
}

interface SortState {
  sortBy: EmployeeSortField;
  sortOrder: SortOrder;
}

function parseEmploymentTypeFilter(value: string): EmploymentType | undefined {
  if (value === 'FULL_TIME' || value === 'PART_TIME' || value === 'CONTRACT') {
    return value;
  }

  return undefined;
}

function sortReducer(state: SortState, field: EmployeeSortField): SortState {
  if (state.sortBy === field) {
    return {
      sortBy: field,
      sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc',
    };
  }

  return {
    sortBy: field,
    sortOrder: 'asc',
  };
}

export function useEmployees(
  options: UseEmployeesOptions = {},
): UseEmployeesResult {
  const limit = options.pageSize ?? DEFAULT_LIMIT;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, dispatchSort] = useReducer(sortReducer, {
    sortBy: 'fullName',
    sortOrder: 'asc',
  });
  const [filters, setFiltersState] = useState<EmployeeFilters>({
    search: '',
    country: '',
    department: '',
    employmentType: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reloadRef = useRef<(() => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    let isActive = true;

    async function loadEmployees(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getEmployees({
          page,
          limit,
          sortBy: sort.sortBy,
          sortOrder: sort.sortOrder,
          country: filters.country || undefined,
          department: filters.department || undefined,
          employmentType: parseEmploymentTypeFilter(filters.employmentType),
          search: filters.search || undefined,
        });

        if (!isActive) {
          return;
        }

        setEmployees(result.data);
        setTotal(result.total);
      } catch (fetchError) {
        if (!isActive) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to load employees';
        setError(message);
        setEmployees([]);
        setTotal(0);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    reloadRef.current = loadEmployees;
    void loadEmployees();

    return () => {
      isActive = false;
    };
  }, [filters, limit, page, sort.sortBy, sort.sortOrder]);

  const setFilters = useCallback((nextFilters: Partial<EmployeeFilters>) => {
    setFiltersState((current) => ({ ...current, ...nextFilters }));
    setPage(1);
  }, []);

  const toggleSort = useCallback((field: EmployeeSortField) => {
    dispatchSort(field);
  }, []);

  const deleteEmployeeById = useCallback(async (id: string) => {
    await deleteEmployee(id);
    await reloadRef.current?.();
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    employees,
    total,
    page,
    limit,
    totalPages,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    filters,
    isLoading,
    error,
    setPage,
    setFilters,
    toggleSort,
    deleteEmployeeById,
  };
}
