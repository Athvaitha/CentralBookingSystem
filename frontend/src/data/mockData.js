// Central Booking System (CBS) - Koora Kotta Eco Resort Dataset
// Authentic property entity configuration with all 7 Koora Kotta Huts

export const initialStats = {
  todayCheckIns: 0,
  todayCheckOuts: 0,
  totalBookings: 0,
  availableRooms: 7,
  occupiedRooms: 0,
  conflictsCount: 0,
  occupancyRate: "0%"
};

export const initialRooms = [
  {
    id: "hut-101",
    number: "Hut 101",
    name: "Jacuzzi Roof Hut",
    type: "Jacuzzi Hut",
    capacity: "2-4 Guests",
    bedType: "1 Queen + Loft Bed",
    pricePerNight: 4500,
    status: "Available", // Available, Booked, Blocked, Maintenance
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

export const initialCheckIns = [];

export const initialCheckOuts = [];

export const initialBookings = [];

export const initialBookingSources = [
  { source: "Koora Kotta Website", count: 0, percentage: 0, color: "#2563eb" },
  { source: "WhatsApp / Direct Call", count: 0, percentage: 0, color: "#16a34a" },
  { source: "Booking.com", count: 0, percentage: 0, color: "#003580" },
  { source: "Airbnb", count: 0, percentage: 0, color: "#ff385c" }
];

export const initialRoomAvailability = [
  { status: "Available", count: 7, color: "#10b981", badgeClass: "badge-available" },
  { status: "Booked", count: 0, color: "#ef4444", badgeClass: "badge-booked" },
  { status: "Blocked", count: 0, color: "#64748b", badgeClass: "badge-blocked" },
  { status: "Maintenance", count: 0, color: "#f59e0b", badgeClass: "badge-maintenance" }
];

export const initialChannels = [
  {
    id: "airbnb",
    name: "Airbnb",
    logo: "airbnb",
    status: "Connected",
    syncState: "Successful",
    lastSync: "2 minutes ago",
    nextSync: "in 13 minutes",
    syncDirection: "Two-Way (Import & Export)",
    roomsMapped: "7 / 7 huts",
    errorsCount: 0,
    color: "#ff385c"
  },
  {
    id: "booking-com",
    name: "Booking.com",
    logo: "booking",
    status: "Connected",
    syncState: "Successful",
    lastSync: "5 minutes ago",
    nextSync: "in 10 minutes",
    syncDirection: "Two-Way (Import & Export)",
    roomsMapped: "7 / 7 huts",
    errorsCount: 0,
    color: "#003580"
  },
  {
    id: "whatsapp-direct",
    name: "WhatsApp Direct",
    logo: "whatsapp",
    status: "Connected",
    syncState: "Active",
    lastSync: "Just now",
    nextSync: "Realtime",
    syncDirection: "Inbound Direct",
    roomsMapped: "7 / 7 huts",
    errorsCount: 0,
    color: "#25D366"
  }
];

export const initialExternalFeeds = [
  {
    id: "feed-1",
    platform: "Airbnb",
    room: "All Huts (Koora Kotta Property)",
    roomId: "all-rooms",
    icalUrl: "https://www.airbnb.com/calendar/ical/8912401.ics?s=cbs_sync_key",
    syncInterval: "30 minutes",
    isActive: true,
    lastSync: "2 minutes ago",
    syncStatus: "Healthy",
    eventsImported: 0,
    syncErrors: 0
  },
  {
    id: "feed-2",
    platform: "Booking.com",
    room: "All Huts (Koora Kotta Property)",
    roomId: "all-rooms",
    icalUrl: "https://admin.booking.com/hotel/ical/340912.ics?token=bkg_cbs_token",
    syncInterval: "15 minutes",
    isActive: true,
    lastSync: "5 minutes ago",
    syncStatus: "Healthy",
    eventsImported: 0,
    syncErrors: 0
  }
];

export const initialConflicts = [];

export const initialActiveBlocks = [];

export const initialHotelSettings = {
  hotelName: "Koora Kotta Eco Resort",
  propertyType: "Hut Stay & Resort",
  address: "382/2, Manaveli Main Road, Mettupalayam, Poothurai, Pondicherry - 605111",
  phone: "+91 9655221114",
  email: "koorakotta.pondy@gmail.com",
  timezone: "Asia/Kolkata (GMT+05:30)",
  currency: "INR (₹)",
  syncSettings: {
    defaultSyncInterval: "15", // minutes
    autoSyncEnabled: true,
    retryFailedSync: true,
    retryCount: 3,
    conflictDetectionThreshold: "Instant"
  },
  notificationSettings: {
    bookingConflicts: true,
    syncFailures: true,
    newBookings: true,
    dailyDigest: false
  },
  adminProfile: {
    name: "Koora Kotta Operations",
    role: "Resort Manager",
    email: "koorakotta.pondy@gmail.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  }
};


