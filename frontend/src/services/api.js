// Central Booking System (CBS) - API Service Layer
// Connects frontend UI to MongoDB Local Express Backend (http://localhost:5000/api)

import {
  initialStats,
  initialRooms,
  initialCheckIns,
  initialCheckOuts,
  initialBookings,
  initialBookingSources,
  initialRoomAvailability,
  initialChannels,
  initialExternalFeeds,
  initialConflicts,
  initialActiveBlocks,
  initialHotelSettings
} from '../data/mockData';

const API_BASE_URL = 'http://localhost:5000/api';

// In-memory fallback state storage
let state = {
  stats: { ...initialStats },
  rooms: [...initialRooms],
  checkIns: [...initialCheckIns],
  checkOuts: [...initialCheckOuts],
  bookings: [...initialBookings],
  bookingSources: [...initialBookingSources],
  roomAvailability: [...initialRoomAvailability],
  channels: [...initialChannels],
  externalFeeds: [...initialExternalFeeds],
  conflicts: [...initialConflicts],
  activeBlocks: [...initialActiveBlocks],
  settings: { ...initialHotelSettings }
};

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Stats
  async getDashboardStats() {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/stats`);
      if (res.ok) {
        const stats = await res.json();
        state.stats = stats;
        return stats;
      }
    } catch (e) {
      console.warn('Backend unavailable, using local memory state for stats');
    }
    await delay();
    return { ...state.stats };
  },

  async getCheckInsToday() {
    try {
      const bRes = await fetch(`${API_BASE_URL}/bookings`);
      if (bRes.ok) {
        const bookings = await bRes.json();
        const todayStr = new Date().toISOString().split('T')[0];
        return bookings.filter(b => b.checkIn === todayStr && b.status === 'Confirmed');
      }
    } catch (e) {}
    await delay();
    return [...state.checkIns];
  },

  async getCheckOutsToday() {
    try {
      const bRes = await fetch(`${API_BASE_URL}/bookings`);
      if (bRes.ok) {
        const bookings = await bRes.json();
        const todayStr = new Date().toISOString().split('T')[0];
        return bookings.filter(b => b.checkOut === todayStr && b.status === 'Confirmed');
      }
    } catch (e) {}
    await delay();
    return [...state.checkOuts];
  },

  async getBookingSources() {
    await delay();
    return [...state.bookingSources];
  },

  async getRoomAvailabilitySummary() {
    try {
      const rRes = await fetch(`${API_BASE_URL}/rooms`);
      if (rRes.ok) {
        const rooms = await rRes.json();
        const availCount = rooms.filter(r => r.status === 'Available').length;
        const bookedCount = rooms.filter(r => r.status === 'Booked').length;
        const blockCount = rooms.filter(r => r.status === 'Blocked').length;
        const maintCount = rooms.filter(r => r.status === 'Maintenance').length;

        return [
          { status: 'Available', count: availCount, color: '#10b981', badgeClass: 'badge-available' },
          { status: 'Booked', count: bookedCount, color: '#ef4444', badgeClass: 'badge-booked' },
          { status: 'Blocked', count: blockCount, color: '#64748b', badgeClass: 'badge-blocked' },
          { status: 'Maintenance', count: maintCount, color: '#f59e0b', badgeClass: 'badge-maintenance' }
        ];
      }
    } catch (e) {}
    await delay();
    return [...state.roomAvailability];
  },

  // Rooms
  async getRooms() {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`);
      if (res.ok) {
        const rooms = await res.json();
        state.rooms = rooms;
        return rooms;
      }
    } catch (e) {
      console.warn('Backend API unavailable, serving local memory rooms');
    }
    await delay();
    return [...state.rooms];
  },

  async getRoomById(id) {
    try {
      const rooms = await this.getRooms();
      return rooms.find(r => r.id === id || r.number === id);
    } catch (e) {}
    return state.rooms.find(r => r.id === id || r.number === id);
  },

  async createRoom(roomData) {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    await delay(300);
    const newRoom = {
      id: `hut-${roomData.number}`,
      number: roomData.number,
      name: roomData.name || `Hut ${roomData.number}`,
      type: roomData.type || "Deluxe Hut",
      capacity: roomData.capacity || "2 Guests",
      bedType: roomData.bedType || "1 Queen Bed",
      pricePerNight: Number(roomData.pricePerNight) || 4000,
      status: "Available",
      currentGuest: null,
      nextAvailable: "Immediate",
      amenities: roomData.amenities || ["Air Conditioning", "WiFi", "Pool Access"],
      cbsIcalUrl: `https://cbs.koorakotta.com/api/v1/ical/room/${roomData.number}.ics`
    };
    state.rooms.push(newRoom);
    state.stats.availableRooms += 1;
    return newRoom;
  },

  async updateRoomStatus(roomId, newStatus) {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    await delay(200);
    const room = state.rooms.find(r => r.id === roomId || r.number === roomId);
    if (room) {
      room.status = newStatus;
    }
    return room;
  },

  // Bookings (MongoDB API)
  async getBookings() {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`);
      if (res.ok) {
        const bookings = await res.json();
        state.bookings = bookings;
        return bookings;
      }
    } catch (e) {
      console.warn('Backend API unavailable, returning local memory bookings');
    }
    await delay();
    return [...state.bookings];
  },

  async checkAvailability(roomNumber, checkIn, checkOut) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomNumber, checkIn, checkOut })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    await delay(250);
    const requestedStart = new Date(checkIn).getTime();
    const requestedEnd = new Date(checkOut).getTime();

    if (isNaN(requestedStart) || isNaN(requestedEnd) || requestedStart >= requestedEnd) {
      return { available: false, reason: "Invalid date range. Check-out must be after check-in." };
    }

    const conflictingBooking = state.bookings.find(b => {
      if (b.roomNumber !== roomNumber || b.status === "Cancelled") return false;
      const bStart = new Date(b.checkIn).getTime();
      const bEnd = new Date(b.checkOut).getTime();
      return requestedStart < bEnd && requestedEnd > bStart;
    });

    if (conflictingBooking) {
      return {
        available: false,
        reason: `${roomNumber} is already reserved by ${conflictingBooking.guestName} (${conflictingBooking.source}) from ${conflictingBooking.checkIn} to ${conflictingBooking.checkOut}.`
      };
    }

    const conflictingBlock = state.activeBlocks.find(blk => {
      if (blk.roomNumber !== roomNumber) return false;
      const blkStart = new Date(blk.startDate).getTime();
      const blkEnd = new Date(blk.endDate).getTime();
      return requestedStart < blkEnd && requestedEnd > blkStart;
    });

    if (conflictingBlock) {
      return {
        available: false,
        reason: `${roomNumber} is ${conflictingBlock.type.toLowerCase()} for: ${conflictingBlock.reason} (${conflictingBlock.startDate} to ${conflictingBlock.endDate}).`
      };
    }

    return { available: true, message: `${roomNumber} is fully available for these dates.` };
  },

  async createBooking(bookingData) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      if (res.ok) {
        const created = await res.json();
        // Update local cache
        state.bookings.unshift(created);
        state.stats.totalBookings += 1;
        return created;
      }
    } catch (e) {}

    await delay(300);
    const newBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: bookingData.guestName,
      email: bookingData.email || "",
      phone: bookingData.phone || "",
      roomNumber: bookingData.roomNumber,
      roomType: bookingData.roomType || `Hut ${bookingData.roomNumber}`,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      nights: Math.max(1, Math.round((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))),
      adults: Number(bookingData.adults) || 1,
      children: Number(bookingData.children) || 0,
      source: bookingData.source || "Manual / Walk-in",
      status: "Confirmed",
      totalAmount: bookingData.totalAmount || 4500,
      paymentStatus: "Paid",
      createdAt: new Date().toLocaleString('en-IN'),
      notes: bookingData.notes || ""
    };
    state.bookings.unshift(newBooking);
    state.stats.totalBookings += 1;
    return newBooking;
  },

  async updateBooking(id, updatedData) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    await delay(200);
    const idx = state.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      state.bookings[idx] = { ...state.bookings[idx], ...updatedData };
      return state.bookings[idx];
    }
    return null;
  },

  async cancelBooking(id) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        return data.booking;
      }
    } catch (e) {}

    await delay(200);
    const booking = state.bookings.find(b => b.id === id);
    if (booking) {
      booking.status = "Cancelled";
    }
    return booking;
  },

  // Availability & Blocks
  async getActiveBlocks() {
    await delay();
    return [...state.activeBlocks];
  },

  async blockRoomDates(blockData) {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blockData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {}

    await delay(300);
    const newBlock = {
      id: `blk-${Date.now()}`,
      roomNumber: blockData.roomNumber,
      roomId: `hut-${blockData.roomNumber}`,
      startDate: blockData.startDate,
      endDate: blockData.endDate,
      type: blockData.type || "Blocked",
      reason: blockData.reason || "Manual Block",
      createdBy: "Admin (Koora Kotta Manager)",
      createdAt: new Date().toISOString().split('T')[0]
    };
    state.activeBlocks.push(newBlock);

    const room = state.rooms.find(r => r.number === blockData.roomNumber || r.id === blockData.roomNumber);
    if (room) {
      room.status = blockData.type || "Blocked";
    }
    return newBlock;
  },

  // Channels & Conflicts
  async getChannels() {
    await delay();
    return [...state.channels];
  },

  async getExternalFeeds() {
    await delay();
    return [...state.externalFeeds];
  },

  async getConflicts() {
    await delay();
    return [...state.conflicts];
  },

  async resolveConflict(conflictId, resolution) {
    await delay(300);
    const conflict = state.conflicts.find(c => c.id === conflictId);
    if (conflict) {
      conflict.status = "Resolved";
      conflict.resolutionNote = resolution.note || `Resolved via ${resolution.chosenAction}`;
    }
    return conflict;
  },

  // Settings
  async getHotelSettings() {
    await delay();
    return { ...state.settings };
  },

  async updateHotelSettings(newSettings) {
    await delay(300);
    state.settings = { ...state.settings, ...newSettings };
    return { ...state.settings };
  }
};
