import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Eye, 
  Wrench, 
  UserCheck, 
  X,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useToast } from '../components/common/Toast';

export default function Conflicts() {
  const { showToast } = useToast();

  const [conflicts, setConflicts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roomFilter, setRoomFilter] = useState('ALL');

  // Resolution modal state
  const [resolvingConflict, setResolvingConflict] = useState(null);
  const [viewingConflict, setViewingConflict] = useState(null);
  const [chosenResolution, setChosenResolution] = useState('keep_booking1'); // 'keep_booking1', 'keep_booking2', 'relocate'
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    async function loadConflicts() {
      const data = await api.getConflicts();
      setConflicts(data);
    }
    loadConflicts();
  }, []);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolvingConflict) return;

    let actionLabel = '';
    if (chosenResolution === 'keep_booking1') {
      actionLabel = `Retained ${resolvingConflict.booking1.source} (${resolvingConflict.booking1.guest}). Auto-cancelled ${resolvingConflict.booking2.source}.`;
    } else if (chosenResolution === 'keep_booking2') {
      actionLabel = `Retained ${resolvingConflict.booking2.source} (${resolvingConflict.booking2.guest}). Auto-cancelled ${resolvingConflict.booking1.source}.`;
    } else {
      actionLabel = `Relocated ${resolvingConflict.booking2.source} reservation to Room 203 (Upgrade provided).`;
    }

    const resolved = await api.resolveConflict(resolvingConflict.id, {
      chosenAction: chosenResolution,
      note: resolutionNote ? `${actionLabel} Note: ${resolutionNote}` : actionLabel
    });

    setConflicts(prev => prev.map(c => c.id === resolved.id ? resolved : c));
    setResolvingConflict(null);
    setResolutionNote('');
    showToast(`Conflict ${resolvingConflict.id} resolved successfully!`, 'success');
  };

  const filteredConflicts = conflicts.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (roomFilter !== 'ALL' && c.roomNumber !== roomFilter) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Alert Banner */}
      <div style={{
        backgroundColor: '#fff5f5',
        border: '1px solid #fecaca',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertTriangle size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#991b1b', margin: 0 }}>
            Automated Double-Booking Conflict Detection
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#b91c1c', margin: '4px 0 0', lineHeight: 1.5 }}>
            CBS continuously monitors overlapping iCal and direct reservations. Conflicts occur when two external channels confirm the same room before synchronization cycles synchronize availability. Immediate resolution is required to avoid guest relocation penalties.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 24px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
            {['ALL', 'New', 'Under Review', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Room:</span>
            <select
              className="form-select"
              style={{ width: 'auto', height: '36px', fontSize: '0.82rem' }}
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
            >
              <option value="ALL">All Rooms</option>
              <option value="101">Room 101</option>
              <option value="203">Room 203</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conflicts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredConflicts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No conflicts found matching current filters.
          </div>
        ) : (
          filteredConflicts.map((conf) => {
            const isResolved = conf.status === 'Resolved';

            return (
              <div 
                key={conf.id} 
                className="card"
                style={{
                  borderLeft: isResolved ? '5px solid #10b981' : '5px solid #dc2626',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}
              >
                {/* Conflict Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                        Conflict #{conf.id}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                        Room {conf.roomNumber} ({conf.roomType})
                      </span>
                      <Badge status={conf.severity} />
                      <Badge status={conf.status} />
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Overlapping Range: <strong>{conf.dateRange}</strong> • Detected at {conf.detectedAt}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setViewingConflict(conf)}
                    >
                      <Eye size={14} /> View Details
                    </button>
                    {!isResolved && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setResolvingConflict(conf);
                          setChosenResolution('keep_booking1');
                          setResolutionNote('');
                        }}
                      >
                        <UserCheck size={14} /> Resolve Conflict
                      </button>
                    )}
                  </div>
                </div>

                {/* Overlapping Booking Side-by-Side Comparison */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Booking 1 */}
                  <div style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Reservation A
                      </span>
                      <span className={`platform-pill ${
                        conf.booking1.source === 'Airbnb' ? 'platform-airbnb' : 'platform-website'
                      }`}>
                        {conf.booking1.source}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{conf.booking1.guest}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{conf.booking1.contact}</div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '0.8rem'
                    }}>
                      <span>Created: {conf.booking1.createdAt}</span>
                      <strong style={{ color: '#047857' }}>{conf.booking1.amount}</strong>
                    </div>
                  </div>

                  {/* Booking 2 */}
                  <div style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Reservation B
                      </span>
                      <span className={`platform-pill ${
                        conf.booking2.source === 'Booking.com' ? 'platform-booking' : 'platform-airbnb'
                      }`}>
                        {conf.booking2.source}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{conf.booking2.guest}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{conf.booking2.contact}</div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '12px',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-color)',
                      fontSize: '0.8rem'
                    }}>
                      <span>Created: {conf.booking2.createdAt}</span>
                      <strong style={{ color: '#047857' }}>{conf.booking2.amount}</strong>
                    </div>
                  </div>
                </div>

                {/* Resolution Status Note if already resolved */}
                {isResolved && conf.resolutionNote && (
                  <div style={{
                    padding: '10px 14px',
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    color: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={16} color="#10b981" />
                    <span><strong>Resolution Outcome:</strong> {conf.resolutionNote}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* RESOLVE CONFLICT MODAL */}
      {resolvingConflict && (
        <Modal
          isOpen={true}
          onClose={() => setResolvingConflict(null)}
          title={`Resolve Conflict #${resolvingConflict.id}`}
          subtitle={`Room ${resolvingConflict.roomNumber} (${resolvingConflict.dateRange})`}
        >
          <form onSubmit={handleResolveSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Choose an action to resolve the overlapping reservations:
              </div>

              {/* Option 1: Keep Booking 1 */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: chosenResolution === 'keep_booking1' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: chosenResolution === 'keep_booking1' ? 'var(--primary-light)' : '#ffffff',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="resolution"
                  checked={chosenResolution === 'keep_booking1'}
                  onChange={() => setChosenResolution('keep_booking1')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Option 1: Retain {resolvingConflict.booking1.source} ({resolvingConflict.booking1.guest})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Confirm Room {resolvingConflict.roomNumber} for {resolvingConflict.booking1.guest}. Cancel {resolvingConflict.booking2.source} reservation and trigger auto-relocation notification.
                  </div>
                </div>
              </label>

              {/* Option 2: Keep Booking 2 */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: chosenResolution === 'keep_booking2' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: chosenResolution === 'keep_booking2' ? 'var(--primary-light)' : '#ffffff',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="resolution"
                  checked={chosenResolution === 'keep_booking2'}
                  onChange={() => setChosenResolution('keep_booking2')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Option 2: Retain {resolvingConflict.booking2.source} ({resolvingConflict.booking2.guest})
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Confirm Room {resolvingConflict.roomNumber} for {resolvingConflict.booking2.guest}. Cancel {resolvingConflict.booking1.source} reservation.
                  </div>
                </div>
              </label>

              {/* Option 3: Relocate to alternative room */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: chosenResolution === 'relocate' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: chosenResolution === 'relocate' ? 'var(--primary-light)' : '#ffffff',
                cursor: 'pointer'
              }}>
                <input
                  type="radio"
                  name="resolution"
                  checked={chosenResolution === 'relocate'}
                  onChange={() => setChosenResolution('relocate')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    Option 3: Keep Both & Relocate {resolvingConflict.booking2.source} to Room 203
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Accommodate both guests by shifting {resolvingConflict.booking2.guest} to complimentary upgraded Executive Suite (Room 203).
                  </div>
                </div>
              </label>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Internal Resolution Notes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Guest contacted via phone and accepted complimentary upgrade"
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setResolvingConflict(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Resolution
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW CONFLICT MODAL */}
      {viewingConflict && (
        <Modal
          isOpen={true}
          onClose={() => setViewingConflict(null)}
          title={`Conflict Details #${viewingConflict.id}`}
          subtitle={`Room ${viewingConflict.roomNumber} (${viewingConflict.dateRange})`}
          footer={
            <button className="btn btn-secondary" onClick={() => setViewingConflict(null)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <span className="form-label">Severity Level</span>
                <Badge status={viewingConflict.severity} />
              </div>
              <div>
                <span className="form-label">Review Status</span>
                <Badge status={viewingConflict.status} />
              </div>
            </div>

            <div>
              <span className="form-label">Audit Reason</span>
              <div style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                {viewingConflict.reason}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700 }}>Booking A ({viewingConflict.booking1.source})</div>
                <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>{viewingConflict.booking1.guest}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Created: {viewingConflict.booking1.createdAt}</div>
              </div>

              <div style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700 }}>Booking B ({viewingConflict.booking2.source})</div>
                <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>{viewingConflict.booking2.guest}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Created: {viewingConflict.booking2.createdAt}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
