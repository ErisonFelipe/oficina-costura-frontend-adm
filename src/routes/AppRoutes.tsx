import React from 'react';
import { Romaneios } from '../pages/Romaneios';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Quotes } from '../pages/Quotes';
import { QuoteDetail } from '../pages/QuoteDetail';
import { Users } from '../pages/Users';
import { Settings } from '../pages/Settings';
import { NotFound } from '../pages/NotFound';
import { AdminLayout } from '../components/layout/AdminLayout';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Protegidas — envolvidas pelo layout admin */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/quotes/:id" element={<QuoteDetail />} />
	  <Route path="/romaneios" element={<Romaneios />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole={['ADMIN']}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole={['ADMIN']}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
