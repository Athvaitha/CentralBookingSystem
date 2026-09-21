import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BookOpenCheck,
  BedDouble,
  SlidersHorizontal,
  RefreshCw,
  AlertTriangle,
  Settings,
  LogOut,
  Building2,
  X
} from 'lucide-react';
import { initialStats, initialHotelSettings } from '../../data/mockData';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/bookings', label: 'Bookings', icon: BookOpenCheck },
    { to: '/rooms', label: 'Rooms', icon: BedDouble },
    { to: '/availability', label: 'Availability', icon: SlidersHorizontal },
    { to: '/synchronization', label: 'Synchronization', icon: RefreshCw },
    { 
      to: '/conflicts', 
      label: 'Conflicts', 
      icon: AlertTriangle,
      badge: initialStats.conflictsCount,
      badgeVariant: 'conflict'
    },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  const admin = initialHotelSettings.adminProfile;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 40,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isOpen ? 'translateX(0)' : undefined,
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
            }}>
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                CBS Admin
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                Hotel Sync & Inventory
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="btn-icon"
            style={{ color: '#94a3b8', display: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', fontWeight: 700, padding: '8px 12px 12px' }}>
            Main Menu
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? '#2563eb' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && item.badge > 0 && (
                    <span style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin Profile Footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img 
                src={admin.avatar} 
                alt={admin.name} 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #3b82f6'
                }} 
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {admin.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {admin.role}
                </div>
              </div>
            </div>

            <button 
              title="Sign Out"
              onClick={() => alert("Logged out from CBS Admin session.")}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
