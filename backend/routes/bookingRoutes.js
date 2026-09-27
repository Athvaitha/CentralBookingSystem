import express from 'express';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Block from '../models/Block.js';

const router = express.Router();

// GET all bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHECK AVAILABILITY
router.post('/check-availability', async (req, res) => {
  try {
    const { roomNumber, checkIn, checkOut } = req.body;
    const reqStart = new Date(checkIn).getTime();
    const reqEnd = new Date(checkOut).getTime();

    if (isNaN(reqStart) || isNaN(reqEnd) || reqStart >= reqEnd) {
      return res.json({ available: false, reason: 'Invalid date range. Check-out must be after check-in.' });
    }

    // Check existing active bookings for this room
    const existingBookings = await Booking.find({ 
      roomNumber, 
      status: { $ne: 'Cancelled' } 
    });

    const conflictingBooking = existingBookings.find(b => {
      const bStart = new Date(b.checkIn).getTime();
      const bEnd = new Date(b.checkOut).getTime();
      return reqStart < bEnd && reqEnd > bStart;
    });

    if (conflictingBooking) {
      return res.json({
        available: false,
        reason: `${roomNumber} is already reserved by ${conflictingBooking.guestName} (${conflictingBooking.source}) from ${conflictingBooking.checkIn} to ${conflictingBooking.checkOut}.`
      });
    }

    // Check active blocks
    const activeBlocks = await Block.find({ roomNumber });
    const conflictingBlock = activeBlocks.find(blk => {
      const blkStart = new Date(blk.startDate).getTime();
      const blkEnd = new Date(blk.endDate).getTime();
      return reqStart < blkEnd && reqEnd > blkStart;
    });

    if (conflictingBlock) {
      return res.json({
        available: false,
        reason: `${roomNumber} is ${conflictingBlock.type.toLowerCase()} for: ${conflictingBlock.reason} (${conflictingBlock.startDate} to ${conflictingBlock.endDate}).`
      });
    }

    res.json({ available: true, message: `${roomNumber} is fully available for these dates.` });
  } catch (err) {
    res.status(500).json({ available: false, reason: err.message });
  }
});

// CREATE a booking
router.post('/', async (req, res) => {
  try {
    const { guestName, email, phone, roomNumber, checkIn, checkOut, adults, children, source, notes } = req.body;

    // Find room to calculate price and get room type
    const room = await Room.findOne({ number: roomNumber });
    const roomType = room ? room.name : `Hut ${roomNumber}`;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    
    const pricePerNight = room ? room.pricePerNight : 4000;
    const totalAmount = nights * pricePerNight;

    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = new Booking({
      id: bookingId,
      guestName,
      email: email || '',
      phone: phone || '',
      roomNumber,
      roomType,
      checkIn,
      checkOut,
      nights,
      adults: Number(adults) || 1,
      children: Number(children) || 0,
      source: source || 'Manual / Walk-in',
      status: 'Confirmed',
      totalAmount,
      paymentStatus: 'Paid',
      notes: notes || ''
    });

    const saved = await newBooking.save();

    // Mark room status as Booked if check-in is today
    if (room) {
      room.status = 'Booked';
      room.currentGuest = guestName;
      await room.save();
    }

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a booking
router.put('/:id', async (req, res) => {
  try {
    const updated = await Booking.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Booking not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CANCEL / DELETE a booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { id: req.params.id },
      { status: 'Cancelled' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Reset room status if occupied by this guest
    const room = await Room.findOne({ number: booking.roomNumber });
    if (room && room.currentGuest === booking.guestName) {
      room.status = 'Available';
      room.currentGuest = null;
      await room.save();
    }

    res.json({ message: `Booking ${req.params.id} cancelled successfully`, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET dashboard metrics / stats
router.get('/stats', async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'Booked' });
    const availableRooms = totalRooms - occupiedRooms;
    const totalBookings = await Booking.countDocuments({ status: { $ne: 'Cancelled' } });
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCheckIns = await Booking.countDocuments({ checkIn: todayStr, status: 'Confirmed' });
    const todayCheckOuts = await Booking.countDocuments({ checkOut: todayStr, status: 'Confirmed' });

    const occupancyRate = totalRooms > 0 ? `${Math.round((occupiedRooms / totalRooms) * 100)}%` : '0%';

    res.json({
      todayCheckIns,
      todayCheckOuts,
      totalBookings,
      availableRooms,
      occupiedRooms,
      conflictsCount: 0,
      occupancyRate
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
