import { Route, Routes } from 'react-router-dom';
import { NavBar } from '@/components/NavBar';
import { EmployeeList } from '@/features/employees/EmployeeList';
import { InsightsDashboard } from '@/features/insights/InsightsDashboard';

function App() {
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

export default App;
