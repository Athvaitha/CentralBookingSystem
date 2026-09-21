import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { ToastProvider } from './components/common/Toast';

import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Bookings from './pages/Bookings';
import Rooms from './pages/Rooms';
import Availability from './pages/Availability';
import Synchronization from './pages/Synchronization';
import Conflicts from './pages/Conflicts';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ToastProvider>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/availability" element={<Availability />} />
          <Route path="/synchronization" element={<Synchronization />} />
          <Route path="/conflicts" element={<Conflicts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </ToastProvider>
  );
}
