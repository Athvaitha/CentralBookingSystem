import React, { useState, useEffect } from 'react';
import { 
  Building, 
  RefreshCw, 
  Bell, 
  User, 
  Save, 
  CheckCircle, 
  Lock, 
  Shield, 
  Globe
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';

export default function Settings() {
  const { showToast } = useToast();

  const [settings, setSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('hotel'); // hotel, sync, notifications, profile
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    async function loadSettings() {
      const data = await api.getSettings();
      setSettings(data);
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await api.updateSettings(settings);
    showToast("Settings updated and persisted successfully!", "success");
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.next !== passwordForm.confirm) {
      showToast("New passwords do not match!", "error");
      return;
    }
    showToast("Admin password changed successfully!", "success");
    setIsPasswordModalOpen(false);
    setPasswordForm({ current: '', next: '', confirm: '' });
  };

  if (!settings) {
    return <div style={{ padding: '30px', color: 'var(--text-muted)' }}>Loading system preferences...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Settings Navigation Tabs */}
      <div className="card" style={{ padding: '8px 12px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            { id: 'hotel', label: 'Hotel Information', icon: Building },
            { id: 'sync', label: 'Synchronization Engine', icon: RefreshCw },
            { id: 'notifications', label: 'Notification Preferences', icon: Bell },
            { id: 'profile', label: 'Admin Profile', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                style={{ border: 'none' }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSaveSettings}>
        {/* 1. Hotel Information */}
        {activeTab === 'hotel' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div>
                <h2 className="card-title">Hotel Property Profile</h2>
                <p className="card-subtitle">General property identification and locale defaults</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Hotel / Property Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.hotelName}
                  onChange={(e) => setSettings({ ...settings, hotelName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Property Classification</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.propertyType}
                  onChange={(e) => setSettings({ ...settings, propertyType: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Physical Address</label>
              <input
                type="text"
                className="form-input"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Contact Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Reservations Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Property Timezone</label>
                <select
                  className="form-select"
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                >
                  <option value="Asia/Kolkata (GMT+05:30)">Asia/Kolkata (GMT+05:30)</option>
                  <option value="Europe/London (GMT+00:00)">Europe/London (GMT+00:00)</option>
                  <option value="America/New_York (GMT-05:00)">America/New_York (GMT-05:00)</option>
                  <option value="Asia/Dubai (GMT+04:00)">Asia/Dubai (GMT+04:00)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Base Currency</label>
                <select
                  className="form-select"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 2. Synchronization Settings */}
        {activeTab === 'sync' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div>
                <h2 className="card-title">Channel & iCal Synchronization Engine</h2>
                <p className="card-subtitle">Automated background fetch and conflict detection timing</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Default iCal Sync Interval</label>
                <select
                  className="form-select"
                  value={settings.syncSettings.defaultSyncInterval}
                  onChange={(e) => setSettings({
                    ...settings,
                    syncSettings: { ...settings.syncSettings, defaultSyncInterval: e.target.value }
                  })}
                >
                  <option value="10">Every 10 minutes</option>
                  <option value="15">Every 15 minutes (Standard)</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="60">Every 60 minutes</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Max Retry Attempts on Failed Sync</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  value={settings.syncSettings.retryCount}
                  onChange={(e) => setSettings({
                    ...settings,
                    syncSettings: { ...settings.syncSettings, retryCount: Number(e.target.value) }
                  })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.syncSettings.autoSyncEnabled}
                  onChange={(e) => setSettings({
                    ...settings,
                    syncSettings: { ...settings.syncSettings, autoSyncEnabled: e.target.checked }
                  })}
                />
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Enable Background Auto-Synchronization</span>
                  <p style={{ margin: 0, fontSize: '0.78rem' }}>Continuously poll connected OTA feeds on scheduled intervals.</p>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.syncSettings.retryFailedSync}
                  onChange={(e) => setSettings({
                    ...settings,
                    syncSettings: { ...settings.syncSettings, retryFailedSync: e.target.checked }
                  })}
                />
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Exponential Backoff Retry on Network Failure</span>
                  <p style={{ margin: 0, fontSize: '0.78rem' }}>Automatically retry disconnected channel feeds with exponential delay.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* 3. Notification Settings */}
        {activeTab === 'notifications' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div>
                <h2 className="card-title">Operational Alert Preferences</h2>
                <p className="card-subtitle">Configure real-time in-app badges and sound alerts</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.bookingConflicts}
                  onChange={(e) => setSettings({
                    ...settings,
                    notificationSettings: { ...settings.notificationSettings, bookingConflicts: e.target.checked }
                  })}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Immediate Conflict Alerts (High Priority)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Send urgent notification when two channels confirm the same room.</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.syncFailures}
                  onChange={(e) => setSettings({
                    ...settings,
                    notificationSettings: { ...settings.notificationSettings, syncFailures: e.target.checked }
                  })}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Channel Disconnection & iCal Sync Failures</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alert operations team when an OTA endpoint returns 4xx/5xx or timeout.</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.notificationSettings.newBookings}
                  onChange={(e) => setSettings({
                    ...settings,
                    notificationSettings: { ...settings.notificationSettings, newBookings: e.target.checked }
                  })}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>New Incoming External Bookings</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Notify front desk upon receiving new Airbnb/Booking.com reservations.</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* 4. Admin Profile */}
        {activeTab === 'profile' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-header" style={{ marginBottom: 0 }}>
              <div>
                <h2 className="card-title">Administrator Account Profile</h2>
                <p className="card-subtitle">Manage administrative user identity and security</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={settings.adminProfile.avatar}
                alt={settings.adminProfile.name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{settings.adminProfile.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{settings.adminProfile.role}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={settings.adminProfile.name}
                  onChange={(e) => setSettings({
                    ...settings,
                    adminProfile: { ...settings.adminProfile, name: e.target.value }
                  })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Admin Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={settings.adminProfile.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    adminProfile: { ...settings.adminProfile, email: e.target.value }
                  })}
                />
              </div>
            </div>

            <div style={{ paddingTop: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                <Lock size={16} /> Change Security Password
              </button>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={16} /> Save All Settings
          </button>
        </div>
      </form>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPasswordModalOpen(false)}
          title="Update Administrator Password"
          subtitle="Ensure password is at least 8 characters long"
        >
          <form onSubmit={handlePasswordChange}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  required
                  className="form-input"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsPasswordModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
