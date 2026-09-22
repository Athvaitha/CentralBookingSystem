// Central Booking System (CBS) - Mock Dataset
// Containing 2 dummy items per entity as requested

export const initialStats = {
  todayCheckIns: 2,
  todayCheckOuts: 2,
  totalBookings: 24,
  availableRooms: 18,
  occupiedRooms: 32,
  conflictsCount: 2,
  occupancyRate: "64%"
};

export const initialRooms = [
  {
    id: "room-101",
    number: "101",
    name: "Deluxe Ocean View",
    type: "Deluxe",
    capacity: "2 Adults",
    bedType: "1 King Bed",
    pricePerNight: 180,
    status: "Booked", // Available, Booked, Blocked, Maintenance
    currentGuest: "Rahul Kumar",
    nextAvailable: "Sep 28, 2026",
    amenities: ["Ocean View", "King Bed", "High-speed WiFi", "Mini Bar", "Air Conditioning"],
    cbsIcalUrl: "https://cbs.hoteladmin.internal/api/v1/ical/room/101.ics"
  },
  {
    id: "room-203",
    number: "203",
    name: "Executive Suite",
    type: "Suite",
    capacity: "3 Adults",
    bedType: "1 King + 1 Sofa Bed",
    pricePerNight: 260,
    status: "Available",
    currentGuest: null,
    nextAvailable: "Immediate",
    amenities: ["Balcony", "Jacuzzi", "Workspace", "Nespresso Machine", "Safe"],
    cbsIcalUrl: "https://cbs.hoteladmin.internal/api/v1/ical/room/203.ics"
  }
];

export const initialCheckIns = [
  {
    id: "chk-in-1",
    guest: "Rahul Kumar",
    email: "rahul.k@example.com",
    phone: "+91 98765 43210",
    room: "Room 101",
    roomId: "room-101",
    time: "10:00 AM",
    source: "Airbnb",
    status: "Confirmed",
    amount: "$360"
  },
  {
    id: "chk-in-2",
    guest: "Priya S",
    email: "priya.s@example.com",
    phone: "+91 91234 56789",
    room: "Room 203",
    roomId: "room-203",
    time: "12:30 PM",
    source: "Hotel Website",
    status: "Confirmed",
    amount: "$780"
  }
];

export const initialCheckOuts = [
  {
    id: "chk-out-1",
    guest: "Amit Patel",
    email: "amit.patel@example.com",
    phone: "+91 99887 66554",
    room: "Room 101",
    roomId: "room-101",
    time: "11:00 AM",
    source: "Booking.com",
    status: "Completed",
    amount: "$540"
  },
  {
    id: "chk-out-2",
    guest: "Sarah Jenkins",
    email: "sarah.j@example.com",
    phone: "+1 415 555 0192",
    room: "Room 203",
    roomId: "room-203",
    time: "11:30 AM",
    source: "Airbnb",
    status: "Pending Departure",
    amount: "$520"
  }
];

export const initialBookings = [
  {
    id: "BK-8491",
    guestName: "Rahul Kumar",
    email: "rahul.k@example.com",
    phone: "+91 98765 43210",
    roomNumber: "101",
    roomType: "Deluxe Ocean View",
    checkIn: "2026-09-25",
    checkOut: "2026-09-27",
    nights: 2,
    adults: 2,
    children: 0,
    source: "Airbnb",
    status: "Confirmed",
    totalAmount: 360,
    paymentStatus: "Paid",
    createdAt: "2026-09-20 10:15 AM",
    notes: "Late check-in requested (after 9 PM)."
  },
  {
    id: "BK-8492",
    guestName: "Priya S",
    email: "priya.s@example.com",
    phone: "+91 91234 56789",
    roomNumber: "203",
    roomType: "Executive Suite",
    checkIn: "2026-09-26",
    checkOut: "2026-09-29",
    nights: 3,
    adults: 2,
    children: 1,
    source: "Hotel Website",
    status: "Confirmed",
    totalAmount: 780,
    paymentStatus: "Paid",
    createdAt: "2026-09-21 08:30 AM",
    notes: "High floor requested, extra baby cot."
  }
];

export const initialBookingSources = [
  { source: "Hotel Website", count: 32, percentage: 25, color: "#2563eb" },
  { source: "Booking.com", count: 45, percentage: 36, color: "#003580" },
  { source: "Airbnb", count: 38, percentage: 30, color: "#ff385c" },
  { source: "Admin / Offline", count: 11, percentage: 9, color: "#7c3aed" }
];

