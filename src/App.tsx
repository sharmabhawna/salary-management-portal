import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { EmployeeList } from '@/features/employees/EmployeeList';
import { InsightsDashboard } from '@/features/insights/InsightsDashboard';

export function AppRoutes() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<EmployeeList />} />
          <Route path="/insights" element={<InsightsDashboard />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
