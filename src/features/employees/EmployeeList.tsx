import { useState } from 'react';
import { EmployeeForm } from '@/features/employees/EmployeeForm';
import {
  COUNTRIES,
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
} from '@/features/employees/employeeOptions';
import { useEmployees } from '@/hooks/useEmployees';
import type { Employee, EmployeeSortField } from '@/types/employee';
import {
  formatDisplayDate,
  formatEmploymentType,
  formatSalary,
} from '@/utils/format';

type Props = {
  pageSize?: number;
};

type SortableColumn = {
  label: string;
  field: EmployeeSortField;
};

const SORTABLE_COLUMNS: SortableColumn[] = [
  { label: 'Full Name', field: 'fullName' },
  { label: 'Job Title', field: 'jobTitle' },
  { label: 'Department', field: 'department' },
  { label: 'Country', field: 'country' },
  { label: 'Salary', field: 'salary' },
  { label: 'Start Date', field: 'startDate' },
];

const TABLE_COLUMN_WIDTHS = [
  '15%',
  '16%',
  '11%',
  '10%',
  '10%',
  '10%',
  '12%',
  '16%',
] as const;

const TABLE_ROW_HEIGHT_CLASS = 'h-11';
const TABLE_HEADER_CELL_CLASS = `max-w-0 px-4 py-0 align-middle ${TABLE_ROW_HEIGHT_CLASS}`;
const TABLE_DATA_CELL_CLASS = `max-w-0 px-4 py-0 align-middle ${TABLE_ROW_HEIGHT_CLASS}`;
const TABLE_ACTIONS_CELL_CLASS = `px-4 py-0 align-middle whitespace-nowrap ${TABLE_ROW_HEIGHT_CLASS}`;

function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading employees"
      className="space-y-3"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse rounded bg-gray-200"
        />
      ))}
    </div>
  );
}

function DeleteConfirmationDialog({
  employee,
  onCancel,
  onConfirm,
  isDeleting,
}: {
  employee: Employee;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 id="delete-dialog-title" className="text-lg font-semibold text-gray-900">
          Delete employee
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete {employee.fullName}? This action cannot be
          undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Confirm delete
          </button>
        </div>
      </div>
    </div>
  );
}

