import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <div className="main-content-wrapper">
        <Header 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
        />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
