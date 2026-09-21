import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Bed, 
  Users, 
  DollarSign, 
  Calendar, 
  Edit, 
  Ban, 
  Wrench, 
  CheckCircle, 
  Eye, 
  Layers, 
  LayoutGrid, 
  List,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/Toast';

export default function Rooms() {
  const { showToast } = useToast();
  const [rooms, setRooms] = useState([]);
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'table'
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingRoom, setViewingRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [blockModalRoom, setBlockModalRoom] = useState(null);

  // Add Room form state
  const [newRoom, setNewRoom] = useState({
    number: '',
    name: '',
    type: 'Deluxe',
    capacity: '2 Adults',
    bedType: '1 King Bed',
    pricePerNight: 160
  });

  // Block/Maintenance quick form state
  const [blockForm, setBlockForm] = useState({
    startDate: '2026-09-28',
    endDate: '2026-09-30',
    type: 'Blocked', // Blocked or Maintenance
    reason: ''
  });

  useEffect(() => {
    async function loadRooms() {
      const data = await api.getRooms();
      setRooms(data);
    }
    loadRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.number) return;
    const created = await api.createRoom(newRoom);
    setRooms(prev => [...prev, created]);
    setIsAddModalOpen(false);
    showToast(`Room ${created.number} created and added to inventory!`, 'success');
    setNewRoom({
      number: '',
      name: '',
      type: 'Deluxe',
      capacity: '2 Adults',
      bedType: '1 King Bed',
      pricePerNight: 160
    });
  };

  const handleUpdateStatus = async (roomId, newStatus) => {
    await api.updateRoomStatus(roomId, newStatus);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
    showToast(`Room status updated to ${newStatus}`, 'info');
  };

  const handleSaveBlock = async (e) => {
    e.preventDefault();
    await api.blockRoomDates({
      roomNumber: blockModalRoom.number,
      startDate: blockForm.startDate,
      endDate: blockForm.endDate,
      type: blockForm.type,
      reason: blockForm.reason || `${blockForm.type} by Admin`
    });
    // Update local room status
    await handleUpdateStatus(blockModalRoom.id, blockForm.type);
    setBlockModalRoom(null);
    showToast(`Room ${blockModalRoom.number} marked as ${blockForm.type}`, 'warning');
  };

  const filteredRooms = rooms.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Controls: Filter & Add Room */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
            {['ALL', 'Available', 'Booked', 'Blocked', 'Maintenance'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* View mode toggle & Add Room */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
              <button
                onClick={() => setViewType('grid')}
                className="btn-icon"
                style={{
                  backgroundColor: viewType === 'grid' ? '#ffffff' : 'transparent',
                  color: viewType === 'grid' ? 'var(--primary)' : 'var(--text-muted)'
                }}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewType('table')}
                className="btn-icon"
                style={{
                  backgroundColor: viewType === 'table' ? '#ffffff' : 'transparent',
                  color: viewType === 'table' ? 'var(--primary)' : 'var(--text-muted)'
                }}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={16} />
              + Add Room
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewType === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px'
        }}>
          {filteredRooms.map((room) => (
            <div key={room.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Room {room.number}
                    </h3>
                    <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {room.type}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {room.name}
                  </div>
                </div>

                <Badge status={room.status} />
              </div>

              {/* Room Specs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                padding: '12px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.82rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} color="var(--text-muted)" />
                  <span>{room.capacity}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bed size={14} color="var(--text-muted)" />
                  <span>{room.bedType}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <DollarSign size={14} color="var(--text-muted)" />
                  <span style={{ fontWeight: 700 }}>${room.pricePerNight} / night</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>Next: <strong>{room.nextAvailable}</strong></span>
                </div>
              </div>

              {/* Current Booking / Occupancy note */}
              {room.currentGuest && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderLeft: '3px solid var(--primary)', paddingLeft: '8px' }}>
                  Current Guest: <strong style={{ color: 'var(--text-main)' }}>{room.currentGuest}</strong>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: 'auto',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)'
              }}>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setViewingRoom(room)}
                >
                  <Eye size={14} /> View
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setBlockModalRoom(room);
                    setBlockForm({ startDate: '2026-09-28', endDate: '2026-09-30', type: 'Blocked', reason: '' });
                  }}
                >
                  <Ban size={14} /> Block Dates
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setBlockModalRoom(room);
                    setBlockForm({ startDate: '2026-09-28', endDate: '2026-09-30', type: 'Maintenance', reason: 'AC Repair' });
                  }}
                >
                  <Wrench size={14} /> Maintenance
                </button>
                {room.status !== 'Available' && (
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleUpdateStatus(room.id, 'Available')}
                  >
                    <CheckCircle size={14} /> Make Available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Room Type</th>
                  <th>Capacity</th>
                  <th>Rate</th>
                  <th>Current Status</th>
                  <th>Current Booking</th>
                  <th>Next Available</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>Room {r.number}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.name}</div>
                    </td>
                    <td>{r.type}</td>
                    <td>{r.capacity} ({r.bedType})</td>
                    <td style={{ fontWeight: 700 }}>${r.pricePerNight}</td>
                    <td>
                      <Badge status={r.status} />
                    </td>
                    <td>{r.currentGuest || '—'}</td>
                    <td>{r.nextAvailable}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setViewingRoom(r)}>
                          <Eye size={14} />
                        </button>
                        <button 
                          className="btn btn-sm btn-secondary" 
                          onClick={() => {
                            setBlockModalRoom(r);
                            setBlockForm({ startDate: '2026-09-28', endDate: '2026-09-30', type: 'Blocked', reason: '' });
                          }}
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD ROOM MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Hotel Room"
        subtitle="Register a new room unit into the central inventory"
      >
        <form onSubmit={handleCreateRoom}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Room Number *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. 301"
                  value={newRoom.number}
                  onChange={(e) => setNewRoom({ ...newRoom, number: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Room Type *</label>
                <select
                  className="form-select"
                  value={newRoom.type}
                  onChange={(e) => setNewRoom({ ...newRoom, type: e.target.value })}
                >
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                  <option value="Standard">Standard</option>
                  <option value="Family">Family</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Display Name / Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Deluxe Ocean View Suite"
                value={newRoom.name}
                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Bed Type</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1 King Bed"
                  value={newRoom.bedType}
                  onChange={(e) => setNewRoom({ ...newRoom, bedType: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Base Rate per Night ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newRoom.pricePerNight}
                  onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Room
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* QUICK BLOCK / MAINTENANCE MODAL */}
      {blockModalRoom && (
        <Modal
          isOpen={true}
          onClose={() => setBlockModalRoom(null)}
          title={`Hold Room ${blockModalRoom.number}`}
          subtitle={`Schedule blocked dates or maintenance for ${blockModalRoom.name}`}
        >
          <form onSubmit={handleSaveBlock}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Hold Type</label>
                <select
                  className="form-select"
                  value={blockForm.type}
                  onChange={(e) => setBlockForm({ ...blockForm, type: e.target.value })}
                >
                  <option value="Blocked">Blocked (Admin / Owner Hold)</option>
                  <option value="Maintenance">Maintenance (Cleaning, Repair, Inspection)</option>
                </select>
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
                  placeholder="e.g. VIP Hold, AC Filter Replacement, Deep Sanitation"
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setBlockModalRoom(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Schedule
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW ROOM MODAL */}
      {viewingRoom && (
        <Modal
          isOpen={true}
          onClose={() => setViewingRoom(null)}
          title={`Room ${viewingRoom.number} - ${viewingRoom.name}`}
          subtitle={`CBS Central Identifier: ${viewingRoom.id}`}
          footer={
            <button className="btn btn-secondary" onClick={() => setViewingRoom(null)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>${viewingRoom.pricePerNight} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ night</span></span>
              <Badge status={viewingRoom.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-app)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category</span>
                <div style={{ fontWeight: 600 }}>{viewingRoom.type}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bedding</span>
                <div style={{ fontWeight: 600 }}>{viewingRoom.bedType}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Capacity</span>
                <div style={{ fontWeight: 600 }}>{viewingRoom.capacity}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Next Available</span>
                <div style={{ fontWeight: 600 }}>{viewingRoom.nextAvailable}</div>
              </div>
            </div>

            <div>
              <label className="form-label">Room Amenities</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {viewingRoom.amenities?.map((am, i) => (
                  <span key={i} style={{ fontSize: '0.78rem', background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: '999px' }}>
                    {am}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">CBS Outgoing iCal Feed</label>
              <div style={{ fontSize: '0.78rem', wordBreak: 'break-all', padding: '8px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '6px', fontFamily: 'monospace' }}>
                {viewingRoom.cbsIcalUrl}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
