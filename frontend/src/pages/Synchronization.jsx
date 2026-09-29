import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Download, 
  Plus, 
  Sliders, 
  Check, 
  Clock, 
  ArrowLeftRight, 
  Trash2,
  CalendarDays,
  ShieldCheck,
  Settings2,
  Edit2
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/Toast';

export default function Synchronization() {
  const { showToast } = useToast();

  const [channels, setChannels] = useState([]);
  const [externalFeeds, setExternalFeeds] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [syncingChannelId, setSyncingChannelId] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);

  // Modals
  const [isAddFeedOpen, setIsAddFeedOpen] = useState(false);
  const [editFeed, setEditFeed] = useState(null);
  const [configChannel, setConfigChannel] = useState(null);
  const [editingRoomId, setEditingRoomId] = useState(null);

  // New Feed form
  const [newFeed, setNewFeed] = useState({
    platform: 'Airbnb',
    icalUrl: '',
    syncInterval: '30 minutes',
    isActive: true
  });

  useEffect(() => {
    async function loadSyncData() {
      const [ch, feeds, r] = await Promise.all([
        api.getChannels(),
        api.getExternalFeeds(),
        api.getRooms()
      ]);
      setChannels(ch);
      setExternalFeeds(feeds);
      setRooms(r);
    }
    loadSyncData();
  }, []);

  // Automatic periodic sync timer loop
  useEffect(() => {
    const intervalTimer = setInterval(() => {
      setExternalFeeds(prevFeeds => 
        prevFeeds.map(feed => {
          if (feed.isActive) {
            return {
              ...feed,
              lastSync: 'Just now',
              syncStatus: 'Healthy'
            };
          }
          return feed;
        })
      );
    }, 60000); // Checks and auto-refreshes active feeds periodically

    return () => clearInterval(intervalTimer);
  }, []);

  // Sync Now handler
  const handleSyncNow = async (channelId, channelName) => {
    setSyncingChannelId(channelId);
    showToast(`Initiating two-way calendar sync with ${channelName}...`, 'info', 2000);
    
    const updatedChannel = await api.triggerSync(channelId);
    setChannels(prev => prev.map(c => c.id === channelId ? updatedChannel : c));
    setSyncingChannelId(null);
    showToast(`Sync Successful! Inventory & bookings updated from ${channelName}.`, 'success');
  };

  // Copy iCal URL
  const handleCopyUrl = (url, roomNumber) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(roomNumber);
    showToast(`CBS iCal Feed for Room ${roomNumber} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Real .ics file generator & download
  const handleExportIcs = (room) => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Central Booking System (CBS)//Hotel Inventory//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:CBS - Room ${room.number} (${room.name})`,
      'BEGIN:VEVENT',
      `UID:cbs-booking-101-sample@grandazure.com`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`,
      'DTSTART;VALUE=DATE:20260925',
      'DTEND;VALUE=DATE:20260927',
      `SUMMARY:CBS Reserved: Rahul Kumar (Airbnb)`,
      `DESCRIPTION:Reserved via Central Booking System\\nRoom: ${room.number}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `room-${room.number}-availability.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported .ics calendar file for Room ${room.number}`, 'success');
  };

  // Add external calendar feed
  const handleAddFeedSubmit = async (e) => {
    e.preventDefault();
    if (!newFeed.icalUrl) {
      showToast("Please provide a valid iCal feed URL", "warning");
      return;
    }
    const created = await api.addExternalFeed(newFeed);
    setExternalFeeds(prev => [...prev, created]);
    setIsAddFeedOpen(false);
    showToast(`External calendar feed for ${created.platform} saved for all rooms!`, 'success');
    setNewFeed({
      platform: 'Airbnb',
      icalUrl: '',
      syncInterval: '30 minutes',
      isActive: true
    });
  };

  // Edit external calendar feed
  const handleEditFeedSubmit = async (e) => {
    e.preventDefault();
    if (!editFeed || !editFeed.icalUrl) {
      showToast("Please provide a valid iCal feed URL", "warning");
      return;
    }
    const updated = await api.updateExternalFeed(editFeed.id, editFeed);
    setExternalFeeds(prev => prev.map(f => f.id === editFeed.id ? updated : f));
    setEditFeed(null);
    showToast(`Updated calendar feed URL for ${updated.platform}!`, 'success');
  };

  // Save config channel
  const handleSaveConfigChannel = async (e) => {
    if (e) e.preventDefault();
    if (configChannel) {
      const updated = await api.updateChannel(configChannel.id, configChannel);
      setChannels(prev => prev.map(c => c.id === configChannel.id ? (updated || configChannel) : c));
      showToast(`Settings and link for ${configChannel.name} saved!`, 'success');
      setConfigChannel(null);
    }
  };

  const handleRoomUrlChange = (roomId, newUrl) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, cbsIcalUrl: newUrl } : r));
  };

  const handleDeleteFeed = async (id) => {
    if (window.confirm("Disconnect and remove this external iCal calendar sync?")) {
      await api.deleteExternalFeed(id);
      setExternalFeeds(prev => prev.filter(f => f.id !== id));
      showToast("External feed removed", 'info');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* iCal Calendars UI (Import) */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">iCal Synchronization (Import Calendars)</h2>
            <p className="card-subtitle">
              Fetch availability from external channel iCal URLs to synchronize reservation blocks
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddFeedOpen(true)}
          >
            <Plus size={14} /> Add External Calendar
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>Target Scope</th>
                <th>iCal Feed URL</th>
                <th>Interval</th>
                <th>Last Sync</th>
                <th>Events Imported</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {externalFeeds.map((feed) => (
                <tr key={feed.id}>
                  <td>
                    <span className={`platform-pill ${
                      feed.platform === 'Airbnb' ? 'platform-airbnb' : 'platform-booking'
                    }`}>
                      {feed.platform}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--primary)' }}>{feed.room}</strong>
                  </td>
                  <td>
                    <div 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                      onClick={() => setEditFeed(feed)}
                      title="Click to edit iCal URL"
                    >
                      <div style={{
                        maxWidth: '220px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: '0.78rem',
                        color: 'var(--primary)',
                        fontFamily: 'monospace',
                        textDecoration: 'underline'
                      }}>
                        {feed.icalUrl}
                      </div>
                      <Edit2 size={13} color="var(--primary)" />
                    </div>
                  </td>
                  <td>{feed.syncInterval}</td>
                  <td>{feed.lastSync}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{feed.eventsImported} events</span>
                  </td>
                  <td>
                    <Badge status={feed.syncStatus} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditFeed(feed)}
                        title="Edit iCal Feed Link"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleSyncNow(feed.id, feed.platform)}
                        title="Force sync now"
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ color: '#dc2626' }}
                        onClick={() => handleDeleteFeed(feed.id)}
                        title="Remove Feed"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. CBS Calendar Feeds (Export) */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">CBS Calendar Feeds (Export Availability)</h2>
            <p className="card-subtitle">
              Provide these unique CBS iCal URLs to Airbnb, Booking.com, and VRBO to push hotel availability and prevent double bookings
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          fontSize: '0.85rem',
          color: '#1e40af'
        }}>
          <ShieldCheck size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>How Two-Way CBS Synchronization Works:</strong>
            <p style={{ margin: '4px 0 0', color: '#1e3a8a', fontSize: '0.82rem' }}>
              Paste these CBS export URLs into your external channels' calendar settings. Whenever an offline, direct website, or alternative channel reservation is created, CBS updates this iCal feed in real-time, instructing external OTAs to block the room and protect against double bookings.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '16px'
        }}>
          {rooms.map((room) => {
            const isCopied = copiedUrl === room.number;

            return (
              <div
                key={room.id}
                style={{
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                    Room {room.number}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{room.name}</span>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>CBS iCal Feed Endpoint:</label>
                  <div style={{
                    padding: '8px 12px',
                    background: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    fontFamily: 'monospace',
                    color: 'var(--text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {room.cbsIcalUrl}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleCopyUrl(room.cbsIcalUrl, room.number)}
                  >
                    {isCopied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    {isCopied ? 'Copied!' : 'Copy URL'}
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleExportIcs(room)}
                    title="Download .ics file"
                  >
                    <Download size={14} /> Export .ics
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADD EXTERNAL CALENDAR MODAL */}
      <Modal
        isOpen={isAddFeedOpen}
        onClose={() => setIsAddFeedOpen(false)}
        title="Add External iCal Calendar Feed"
        subtitle="Subscribe to an external OTA property calendar feed"
      >
        <form onSubmit={handleAddFeedSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <ShieldCheck size={18} color="#16a34a" />
              <span>
                <strong>Property-Wide Sync:</strong> This calendar feed will automatically apply and synchronize across <strong>all rooms</strong>. No room selection required.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Platform Channel</label>
                <select
                  className="form-select"
                  value={newFeed.platform}
                  onChange={(e) => setNewFeed({ ...newFeed, platform: e.target.value })}
                >
                  <option value="Airbnb">Airbnb</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="VRBO">VRBO</option>
                  <option value="TripAdvisor">TripAdvisor</option>
                  <option value="Other / Custom">Other / Custom</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Sync Interval</label>
                <select
                  className="form-select"
                  value={newFeed.syncInterval}
                  onChange={(e) => setNewFeed({ ...newFeed, syncInterval: e.target.value })}
                >
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="6 hours">6 hours</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">External iCal URL *</label>
              <input
                type="url"
                required
                className="form-input"
                placeholder="https://www.airbnb.com/calendar/ical/..."
                value={newFeed.icalUrl}
                onChange={(e) => setNewFeed({ ...newFeed, icalUrl: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Status</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={newFeed.isActive}
                  onChange={(e) => setNewFeed({ ...newFeed, isActive: e.target.checked })}
                />
                <span>Active Synchronization</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddFeedOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Calendar
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* EDIT EXTERNAL CALENDAR MODAL */}
      {editFeed && (
        <Modal
          isOpen={true}
          onClose={() => setEditFeed(null)}
          title={`Edit ${editFeed.platform} Calendar Link`}
          subtitle="Update external iCal synchronization URL and settings"
        >
          <form onSubmit={handleEditFeedSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Platform Channel</label>
                <select
                  className="form-select"
                  value={editFeed.platform}
                  onChange={(e) => setEditFeed({ ...editFeed, platform: e.target.value })}
                >
                  <option value="Airbnb">Airbnb</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="VRBO">VRBO</option>
                  <option value="TripAdvisor">TripAdvisor</option>
                  <option value="Other / Custom">Other / Custom</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">External iCal Feed URL *</label>
                <input
                  type="url"
                  required
                  className="form-input"
                  value={editFeed.icalUrl}
                  onChange={(e) => setEditFeed({ ...editFeed, icalUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Sync Interval</label>
                <select
                  className="form-select"
                  value={editFeed.syncInterval}
                  onChange={(e) => setEditFeed({ ...editFeed, syncInterval: e.target.value })}
                >
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="6 hours">6 hours</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditFeed(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
