// Central Booking System (CBS) - Mock Service Layer
// Cleanly separates UI from data fetching for easy backend API replacement

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

// In-memory state storage
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

const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Stats
  async getDashboardStats() {
    await delay();
    return { ...state.stats };
  },

  async getCheckInsToday() {
    await delay();
    return [...state.checkIns];
  },

  async getCheckOutsToday() {
    await delay();
    return [...state.checkOuts];
  },

  async getBookingSources() {
    await delay();
    return [...state.bookingSources];
  },

  async getRoomAvailabilitySummary() {
    await delay();
    return [...state.roomAvailability];
  },

  // Rooms
  async getRooms() {
    await delay();
    return [...state.rooms];
  },

  async getRoomById(id) {
    await delay();
    return state.rooms.find(r => r.id === id || r.number === id);
  },

  async createRoom(roomData) {
    await delay(300);
    const newRoom = {
      id: `room-${roomData.number}`,
      number: roomData.number,
      name: roomData.name || `Room ${roomData.number}`,
      type: roomData.type || "Standard",
      capacity: roomData.capacity || "2 Adults",
      bedType: roomData.bedType || "1 King Bed",
      pricePerNight: Number(roomData.pricePerNight) || 150,
      status: "Available",
      currentGuest: null,
      nextAvailable: "Immediate",
      amenities: roomData.amenities || ["Air Conditioning", "WiFi", "TV"],
      cbsIcalUrl: `https://cbs.hoteladmin.internal/api/v1/ical/room/${roomData.number}.ics`
    };
    state.rooms.push(newRoom);
    state.stats.availableRooms += 1;
    return newRoom;
  },

  async updateRoomStatus(roomId, newStatus) {
    await delay(200);
    const room = state.rooms.find(r => r.id === roomId || r.number === roomId);
    if (room) {
      room.status = newStatus;
    }
    return room;
  },

  // Bookings
  async getBookings() {
    await delay();
    return [...state.bookings];
  },

  async checkAvailability(roomNumber, checkIn, checkOut) {
    await delay(350);
    // Validate if any booking overlaps with roomNumber and dates
    const requestedStart = new Date(checkIn).getTime();
    const requestedEnd = new Date(checkOut).getTime();

    if (isNaN(requestedStart) || isNaN(requestedEnd) || requestedStart >= requestedEnd) {
      return { available: false, reason: "Invalid date range. Check-out must be after check-in." };
    }

    // Check against existing bookings for this room
    const conflictingBooking = state.bookings.find(b => {
      if (b.roomNumber !== roomNumber || b.status === "Cancelled") return false;
      const bStart = new Date(b.checkIn).getTime();
      const bEnd = new Date(b.checkOut).getTime();
      // Overlap condition: start < bEnd && end > bStart
      return requestedStart < bEnd && requestedEnd > bStart;
    });

    if (conflictingBooking) {
      return {
        available: false,
        reason: `Room ${roomNumber} is already booked by ${conflictingBooking.guestName} (${conflictingBooking.source}) from ${conflictingBooking.checkIn} to ${conflictingBooking.checkOut}.`
      };
    }

    // Check against active blocks
    const conflictingBlock = state.activeBlocks.find(blk => {
      if (blk.roomNumber !== roomNumber) return false;
      const blkStart = new Date(blk.startDate).getTime();
      const blkEnd = new Date(blk.endDate).getTime();
      return requestedStart < blkEnd && requestedEnd > blkStart;
    });

    if (conflictingBlock) {
      return {
        available: false,
        reason: `Room ${roomNumber} is ${conflictingBlock.type.toLowerCase()} for: ${conflictingBlock.reason} (${conflictingBlock.startDate} to ${conflictingBlock.endDate}).`
      };
    }

    return { available: true, message: `Room ${roomNumber} is fully available for these dates.` };
  },

  async createBooking(bookingData) {
    await delay(400);
    const newBooking = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: bookingData.guestName,
      email: bookingData.email,
      phone: bookingData.phone,
      roomNumber: bookingData.roomNumber,
      roomType: bookingData.roomType || `Room ${bookingData.roomNumber}`,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      nights: Math.max(1, Math.round((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))),
      adults: Number(bookingData.adults) || 1,
      children: Number(bookingData.children) || 0,
      source: bookingData.source || "Admin / Offline",
      status: "Confirmed",
      totalAmount: bookingData.totalAmount || 320,
      paymentStatus: "Paid",
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: bookingData.notes || ""
    };
    state.bookings.unshift(newBooking);
    state.stats.totalBookings += 1;
    return newBooking;
  },

  async updateBooking(id, updatedData) {
    await delay(300);
    const idx = state.bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      state.bookings[idx] = { ...state.bookings[idx], ...updatedData };
      return state.bookings[idx];
    }
    return null;
  },

  async cancelBooking(id) {
    await delay(250);
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

  async blockRoomDates(data) {
    await delay(350);
    const newBlock = {
      id: `blk-${Date.now()}`,
      roomNumber: data.roomNumber,
      roomId: `room-${data.roomNumber}`,
      startDate: data.startDate,
      endDate: data.endDate,
      type: data.type || "Blocked", // Blocked or Maintenance
      reason: data.reason || "Manual Admin Hold",
      createdBy: "Admin (Alex Mercer)",
      createdAt: new Date().toISOString().split('T')[0]
    };
    state.activeBlocks.unshift(newBlock);
    return newBlock;
  },

  async removeBlock(blockId) {
    await delay(250);
    state.activeBlocks = state.activeBlocks.filter(b => b.id !== blockId);
    return true;
  },

  // Synchronization
  async getChannels() {
    await delay();
    return [...state.channels];
  },

  async triggerSync(channelId) {
    // Simulate real sync latency
    await delay(1200);
    const channel = state.channels.find(c => c.id === channelId);
    if (channel) {
      channel.lastSync = "Just now";
      channel.syncState = "Successful";
      channel.errorsCount = 0;
    }
    return channel;
  },

  async getExternalFeeds() {
    await delay();
    return [...state.externalFeeds];
  },

  async addExternalFeed(feedData) {
    await delay(350);
    const newFeed = {
      id: `feed-${Date.now()}`,
      platform: feedData.platform,
      room: "All Rooms (Property-Wide)",
      roomId: "all-rooms",
      icalUrl: feedData.icalUrl,
      syncInterval: feedData.syncInterval || "30 minutes",
      isActive: true,
      lastSync: "Just now",
      syncStatus: "Healthy",
      eventsImported: Math.floor(Math.random() * 15) + 5,
      syncErrors: 0
    };
    state.externalFeeds.push(newFeed);
    return newFeed;
  },

  async deleteExternalFeed(id) {
    await delay(250);
    state.externalFeeds = state.externalFeeds.filter(f => f.id !== id);
    return true;
  },

  // Conflicts
  async getConflicts() {
    await delay();
    return [...state.conflicts];
  },

  async resolveConflict(conflictId, resolution) {
    await delay(400);
    const conflict = state.conflicts.find(c => c.id === conflictId);
    if (conflict) {
      conflict.status = "Resolved";
      conflict.resolutionNote = resolution.note || `Resolved via ${resolution.chosenAction}`;
      if (state.stats.conflictsCount > 0) {
        state.stats.conflictsCount -= 1;
      }
    }
    return conflict;
  },

  // Settings
  async getSettings() {
    await delay();
    return { ...state.settings };
  },

  async updateSettings(newSettings) {
    await delay(300);
    state.settings = { ...state.settings, ...newSettings };
    return { ...state.settings };
  }
};
