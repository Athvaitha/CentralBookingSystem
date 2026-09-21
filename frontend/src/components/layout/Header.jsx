import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { initialHotelSettings, initialChannels, initialConflicts } from '../../data/mockData';

export default function Header({ onOpenSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSyncDropdown, setShowSyncDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const titles = {
    '/dashboard': 'Dashboard Overview',
    '/calendar': 'Central Availability Calendar',
    '/bookings': 'Bookings Management',
    '/rooms': 'Hotel Rooms Inventory',
    '/availability': 'Availability & Maintenance Management',
    '/synchronization': 'Channel Synchronization Dashboard',
    '/conflicts': 'Booking Conflicts Resolution Center',
    '/settings': 'System & Hotel Settings'
  };

  const currentTitle = titles[location.pathname] || 'Central Booking System';
  const admin = initialHotelSettings.adminProfile;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/bookings?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      {/* Left: Mobile hamburger & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenSidebar}
          className="btn-icon"
          style={{ display: 'flex' }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.2 }}>
            {currentTitle}
          </h1>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            CBS / {location.pathname.replace('/', '') || 'dashboard'}
          </span>
        </div>
      </div>

      {/* Middle: Global Search */}
      <div style={{ maxWidth: '400px', width: '100%', margin: '0 24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
          <Search 
            size={16} 
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} 
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
            placeholder="Search guest, booking ID, or room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Right: Sync Status, Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
        {/* Sync Status Indicator */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSyncDropdown(!showSyncDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '6px 12px',
              borderRadius: '999px',
              color: '#065f46',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
            }} />
            <span>All systems synced</span>
            <ChevronDown size={14} />
          </button>

          {/* Sync Status Popup */}
          {showSyncDropdown && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '280px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              padding: '14px',
              zIndex: 100
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Channel Synchronization</span>
                <button 
                  onClick={() => navigate('/synchronization')} 
                  style={{ fontSize: '0.75rem', color: 'var(--primary)', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Manage
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {initialChannels.map(channel => (
                  <div key={channel.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 500 }}>{channel.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{channel.lastSync}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-icon"
            style={{ position: 'relative' }}
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444'
            }} />
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '320px',
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              zIndex: 100
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-app)'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>System Alerts & Activity</span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                  2 Actions Required
                </span>
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <div 
                  onClick={() => { setShowNotifications(false); navigate('/conflicts'); }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-light)',
                    display: 'flex',
                    gap: '10px',
                    cursor: 'pointer',
                    backgroundColor: '#fff5f5'
                  }}
                >
                  <AlertTriangle size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b' }}>Booking Conflict Detected</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room 101 double booked for Sep 25-27.</div>
                  </div>
                </div>

                <div 
                  onClick={() => { setShowNotifications(false); navigate('/synchronization'); }}
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>iCal Sync Completed</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Booking.com calendar feed updated 5 mins ago.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => navigate('/settings')}>
          <img
            src={admin.avatar}
            alt={admin.name}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid var(--border-strong)'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {admin.name}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
