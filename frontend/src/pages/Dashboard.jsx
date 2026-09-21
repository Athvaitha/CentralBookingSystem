import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  LogOut, 
  CalendarCheck2, 
  Bed, 
  DoorClosed, 
  AlertTriangle,
  ArrowUpRight,
  Eye,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { api } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [checkOuts, setCheckOuts] = useState([]);
  const [bookingSources, setBookingSources] = useState([]);
  const [roomAvailability, setRoomAvailability] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('checkIns'); // checkIns or checkOuts
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    async function loadData() {
      const [s, ci, co, bs, ra, b] = await Promise.all([
        api.getDashboardStats(),
        api.getCheckInsToday(),
        api.getCheckOutsToday(),
        api.getBookingSources(),
        api.getRoomAvailabilitySummary(),
        api.getBookings()
      ]);
      setStats(s);
      setCheckIns(ci);
      setCheckOuts(co);
      setBookingSources(bs);
      setRoomAvailability(ra);
      setRecentBookings(b.slice(0, 2)); // 2 dummy records as requested
    }
    loadData();
  }, []);

  const handleProcessCheckIn = (guestName, room) => {
    showToast(`Checked in ${guestName} to ${room}`, 'success');
  };

  const handleProcessCheckOut = (guestName, room) => {
    showToast(`Checked out ${guestName} from ${room}`, 'info');
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      await api.cancelBooking(id);
      setRecentBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b));
      showToast(`Booking ${id} was cancelled`, 'warning');
    }
  };

  if (!stats) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 1. Summary KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <StatCard
          title="Today's Check-ins"
          value={stats.todayCheckIns}
          icon={LogIn}
          color="emerald"
          changeText="Expected arrivals today"
        />
        <StatCard
          title="Today's Check-outs"
          value={stats.todayCheckOuts}
          icon={LogOut}
          color="blue"
          changeText="Scheduled departures"
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={CalendarCheck2}
          color="indigo"
          changeText="Active this month"
        />
        <StatCard
          title="Available Rooms"
          value={stats.availableRooms}
          icon={Bed}
          color="emerald"
          changeText="Ready for check-in"
        />
        <StatCard
          title="Occupied Rooms"
          value={stats.occupiedRooms}
          icon={DoorClosed}
          color="slate"
          changeText={`${stats.occupancyRate} Occupancy rate`}
        />
        <StatCard
          title="Booking Conflicts"
          value={stats.conflictsCount}
          icon={AlertTriangle}
          color="rose"
          alert={stats.conflictsCount > 0}
          changeText="Requires immediate review"
          onClick={() => navigate('/conflicts')}
        />
      </div>

      {/* 2. Today's Overview (Check-ins & Check-outs) */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Today's Guest Movements</h2>
            <p className="card-subtitle">Real-time arrival and departure desk operations</p>
          </div>

          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setActiveTab('checkIns')}
              className={`btn btn-sm ${activeTab === 'checkIns' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
            >
              <LogIn size={14} />
              Check-ins ({checkIns.length})
            </button>
            <button
              onClick={() => setActiveTab('checkOuts')}
              className={`btn btn-sm ${activeTab === 'checkOuts' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ border: 'none' }}
            >
              <LogOut size={14} />
              Check-outs ({checkOuts.length})
            </button>
          </div>
        </div>

        <div className="table-container">
          {activeTab === 'checkIns' ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in Time</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {checkIns.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.guest}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{row.room}</span>
                    </td>
                    <td>{row.time}</td>
                    <td>
                      <span className={`platform-pill ${
                        row.source === 'Airbnb' ? 'platform-airbnb' : 
                        row.source === 'Booking.com' ? 'platform-booking' : 'platform-website'
                      }`}>
                        {row.source}
                      </span>
                    </td>
                    <td>
                      <Badge status={row.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleProcessCheckIn(row.guest, row.room)}
                      >
                        <CheckCircle size={14} />
                        Check In
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-out Time</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {checkOuts.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.guest}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{row.room}</span>
                    </td>
                    <td>{row.time}</td>
                    <td>
                      <span className={`platform-pill ${
                        row.source === 'Airbnb' ? 'platform-airbnb' : 
                        row.source === 'Booking.com' ? 'platform-booking' : 'platform-website'
                      }`}>
                        {row.source}
                      </span>
                    </td>
                    <td>
                      <Badge status={row.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleProcessCheckOut(row.guest, row.room)}
                      >
                        <LogOut size={14} />
                        Process Check-out
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 3. Middle Section: Booking Sources & Room Availability Side-by-Side */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        {/* Booking Source Summary */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Booking Source Summary</h2>
              <p className="card-subtitle">Channel distribution of active bookings</p>
            </div>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => navigate('/synchronization')}
            >
              Channels <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Simple Clean Visual Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
            {bookingSources.map((item) => (
              <div key={item.source}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.source}</span>
                  <div style={{ display: 'flex', gap: '8px', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.count}</span>
                    <span>({item.percentage}%)</span>
                  </div>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                    borderRadius: '999px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-app)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.82rem'
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Channel Direct Bookings</span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>126 Bookings</span>
          </div>
        </div>

        {/* Room Availability Summary */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Room Availability Summary</h2>
              <p className="card-subtitle">Current property inventory allocation</p>
            </div>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => navigate('/availability')}
            >
              Manage <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginTop: '6px'
          }}>
            {roomAvailability.map((item) => (
              <div 
                key={item.status}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: item.color
                  }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {item.status}
                  </span>
                </div>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: '#065f46'
          }}>
            <span style={{ fontWeight: 600 }}>Total Rooms in Inventory</span>
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>56 Units</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Bookings Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Recent Bookings</h2>
            <p className="card-subtitle">Latest incoming reservations across all sources</p>
          </div>
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => navigate('/bookings')}
          >
            All Bookings <ExternalLink size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Source</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{b.id}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.guestName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.email}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>Room {b.roomNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.roomType}</div>
                  </td>
                  <td>{b.checkIn}</td>
                  <td>{b.checkOut}</td>
                  <td>
                    <span className={`platform-pill ${
                      b.source === 'Airbnb' ? 'platform-airbnb' : 
                      b.source === 'Booking.com' ? 'platform-booking' : 'platform-website'
                    }`}>
                      {b.source}
                    </span>
                  </td>
                  <td>
                    <Badge status={b.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setSelectedBooking(b)}
                        title="View Details"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => navigate('/bookings')}
                        title="Edit Booking"
                      >
                        Edit
                      </button>
                      {b.status !== 'Cancelled' && (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleCancelBooking(b.id)}
                          title="Cancel Booking"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Details - ${selectedBooking.id}`}
          subtitle={`Created on ${selectedBooking.createdAt}`}
          footer={
            <button className="btn btn-secondary" onClick={() => setSelectedBooking(null)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Guest Name</label>
                <div style={{ fontWeight: 600 }}>{selectedBooking.guestName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedBooking.email}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedBooking.phone}</div>
              </div>
              <div>
                <label className="form-label">Room Reserved</label>
                <div style={{ fontWeight: 600 }}>Room {selectedBooking.roomNumber}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedBooking.roomType}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: 'var(--bg-app)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Check-in</span>
                <div style={{ fontWeight: 700 }}>{selectedBooking.checkIn}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Check-out</span>
                <div style={{ fontWeight: 700 }}>{selectedBooking.checkOut}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration</span>
                <div style={{ fontWeight: 700 }}>{selectedBooking.nights} Nights</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Channel Source</label>
                <Badge status={selectedBooking.source} />
              </div>
              <div>
                <label className="form-label">Booking Status</label>
                <Badge status={selectedBooking.status} />
              </div>
            </div>

            {selectedBooking.notes && (
              <div>
                <label className="form-label">Guest Requests / Notes</label>
                <div style={{ padding: '10px 14px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                  {selectedBooking.notes}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
