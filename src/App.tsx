import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthContainer } from './components/auth/AuthContainer';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewPage } from './components/pages/OverviewPage';
import { CallsPage } from './components/pages/CallsPage';
import { BookingsPage } from './components/pages/BookingsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
            {user ? (
              <>
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<OverviewPage />} />
                  <Route path="calls" element={<CallsPage />} />
                  <Route path="bookings" element={<BookingsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            ) : (
              <>
                <Route path="/auth" element={<AuthContainer />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </>
            )}
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;