export const initialRoomAvailability = [
  { status: "Available", count: 18, color: "#10b981", badgeClass: "badge-available" },
  { status: "Booked", count: 32, color: "#ef4444", badgeClass: "badge-booked" },
  { status: "Blocked", count: 4, color: "#64748b", badgeClass: "badge-blocked" },
  { status: "Maintenance", count: 2, color: "#f59e0b", badgeClass: "badge-maintenance" }
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
    roomsMapped: "2 / 2 rooms",
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
    roomsMapped: "2 / 2 rooms",
    errorsCount: 0,
    color: "#003580"
  }
];

export const initialExternalFeeds = [
  {
    id: "feed-1",
    platform: "Airbnb",
    room: "All Rooms (Property-Wide)",
    roomId: "all-rooms",
    icalUrl: "https://www.airbnb.com/calendar/ical/8912401.ics?s=cbs_sync_key",
    syncInterval: "30 minutes",
    isActive: true,
    lastSync: "2 minutes ago",
    syncStatus: "Healthy",
    eventsImported: 14,
    syncErrors: 0
  },
  {
    id: "feed-2",
    platform: "Booking.com",
    room: "All Rooms (Property-Wide)",
    roomId: "all-rooms",
    icalUrl: "https://admin.booking.com/hotel/ical/340912.ics?token=bkg_cbs_token",
    syncInterval: "15 minutes",
    isActive: true,
    lastSync: "5 minutes ago",
    syncStatus: "Healthy",
    eventsImported: 22,
    syncErrors: 0
  }
];

export const initialConflicts = [
  {
    id: "CONF-101",
    roomNumber: "101",
    roomType: "Deluxe Ocean View",
    dateRange: "Sep 25 - Sep 27, 2026",
    startDate: "2026-09-25",
    endDate: "2026-09-27",
    severity: "Critical",
    status: "New", // New, Under Review, Resolved
    detectedAt: "2026-09-21 14:22 PM",
    reason: "Direct overlap between Airbnb and Booking.com iCal feeds.",
    booking1: {
      id: "BK-AB-901",
      source: "Airbnb",
      guest: "Rahul Kumar",
      status: "Confirmed",
      amount: "$360",
      createdAt: "2026-09-20 14:20 PM",
      contact: "rahul.k@example.com"
    },
    booking2: {
      id: "BK-BC-442",
      source: "Booking.com",
      guest: "Michael Scott",
      status: "Confirmed",
      amount: "$390",
      createdAt: "2026-09-20 14:22 PM",
      contact: "m.scott@dundermifflin.com"
    }
  },
  {
    id: "CONF-102",
    roomNumber: "203",
    roomType: "Executive Suite",
    dateRange: "Oct 02 - Oct 04, 2026",
    startDate: "2026-10-02",
    endDate: "2026-10-04",
    severity: "High",
    status: "Under Review",
    detectedAt: "2026-09-21 15:45 PM",
    reason: "Website booking conflicted with incoming Airbnb calendar feed.",
    booking1: {
      id: "BK-WS-551",
      source: "Hotel Website",
      guest: "Priya S",
      status: "Confirmed",
      amount: "$780",
      createdAt: "2026-09-21 15:30 PM",
      contact: "priya.s@example.com"
    },
    booking2: {
      id: "BK-AB-918",
      source: "Airbnb",
      guest: "David Miller",
      status: "Confirmed",
      amount: "$750",
      createdAt: "2026-09-21 15:32 PM",
      contact: "david.miller@example.com"
    }
  }
];

export const initialActiveBlocks = [
  {
    id: "blk-1",
    roomNumber: "101",
    roomId: "room-101",
    startDate: "2026-09-28",
    endDate: "2026-09-29",
    type: "Blocked",
    reason: "Owner Personal Stay",
    createdBy: "Admin (Alex Mercer)",
    createdAt: "2026-09-19"
  },
  {
    id: "blk-2",
    roomNumber: "203",
    roomId: "room-203",
    startDate: "2026-09-30",
    endDate: "2026-10-01",
    type: "Maintenance",
    reason: "Deep Cleaning & AC Filter Service",
    createdBy: "Housekeeping Lead",
    createdAt: "2026-09-20"
  }
];

export const initialHotelSettings = {
  hotelName: "Grand Azure Boutique Hotel & Suites",
  propertyType: "Boutique Hotel",
  address: "42 Seaside Promenade, Marine Drive, Mumbai 400020",
  phone: "+91 22 2200 4500",
  email: "reservations@grandazurehotel.com",
  timezone: "Asia/Kolkata (GMT+05:30)",
  currency: "USD ($)",
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
    name: "Alex Mercer",
    role: "Central Operations Manager",
    email: "alex.mercer@grandazurehotel.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
  }
};
