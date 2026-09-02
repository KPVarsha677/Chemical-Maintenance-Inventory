import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { ChemicalDetail } from './pages/ChemicalDetail';
import { ChemicalForm } from './pages/ChemicalForm';
import { RecordUsage } from './pages/RecordUsage';
import { Transactions } from './pages/Transactions';
import { Alerts } from './pages/Alerts';
import { ExpiryFirst } from './pages/ExpiryFirst';
import { Assistant } from './pages/Assistant';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';

export function App() {
  return (
    <AuthProvider>
      <InventoryProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              element={
              <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }>

              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/new" element={<ChemicalForm />} />
              <Route path="/inventory/:id" element={<ChemicalDetail />} />
              <Route path="/inventory/:id/edit" element={<ChemicalForm />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/new" element={<RecordUsage />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/expiry-first" element={<ExpiryFirst />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </InventoryProvider>
    </AuthProvider>);

}