import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, LoginPage, ProtectedRoute } from './features/auth';
import { UploadPage } from './features/data-upload';
import { PreprocessingPage } from './features/preprocessing';
import { ClusteringPage } from './features/clustering';
import { AnalysisPage } from './features/analysis';
import { SegmentsPage } from './features/segments';
import { ReportsPage } from './features/reports';
import { DashboardPage } from './features/dashboard';
import { Navbar } from './shared/components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/preprocess"
          element={
            <ProtectedRoute>
              <PreprocessingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clustering"
          element={
            <ProtectedRoute>
              <ClusteringPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/segments"
          element={
            <ProtectedRoute>
              <SegmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analysis"
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;