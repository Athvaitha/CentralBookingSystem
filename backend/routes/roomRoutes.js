import express from 'express';
import Room from '../models/Room.js';
import Block from '../models/Block.js';

const router = express.Router();

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ number: 1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a room
router.post('/', async (req, res) => {
  try {
    const { number, name, type, capacity, bedType, pricePerNight } = req.body;
    const roomId = `hut-${number.toLowerCase().replace(/\s+/g, '-')}`;
    
    const newRoom = new Room({
      id: roomId,
      number,
      name,
      type: type || 'Deluxe Hut',
      capacity: capacity || '2 Guests',
      bedType: bedType || '1 Queen Bed',
      pricePerNight: Number(pricePerNight) || 4000,
      status: 'Available',
      amenities: ['Air Conditioning', 'Free WiFi', 'Pool Access'],
      cbsIcalUrl: `https://cbs.koorakotta.com/api/v1/ical/room/${roomId}.ics`
    });

    const saved = await newRoom.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE room status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const room = await Room.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true }
    );
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// BLOCK room dates
router.post('/block', async (req, res) => {
  try {
    const { roomNumber, startDate, endDate, type, reason } = req.body;
    const newBlock = new Block({
      id: `blk-${Date.now()}`,
      roomNumber,
      roomId: `hut-${roomNumber.toLowerCase().replace(/\s+/g, '-')}`,
      startDate,
      endDate,
      type: type || 'Blocked',
      reason: reason || 'Admin Block'
    });

    const saved = await newBlock.save();

    // Update room status
    await Room.findOneAndUpdate(
      { number: roomNumber },
      { status: type || 'Blocked' }
    );

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
