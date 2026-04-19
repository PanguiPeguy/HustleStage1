import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';

import AuthPage      from './pages/AuthPage';
import LandingPage   from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage   from './pages/ClientsPage';
import FacturesPage  from './pages/FacturesPage';
import NewFacturePage from './pages/NewFacturePage';
import ProfilePage   from './pages/ProfilePage';

import ProtectedRoute from './components/layout/ProtectedRoute';
import Sidebar        from './components/layout/Sidebar';
import { SettingsProvider } from './context/SettingsContext';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="app-root">
    <Sidebar />
    <div className="main-wrapper">
      <main className="page-content animate-fade-up">
        {children}
      </main>
      <footer className="page-footer">
        © 2026 InvoicePro — Solution de facturation SaaS
      </footer>
    </div>
  </div>
);

const App: React.FC = () => (
  <SettingsProvider>
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          },
          success: { iconTheme: { primary: '#10B981', secondary: 'transparent' } },
          error:   { iconTheme: { primary: '#EF4444', secondary: 'transparent' } },
        }}
      />
      <Routes>
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"     element={<AppLayout><DashboardPage /></AppLayout>} />
          <Route path="/clients"       element={<AppLayout><ClientsPage /></AppLayout>} />
          <Route path="/factures"      element={<AppLayout><FacturesPage /></AppLayout>} />
          <Route path="/newfactures"   element={<AppLayout><NewFacturePage /></AppLayout>} />
          <Route path="/factures/edit/:id" element={<AppLayout><NewFacturePage /></AppLayout>} />
          <Route path="/profile"       element={<AppLayout><ProfilePage /></AppLayout>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </SettingsProvider>
);

export default App;
