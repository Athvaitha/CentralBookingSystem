import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Ban, 
  Wrench, 
  CheckCircle2, 
  Calendar, 
  Trash2, 
  ArrowRight,
  Info,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import { useToast } from '../components/common/Toast';

export default function Availability() {
  const { showToast } = useToast();

  const [rooms, setRooms] = useState([]);
  const [activeBlocks, setActiveBlocks] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('101');

  // Block form
  const [blockForm, setBlockForm] = useState({
    startDate: '2026-09-28',
    endDate: '2026-09-30',
    type: 'Blocked', // Blocked, Maintenance
    reason: 'Owner Personal Stay'
  });

  useEffect(() => {
    async function loadData() {
      const [r, blk, b] = await Promise.all([
        api.getRooms(),
        api.getActiveBlocks(),
        api.getBookings()
      ]);
      setRooms(r);
      setActiveBlocks(blk);
      setBookings(b);
    }
    loadData();
  }, []);

  const handleApplyHold = async (e) => {
    e.preventDefault();
    const created = await api.blockRoomDates({
      roomNumber: selectedRoomNumber,
      startDate: blockForm.startDate,
      endDate: blockForm.endDate,
      type: blockForm.type,
      reason: blockForm.reason
    });
    setActiveBlocks(prev => [created, ...prev]);
    showToast(`Room ${selectedRoomNumber} ${blockForm.type.toLowerCase()} from ${blockForm.startDate} to ${blockForm.endDate}`, 'success');
  };

  const handleRemoveBlock = async (id) => {
    if (window.confirm("Remove this hold and make dates available again?")) {
      await api.removeBlock(id);
      setActiveBlocks(prev => prev.filter(b => b.id !== id));
      showToast("Room hold removed. Dates returned to Available status.", 'info');
    }
  };

  // Generate 7-day timeline preview for the selected room
  const getTimelineDays = () => {
    const days = [];
    const base = new Date('2026-09-25T00:00:00');
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const ymd = d.toISOString().split('T')[0];

      // Check booking
      const bk = bookings.find(b => b.roomNumber === selectedRoomNumber && b.status !== 'Cancelled' && ymd >= b.checkIn && ymd <= b.checkOut);
      if (bk) {
        days.push({ date: d, ymd, status: 'Booked', detail: `Booked: ${bk.guestName} (${bk.source})` });
        continue;
      }

      // Check block
      const blk = activeBlocks.find(b => b.roomNumber === selectedRoomNumber && ymd >= b.startDate && ymd <= b.endDate);
      if (blk) {
        days.push({ date: d, ymd, status: blk.type, detail: `${blk.type}: ${blk.reason}` });
        continue;
      }

      days.push({ date: d, ymd, status: 'Available', detail: 'Available for reservation' });
    }
    return days;
  };

  const timeline = getTimelineDays();
  const currentRoom = rooms.find(r => r.number === selectedRoomNumber);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Split: Room Selection & Blocking Controls vs Live Schedule Preview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {/* Blocking Form Controller */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Inventory Block / Maintenance Controller</h2>
              <p className="card-subtitle">Take rooms out of rotation or mark for servicing</p>
            </div>
          </div>

          <form onSubmit={handleApplyHold}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Select Room</label>
                <select
                  className="form-select"
                  value={selectedRoomNumber}
                  onChange={(e) => setSelectedRoomNumber(e.target.value)}
                >
                  {rooms.map(r => (
                    <option key={r.number} value={r.number}>
                      Room {r.number} – {r.name} ({r.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Hold Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setBlockForm({ ...blockForm, type: 'Blocked', reason: 'Owner Stay' })}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: blockForm.type === 'Blocked' ? '2px solid #64748b' : '1px solid var(--border-color)',
                      backgroundColor: blockForm.type === 'Blocked' ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    <Ban size={16} color="#64748b" />
                    Block Room
                  </button>

                  <button
                    type="button"
                    onClick={() => setBlockForm({ ...blockForm, type: 'Maintenance', reason: 'AC Servicing & Deep Cleaning' })}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: blockForm.type === 'Maintenance' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                      backgroundColor: blockForm.type === 'Maintenance' ? '#fffbeb' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    <Wrench size={16} color="#d97706" />
                    Maintenance
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={blockForm.startDate}
                    onChange={(e) => setBlockForm({ ...blockForm, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={blockForm.endDate}
                    onChange={(e) => setBlockForm({ ...blockForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Reason / Work Order Notes</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. VIP offline hold, Deep renovation, Plumbing fix"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '6px' }}>
                Apply Availability Change
              </button>
            </div>
          </form>
        </div>

        {/* Live Daily Schedule Preview */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Room {selectedRoomNumber} Schedule Overview</h2>
              <p className="card-subtitle">Upcoming 7-day operational timeline</p>
            </div>
            {currentRoom && (
              <Badge status={currentRoom.status} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {timeline.map((day) => {
              const statusColors = {
                Available: { bg: 'var(--bg-available)', text: '#065f46', border: 'var(--border-available)' },
                Booked: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
                Blocked: { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' },
                Maintenance: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' }
              };
              const sc = statusColors[day.status] || statusColors.Available;

              return (
                <div
                  key={day.ymd}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: sc.bg,
                    border: `1px solid ${sc.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontWeight: 700, width: '100px', color: 'var(--text-main)' }}>
                      {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                    </div>
                    <ArrowRight size={14} color="var(--text-subtle)" />
                    <div style={{ fontWeight: 500, color: sc.text }}>
                      {day.detail}
                    </div>
                  </div>

                  <Badge status={day.status} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Blocks & Scheduled Maintenance Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Active Holds & Maintenance Periods</h2>
            <p className="card-subtitle">Currently enforced manual holds in central system</p>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Hold ID</th>
                <th>Room</th>
                <th>Category</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason / Description</th>
                <th>Created By</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeBlocks.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No active blocks or maintenance schedules.
                  </td>
                </tr>
              ) : (
                activeBlocks.map((blk) => (
                  <tr key={blk.id}>
                    <td>
                      <span style={{ fontWeight: 700 }}>{blk.id}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>Room {blk.roomNumber}</strong>
                    </td>
                    <td>
                      <Badge status={blk.type} />
                    </td>
                    <td>{blk.startDate}</td>
                    <td>{blk.endDate}</td>
                    <td>{blk.reason}</td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{blk.createdBy}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        style={{ color: '#dc2626' }}
                        onClick={() => handleRemoveBlock(blk.id)}
                        title="Unblock and restore availability"
                      >
                        <Trash2 size={14} /> Unblock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
