import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageContext';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import DashboardLayout from './components/DashboardLayout';
import AnalysisView from './components/AnalysisView';
import StatsView from './components/StatsView';
import UsersView from './components/UsersView';
import SalaryTreeView from './components/SalaryTreeView';
import TelemetryView from './components/TelemetryView';
import CompareView from './components/CompareView';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const role = localStorage.getItem('userRole');
  if (role !== 'admin') {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<AnalysisView />} />
            <Route path="tree" element={<SalaryTreeView />} />
            <Route path="compare" element={<CompareView />} />
            <Route path="stats" element={<AdminRoute><StatsView /></AdminRoute>} />
            <Route path="users" element={<AdminRoute><UsersView /></AdminRoute>} />
            <Route path="telemetry" element={<AdminRoute><TelemetryView /></AdminRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}