function SortIcon({
  field,
  sortBy,
  sortOrder,
}: {
  field: EmployeeSortField;
  sortBy: EmployeeSortField;
  sortOrder: 'asc' | 'desc';
}) {
  const isActive = sortBy === field;
  const ascendingClass =
    isActive && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-300';
  const descendingClass =
    isActive && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-300';

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[18px] w-3 shrink-0 flex-col items-center justify-center"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`h-3 w-3 ${ascendingClass}`}
      >
        <path
          fillRule="evenodd"
          d="M10.53 3.47a.75.75 0 0 0-1.06 0L5.22 7.72a.75.75 0 0 0 1.06 1.06L10 5.06l3.72 3.72a.75.75 0 1 0 1.06-1.06l-4.25-4.25Z"
          clipRule="evenodd"
        />
      </svg>
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={`-mt-1.5 h-3 w-3 ${descendingClass}`}
      >
        <path
          fillRule="evenodd"
          d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

function TableCellContent({
  value,
  className = 'text-gray-700',
}: {
  value: string;
  className?: string;
}) {
  return (
    <div className={`truncate ${className}`} title={value}>
      {value}
    </div>
  );
}

function SortableHeader({
  column,
  sortBy,
  sortOrder,
  onSort,
}: {
  column: SortableColumn;
  sortBy: EmployeeSortField;
  sortOrder: 'asc' | 'desc';
  onSort: (field: EmployeeSortField) => void;
}) {
  return (
    <th
      scope="col"
      aria-sort={
        sortBy === column.field
          ? sortOrder === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
      className={`${TABLE_HEADER_CELL_CLASS} text-left font-medium text-gray-700`}
    >
      <button
        type="button"
        onClick={() => {
          onSort(column.field);
        }}
        className={`relative flex w-full items-center truncate pr-6 text-left hover:text-gray-900 ${TABLE_ROW_HEIGHT_CLASS}`}
      >
        {column.label}
        <span className="absolute right-0 top-1/2 -translate-y-1/2">
          <SortIcon field={column.field} sortBy={sortBy} sortOrder={sortOrder} />
        </span>
      </button>
    </th>
  );
}

export function EmployeeList({ pageSize }: Props) {
  const {
    employees,
    total,
    page,
    totalPages,
    sortBy,
    sortOrder,
    filters,
    isLoading,
    error,
    setPage,
    setFilters,
    toggleSort,
    deleteEmployeeById,
    refreshEmployees,
  } = useEmployees({ pageSize });

  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formEmployee, setFormEmployee] = useState<Employee | null | undefined>(
    undefined,
  );

  const handleConfirmDelete = async (employeeId: string) => {
    setIsDeleting(true);

    try {
      await deleteEmployeeById(employeeId);
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl p-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and review employee records
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormEmployee(null);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Employee
        </button>
      </header>

      <div className="mb-4 grid gap-4 md:grid-cols-4">
        <div>
          <label htmlFor="employee-search" className="mb-1 block text-sm font-medium text-gray-700">
            Search
          </label>
          <input
            id="employee-search"
            type="search"
            value={filters.search}
            onChange={(event) => {
              setFilters({ search: event.target.value });
            }}
            placeholder="Search by name"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="country-filter" className="mb-1 block text-sm font-medium text-gray-700">
            Country
          </label>
          <select
            id="country-filter"
            value={filters.country}
            onChange={(event) => {
              setFilters({ country: event.target.value });
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All countries</option>
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="department-filter" className="mb-1 block text-sm font-medium text-gray-700">
            Department
          </label>
          <select
            id="department-filter"
            value={filters.department}
            onChange={(event) => {
              setFilters({ department: event.target.value });
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="employment-type-filter" className="mb-1 block text-sm font-medium text-gray-700">
            Employment Type
          </label>
          <select
            id="employment-type-filter"
            value={filters.employmentType}
            onChange={(event) => {
              setFilters({ employmentType: event.target.value });
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading && employees.length === 0 ? (
        <LoadingSkeleton />
      ) : employees.length === 0 ? (
        <p className="rounded-md border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-600">
          No employees match the current filters.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full table-fixed divide-y divide-gray-200 text-sm">
            <colgroup>
              {TABLE_COLUMN_WIDTHS.map((width, index) => (
                <col key={index} style={{ width }} />
              ))}
            </colgroup>
            <thead className="bg-gray-50">
              <tr className={TABLE_ROW_HEIGHT_CLASS}>
                {SORTABLE_COLUMNS.map((column) => (
                  <SortableHeader
                    key={column.field}
                    column={column}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={toggleSort}
                  />
                ))}
                <th
                  scope="col"
                  className={`${TABLE_HEADER_CELL_CLASS} text-left font-medium text-gray-700`}
                >
                  <div className={`flex items-center truncate ${TABLE_ROW_HEIGHT_CLASS}`}>
                    Employment Type
                  </div>
                </th>
                <th
                  scope="col"
                  className={`${TABLE_ACTIONS_CELL_CLASS} text-left font-medium text-gray-700`}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.id} className={TABLE_ROW_HEIGHT_CLASS}>
                  <td className={TABLE_DATA_CELL_CLASS}>
                    <TableCellContent value={employee.fullName} className="text-gray-900" />
                  </td>
                  <td className={TABLE_DATA_CELL_CLASS}>
                    <TableCellContent value={employee.jobTitle} />
                  </td>
                  <td className={TABLE_DATA_CELL_CLASS}>
                    <TableCellContent value={employee.department} />
                  </td>
                  <td className={TABLE_DATA_CELL_CLASS}>
                    <TableCellContent value={employee.country} />
                  </td>
                  <td className={TABLE_DATA_CELL_CLASS}>
                    <TableCellContent
                      value={formatSalary(employee.salary)}
                      className="tabular-nums text-gray-700"
                    />
                  </td>
                  <td className={TABLE_DATA_CELL_CLASS}>
                    <TableCellContent
                      value={formatDisplayDate(employee.startDate)}
                      className="tabular-nums text-gray-700"
                    />
                  </td>
                  <td className={TABLE_DATA_CELL_CLASS}>
                    <TableCellContent
                      value={formatEmploymentType(employee.employmentType)}
                    />
                  </td>
                  <td className={TABLE_ACTIONS_CELL_CLASS}>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormEmployee(employee);
                        }}
                        className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPendingDelete(employee);
                        }}
                        className="rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!error && employees.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">{total} employees total</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setPage(page - 1);
              }}
              disabled={page <= 1}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => {
                setPage(page + 1);
              }}
              disabled={page >= totalPages}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {formEmployee !== undefined && (
        <EmployeeForm
          employee={formEmployee ?? undefined}
          onCancel={() => {
            setFormEmployee(undefined);
          }}
          onSuccess={(_employee) => {
            setFormEmployee(undefined);
            void refreshEmployees();
          }}
        />
      )}

      {pendingDelete && (
        <DeleteConfirmationDialog
          employee={pendingDelete}
          onCancel={() => {
            setPendingDelete(null);
          }}
          onConfirm={() => {
            void handleConfirmDelete(pendingDelete.id);
          }}
          isDeleting={isDeleting}
        />
      )}
    </section>
  );
}
