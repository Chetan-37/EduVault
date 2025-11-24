import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { ManageCourses } from './pages/ManageCourses';
import { StudentDashboard } from './pages/StudentDashboard';
import { storageService } from './services/storageService';
import { UserRole } from './types';

// Protected Route Wrappers
interface ProtectedRouteProps {
  allowedRole?: UserRole;
}

const ProtectedRoute: React.FC<React.PropsWithChildren<ProtectedRouteProps>> = ({ children, allowedRole }) => {
  const user = storageService.getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect if role doesn't match
    return <Navigate to={user.role === UserRole.ADMIN ? '/admin' : '/student'} replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole={UserRole.ADMIN}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/courses" 
            element={
              <ProtectedRoute allowedRole={UserRole.ADMIN}>
                <ManageCourses />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRole={UserRole.STUDENT}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;