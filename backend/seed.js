import mongoose from 'mongoose';
import Room from './models/Room.js';
import Booking from './models/Booking.js';
import Block from './models/Block.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/koorakotta_cbs';

const kooraKottaHuts = [
  {
    id: "hut-101",
    number: "Hut 101",
    name: "Jacuzzi Roof Hut",
    type: "Jacuzzi Hut",
    capacity: "2-4 Guests",
    bedType: "1 Queen + Loft Bed",
    pricePerNight: 4500,
    status: "Available",
    currentGuest: null,
    nextAvailable: "Immediate",
    amenities: ["Private Jacuzzi", "Loft Bedroom", "Air Conditioning", "Pool Access ('The NASHA')", "Free WiFi"],
    cbsIcalUrl: "https://cbs.koorakotta.com/api/v1/ical/room/hut-101.ics"
  },
  {
    id: "hut-102",
    number: "Hut 102",
    name: "Poolside Family Hut",
    type: "Family Hut",
    capacity: "4-10 Guests",
    bedType: "2 Double Beds + Loft Bed",
    pricePerNight: 6500,
    status: "Available",
    currentGuest: null,
    nextAvailable: "Immediate",
    amenities: ["Swimming Pool View", "Campfire Yard", "Loft Stairs", "Air Conditioning", "Free Breakfast"],
    cbsIcalUrl: "https://cbs.koorakotta.com/api/v1/ical/room/hut-102.ics"
  },
  {
    id: "hut-103",
    number: "Hut 103",
    name: "Serene Wooden Loft Hut",
    type: "Loft Hut",
    capacity: "2-3 Guests",
    bedType: "1 Queen Bed + Ladder Loft",
    pricePerNight: 3800,
    status: "Available",
    currentGuest: null,
    nextAvailable: "Immediate",
    amenities: ["Wooden Interiors", "Garden View", "Air Conditioning", "Tea/Coffee Maker", "Pool Access"],
    cbsIcalUrl: "https://cbs.koorakotta.com/api/v1/ical/room/hut-103.ics"
  },
  {
    id: "hut-104",
    number: "Hut 104",
    name: "Executive Nature Hut",
    type: "Executive Hut",
    capacity: "2-4 Guests",
    bedType: "1 King Bed + Loft Sofa",
    pricePerNight: 4200,
    status: "Available",
    currentGuest: null,
    nextAvailable: "Immediate",
    amenities: ["Private Balcony", "Nature View", "Air Conditioning", "Hot Water Shower", "Free WiFi"],
    cbsIcalUrl: "https://cbs.koorakotta.com/api/v1/ical/room/hut-104.ics"
  },
  {
    id: "hut-105",
    number: "Hut 105",
    name: "Deluxe Eco Loft Hut",
    type: "Deluxe Hut",
    capacity: "2-3 Guests",
    bedType: "1 Queen Bed",
    pricePerNight: 3500,
    status: "Available",
    currentGuest: null,
    nextAvailable: "Immediate",
    amenities: ["Eco Wooden Design", "Loft Stairs", "Air Conditioning", "Pool Access", "Daily Housekeeping"],
    cbsIcalUrl: "https://cbs.koorakotta.com/api/v1/ical/room/hut-105.ics"
  },
  {
    id: "hut-106",
    number: "Hut 106",
    name: "Garden Cottage Hut",
    type: "Garden Hut",
    capacity: "2-4 Guests",
    bedType: "1 King Bed + Single Bed",
    pricePerNight: 4000,
    status: "Available",
    currentGuest: null,
    nextAvailable: "Immediate",
    amenities: ["Private Lawn View", "Campfire Yard", "Air Conditioning", "Pool Access", "Free WiFi"],
    cbsIcalUrl: "https://cbs.koorakotta.com/api/v1/ical/room/hut-106.ics"
  },
  {
    id: "hut-107",
    number: "Hut 107",
    name: "Grand Family Suite Hut",
    type: "Family Suite Hut",
    capacity: "6-10 Guests",
    bedType: "3 Double Beds + Double Loft Bed",
    pricePerNight: 7500,
    status: "Available",
    currentGuest: null,
    nextAvailable: "Immediate",
    amenities: ["Large Family Lounge", "Private Patio", "Air Conditioning", "Pool Access", "Complimentary Breakfast"],
    cbsIcalUrl: "https://cbs.koorakotta.com/api/v1/ical/room/hut-107.ics"
  }
];

export async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🌱 Connected to MongoDB for Seeding...');

    // Clear rooms & insert Koora Kotta Huts if count is not 7
    const count = await Room.countDocuments();
    if (count < 7) {
      await Room.deleteMany({});
      await Room.insertMany(kooraKottaHuts);
      console.log('✅ Seeded 7 Koora Kotta Huts into MongoDB local database.');
    } else {
      console.log(`ℹ️ MongoDB already contains ${count} huts.`);
    }

  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => mongoose.disconnect());
}
