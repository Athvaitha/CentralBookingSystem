import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter, 
  Eye, 
  Clock, 
  BedDouble, 
  Info,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

export default function Calendar() {
  const [viewMode, setViewMode] = useState('week'); // day, week, month
  const [currentDate, setCurrentDate] = useState(new Date('2026-09-24T00:00:00'));
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeBlocks, setActiveBlocks] = useState([]);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('ALL');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null); // for detail modal

  useEffect(() => {
    async function loadCalendarData() {
      const [r, b, blk] = await Promise.all([
        api.getRooms(),
        api.getBookings(),
        api.getActiveBlocks()
      ]);
      setRooms(r);
      setBookings(b);
      setActiveBlocks(blk);
    }
    loadCalendarData();
  }, []);

  // Compute date columns based on viewMode
  const getDateRange = () => {
    const dates = [];
    const base = new Date(currentDate);
    let count = 7;
    if (viewMode === 'day') count = 1;
    if (viewMode === 'month') count = 14; // Clean bi-weekly / 14-day window for high clarity

    for (let i = 0; i < count; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const dates = getDateRange();

  const handlePrev = () => {
    const next = new Date(currentDate);
    const step = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 14;
    next.setDate(next.getDate() - step);
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    const step = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 14;
    next.setDate(next.getDate() + step);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-09-25T00:00:00'));
  };

  // Helper to get day string YYYY-MM-DD
  const formatYMD = (d) => {
    return d.toISOString().split('T')[0];
  };

  // Find cell status for a room and date
  const getCellState = (roomNumber, dateObj) => {
    const ymd = formatYMD(dateObj);

    // 1. Check booking
    const booking = bookings.find(b => {
      if (b.roomNumber !== roomNumber || b.status === 'Cancelled') return false;
      return ymd >= b.checkIn && ymd <= b.checkOut;
    });

    if (booking) {
      if (selectedSourceFilter !== 'ALL' && booking.source !== selectedSourceFilter) {
        return { type: 'AVAILABLE' };
      }
      return {
        type: 'BOOKED',
        data: booking,
        label: `${booking.guestName} (${booking.source})`
      };
    }

    // 2. Check blocks / maintenance
    const block = activeBlocks.find(blk => {
      if (blk.roomNumber !== roomNumber) return false;
      return ymd >= blk.startDate && ymd <= blk.endDate;
    });

    if (block) {
      return {
        type: block.type.toUpperCase(), // BLOCKED or MAINTENANCE
        data: block,
        label: `${block.type}: ${block.reason}`
      };
    }

    return { type: 'AVAILABLE' };
  };

  const filteredRooms = rooms.filter(r => {
    if (selectedRoomFilter !== 'ALL' && r.number !== selectedRoomFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Calendar Header Controls */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Left: Navigation & Date Range */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleToday}>
              Today
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button className="btn-icon" onClick={handlePrev} title="Previous">
                <ChevronLeft size={18} />
              </button>
              <button className="btn-icon" onClick={handleNext} title="Next">
                <ChevronRight size={18} />
              </button>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              {dates[0]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {dates.length > 1 && ` – ${dates[dates.length - 1]?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </div>
          </div>

          {/* Right: View switcher & Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            {/* View Mode Switcher */}
            <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
              {['day', 'week', 'month'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    backgroundColor: viewMode === mode ? '#ffffff' : 'transparent',
                    color: viewMode === mode ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: viewMode === mode ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {mode} View
                </button>
              ))}
            </div>

            {/* Room Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
              value={selectedRoomFilter}
              onChange={(e) => setSelectedRoomFilter(e.target.value)}
            >
              <option value="ALL">All Rooms ({rooms.length})</option>
              {rooms.map(r => (
                <option key={r.number} value={r.number}>Room {r.number}</option>
              ))}
            </select>

            {/* Source Filter */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
            >
              <option value="ALL">All Sources</option>
              <option value="Airbnb">Airbnb</option>
              <option value="Booking.com">Booking.com</option>
              <option value="Hotel Website">Hotel Website</option>
              <option value="Admin / Offline">Admin / Offline</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <span style={{ fontWeight: 600 }}>Legend:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--bg-available)', border: '1px solid var(--border-available)' }} />
            <span>AVAILABLE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fee2e2', border: '1px solid #fca5a5' }} />
            <span>BOOKED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f1f5f9', border: '1px solid #cbd5e1' }} />
            <span>BLOCKED</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fef3c7', border: '1px solid #fcd34d' }} />
            <span>MAINTENANCE</span>
          </div>
        </div>
      </div>

      {/* Calendar Matrix Grid */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '850px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                {/* Room sticky column */}
                <th style={{
                  padding: '16px 20px',
                  width: '220px',
                  minWidth: '220px',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.05em',
                  borderRight: '1px solid var(--border-color)'
                }}>
                  Room & Type
                </th>

                {/* Date Columns */}
                {dates.map((d) => {
                  const isToday = formatYMD(d) === '2026-09-25'; // current operational date
                  return (
                    <th key={formatYMD(d)} style={{
                      padding: '12px 10px',
                      textAlign: 'center',
                      borderRight: '1px solid var(--border-color)',
                      backgroundColor: isToday ? '#eff6ff' : undefined
                    }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isToday ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {d.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 800,
                        color: isToday ? 'var(--primary)' : 'var(--text-main)',
                        marginTop: '2px'
                      }}>
                        {d.getDate()}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                        {d.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {filteredRooms.map((room) => (
                <tr key={room.number} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {/* Room Cell */}
                  <td style={{
                    padding: '16px 20px',
                    borderRight: '1px solid var(--border-color)',
                    backgroundColor: '#ffffff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                        Room {room.number}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {room.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                      ${room.pricePerNight}/night • {room.capacity}
                    </div>
                  </td>

                  {/* Day Status Cells */}
                  {dates.map((d) => {
                    const cell = getCellState(room.number, d);

                    return (
                      <td 
                        key={formatYMD(d)} 
                        style={{
                          padding: '8px 6px',
                          borderRight: '1px solid var(--border-color)',
                          verticalAlign: 'middle',
                          textAlign: 'center'
                        }}
                      >
                        {cell.type === 'BOOKED' && (
                          <div 
                            onClick={() => setSelectedItem({ ...cell.data, cellType: 'BOOKED' })}
                            style={{
                              backgroundColor: '#fee2e2',
                              border: '1px solid #fca5a5',
                              color: '#991b1b',
                              padding: '8px 6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              lineHeight: 1.2,
                              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                            title={`Booked by ${cell.data.guestName} (${cell.data.source}) - Click for details`}
                          >
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {cell.data.guestName}
                            </div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 500, color: '#b91c1c', marginTop: '2px' }}>
                              {cell.data.source}
                            </div>
                          </div>
                        )}

                        {cell.type === 'AVAILABLE' && (
                          <div 
                            style={{
                              backgroundColor: 'var(--bg-available)',
                              border: '1px dashed var(--border-available)',
                              color: '#047857',
                              padding: '8px 4px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 600
                            }}
                          >
                            AVAILABLE
                          </div>
                        )}

                        {cell.type === 'BLOCKED' && (
                          <div 
                            onClick={() => setSelectedItem({ ...cell.data, cellType: 'BLOCKED' })}
                            style={{
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: '#334155',
                              padding: '8px 4px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                            title={cell.data.reason}
                          >
                            BLOCKED
                          </div>
                        )}

                        {cell.type === 'MAINTENANCE' && (
                          <div 
                            onClick={() => setSelectedItem({ ...cell.data, cellType: 'MAINTENANCE' })}
                            style={{
                              backgroundColor: '#fffbeb',
                              border: '1px solid #fde68a',
                              color: '#92400e',
                              padding: '8px 4px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                            title={cell.data.reason}
                          >
                            MAINT.
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calendar Details Drawer / Modal */}
      {selectedItem && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.cellType === 'BOOKED' ? `Reservation Details (${selectedItem.id})` : `Schedule Detail (${selectedItem.type})`}
          subtitle={`Room ${selectedItem.roomNumber || selectedItem.room}`}
          footer={
            <button className="btn btn-secondary" onClick={() => setSelectedItem(null)}>
              Close
            </button>
          }
        >
          {selectedItem.cellType === 'BOOKED' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span className="form-label">Guest Name</span>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{selectedItem.guestName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedItem.email}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedItem.phone}</div>
                </div>
                <div>
                  <span className="form-label">Reservation Platform</span>
                  <div style={{ marginTop: '4px' }}>
                    <Badge status={selectedItem.source} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Payment: <strong style={{ color: '#047857' }}>{selectedItem.paymentStatus || 'Paid'}</strong> (${selectedItem.totalAmount || 360})
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                padding: '14px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Check-in</div>
                  <div style={{ fontWeight: 700 }}>{selectedItem.checkIn}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Check-out</div>
                  <div style={{ fontWeight: 700 }}>{selectedItem.checkOut}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Guests</div>
                  <div style={{ fontWeight: 700 }}>{selectedItem.adults || 2} Adults, {selectedItem.children || 0} Kids</div>
                </div>
              </div>

              {selectedItem.notes && (
                <div>
                  <span className="form-label">Notes & Requests</span>
                  <div style={{ padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                    {selectedItem.notes}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span className="form-label">Hold Category</span>
                <Badge status={selectedItem.type} />
              </div>
              <div>
                <span className="form-label">Reason / Work Order</span>
                <div style={{ fontWeight: 600 }}>{selectedItem.reason}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <span className="form-label">Start Date</span>
                  <div>{selectedItem.startDate}</div>
                </div>
                <div>
                  <span className="form-label">End Date</span>
                  <div>{selectedItem.endDate}</div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
