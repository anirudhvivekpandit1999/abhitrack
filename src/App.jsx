import './App.css';
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FullExcelFile from './pages/FullExcelFile';

const Login = lazy(() => import('./pages/Login'));
const Landing = lazy(() => import('./pages/Landing'));
const DataFileChecks = lazy(() => import('./pages/DataFileChecks'));
const CalculatedColumnsBuilder = lazy(() => import('./pages/CalculatedColumnsBuilder'));
const DependencyModel = lazy(() => import('./pages/DependencyModel'));
const VisualizeData = lazy(() => import('./pages/VisualizeData'));
const NonAbhitechLogin = lazy(() => import('./pages/NonAbhitechLogin'));
const NonAbhitechSignup = lazy(() => import('./pages/NonAbhitechSignup'));
const Payment = lazy(() => import('./pages/Payment'));
const UserManual = lazy(() => import('./pages/UserManual'));
const NotFound = lazy(() => import('./pages/NotFound'));

const GlobalLoadingIndicator = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-gray-200 z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Suspense fallback={<GlobalLoadingIndicator />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/non-abhitech-login" element={<NonAbhitechLogin />} />
          <Route path="/non-abhitech-signup" element={<NonAbhitechSignup />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/" element={<Landing />} />
          <Route path="/full-excel-file" element={<FullExcelFile />} />
          <Route path="/data-file-checks" element={<ProtectedRoute><DataFileChecks /></ProtectedRoute>} />
          <Route path="/calculated-columns-builder" element={<ProtectedRoute><CalculatedColumnsBuilder /></ProtectedRoute>} />
          <Route path="/dependency-model" element={<ProtectedRoute><DependencyModel /></ProtectedRoute>} />
          <Route path="/visualize-data" element={<ProtectedRoute><VisualizeData /></ProtectedRoute>} />
          <Route path="/manual" element={<UserManual />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </AuthProvider>
  );
}

export default App;