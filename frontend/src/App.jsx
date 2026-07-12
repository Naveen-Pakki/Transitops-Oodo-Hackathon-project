import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/authentication/Login';
import ResetPassword from './pages/authentication/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Vehicles from './pages/vehicles/Vehicles';
import Drivers from './pages/drivers/Drivers';
import Trips from './pages/trips/Trips';
import Maintenance from './pages/maintenance/Maintenance';
import Fuel from './pages/expenses/Fuel';
import Expenses from './pages/expenses/Expenses';
import Reports from './pages/reports/Reports';

function App() {
  return (
    <CurrencyProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Secure Layout Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route 
              path="vehicles" 
              element={
                <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST']}>
                  <Vehicles />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="drivers" 
              element={
                <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']}>
                  <Drivers />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="trips" 
              element={
                <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST']}>
                  <Trips />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="maintenance" 
              element={
                <ProtectedRoute allowedRoles={['FLEET_MANAGER']}>
                  <Maintenance />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="fuel" 
              element={
                <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
                  <Fuel />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="expenses" 
              element={
                <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
                  <Expenses />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="reports" 
              element={
                <ProtectedRoute allowedRoles={['FLEET_MANAGER', 'FINANCIAL_ANALYST']}>
                  <Reports />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Fallback Catch All */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
     </AuthProvider>
    </CurrencyProvider>
  );
}

export default App;
