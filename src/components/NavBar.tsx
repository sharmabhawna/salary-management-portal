import { NavLink } from 'react-router-dom';

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'rounded-md bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700'
    : 'rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900';

export function NavBar() {
  return (
    <nav
      aria-label="Main navigation"
      className="border-b border-gray-200 bg-white shadow-sm"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <span className="text-lg font-semibold text-gray-900">Salary Management</span>
        <div className="flex gap-2">
          <NavLink to="/" end className={linkClassName}>
            Employees
          </NavLink>
          <NavLink to="/insights" className={linkClassName}>
            Insights
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
