import { COUNTRIES } from '@/features/employees/employeeOptions';
import { useInsights } from '@/hooks/useInsights';
import { formatHeadcount, formatSalary } from '@/utils/format';

function PanelLoadingState({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="h-16 animate-pulse rounded bg-gray-200"
    />
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export function InsightsDashboard() {
  const {
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
  } = useInsights();

  return (
    <section className="mx-auto max-w-7xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Salary Insights</h1>
        <p className="mt-1 text-sm text-gray-600">
          Explore compensation analytics across the organization
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <article className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Country Salary Stats
          </h2>
          <form
            className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              void fetchCountryStats();
            }}
          >
            <div className="flex-1">
              <label
                htmlFor="country-stats-country"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Country
              </label>
              <select
                id="country-stats-country"
                value={countryStatsCountry}
                onChange={(event) => {
                  setCountryStatsCountry(event.target.value);
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
            </div>
            <button
              type="submit"
              disabled={!countryStatsCountry || countryStatsLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              View stats
            </button>
          </form>

          {countryStatsLoading ? (
            <div className="mt-4">
              <PanelLoadingState label="Loading country salary stats" />
            </div>
          ) : null}

          {countryStatsError ? (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {countryStatsError}
            </p>
          ) : null}

          {countryStatsMessage ? (
            <p className="mt-4 text-sm text-gray-600">{countryStatsMessage}</p>
          ) : null}

          {countryStats ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <StatCard label="Minimum" value={formatSalary(countryStats.min)} />
              <StatCard label="Maximum" value={formatSalary(countryStats.max)} />
              <StatCard label="Average" value={formatSalary(countryStats.average)} />
            </div>
          ) : null}
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Average Salary by Job Title
          </h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void fetchJobTitleInsight();
            }}
          >
            <div>
              <label
                htmlFor="job-title-input"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Job Title
              </label>
              <input
                id="job-title-input"
                type="text"
                value={jobTitleInput}
                onChange={(event) => {
                  setJobTitleInput(event.target.value);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="job-title-country"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Country
              </label>
              <select
                id="job-title-country"
                value={jobTitleCountry}
                onChange={(event) => {
                  setJobTitleCountry(event.target.value);
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
            </div>
            <button
              type="submit"
              disabled={!jobTitleInput || !jobTitleCountry || jobTitleLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              View average
            </button>
          </form>

          {jobTitleLoading ? (
            <div className="mt-4">
              <PanelLoadingState label="Loading job title salary insight" />
            </div>
          ) : null}

          {jobTitleError ? (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {jobTitleError}
            </p>
          ) : null}

          {jobTitleMessage ? (
            <p className="mt-4 text-sm text-gray-600">{jobTitleMessage}</p>
          ) : null}

          {jobTitleInsight ? (
            <div className="mt-4">
              <StatCard
                label={`Average salary for ${jobTitleInsight.jobTitle}`}
                value={formatSalary(jobTitleInsight.average)}
              />
            </div>
          ) : null}
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Salary by Department</h2>

          {departmentLoading ? (
            <div className="mt-4">
              <PanelLoadingState label="Loading department salary table" />
            </div>
          ) : departmentError ? (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {departmentError}
            </p>
          ) : departmentStats.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">
              No department salary data available.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left font-medium text-gray-700"
                    >
                      Department
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left font-medium text-gray-700"
                    >
                      Average Salary
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {departmentStats.map((stat) => (
                    <tr key={stat.department}>
                      <td className="px-4 py-3 text-gray-900">{stat.department}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatSalary(stat.average)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Headcount by Country
          </h2>

          {headcountLoading ? (
            <div className="mt-4">
              <PanelLoadingState label="Loading headcount by country table" />
            </div>
          ) : headcountError ? (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {headcountError}
            </p>
          ) : headcountStats.length === 0 ? (
            <p className="mt-4 text-sm text-gray-600">
              No headcount data available.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left font-medium text-gray-700"
                    >
                      Country
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-left font-medium text-gray-700"
                    >
                      Employee Count
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {headcountStats.map((stat) => (
                    <tr key={stat.country}>
                      <td className="px-4 py-3 text-gray-900">{stat.country}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {formatHeadcount(stat.headcount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
