import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/Toast';

export default function Bookings() {
  const location = useLocation();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roomFilter, setRoomFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

  // New Booking Form state
  const [newBooking, setNewBooking] = useState({
    guestName: '',
    email: '',
    phone: '',
    roomNumber: 'Hut 101',
    checkIn: '2026-09-30',
    checkOut: '2026-10-02',
    adults: 2,
    children: 0,
    source: 'Manual / Walk-in',
    notes: ''
  });

  // Availability check state: null | { checking: boolean, available: boolean, message: string }
  const [availabilityCheck, setAvailabilityCheck] = useState(null);

  useEffect(() => {
    // Check URL params for search query from header
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) setSearchQuery(q);

    async function loadData() {
      const [b, r] = await Promise.all([
        api.getBookings(),
        api.getRooms()
      ]);
      setBookings(b);
      setRooms(r);
      if (r.length > 0) {
        setNewBooking(prev => ({ ...prev, roomNumber: r[0].number }));
      }
    }
    loadData();
  }, [location.search]);

  // Handle checking availability for manual booking
  const handleCheckAvailability = async () => {
    if (!newBooking.roomNumber || !newBooking.checkIn || !newBooking.checkOut) {
      showToast("Please choose a room, check-in, and check-out date first", "warning");
      return;
    }
    setAvailabilityCheck({ checking: true });
    const result = await api.checkAvailability(
      newBooking.roomNumber,
      newBooking.checkIn,
      newBooking.checkOut
    );
    setAvailabilityCheck({
      checking: false,
      available: result.available,
      message: result.available ? result.message : result.reason
    });
  };

  // Reset availability check if dates or room change
  const handleBookingFieldChange = (field, val) => {
    setNewBooking(prev => ({ ...prev, [field]: val }));
    setAvailabilityCheck(null);
  };

  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    if (!availabilityCheck || !availabilityCheck.available) {
      showToast("Please verify room availability before confirming", "warning");
      return;
    }

    const created = await api.createBooking(newBooking);
    setBookings(prev => [created, ...prev]);
    setIsAddModalOpen(false);
    showToast(`Booking ${created.id} created successfully!`, "success");
    // Reset form
    setNewBooking({
      guestName: '',
      email: '',
      phone: '',
      roomNumber: '101',
      checkIn: '2026-09-30',
      checkOut: '2026-10-02',
      adults: 2,
      children: 0,
      source: 'Admin / Offline',
      notes: ''
    });
    setAvailabilityCheck(null);
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm(`Are you sure you want to cancel booking ${id}?`)) {
      await api.cancelBooking(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
      showToast(`Booking ${id} marked as Cancelled`, "warning");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updated = await api.updateBooking(editingBooking.id, editingBooking);
    setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
    setEditingBooking(null);
    showToast(`Booking ${updated.id} updated successfully`, "success");
  };

  // Filtering
  const filteredBookings = bookings.filter(b => {
    if (sourceFilter !== 'ALL' && b.source !== sourceFilter) return false;
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (roomFilter !== 'ALL' && b.roomNumber !== roomFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.guestName.toLowerCase().includes(q);
      const matchId = b.id.toLowerCase().includes(q);
      const matchRoom = `room ${b.roomNumber}`.toLowerCase().includes(q) || b.roomNumber.includes(q);
      const matchEmail = b.email && b.email.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchRoom && !matchEmail) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Controls: Search, Filters, Add Booking */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Left: Search input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search 
              size={16} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} 
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
              placeholder="Search guest, ID, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Middle: Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <select
              className="form-select"
              style={{ width: 'auto', height: '38px', fontSize: '0.82rem' }}
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="ALL">All Sources</option>
              <option value="Manual / Walk-in">Manual / Walk-in</option>
              <option value="WhatsApp Direct">WhatsApp Direct</option>
              <option value="Phone Booking">Phone Booking</option>
              <option value="Koora Kotta Website">Koora Kotta Website</option>
              <option value="Airbnb">Airbnb</option>
              <option value="Booking.com">Booking.com</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', height: '38px', fontSize: '0.82rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Conflict">Conflict</option>
            </select>

            <select
              className="form-select"
              style={{ width: 'auto', height: '38px', fontSize: '0.82rem' }}
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="ALL">All Rooms</option>
              {rooms.map(r => (
                <option key={r.number} value={r.number}>Room {r.number}</option>
              ))}
            </select>
          </div>

          {/* Right: Add Booking Button */}
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} />
            + Add Booking
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Guests</th>
                <th>Source</th>
                <th>Status</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No bookings found matching current search or filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{b.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.guestName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Room {b.roomNumber}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.roomType}</div>
                    </td>
                    <td>{b.checkIn}</td>
                    <td>{b.checkOut}</td>
                    <td>
                      {b.adults} Adults{b.children > 0 ? `, ${b.children} Ch.` : ''}
                    </td>
                    <td>
                      <span className={`platform-pill ${
                        b.source === 'Airbnb' ? 'platform-airbnb' : 
                        b.source === 'Booking.com' ? 'platform-booking' : 
                        b.source === 'Hotel Website' ? 'platform-website' : 'platform-admin'
                      }`}>
                        {b.source}
                      </span>
                    </td>
                    <td>
                      <Badge status={b.status} />
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {b.createdAt}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn-icon"
                          onClick={() => setViewingBooking(b)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => setEditingBooking({ ...b })}
                          title="Edit Booking"
                        >
                          <Edit3 size={16} />
                        </button>
                        {b.status !== 'Cancelled' && (
                          <button
                            className="btn-icon"
                            style={{ color: '#dc2626' }}
                            onClick={() => handleCancelBooking(b.id)}
                            title="Cancel Booking"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--bg-app)'
        }}>
          <span>Showing {filteredBookings.length} of {bookings.length} reservations</span>
          <span>Central Booking System (CBS) Registry</span>
        </div>
      </div>

      {/* ADD MANUAL BOOKING MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAvailabilityCheck(null);
        }}
        title="Create Admin / Offline Booking"
        subtitle="Manually create a direct guest reservation with real-time inventory validation"
        maxWidth="650px"
      >
        <form onSubmit={handleCreateBookingSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Guest Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={newBooking.guestName}
                  onChange={(e) => handleBookingFieldChange('guestName', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. john@example.com"
                  value={newBooking.email}
                  onChange={(e) => handleBookingFieldChange('email', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+1 555-0199"
                  value={newBooking.phone}
                  onChange={(e) => handleBookingFieldChange('phone', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Select Room *</label>
                <select
                  className="form-select"
                  value={newBooking.roomNumber}
                  onChange={(e) => handleBookingFieldChange('roomNumber', e.target.value)}
                >
                  {rooms.map(r => (
                    <option key={r.number} value={r.number}>
                      {r.number} - {r.name} (₹{r.pricePerNight}/night)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Check-in Date *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={newBooking.checkIn}
                  onChange={(e) => handleBookingFieldChange('checkIn', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Check-out Date *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={newBooking.checkOut}
                  onChange={(e) => handleBookingFieldChange('checkOut', e.target.value)}
                />
              </div>
            </div>

            {/* Availability Check Action & Feedback Box */}
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Inventory Availability Check
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={handleCheckAvailability}
                  disabled={availabilityCheck?.checking}
                >
                  {availabilityCheck?.checking ? 'Checking...' : 'Check Availability'}
                </button>
              </div>

              {/* Status Outcome */}
              {availabilityCheck && (
                <div>
                  {availabilityCheck.available ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 'var(--radius-sm)',
                      color: '#065f46',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      <CheckCircle2 size={18} color="#10b981" />
                      <div>
                        <div>Room available</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 400, color: '#047857' }}>
                          ✓ Continue booking
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '10px 12px',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-sm)',
                      color: '#991b1b',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}>
                      <XCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div>
                        <div>Room unavailable</div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 400, color: '#b91c1c' }}>
                          ✕ {availabilityCheck.message || 'Cannot create booking due to scheduling overlap.'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Guests & Source */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Adults</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={newBooking.adults}
                  onChange={(e) => handleBookingFieldChange('adults', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Children</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={newBooking.children}
                  onChange={(e) => handleBookingFieldChange('children', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Booking Source</label>
                <select
                  className="form-select"
                  value={newBooking.source}
                  onChange={(e) => handleBookingFieldChange('source', e.target.value)}
                >
                  <option value="Manual / Walk-in">Manual / Walk-in</option>
                  <option value="WhatsApp Direct">WhatsApp Direct</option>
                  <option value="Phone Booking">Phone Booking</option>
                  <option value="Koora Kotta Website">Koora Kotta Website</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Booking.com">Booking.com</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Special Requests / Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Optional guest preferences..."
                value={newBooking.notes}
                onChange={(e) => handleBookingFieldChange('notes', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setAvailabilityCheck(null);
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!availabilityCheck?.available}
              title={!availabilityCheck?.available ? 'Run availability check first' : 'Confirm and add booking'}
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </Modal>

      {/* VIEW BOOKING MODAL */}
      {viewingBooking && (
        <Modal
          isOpen={true}
          onClose={() => setViewingBooking(null)}
          title={`Booking ${viewingBooking.id}`}
          subtitle={`Created on ${viewingBooking.createdAt}`}
          footer={
            <button className="btn btn-secondary" onClick={() => setViewingBooking(null)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Guest Details</label>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{viewingBooking.guestName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{viewingBooking.email}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{viewingBooking.phone}</div>
              </div>
              <div>
                <label className="form-label">Room Allocation</label>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Room {viewingBooking.roomNumber}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{viewingBooking.roomType}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '12px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Check-in</span>
                <div style={{ fontWeight: 700 }}>{viewingBooking.checkIn}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Check-out</span>
                <div style={{ fontWeight: 700 }}>{viewingBooking.checkOut}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Party</span>
                <div style={{ fontWeight: 700 }}>{viewingBooking.adults} Adults, {viewingBooking.children} Kids</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Source Channel</label>
                <Badge status={viewingBooking.source} />
              </div>
              <div>
                <label className="form-label">Reservation Status</label>
                <Badge status={viewingBooking.status} />
              </div>
            </div>

            {viewingBooking.notes && (
              <div>
                <label className="form-label">Special Notes</label>
                <div style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  {viewingBooking.notes}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* EDIT BOOKING MODAL */}
      {editingBooking && (
        <Modal
          isOpen={true}
          onClose={() => setEditingBooking(null)}
          title={`Edit Booking ${editingBooking.id}`}
          subtitle="Modify guest details or reservation status"
          footer={null}
        >
          <form onSubmit={handleEditSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Guest Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingBooking.guestName}
                  onChange={(e) => setEditingBooking({ ...editingBooking, guestName: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Check-in</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editingBooking.checkIn}
                    onChange={(e) => setEditingBooking({ ...editingBooking, checkIn: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Check-out</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editingBooking.checkOut}
                    onChange={(e) => setEditingBooking({ ...editingBooking, checkOut: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={editingBooking.status}
                    onChange={(e) => setEditingBooking({ ...editingBooking, status: e.target.value })}
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Conflict">Conflict</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Total Amount ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editingBooking.totalAmount || 0}
                    onChange={(e) => setEditingBooking({ ...editingBooking, totalAmount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={editingBooking.notes || ''}
                  onChange={(e) => setEditingBooking({ ...editingBooking, notes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingBooking(null)}>
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
