/**
 * ═══════════════════════════════════════════════════════════════
 * LiftLink — Production-Quality Marketplace Seed
 * ═══════════════════════════════════════════════════════════════
 *
 * Populates:  1 Admin, 10 Users, 35 Vendors, 120+ Reviews,
 *             60+ Quotes, 80+ Inquiries, 100+ Notifications
 *
 * Run:   node scripts/seed.js            (from backend/)
 * Reset: node scripts/seed.js --reset    (drops all & re-seeds)
 *
 * All passwords: Test@1234
 * ═══════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const RESET = process.argv.includes("--reset");

await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
console.log("✅ Connected:", mongoose.connection.host, "/", mongoose.connection.name);

const db = mongoose.connection.db;

// ── Drop collections if --reset flag ────────────────────────────────
if (RESET) {
  const toDrop = ["admins", "users", "vendors", "reviews", "quotes", "inquiries", "notifications", "services"];
  for (const col of toDrop) {
    try { await db.collection(col).drop(); } catch {}
  }
  console.log("🗑  Cleared all existing data (--reset)");
} else {
  // Check if vendors already exist
  const existingCount = await db.collection("vendors").countDocuments();
  if (existingCount >= 30) {
    console.log(`ℹ️  Database already has ${existingCount} vendors. Use --reset to re-seed.`);
    await mongoose.disconnect();
    process.exit(0);
  }
  // Drop for clean re-seed even without --reset if < 30 vendors
  const toDrop = ["admins", "users", "vendors", "reviews", "quotes", "inquiries", "notifications", "services"];
  for (const col of toDrop) {
    try { await db.collection(col).drop(); } catch {}
  }
  console.log("🗑  Cleared old data for fresh seed");
}

const hash = await bcrypt.hash("Test@1234", 10);
const oid = () => new mongoose.Types.ObjectId();

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════

const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const randomBetween = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

const businessHours = [
  { day: "Monday", open: "09:00", close: "18:00", closed: false },
  { day: "Tuesday", open: "09:00", close: "18:00", closed: false },
  { day: "Wednesday", open: "09:00", close: "18:00", closed: false },
  { day: "Thursday", open: "09:00", close: "18:00", closed: false },
  { day: "Friday", open: "09:00", close: "18:00", closed: false },
  { day: "Saturday", open: "10:00", close: "14:00", closed: false },
  { day: "Sunday", open: "00:00", close: "00:00", closed: true },
];

// ═══════════════════════════════════════════════════════════════
//  1. ADMIN
// ═══════════════════════════════════════════════════════════════

try {
  const adminSeedResp = await fetch(`http://localhost:${process.env.PORT || 5000}/api/admin/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "LiftLink Admin", email: "admin@liftlink.com", password: "Test@1234" }),
  });
  const adminJson = await adminSeedResp.json();
  if (!adminSeedResp.ok) {
    console.log("ℹ️  Admin:", adminJson.message, "(using existing)");
  } else {
    console.log("👤 Admin:  admin@liftlink.com / Test@1234");
  }
} catch {
  // Server not running — insert via raw insert with pre-hashed password
  await db.collection("admins").insertOne({
    name: "LiftLink Admin", email: "admin@liftlink.com", password: hash,
    role: "superadmin", isActive: true, createdAt: new Date(), updatedAt: new Date(),
  });
  console.log("👤 Admin:  admin@liftlink.com / Test@1234 (direct insert)");
}

// ═══════════════════════════════════════════════════════════════
//  2. USERS (10 realistic Indian users)
// ═══════════════════════════════════════════════════════════════

const usersData = [
  { username: "arjun_mehta",      fullName: "Arjun Mehta",       email: "arjun@test.com",       mobile: "9876543210" },
  { username: "sneha_patil",      fullName: "Sneha Patil",       email: "sneha@test.com",       mobile: "8765432109" },
  { username: "rahul_sharma",     fullName: "Rahul Sharma",      email: "rahul@test.com",       mobile: "9988776655" },
  { username: "priya_nair",       fullName: "Priya Nair",        email: "priya.n@test.com",     mobile: "9123456780" },
  { username: "vikram_singh",     fullName: "Vikram Singh",      email: "vikram@test.com",      mobile: "9234567891" },
  { username: "deepika_reddy",    fullName: "Deepika Reddy",     email: "deepika@test.com",     mobile: "9345678902" },
  { username: "amit_gupta",       fullName: "Amit Gupta",        email: "amit.g@test.com",      mobile: "9456789013" },
  { username: "kavita_joshi",     fullName: "Kavita Joshi",      email: "kavita@test.com",      mobile: "9567890124" },
  { username: "sunil_deshmukh",   fullName: "Sunil Deshmukh",    email: "sunil@test.com",       mobile: "9678901235" },
  { username: "meera_iyer",       fullName: "Meera Iyer",        email: "meera@test.com",       mobile: "9789012346" },
];

const userInsert = await db.collection("users").insertMany(
  usersData.map((u) => ({
    ...u, password: hash, savedVendors: [], recentlyViewed: [],
    isActive: true, emailVerified: true, createdAt: daysAgo(randomBetween(30, 120)), updatedAt: new Date(),
  }))
);
const userIds = Object.values(userInsert.insertedIds);
console.log(`👤 Users: ${userIds.length} created`);

// ═══════════════════════════════════════════════════════════════
//  3. VENDORS (35 realistic Indian elevator companies)
// ═══════════════════════════════════════════════════════════════

const vendorsRaw = [
  // ── 1. Mumbai & Thane ────────────────────────────────────────
  {
    fullname: "Rajesh Kumar", companyName: "SwiftLift Solutions", companyType: "Elevator Service Provider",
    email: "info@swiftlift.in", location: "Mumbai, Maharashtra",
    contact: "+91 22 4567 8900", mobile: "9876543210",
    description: "SwiftLift Solutions is one of Mumbai's most trusted elevator service providers with over 12 years of experience. We deliver turnkey passenger and freight elevator solutions for commercial complexes, residential towers, and industrial facilities across Maharashtra. Our ISO-certified operations ensure world-class safety and reliability.",
    tagline: "Elevating Your World, One Floor at a Time",
    experience: 12, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Freight Elevators", "Home Lifts", "MRL Elevators"],
    serviceCities: ["Mumbai", "Pune", "Thane", "Nashik"],
    serviceAreas: ["Maharashtra"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "Bureau Veritas", year: 2021 },
      { name: "CE Marking", issuedBy: "TÜV Rheinland", year: 2022 },
    ],
    socialLinks: { website: "https://swiftlift.in", linkedin: "https://linkedin.com/company/swiftlift", instagram: "https://instagram.com/swiftliftsolutions" },
    services: [
      { serviceName: "Passenger Elevator Installation", category: "Installation", description: "Full installation for buildings from 2 to 40 floors, including shaft construction assistance" },
      { serviceName: "Annual Maintenance Contract", category: "Maintenance", description: "Comprehensive preventive AMC with 24/7 emergency support and quarterly inspections" },
      { serviceName: "Elevator Modernization", category: "Modernization", description: "Upgrade legacy elevator systems with energy-efficient drives, modern cabins, and smart controls" },
    ],
    projects: [
      { title: "Oberoi Realty Tower — Mumbai", description: "Installed 8 high-speed gearless traction passenger lifts", year: 2023, location: "Goregaon, Mumbai" },
      { title: "Serenity Heights Pune", description: "4 home lifts with glass cabins for luxury villas", year: 2024, location: "Baner, Pune" },
    ],
    profileViews: 892, averageRating: 4.5, totalReviews: 6,
  },
  {
    fullname: "Anita Desai", companyName: "Thane Elevator Works", companyType: "Elevator Contractor",
    email: "info@thaneelevator.com", location: "Thane, Maharashtra",
    contact: "+91 22 2538 1100", mobile: "9876501234",
    description: "Thane Elevator Works has served the Thane-Dombivli-Kalyan corridor for over 9 years. We specialize in budget-friendly residential lifts, MRL elevators, and annual maintenance contracts for housing societies.",
    tagline: "Affordable Lifts, Premium Safety",
    experience: 9, teamSize: "10-50", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Home Lifts", "MRL Elevators"],
    serviceCities: ["Thane", "Dombivli", "Kalyan", "Mumbai"],
    serviceAreas: ["Thane District"],
    certifications: [{ name: "ISO 9001:2015", issuedBy: "IRQS", year: 2022 }],
    socialLinks: { website: "https://thaneelevator.com" },
    services: [
      { serviceName: "Residential Lift Installation", category: "Installation", description: "Compact MRL lifts for residential societies" },
      { serviceName: "Elevator AMC", category: "Maintenance", description: "Monthly inspection and 24/7 breakdown support" },
    ],
    projects: [
      { title: "Rustomjee Urbania", description: "12 MRL lifts across 3 towers", year: 2023, location: "Thane" },
    ],
    profileViews: 356, averageRating: 4.2, totalReviews: 4,
  },
  // ── 2. Delhi NCR ─────────────────────────────────────────────
  {
    fullname: "Priya Sharma", companyName: "Apex Elevators Pvt Ltd", companyType: "Elevator Manufacturer",
    email: "sales@apexelevators.in", location: "New Delhi, Delhi",
    contact: "+91 11 4123 5500", mobile: "8765432109",
    description: "Apex Elevators is a leading elevator manufacturing company headquartered in Delhi with a state-of-the-art factory in Manesar. We manufacture and install passenger, hospital, and panoramic elevators with an installed base of 2,500+ units across India.",
    tagline: "Engineering Excellence, Floor by Floor",
    experience: 18, teamSize: "100-500", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Hospital Elevators", "Panoramic Glass Elevators", "Escalators", "Dumbwaiters"],
    serviceCities: ["Delhi", "Gurugram", "Noida", "Faridabad", "Chandigarh", "Jaipur"],
    serviceAreas: ["Delhi NCR", "Haryana", "Punjab", "Rajasthan"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "TÜV SÜD", year: 2020 },
      { name: "BIS IS 14665", issuedBy: "Bureau of Indian Standards", year: 2022 },
      { name: "ASME A17.1", issuedBy: "ASME International", year: 2023 },
    ],
    socialLinks: { website: "https://apexelevators.in", linkedin: "https://linkedin.com/company/apex-elevators", facebook: "https://facebook.com/apexelevators", instagram: "https://instagram.com/apexelevators" },
    services: [
      { serviceName: "Passenger Elevator Manufacturing", category: "Manufacturing", description: "In-house manufacturing of geared and gearless traction passenger lifts" },
      { serviceName: "Hospital Elevator Installation", category: "Installation", description: "Stretcher-compatible elevators with anti-bacterial cabin interiors" },
      { serviceName: "Escalator Installation", category: "Installation", description: "Commercial escalators for malls, airports, and metro stations" },
      { serviceName: "24/7 Emergency Breakdown", category: "Maintenance", description: "Round-the-clock emergency repair and rescue services" },
    ],
    projects: [
      { title: "Max Super Speciality Hospital", description: "6 hospital-grade lifts with UPS backup", year: 2022, location: "Saket, New Delhi" },
      { title: "DLF Cyber Hub", description: "14 high-capacity passenger lifts and 4 escalators", year: 2023, location: "Gurugram" },
      { title: "Jaipur Metro Station", description: "8 escalators for passenger interchange", year: 2024, location: "Jaipur" },
    ],
    profileViews: 1543, averageRating: 4.8, totalReviews: 8,
  },
  {
    fullname: "Manish Kapoor", companyName: "Capital Lifts & Escalators", companyType: "Elevator Dealer",
    email: "enquiry@capitallifts.in", location: "Gurugram, Haryana",
    contact: "+91 124 456 7890", mobile: "9811234567",
    description: "Capital Lifts is an authorized dealer and installer for leading international elevator brands. We provide end-to-end solutions including installation, modernization, and maintenance for corporate offices, luxury residences, and retail spaces across Delhi NCR.",
    tagline: "Your Trusted Elevator Partner in NCR",
    experience: 11, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Capsule Elevators", "Panoramic Glass Elevators", "Car Elevators"],
    serviceCities: ["Gurugram", "Delhi", "Noida", "Greater Noida"],
    serviceAreas: ["Delhi NCR"],
    certifications: [
      { name: "ISO 14001:2015", issuedBy: "SGS India", year: 2023 },
    ],
    socialLinks: { website: "https://capitallifts.in", linkedin: "https://linkedin.com/company/capital-lifts" },
    services: [
      { serviceName: "Capsule Elevator Installation", category: "Installation", description: "Aesthetic capsule lifts for hotels and commercial buildings" },
      { serviceName: "Car Elevator Solutions", category: "Installation", description: "Heavy-duty car lifts for residential and commercial parking" },
      { serviceName: "Elevator Modernization", category: "Modernization", description: "Complete controller and cabin upgrades for existing elevators" },
    ],
    projects: [
      { title: "Ambience Mall Expansion", description: "6 capsule elevators with panoramic views", year: 2024, location: "Gurugram" },
    ],
    profileViews: 567, averageRating: 4.4, totalReviews: 5,
  },
  // ── 3. Pune ──────────────────────────────────────────────────
  {
    fullname: "Sanjay Kulkarni", companyName: "Precision Elevators India", companyType: "Elevator Manufacturer",
    email: "info@precisionelevators.in", location: "Pune, Maharashtra",
    contact: "+91 20 2612 3400", mobile: "9823456789",
    description: "Precision Elevators India is a Pune-based manufacturer specializing in machine-room-less (MRL) traction elevators. With a modern manufacturing facility in Chakan and an R&D team of 20 engineers, we deliver energy-efficient elevator systems across Western India.",
    tagline: "Precision Engineering for Modern Buildings",
    experience: 14, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["MRL Elevators", "Traction Elevators", "Passenger Elevators", "Freight Elevators"],
    serviceCities: ["Pune", "Mumbai", "Nashik", "Aurangabad", "Kolhapur"],
    serviceAreas: ["Maharashtra", "Goa", "Karnataka"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "TÜV Nord", year: 2021 },
      { name: "BIS IS 14665", issuedBy: "Bureau of Indian Standards", year: 2023 },
    ],
    socialLinks: { website: "https://precisionelevators.in", linkedin: "https://linkedin.com/company/precision-elevators" },
    services: [
      { serviceName: "MRL Elevator Manufacturing", category: "Manufacturing", description: "Compact gearless traction lifts that save machine room space and energy" },
      { serviceName: "Freight Elevator Installation", category: "Installation", description: "Heavy-duty goods lifts with capacities from 1000kg to 5000kg" },
      { serviceName: "Elevator Modernization", category: "Modernization", description: "Retrofit old hydraulic systems with modern MRL traction drives" },
      { serviceName: "Annual Maintenance Contract", category: "Maintenance", description: "Quarterly inspections, lubrication, and emergency callback service" },
    ],
    projects: [
      { title: "Panchshil Tech Park", description: "22 MRL passenger lifts across 4 IT towers", year: 2023, location: "Hinjewadi, Pune" },
      { title: "Godrej Infinity", description: "16 gearless traction lifts for residential complex", year: 2024, location: "Keshav Nagar, Pune" },
    ],
    profileViews: 723, averageRating: 4.6, totalReviews: 7,
  },
  {
    fullname: "Neha Bhosale", companyName: "UrbanLift Pune", companyType: "Elevator Service Provider",
    email: "hello@urbanliftpune.com", location: "Pune, Maharashtra",
    contact: "+91 20 3045 6700", mobile: "9890123456",
    description: "UrbanLift Pune is a dedicated elevator maintenance and modernization company serving Pune's growing real estate market. We handle AMC contracts for 400+ residential societies and specialize in upgrading older hydraulic lifts to modern energy-efficient systems.",
    tagline: "Pune's Elevator Maintenance Experts",
    experience: 7, teamSize: "10-50", isApproved: true, isVerified: false,
    liftCategories: ["Passenger Elevators", "Home Lifts", "Hydraulic Elevators"],
    serviceCities: ["Pune", "Pimpri-Chinchwad", "Lonavala"],
    serviceAreas: ["Pune District"],
    certifications: [{ name: "ISO 9001:2015", issuedBy: "IRQS", year: 2023 }],
    socialLinks: { website: "https://urbanliftpune.com", instagram: "https://instagram.com/urbanliftpune" },
    services: [
      { serviceName: "Elevator AMC", category: "Maintenance", description: "Comprehensive and non-comprehensive AMC plans for all lift types" },
      { serviceName: "Hydraulic Lift Repair", category: "Repair", description: "Specializing in hydraulic elevator troubleshooting and repair" },
      { serviceName: "Emergency Breakdown Service", category: "Maintenance", description: "60-minute response time across Pune city" },
    ],
    projects: [],
    profileViews: 234, averageRating: 4.0, totalReviews: 3,
  },
  // ── 4. Bengaluru ─────────────────────────────────────────────
  {
    fullname: "Karthik Rao", companyName: "BangaLift Technologies", companyType: "Elevator Manufacturer",
    email: "contact@bangalift.co.in", location: "Bengaluru, Karnataka",
    contact: "+91 80 4567 8900", mobile: "9900123456",
    description: "BangaLift Technologies is Bengaluru's premier elevator manufacturer with a smart factory in Peenya Industrial Area. We leverage IoT and AI-powered predictive maintenance to deliver next-generation elevator solutions for India's tech hub.",
    tagline: "Smart Elevators for Smart Cities",
    experience: 10, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "MRL Elevators", "Panoramic Glass Elevators", "Dumbwaiters"],
    serviceCities: ["Bengaluru", "Mysuru", "Hubli", "Mangaluru"],
    serviceAreas: ["Karnataka", "Kerala"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "DNV GL", year: 2022 },
      { name: "ISO 14001:2015", issuedBy: "DNV GL", year: 2022 },
    ],
    socialLinks: { website: "https://bangalift.co.in", linkedin: "https://linkedin.com/company/bangalift", googleMaps: "https://g.co/maps/bangalift" },
    services: [
      { serviceName: "Smart Elevator Systems", category: "Installation", description: "IoT-enabled elevators with mobile app control and predictive maintenance" },
      { serviceName: "Panoramic Glass Elevator", category: "Installation", description: "Full-glass cabin elevators for malls, hotels, and commercial atriums" },
      { serviceName: "Dumbwaiter Installation", category: "Installation", description: "Service lifts for restaurants, hospitals, and libraries" },
      { serviceName: "Annual Maintenance Contract", category: "Maintenance", description: "AI-driven predictive AMC with remote diagnostics" },
    ],
    projects: [
      { title: "Embassy Tech Village", description: "32 smart passenger lifts with IoT integration", year: 2024, location: "Outer Ring Road, Bengaluru" },
      { title: "Prestige Lakeside Habitat", description: "24 MRL lifts for residential township", year: 2023, location: "Whitefield, Bengaluru" },
    ],
    profileViews: 1102, averageRating: 4.7, totalReviews: 9,
  },
  {
    fullname: "Lakshmi Krishnan", companyName: "SkyRise Elevators Bengaluru", companyType: "Elevator Service Provider",
    email: "info@skyriseelevators.in", location: "Bengaluru, Karnataka",
    contact: "+91 80 2345 6789", mobile: "9845678901",
    description: "SkyRise Elevators provides expert elevator installation and maintenance services in Bengaluru. We are an authorized service partner for multiple global elevator brands and serve over 300 buildings in the city.",
    tagline: "Rising Higher Together",
    experience: 8, teamSize: "10-50", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Traction Elevators", "Home Lifts"],
    serviceCities: ["Bengaluru", "Electronic City", "Whitefield"],
    serviceAreas: ["Bengaluru Urban"],
    certifications: [{ name: "ISO 9001:2015", issuedBy: "BSI", year: 2023 }],
    socialLinks: { website: "https://skyriseelevators.in" },
    services: [
      { serviceName: "Traction Elevator Installation", category: "Installation", description: "Geared and gearless traction lifts for all building types" },
      { serviceName: "Elevator AMC", category: "Maintenance", description: "Flexible monthly and annual maintenance plans" },
    ],
    projects: [
      { title: "Brigade Gateway", description: "8 high-speed traction passenger lifts", year: 2023, location: "Rajajinagar, Bengaluru" },
    ],
    profileViews: 445, averageRating: 4.3, totalReviews: 4,
  },
  // ── 5. Hyderabad ─────────────────────────────────────────────
  {
    fullname: "Venkat Reddy", companyName: "Deccan Lift Corporation", companyType: "Elevator Manufacturer",
    email: "info@deccanlift.com", location: "Hyderabad, Telangana",
    contact: "+91 40 2345 6789", mobile: "9848012345",
    description: "Deccan Lift Corporation is a Hyderabad-based elevator manufacturer established in 2005. We supply and install passenger, hospital, and villa elevators to builders and architects across Telangana and Andhra Pradesh.",
    tagline: "Lifting Hyderabad's Skyline",
    experience: 19, teamSize: "100-500", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Hospital Elevators", "Villa Elevators", "Hydraulic Elevators"],
    serviceCities: ["Hyderabad", "Secunderabad", "Warangal", "Vijayawada", "Visakhapatnam"],
    serviceAreas: ["Telangana", "Andhra Pradesh"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "Bureau Veritas", year: 2021 },
      { name: "BIS IS 14665", issuedBy: "Bureau of Indian Standards", year: 2023 },
    ],
    socialLinks: { website: "https://deccanlift.com", linkedin: "https://linkedin.com/company/deccanliftcorp", facebook: "https://facebook.com/deccanlift" },
    services: [
      { serviceName: "Villa Elevator Installation", category: "Installation", description: "Compact home lifts designed for bungalows and villas" },
      { serviceName: "Hospital Elevator Systems", category: "Installation", description: "Bed lifts with wide doors and smooth ride for patient transport" },
      { serviceName: "Hydraulic Elevator Installation", category: "Installation", description: "Hydraulic lifts for low-rise buildings up to 6 floors" },
      { serviceName: "Elevator Repair & Servicing", category: "Maintenance", description: "Expert repair services for all major elevator brands" },
    ],
    projects: [
      { title: "Apollo Hospitals Jubilee Hills", description: "4 hospital bed elevators with emergency backup", year: 2022, location: "Hyderabad" },
      { title: "My Home Bhooja", description: "18 passenger lifts for luxury residential tower", year: 2024, location: "Madhapur, Hyderabad" },
    ],
    profileViews: 934, averageRating: 4.5, totalReviews: 6,
  },
  {
    fullname: "Farah Begum", companyName: "HydraLift Solutions", companyType: "Elevator Service Provider",
    email: "support@hydralift.in", location: "Hyderabad, Telangana",
    contact: "+91 40 6789 0123", mobile: "9700123456",
    description: "HydraLift Solutions specializes in hydraulic elevator systems for low-rise residential and commercial buildings. We are Hyderabad's go-to company for hydraulic lift installation, repair, and annual maintenance contracts.",
    tagline: "Hydraulic Excellence, Guaranteed",
    experience: 6, teamSize: "10-50", isApproved: true, isVerified: false,
    liftCategories: ["Hydraulic Elevators", "Home Lifts", "Residential Elevators"],
    serviceCities: ["Hyderabad", "Secunderabad", "Ranga Reddy"],
    serviceAreas: ["Hyderabad Metro"],
    certifications: [{ name: "ISO 9001:2015", issuedBy: "QCI", year: 2023 }],
    socialLinks: { website: "https://hydralift.in" },
    services: [
      { serviceName: "Hydraulic Lift Installation", category: "Installation", description: "Oil-hydraulic lifts for G+4 to G+6 buildings" },
      { serviceName: "Lift AMC", category: "Maintenance", description: "Regular preventive maintenance for hydraulic elevators" },
    ],
    projects: [],
    profileViews: 178, averageRating: 4.1, totalReviews: 3,
  },
  // ── 6. Ahmedabad & Surat ─────────────────────────────────────
  {
    fullname: "Jignesh Patel", companyName: "Gujarat Elevator Systems", companyType: "Elevator Manufacturer",
    email: "info@gujaratelevators.com", location: "Ahmedabad, Gujarat",
    contact: "+91 79 2635 7800", mobile: "9824567890",
    description: "Gujarat Elevator Systems is a family-owned elevator manufacturing business operating since 1998. With over 3,000 lifts installed across Gujarat, we are the state's most experienced elevator company with NABL-accredited testing facilities.",
    tagline: "Gujarat's Most Trusted Elevator Partner",
    experience: 26, teamSize: "100-500", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Freight Elevators", "MRL Elevators", "Traction Elevators", "Car Elevators"],
    serviceCities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
    serviceAreas: ["Gujarat"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "Lloyd's Register", year: 2020 },
      { name: "CE Marking", issuedBy: "TÜV Rheinland", year: 2021 },
      { name: "BIS IS 14665", issuedBy: "Bureau of Indian Standards", year: 2022 },
    ],
    socialLinks: { website: "https://gujaratelevators.com", linkedin: "https://linkedin.com/company/gujarat-elevators", googleMaps: "https://g.co/maps/gujaratelevators" },
    services: [
      { serviceName: "Passenger Elevator Manufacturing", category: "Manufacturing", description: "Custom passenger lifts for residential, commercial, and institutional buildings" },
      { serviceName: "Freight Elevator Systems", category: "Installation", description: "Heavy-duty goods lifts for factories and warehouses" },
      { serviceName: "Car Elevator Solutions", category: "Installation", description: "Automobile lifts for multi-level car parking systems" },
      { serviceName: "Comprehensive AMC", category: "Maintenance", description: "All-inclusive annual maintenance with genuine spare parts" },
    ],
    projects: [
      { title: "GIFT City Tower 1", description: "10 high-speed passenger lifts for 30-floor tower", year: 2023, location: "Gandhinagar" },
      { title: "Adani Shantigram", description: "28 residential lifts across township", year: 2024, location: "Ahmedabad" },
    ],
    profileViews: 1287, averageRating: 4.6, totalReviews: 8,
  },
  {
    fullname: "Paresh Shah", companyName: "Diamond Lifts Surat", companyType: "Elevator Contractor",
    email: "info@diamondliftssurat.com", location: "Surat, Gujarat",
    contact: "+91 261 234 5678", mobile: "9825678901",
    description: "Diamond Lifts is Surat's fastest-growing elevator installation company. We serve the city's booming textile industry with specialized freight elevators and provide residential lift solutions for Surat's expanding skyline.",
    tagline: "Surat's Rising Elevator Company",
    experience: 8, teamSize: "10-50", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Freight Elevators", "Home Lifts", "Dumbwaiters"],
    serviceCities: ["Surat", "Navsari", "Valsad"],
    serviceAreas: ["South Gujarat"],
    certifications: [{ name: "ISO 9001:2015", issuedBy: "IRQS", year: 2022 }],
    socialLinks: { website: "https://diamondliftssurat.com" },
    services: [
      { serviceName: "Textile Mill Freight Elevators", category: "Installation", description: "Heavy-duty goods lifts designed for Surat's textile factories" },
      { serviceName: "Residential Lift Installation", category: "Installation", description: "Compact lifts for G+3 to G+12 residential buildings" },
      { serviceName: "Dumbwaiter Installation", category: "Installation", description: "Small service lifts for restaurants and industrial kitchens" },
    ],
    projects: [
      { title: "Surat Diamond Bourse", description: "4 freight lifts for world's largest office building", year: 2023, location: "Surat" },
    ],
    profileViews: 345, averageRating: 4.3, totalReviews: 4,
  },
  // ── 7. Chennai ───────────────────────────────────────────────
  {
    fullname: "Ramesh Subramaniam", companyName: "TamilNadu Elevators Ltd", companyType: "Elevator Manufacturer",
    email: "info@tnlifts.co.in", location: "Chennai, Tamil Nadu",
    contact: "+91 44 2468 1357", mobile: "9841234567",
    description: "TamilNadu Elevators Ltd is South India's oldest elevator company, founded in 1994. We are a government-empaneled supplier for public sector projects and have installed over 4,500 elevators across hospitals, government offices, and residential complexes.",
    tagline: "South India's Pioneer in Vertical Transportation",
    experience: 30, teamSize: "500+", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Hospital Elevators", "Freight Elevators", "Escalators", "Moving Walkways"],
    serviceCities: ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"],
    serviceAreas: ["Tamil Nadu", "Puducherry", "Kerala"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "TÜV SÜD", year: 2019 },
      { name: "ISO 14001:2015", issuedBy: "TÜV SÜD", year: 2019 },
      { name: "OHSAS 18001", issuedBy: "BSI", year: 2020 },
      { name: "BIS IS 14665", issuedBy: "Bureau of Indian Standards", year: 2021 },
    ],
    socialLinks: { website: "https://tnlifts.co.in", linkedin: "https://linkedin.com/company/tamilnadu-elevators", facebook: "https://facebook.com/tnlifts" },
    services: [
      { serviceName: "Hospital Elevator Systems", category: "Installation", description: "Stretcher and bed lifts compliant with healthcare standards" },
      { serviceName: "Escalator Installation", category: "Installation", description: "Indoor and outdoor escalators for malls and transit systems" },
      { serviceName: "Moving Walkway Systems", category: "Installation", description: "Horizontal moving walkways for airports and exhibitions" },
      { serviceName: "Government Project Elevators", category: "Installation", description: "Public sector elevator installations with CPWD compliance" },
    ],
    projects: [
      { title: "Chennai Metro Phase 2", description: "16 escalators and 8 elevators for 4 stations", year: 2024, location: "Chennai" },
      { title: "AIIMS Madurai", description: "12 hospital-grade bed elevators", year: 2023, location: "Madurai" },
    ],
    profileViews: 1876, averageRating: 4.7, totalReviews: 10,
  },
  {
    fullname: "Deepa Venkatesh", companyName: "Marina Lift Works", companyType: "Elevator Service Provider",
    email: "service@marinalift.in", location: "Chennai, Tamil Nadu",
    contact: "+91 44 4567 8901", mobile: "9840567890",
    description: "Marina Lift Works is a women-owned elevator maintenance company in Chennai. We specialize in annual maintenance contracts, emergency breakdown services, and lift modernization for residential apartments and small commercial buildings.",
    tagline: "Reliable Lift Maintenance, Every Day",
    experience: 5, teamSize: "10-50", isApproved: true, isVerified: false,
    liftCategories: ["Passenger Elevators", "Hydraulic Elevators", "Home Lifts"],
    serviceCities: ["Chennai", "Tambaram", "Porur"],
    serviceAreas: ["Chennai Metro"],
    certifications: [],
    socialLinks: { website: "https://marinalift.in", instagram: "https://instagram.com/marinaliftworks" },
    services: [
      { serviceName: "Elevator AMC", category: "Maintenance", description: "Affordable annual maintenance contracts for residential societies" },
      { serviceName: "Emergency Breakdown Service", category: "Maintenance", description: "45-minute response for elevator breakdowns in Chennai" },
      { serviceName: "Lift Modernization", category: "Modernization", description: "Controller and door operator upgrades for older lifts" },
    ],
    projects: [],
    profileViews: 156, averageRating: 3.9, totalReviews: 2,
  },
  // ── 8. Jaipur ────────────────────────────────────────────────
  {
    fullname: "Rajendra Meena", companyName: "Rajasthan Lift Industries", companyType: "Elevator Manufacturer",
    email: "info@rajasthanlift.com", location: "Jaipur, Rajasthan",
    contact: "+91 141 234 5678", mobile: "9829012345",
    description: "Rajasthan Lift Industries is the leading elevator company in the state with a manufacturing plant in Sitapura Industrial Area. We specialize in aesthetically designed capsule and panoramic elevators suited for Rajasthan's heritage hotels and luxury properties.",
    tagline: "Royal Elevators for Rajasthan's Heritage",
    experience: 16, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["Capsule Elevators", "Panoramic Glass Elevators", "Passenger Elevators", "Villa Elevators"],
    serviceCities: ["Jaipur", "Jodhpur", "Udaipur", "Ajmer", "Kota"],
    serviceAreas: ["Rajasthan"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "Bureau Veritas", year: 2021 },
      { name: "CE Marking", issuedBy: "TÜV Rheinland", year: 2023 },
    ],
    socialLinks: { website: "https://rajasthanlift.com", instagram: "https://instagram.com/rajasthanlift" },
    services: [
      { serviceName: "Capsule Elevator Installation", category: "Installation", description: "Luxury capsule lifts with custom exterior cladding and LED lighting" },
      { serviceName: "Panoramic Glass Elevator", category: "Installation", description: "Full-height glass lifts for hotels and commercial atriums" },
      { serviceName: "Villa Home Lift", category: "Installation", description: "Compact hydraulic home lifts for villas and bungalows" },
    ],
    projects: [
      { title: "Taj Rambagh Palace", description: "2 bespoke capsule elevators matching heritage aesthetics", year: 2023, location: "Jaipur" },
      { title: "World Trade Park", description: "4 panoramic glass elevators for shopping mall", year: 2024, location: "Jaipur" },
    ],
    profileViews: 678, averageRating: 4.4, totalReviews: 5,
  },
  // ── 9. Kolkata ───────────────────────────────────────────────
  {
    fullname: "Subhash Ghosh", companyName: "Eastern Elevator Corporation", companyType: "Elevator Manufacturer",
    email: "info@easternelevator.in", location: "Kolkata, West Bengal",
    contact: "+91 33 2456 7890", mobile: "9830123456",
    description: "Eastern Elevator Corporation has been serving Eastern India since 2002. We manufacture passenger and freight elevators at our Howrah factory and have an installed base of 1,800+ units across West Bengal, Odisha, and the Northeast states.",
    tagline: "Eastern India's Elevator Leader",
    experience: 22, teamSize: "100-500", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Freight Elevators", "Hospital Elevators", "Traction Elevators"],
    serviceCities: ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Bhubaneswar"],
    serviceAreas: ["West Bengal", "Odisha", "Northeast India"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "TÜV India", year: 2021 },
      { name: "BIS IS 14665", issuedBy: "Bureau of Indian Standards", year: 2022 },
    ],
    socialLinks: { website: "https://easternelevator.in", linkedin: "https://linkedin.com/company/eastern-elevator" },
    services: [
      { serviceName: "Passenger Elevator Manufacturing", category: "Manufacturing", description: "Traction passenger lifts for high-rise residential and commercial buildings" },
      { serviceName: "Hospital Elevator Installation", category: "Installation", description: "Bed and stretcher lifts for healthcare facilities" },
      { serviceName: "Freight Elevator Systems", category: "Installation", description: "Industrial goods lifts for factories and tea gardens" },
      { serviceName: "Annual Maintenance Contract", category: "Maintenance", description: "Full-service AMC with genuine spares across Eastern India" },
    ],
    projects: [
      { title: "ITC Royal Bengal", description: "10 luxury passenger lifts for 5-star hotel", year: 2022, location: "Kolkata" },
      { title: "Tata Steel Works Expansion", description: "6 industrial freight lifts", year: 2023, location: "Jamshedpur" },
    ],
    profileViews: 876, averageRating: 4.5, totalReviews: 6,
  },
  // ── 10. Nashik ───────────────────────────────────────────────
  {
    fullname: "Suresh Patel", companyName: "ElevaTech Engineers", companyType: "Elevator Contractor",
    email: "contact@elevatech.in", location: "Nashik, Maharashtra",
    contact: "+91 253 234 5678", mobile: "7654321098",
    description: "ElevaTech Engineers is a trusted elevator contractor in Nashik serving residential and commercial projects. With 8 years of experience, we provide affordable home lifts and passenger elevator solutions for the growing Nashik real estate market.",
    tagline: "Safe, Reliable, Affordable Lifts",
    experience: 8, teamSize: "10-50", isApproved: true, isVerified: false,
    liftCategories: ["Home Lifts", "Passenger Elevators", "Residential Elevators"],
    serviceCities: ["Nashik", "Ahmednagar", "Aurangabad"],
    serviceAreas: ["Nashik Division"],
    certifications: [],
    socialLinks: {},
    services: [
      { serviceName: "Home Lift Installation", category: "Installation", description: "Budget-friendly residential lifts for individual homes and villas" },
      { serviceName: "Passenger Lift Installation", category: "Installation", description: "Standard passenger lifts for residential societies" },
      { serviceName: "Elevator Repair", category: "Maintenance", description: "Multi-brand elevator repair and spare parts supply" },
    ],
    projects: [
      { title: "Nashik Green Residency", description: "6 passenger lifts for township project", year: 2024, location: "Nashik" },
    ],
    profileViews: 123, averageRating: 4.1, totalReviews: 3,
  },
  // ── 11. Nagpur ───────────────────────────────────────────────
  {
    fullname: "Aarti Wankhede", companyName: "Central India Lifts Pvt Ltd", companyType: "Elevator Service Provider",
    email: "info@centralindialifts.com", location: "Nagpur, Maharashtra",
    contact: "+91 712 234 5678", mobile: "9370123456",
    description: "Central India Lifts is the largest elevator service provider in Vidarbha region. We install and maintain passenger, freight, and home elevators for residential, commercial, and government projects across Central India.",
    tagline: "Vidarbha's Premier Elevator Partner",
    experience: 13, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Freight Elevators", "Home Lifts", "MRL Elevators"],
    serviceCities: ["Nagpur", "Wardha", "Chandrapur", "Amravati", "Akola"],
    serviceAreas: ["Vidarbha Region", "Central India"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "IRQS", year: 2022 },
    ],
    socialLinks: { website: "https://centralindialifts.com", facebook: "https://facebook.com/centralindialifts" },
    services: [
      { serviceName: "Passenger Elevator Installation", category: "Installation", description: "Traction and MRL passenger lifts for all building types" },
      { serviceName: "Freight Elevator Installation", category: "Installation", description: "Industrial goods lifts for factories and warehouses" },
      { serviceName: "Elevator AMC", category: "Maintenance", description: "Comprehensive annual maintenance with 4-hour emergency response" },
    ],
    projects: [
      { title: "VCA Stadium Nagpur", description: "4 passenger lifts for cricket stadium renovation", year: 2023, location: "Nagpur" },
    ],
    profileViews: 456, averageRating: 4.3, totalReviews: 5,
  },
  // ── 12. Aurangabad ───────────────────────────────────────────
  {
    fullname: "Irfan Shaikh", companyName: "Marathwada Elevator Co", companyType: "Elevator Contractor",
    email: "info@marathwadaelevator.com", location: "Aurangabad, Maharashtra",
    contact: "+91 240 234 5678", mobile: "9881234567",
    description: "Marathwada Elevator Co has been serving the Aurangabad-Jalna-Latur corridor for over a decade. We provide complete elevator solutions from installation to AMC for residential and commercial buildings.",
    tagline: "Elevating Marathwada's Growth",
    experience: 11, teamSize: "10-50", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Home Lifts", "Hydraulic Elevators"],
    serviceCities: ["Aurangabad", "Jalna", "Latur", "Nanded"],
    serviceAreas: ["Marathwada Region"],
    certifications: [{ name: "ISO 9001:2015", issuedBy: "QCI", year: 2023 }],
    socialLinks: { website: "https://marathwadaelevator.com" },
    services: [
      { serviceName: "Residential Elevator Installation", category: "Installation", description: "Passenger lifts for residential complexes and individual buildings" },
      { serviceName: "Hydraulic Home Lift", category: "Installation", description: "Oil-hydraulic lifts for low-rise homes and clinics" },
      { serviceName: "Elevator AMC & Servicing", category: "Maintenance", description: "Regular maintenance and breakdown support" },
    ],
    projects: [],
    profileViews: 189, averageRating: 4.0, totalReviews: 2,
  },
  // ── 13. Indore ───────────────────────────────────────────────
  {
    fullname: "Gaurav Malviya", companyName: "Indore Lift Solutions", companyType: "Elevator Service Provider",
    email: "info@indorelifts.com", location: "Indore, Madhya Pradesh",
    contact: "+91 731 234 5678", mobile: "9893456789",
    description: "Indore Lift Solutions is Madhya Pradesh's fastest-growing elevator company. We provide end-to-end elevator services including installation, modernization, and maintenance for Indore's rapidly developing urban landscape.",
    tagline: "MP's Fastest Growing Elevator Company",
    experience: 7, teamSize: "10-50", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "MRL Elevators", "Home Lifts", "Capsule Elevators"],
    serviceCities: ["Indore", "Bhopal", "Ujjain", "Dewas"],
    serviceAreas: ["Madhya Pradesh"],
    certifications: [{ name: "ISO 9001:2015", issuedBy: "Bureau Veritas", year: 2023 }],
    socialLinks: { website: "https://indorelifts.com", instagram: "https://instagram.com/indoreliftsolutions" },
    services: [
      { serviceName: "MRL Elevator Installation", category: "Installation", description: "Space-saving machine-room-less elevators for modern buildings" },
      { serviceName: "Capsule Elevator Installation", category: "Installation", description: "Aesthetic capsule lifts for shopping malls and hotels" },
      { serviceName: "Elevator Modernization", category: "Modernization", description: "Upgrade old elevators with modern controllers and safety features" },
      { serviceName: "Emergency Maintenance", category: "Maintenance", description: "24/7 emergency breakdown response within Indore" },
    ],
    projects: [
      { title: "Phoenix Citadel Mall", description: "6 capsule elevators and 2 escalators", year: 2024, location: "Indore" },
    ],
    profileViews: 312, averageRating: 4.2, totalReviews: 3,
  },
  // ── 14-20. More vendors across various cities ────────────────
  {
    fullname: "Vikram Rathod", companyName: "Skyline Elevators India", companyType: "Elevator Manufacturer",
    email: "info@skylineelevators.in", location: "Mumbai, Maharashtra",
    contact: "+91 22 6789 0123", mobile: "9820345678",
    description: "Skyline Elevators India is a premium elevator brand specializing in high-speed gearless traction lifts for skyscrapers and luxury residential towers. We are trusted by India's top real estate developers for their most prestigious projects.",
    tagline: "Elevating India's Tallest Buildings",
    experience: 20, teamSize: "100-500", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Traction Elevators", "Panoramic Glass Elevators", "Freight Elevators"],
    serviceCities: ["Mumbai", "Pune", "Bengaluru", "Delhi", "Hyderabad", "Chennai"],
    serviceAreas: ["Pan India"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "Lloyd's Register", year: 2020 },
      { name: "EN 81-20:2014", issuedBy: "TÜV SÜD", year: 2022 },
      { name: "ASME A17.1", issuedBy: "ASME International", year: 2023 },
    ],
    socialLinks: { website: "https://skylineelevators.in", linkedin: "https://linkedin.com/company/skyline-elevators-india", instagram: "https://instagram.com/skylineelevators" },
    services: [
      { serviceName: "High-Speed Elevator Systems", category: "Installation", description: "Gearless traction lifts with speeds up to 6 m/s for buildings above 30 floors" },
      { serviceName: "Panoramic Glass Elevator", category: "Installation", description: "Scenic glass lifts for luxury hotels and premium residences" },
      { serviceName: "Destination Control Systems", category: "Installation", description: "AI-powered elevator dispatching for reduced wait times" },
    ],
    projects: [
      { title: "Lodha The World Towers", description: "24 high-speed lifts for 75-floor luxury tower", year: 2023, location: "Lower Parel, Mumbai" },
      { title: "Prestige Exora Business Park", description: "18 passenger lifts for IT park", year: 2024, location: "Bengaluru" },
    ],
    profileViews: 2145, averageRating: 4.9, totalReviews: 12,
  },
  {
    fullname: "Pradeep Yadav", companyName: "SafeWay Elevator Services", companyType: "Elevator Service Provider",
    email: "contact@safewaylifts.in", location: "Delhi, NCR",
    contact: "+91 11 2345 6789", mobile: "9810234567",
    description: "SafeWay Elevator Services is Delhi's leading elevator maintenance and repair company. We manage AMC contracts for 800+ lifts across Delhi NCR and provide round-the-clock emergency breakdown services.",
    tagline: "Your Safety is Our Priority",
    experience: 12, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Traction Elevators", "MRL Elevators"],
    serviceCities: ["Delhi", "Noida", "Ghaziabad", "Gurugram", "Faridabad"],
    serviceAreas: ["Delhi NCR"],
    certifications: [{ name: "ISO 9001:2015", issuedBy: "BSI", year: 2022 }],
    socialLinks: { website: "https://safewaylifts.in", googleMaps: "https://g.co/maps/safewaylifts" },
    services: [
      { serviceName: "Elevator AMC", category: "Maintenance", description: "Comprehensive and semi-comprehensive AMC for all elevator types" },
      { serviceName: "Emergency Breakdown Service", category: "Maintenance", description: "30-minute response time with trained rescue teams" },
      { serviceName: "Elevator Repair", category: "Maintenance", description: "Multi-brand repair expertise with genuine spare parts" },
    ],
    projects: [],
    profileViews: 567, averageRating: 4.4, totalReviews: 6,
  },
  {
    fullname: "Rohit Agarwal", companyName: "EcoLift Green Elevators", companyType: "Elevator Manufacturer",
    email: "info@ecolift.in", location: "Pune, Maharashtra",
    contact: "+91 20 4567 8901", mobile: "9822345678",
    description: "EcoLift is India's first green elevator company. We manufacture solar-powered, energy-regenerative elevator systems that reduce building energy consumption by up to 40%. Our elevators are designed for IGBC and LEED-certified green buildings.",
    tagline: "India's First Green Elevator Company",
    experience: 6, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["MRL Elevators", "Traction Elevators", "Home Lifts", "Passenger Elevators"],
    serviceCities: ["Pune", "Mumbai", "Bengaluru", "Hyderabad"],
    serviceAreas: ["Maharashtra", "Karnataka", "Telangana"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "TÜV Nord", year: 2022 },
      { name: "ISO 14001:2015", issuedBy: "TÜV Nord", year: 2022 },
      { name: "IGBC Green Partner", issuedBy: "Indian Green Building Council", year: 2023 },
    ],
    socialLinks: { website: "https://ecolift.in", linkedin: "https://linkedin.com/company/ecolift-india", instagram: "https://instagram.com/ecoliftindia" },
    services: [
      { serviceName: "Solar-Powered Elevators", category: "Installation", description: "Elevator systems with rooftop solar integration and battery backup" },
      { serviceName: "Energy-Regenerative Lifts", category: "Installation", description: "Traction elevators that feed energy back to the building grid" },
      { serviceName: "Green Building Elevator Consulting", category: "Consulting", description: "Elevator design for IGBC and LEED-certified green buildings" },
    ],
    projects: [
      { title: "Suzlon One Earth Campus", description: "6 solar-powered elevators for green office campus", year: 2024, location: "Pune" },
    ],
    profileViews: 678, averageRating: 4.5, totalReviews: 4,
  },
  {
    fullname: "Kavita Deshmukh", companyName: "HomeRise Lifts", companyType: "Elevator Service Provider",
    email: "hello@homeriselifts.com", location: "Nagpur, Maharashtra",
    contact: "+91 712 456 7890", mobile: "9371234567",
    description: "HomeRise Lifts is dedicated exclusively to residential home elevator solutions. We design, install, and maintain compact lifts for individual homes, villas, duplexes, and senior living facilities across Central India.",
    tagline: "Compact Lifts for Every Indian Home",
    experience: 5, teamSize: "1-10", isApproved: true, isVerified: false,
    liftCategories: ["Home Lifts", "Residential Elevators", "Villa Elevators", "Hydraulic Elevators"],
    serviceCities: ["Nagpur", "Raipur", "Jabalpur", "Bhopal"],
    serviceAreas: ["Central India"],
    certifications: [],
    socialLinks: { website: "https://homeriselifts.com", instagram: "https://instagram.com/homeriselifts" },
    services: [
      { serviceName: "Home Lift Installation", category: "Installation", description: "Compact through-floor lifts for G+1 to G+3 homes" },
      { serviceName: "Villa Elevator Systems", category: "Installation", description: "Hydraulic and screw-drive lifts for luxury villas" },
      { serviceName: "Stairlift Installation", category: "Installation", description: "Motorized chair lifts for elderly and disabled access" },
    ],
    projects: [],
    profileViews: 134, averageRating: 4.0, totalReviews: 2,
  },
  {
    fullname: "Anand Jha", companyName: "MetroLift Engineers", companyType: "Elevator Contractor",
    email: "info@metroliftengineers.com", location: "Bengaluru, Karnataka",
    contact: "+91 80 3456 7890", mobile: "9945678901",
    description: "MetroLift Engineers specializes in escalator and moving walkway installation for metro rail systems, airports, and large commercial complexes. We are an empaneled contractor for multiple Indian metro rail corporations.",
    tagline: "India's Escalator Specialists",
    experience: 14, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["Escalators", "Moving Walkways", "Passenger Elevators"],
    serviceCities: ["Bengaluru", "Chennai", "Hyderabad", "Mumbai", "Delhi"],
    serviceAreas: ["Pan India"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "Bureau Veritas", year: 2021 },
      { name: "EN 115-1:2017", issuedBy: "TÜV SÜD", year: 2022 },
    ],
    socialLinks: { website: "https://metroliftengineers.com", linkedin: "https://linkedin.com/company/metrolift-engineers" },
    services: [
      { serviceName: "Escalator Installation", category: "Installation", description: "Heavy-duty commercial escalators for transit and retail" },
      { serviceName: "Moving Walkway Installation", category: "Installation", description: "Horizontal and inclined moving walkways for airports" },
      { serviceName: "Escalator Modernization", category: "Modernization", description: "Upgrade existing escalators with energy-efficient drives and safety features" },
      { serviceName: "Escalator AMC", category: "Maintenance", description: "Preventive maintenance for escalators and moving walkways" },
    ],
    projects: [
      { title: "Namma Metro Phase 2", description: "28 escalators across 6 stations", year: 2024, location: "Bengaluru" },
      { title: "Kempegowda International Airport T2", description: "12 moving walkways", year: 2023, location: "Bengaluru" },
    ],
    profileViews: 987, averageRating: 4.6, totalReviews: 7,
  },
  {
    fullname: "Manoj Tiwari", companyName: "Bharat Elevator Corporation", companyType: "Elevator Manufacturer",
    email: "info@bharatelevator.co.in", location: "Ahmedabad, Gujarat",
    contact: "+91 79 4567 8901", mobile: "9825012345",
    description: "Bharat Elevator Corporation is a PSU-empaneled elevator manufacturer with a focus on government, defense, and institutional projects. We manufacture elevators complying with CPWD specifications and have supplied lifts to over 200 government buildings.",
    tagline: "Trusted by Government, Built for the Nation",
    experience: 25, teamSize: "100-500", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Freight Elevators", "Hospital Elevators", "Dumbwaiters"],
    serviceCities: ["Ahmedabad", "Delhi", "Mumbai", "Kolkata", "Chennai", "Lucknow"],
    serviceAreas: ["Pan India"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "TÜV India", year: 2020 },
      { name: "BIS IS 14665", issuedBy: "Bureau of Indian Standards", year: 2021 },
      { name: "CPWD Empanelment", issuedBy: "CPWD", year: 2023 },
    ],
    socialLinks: { website: "https://bharatelevator.co.in", linkedin: "https://linkedin.com/company/bharat-elevator" },
    services: [
      { serviceName: "Government Project Elevators", category: "Installation", description: "CPWD-compliant elevators for government offices and PSU buildings" },
      { serviceName: "Defense Establishment Lifts", category: "Installation", description: "Heavy-duty lifts for defense installations and cantonments" },
      { serviceName: "Hospital Dumbwaiters", category: "Installation", description: "Kitchen and laundry dumbwaiters for hospitals" },
      { serviceName: "Comprehensive AMC", category: "Maintenance", description: "Pan-India AMC network with regional service centers" },
    ],
    projects: [
      { title: "Parliament House Annex", description: "4 VIP passenger lifts", year: 2022, location: "New Delhi" },
      { title: "AIIMS Delhi Expansion", description: "8 hospital bed lifts", year: 2024, location: "New Delhi" },
    ],
    profileViews: 1456, averageRating: 4.4, totalReviews: 7,
  },
  {
    fullname: "Nisha Verma", companyName: "SmartLift Automation", companyType: "Elevator Technology Company",
    email: "hello@smartliftauto.in", location: "Pune, Maharashtra",
    contact: "+91 20 5678 9012", mobile: "9823567890",
    description: "SmartLift Automation is an elevator technology startup that develops IoT-enabled elevator controllers, remote monitoring dashboards, and AI-based predictive maintenance solutions. We partner with elevator manufacturers to add smart capabilities to their products.",
    tagline: "Making Every Elevator Smart",
    experience: 4, teamSize: "10-50", isApproved: true, isVerified: true,
    liftCategories: ["MRL Elevators", "Traction Elevators", "Passenger Elevators"],
    serviceCities: ["Pune", "Mumbai", "Bengaluru", "Delhi"],
    serviceAreas: ["Pan India"],
    certifications: [
      { name: "ISO 27001:2022", issuedBy: "BSI", year: 2023 },
      { name: "Startup India Recognition", issuedBy: "DPIIT", year: 2022 },
    ],
    socialLinks: { website: "https://smartliftauto.in", linkedin: "https://linkedin.com/company/smartlift-automation", instagram: "https://instagram.com/smartliftauto" },
    services: [
      { serviceName: "IoT Elevator Controller", category: "Technology", description: "Retrofit IoT controllers for remote monitoring and diagnostics" },
      { serviceName: "Predictive Maintenance AI", category: "Technology", description: "AI algorithms that predict component failures before they happen" },
      { serviceName: "Elevator Cloud Dashboard", category: "Technology", description: "Web-based dashboard for building managers to monitor all elevators" },
    ],
    projects: [
      { title: "Tata Smart City — Pune", description: "IoT retrofit for 40 existing elevators", year: 2024, location: "Pune" },
    ],
    profileViews: 534, averageRating: 4.7, totalReviews: 5,
  },
  // ── 21-35. Additional vendors for marketplace density ────────
  {
    fullname: "Arun Krishnamurthy", companyName: "Kochi Elevator Works", companyType: "Elevator Contractor",
    email: "info@kochielevator.in", location: "Kochi, Kerala",
    contact: "+91 484 234 5678", mobile: "9847012345",
    description: "Kochi Elevator Works serves Kerala's booming real estate sector with quality passenger and home elevator installations. We are Kerala's largest independent elevator installer with over 800 lifts installed across the state.",
    tagline: "Kerala's Trusted Elevator Installer",
    experience: 15, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Home Lifts", "Villa Elevators", "Hydraulic Elevators"],
    serviceCities: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
    serviceAreas: ["Kerala"],
    certifications: [{ name: "ISO 9001:2015", issuedBy: "Bureau Veritas", year: 2022 }],
    socialLinks: { website: "https://kochielevator.in" },
    services: [
      { serviceName: "Residential Elevator Installation", category: "Installation", description: "Passenger lifts for apartment complexes and housing societies" },
      { serviceName: "Home Lift Solutions", category: "Installation", description: "Compact lifts for individual houses and villas" },
      { serviceName: "Elevator AMC", category: "Maintenance", description: "Annual maintenance plans across Kerala" },
    ],
    projects: [
      { title: "Sobha City Thrissur", description: "12 passenger lifts for residential township", year: 2024, location: "Thrissur" },
    ],
    profileViews: 423, averageRating: 4.3, totalReviews: 5,
  },
  {
    fullname: "Harish Menon", companyName: "VelocityLift India", companyType: "Elevator Manufacturer",
    email: "sales@velocitylift.in", location: "Chennai, Tamil Nadu",
    contact: "+91 44 3456 7890", mobile: "9841567890",
    description: "VelocityLift India manufactures high-speed gearless traction elevators for commercial towers, hospitals, and luxury residences. Our elevators are designed for speeds from 1.75 m/s to 4 m/s.",
    tagline: "Speed Meets Safety",
    experience: 11, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["Traction Elevators", "Passenger Elevators", "Hospital Elevators", "Panoramic Glass Elevators"],
    serviceCities: ["Chennai", "Bengaluru", "Hyderabad", "Coimbatore"],
    serviceAreas: ["South India"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "DNV GL", year: 2022 },
      { name: "EN 81-20:2014", issuedBy: "TÜV SÜD", year: 2023 },
    ],
    socialLinks: { website: "https://velocitylift.in", linkedin: "https://linkedin.com/company/velocitylift" },
    services: [
      { serviceName: "High-Speed Elevator Installation", category: "Installation", description: "Gearless traction lifts for buildings above 15 floors" },
      { serviceName: "Hospital Elevator Systems", category: "Installation", description: "Smooth-ride bed elevators for healthcare facilities" },
      { serviceName: "Elevator AMC", category: "Maintenance", description: "Premium maintenance plans with dedicated service engineers" },
    ],
    projects: [
      { title: "DLF IT Park Chennai", description: "20 high-speed passenger lifts", year: 2024, location: "Chennai" },
    ],
    profileViews: 567, averageRating: 4.5, totalReviews: 5,
  },
  {
    fullname: "Anjali Sharma", companyName: "NorthStar Lifts", companyType: "Elevator Service Provider",
    email: "info@northstarlifts.in", location: "Jaipur, Rajasthan",
    contact: "+91 141 456 7890", mobile: "9828901234",
    description: "NorthStar Lifts provides elevator installation and maintenance services across Rajasthan. We specialize in heritage-compatible elevator solutions that blend with Rajasthan's architectural heritage.",
    tagline: "Heritage-Friendly Elevator Solutions",
    experience: 9, teamSize: "10-50", isApproved: true, isVerified: false,
    liftCategories: ["Passenger Elevators", "Home Lifts", "Capsule Elevators"],
    serviceCities: ["Jaipur", "Jodhpur", "Udaipur"],
    serviceAreas: ["Rajasthan"],
    certifications: [{ name: "ISO 9001:2015", issuedBy: "QCI", year: 2023 }],
    socialLinks: { website: "https://northstarlifts.in" },
    services: [
      { serviceName: "Heritage Building Elevators", category: "Installation", description: "Custom elevator designs for heritage hotels and havelis" },
      { serviceName: "Residential Lift Installation", category: "Installation", description: "Standard passenger lifts for residential complexes" },
      { serviceName: "Elevator AMC", category: "Maintenance", description: "Annual maintenance contracts across Rajasthan" },
    ],
    projects: [],
    profileViews: 201, averageRating: 4.1, totalReviews: 3,
  },
  {
    fullname: "Sameer Qureshi", companyName: "Lucknow Lift Systems", companyType: "Elevator Contractor",
    email: "info@lucknowlifts.com", location: "Lucknow, Uttar Pradesh",
    contact: "+91 522 234 5678", mobile: "9839012345",
    description: "Lucknow Lift Systems is UP's leading elevator installation company with a strong presence in Lucknow, Kanpur, and Varanasi. We are a government-empaneled contractor for state government buildings.",
    tagline: "UP's Trusted Elevator Partner",
    experience: 17, teamSize: "50-100", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Freight Elevators", "Hospital Elevators", "MRL Elevators"],
    serviceCities: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj"],
    serviceAreas: ["Uttar Pradesh"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "TÜV India", year: 2022 },
      { name: "BIS IS 14665", issuedBy: "Bureau of Indian Standards", year: 2023 },
    ],
    socialLinks: { website: "https://lucknowlifts.com" },
    services: [
      { serviceName: "Passenger Elevator Installation", category: "Installation", description: "Traction and MRL passenger lifts for commercial and residential" },
      { serviceName: "Hospital Elevator Installation", category: "Installation", description: "Bed elevators for government and private hospitals" },
      { serviceName: "Elevator AMC", category: "Maintenance", description: "Comprehensive AMC across Uttar Pradesh" },
    ],
    projects: [
      { title: "KGMU Hospital Expansion", description: "6 hospital bed elevators", year: 2024, location: "Lucknow" },
    ],
    profileViews: 389, averageRating: 4.2, totalReviews: 4,
  },
  {
    fullname: "Deepak Chauhan", companyName: "Chandigarh Elevator Co", companyType: "Elevator Service Provider",
    email: "info@chandigarhelevator.com", location: "Chandigarh, Punjab",
    contact: "+91 172 234 5678", mobile: "9815012345",
    description: "Chandigarh Elevator Co serves the Tricity region (Chandigarh, Mohali, Panchkula) with quality elevator installation and maintenance. We are the preferred elevator partner for the Chandigarh Housing Board.",
    tagline: "Tricity's Preferred Elevator Company",
    experience: 10, teamSize: "10-50", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Home Lifts", "MRL Elevators"],
    serviceCities: ["Chandigarh", "Mohali", "Panchkula", "Ambala"],
    serviceAreas: ["Chandigarh Tricity", "Punjab", "Haryana"],
    certifications: [{ name: "ISO 9001:2015", issuedBy: "IRQS", year: 2023 }],
    socialLinks: { website: "https://chandigarhelevator.com" },
    services: [
      { serviceName: "Residential Lift Installation", category: "Installation", description: "MRL and traction lifts for residential societies" },
      { serviceName: "Home Lift Solutions", category: "Installation", description: "Compact lifts for independent houses" },
      { serviceName: "Elevator AMC", category: "Maintenance", description: "Maintenance contracts for Tricity region" },
    ],
    projects: [
      { title: "Marbella Grand", description: "8 passenger lifts for luxury residential tower", year: 2024, location: "Mohali" },
    ],
    profileViews: 267, averageRating: 4.3, totalReviews: 3,
  },
  {
    fullname: "Sunita Rao", companyName: "Goa Vertical Solutions", companyType: "Elevator Contractor",
    email: "info@goavertical.com", location: "Panaji, Goa",
    contact: "+91 832 234 5678", mobile: "9850123456",
    description: "Goa Vertical Solutions specializes in compact elevator installations for Goa's boutique hotels, resorts, and luxury villas. We understand Goa's unique building regulations and provide architecturally harmonious elevator solutions.",
    tagline: "Elevating Goa's Hospitality",
    experience: 7, teamSize: "1-10", isApproved: true, isVerified: false,
    liftCategories: ["Home Lifts", "Panoramic Glass Elevators", "Villa Elevators", "Dumbwaiters"],
    serviceCities: ["Panaji", "Margao", "Vasco da Gama"],
    serviceAreas: ["Goa"],
    certifications: [],
    socialLinks: { website: "https://goavertical.com", instagram: "https://instagram.com/goavertical" },
    services: [
      { serviceName: "Hotel Elevator Installation", category: "Installation", description: "Compact lifts for boutique hotels and resorts" },
      { serviceName: "Glass Villa Elevator", category: "Installation", description: "Panoramic glass lifts for luxury villas" },
      { serviceName: "Restaurant Dumbwaiter", category: "Installation", description: "Kitchen service lifts for restaurants and cafes" },
    ],
    projects: [],
    profileViews: 145, averageRating: 4.0, totalReviews: 2,
  },
  {
    fullname: "Ravi Menon", companyName: "KeralaLift Pvt Ltd", companyType: "Elevator Manufacturer",
    email: "info@keralift.co.in", location: "Thiruvananthapuram, Kerala",
    contact: "+91 471 234 5678", mobile: "9846012345",
    description: "KeralaLift is Kerala's only elevator manufacturing company with an NABL-accredited testing lab. We manufacture and install all types of elevators from home lifts to hospital elevators, and our products are exported to the Middle East.",
    tagline: "Made in Kerala, Trusted Worldwide",
    experience: 20, teamSize: "100-500", isApproved: true, isVerified: true,
    liftCategories: ["Passenger Elevators", "Home Lifts", "Hospital Elevators", "Freight Elevators", "MRL Elevators"],
    serviceCities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
    serviceAreas: ["Kerala", "Middle East"],
    certifications: [
      { name: "ISO 9001:2015", issuedBy: "TÜV SÜD", year: 2021 },
      { name: "BIS IS 14665", issuedBy: "Bureau of Indian Standards", year: 2022 },
      { name: "NABL Accreditation", issuedBy: "NABL", year: 2023 },
    ],
    socialLinks: { website: "https://keralift.co.in", linkedin: "https://linkedin.com/company/keralift", facebook: "https://facebook.com/keralift" },
    services: [
      { serviceName: "Elevator Manufacturing", category: "Manufacturing", description: "Complete in-house manufacturing of traction and MRL elevators" },
      { serviceName: "Home Lift Solutions", category: "Installation", description: "Compact through-floor lifts for Kerala's homes" },
      { serviceName: "Hospital Elevator Systems", category: "Installation", description: "Stretcher lifts meeting Indian healthcare standards" },
      { serviceName: "Export Services", category: "Manufacturing", description: "Elevator supply and installation for Gulf countries" },
    ],
    projects: [
      { title: "Lulu Mall Thiruvananthapuram", description: "8 escalators and 6 passenger lifts", year: 2024, location: "Thiruvananthapuram" },
      { title: "Medical College Hospital", description: "4 hospital bed elevators", year: 2023, location: "Kochi" },
    ],
    profileViews: 756, averageRating: 4.6, totalReviews: 7,
  },
  // ── Pending / Unapproved vendors (for admin dashboard demo) ──
  {
    fullname: "Meena Joshi", companyName: "GlobalLift Corporation", companyType: "Elevator Manufacturer",
    email: "meena@globallift.com", location: "Chennai, Tamil Nadu",
    contact: "+91 44 6543 2109", mobile: "6543210987",
    description: "South India's newest elevator manufacturer planning to serve hospitals, airports, and commercial towers.",
    tagline: "Lifting Standards Across South India",
    experience: 2, teamSize: "10-50", isApproved: false, isVerified: false,
    liftCategories: ["Hospital Elevators", "Passenger Elevators"],
    serviceCities: ["Chennai", "Bengaluru"],
    serviceAreas: ["South India"],
    services: [], projects: [], certifications: [],
    socialLinks: {},
    profileViews: 12, averageRating: 0, totalReviews: 0,
  },
  {
    fullname: "Rakesh Gupta", companyName: "NewAge Elevators Delhi", companyType: "Elevator Service Provider",
    email: "rakesh@newageelevators.com", location: "Delhi, NCR",
    contact: "+91 11 9876 5432", mobile: "9811098765",
    description: "Newly established elevator service provider seeking approval to serve the Delhi NCR market with innovative maintenance solutions.",
    tagline: "Next Generation Elevator Services",
    experience: 1, teamSize: "1-10", isApproved: false, isVerified: false,
    liftCategories: ["Passenger Elevators", "MRL Elevators"],
    serviceCities: ["Delhi", "Noida"],
    serviceAreas: ["Delhi NCR"],
    services: [], projects: [], certifications: [],
    socialLinks: {},
    profileViews: 5, averageRating: 0, totalReviews: 0,
  },
];

// Insert vendors with shared fields
const vendorInsert = await db.collection("vendors").insertMany(
  vendorsRaw.map((v) => ({
    ...v,
    password: hash,
    isActive: true,
    totalInquiries: 0,
    totalQuotes: 0,
    savedBy: [],
    businessHours,
    createdAt: daysAgo(randomBetween(30, 365)),
    updatedAt: new Date(),
  }))
);
const vendorIds = Object.values(vendorInsert.insertedIds);
const approvedVendorIds = vendorIds.filter((_, i) => vendorsRaw[i].isApproved);
console.log(`🏢 Vendors: ${vendorIds.length} created (${approvedVendorIds.length} approved, ${vendorIds.length - approvedVendorIds.length} pending)`);

// ═══════════════════════════════════════════════════════════════
//  4. REVIEWS (120+ realistic reviews)
// ═══════════════════════════════════════════════════════════════

const reviewComments = {
  5: [
    "Outstanding service! The installation was completed ahead of schedule and the quality exceeds our expectations. Highly recommended!",
    "Best elevator company we've worked with. Professional team, excellent communication, and flawless execution.",
    "We've been using their AMC service for 3 years — zero breakdowns and always responsive. Top-notch maintenance team.",
    "Exceptional quality and attention to detail. The elevator runs silently and the cabin finish is premium.",
    "Very impressed with their project management. On-time delivery, within budget, and excellent after-sales support.",
    "Our hospital chose them for bed elevators and we couldn't be happier. Smooth ride quality is critical for patients and they delivered perfectly.",
    "World-class elevator installation. Their engineering team is knowledgeable and the safety standards are impeccable.",
    "The best investment we made for our building. Energy-efficient, quiet operation, and great aesthetics.",
  ],
  4: [
    "Very good service overall. Installation was professional and timely. Minor delay in paperwork but the end result is excellent.",
    "Good quality lifts at competitive pricing. AMC team is responsive and professional. Would recommend.",
    "Solid performance from the installation team. The elevator works perfectly and they provided good training to our staff.",
    "Reliable company with good track record. The lift quality is above average and maintenance support is prompt.",
    "Happy with the installation. Communication could be slightly better during the project but the final result is great.",
    "Good value for money. The elevator is well-built and they honored all warranty commitments without any issues.",
    "Professional installation team. The project was completed with minimal disruption to our building operations.",
  ],
  3: [
    "Decent service but there were some delays during installation. The final quality is acceptable but not exceptional.",
    "Average experience. The elevator works fine but the after-sales support could be improved. Response times are a bit slow.",
    "OK service. Nothing outstanding but nothing terrible either. They did the job but there's room for improvement.",
    "The product quality is acceptable but the installation process was a bit chaotic. Better project management needed.",
  ],
};

const reviewTitles = {
  5: ["Excellent Experience!", "Highly Recommended!", "Best in the Industry", "Outstanding Quality", "Five Stars Deserved"],
  4: ["Very Good Service", "Reliable Company", "Good Quality", "Satisfied Customer", "Would Recommend"],
  3: ["Average Experience", "Room for Improvement", "Decent Service", "OK Quality", "Acceptable"],
};

const vendorReplies = [
  "Thank you for your kind review! We're glad you had a great experience with our team.",
  "We appreciate your feedback and are committed to maintaining the highest standards of service.",
  "Thank you for choosing us! We look forward to serving you in the future.",
  "We're grateful for your positive review. Your satisfaction is our top priority.",
  null, null, null, // Some reviews without replies
];

const reviews = [];
for (let vi = 0; vi < approvedVendorIds.length; vi++) {
  const vId = approvedVendorIds[vi];
  const vData = vendorsRaw[vi];
  const numReviews = vData.totalReviews || randomBetween(2, 6);
  const usedUsers = new Set();

  for (let r = 0; r < numReviews && r < userIds.length; r++) {
    const uIdx = (vi + r) % userIds.length;
    if (usedUsers.has(uIdx)) continue;
    usedUsers.add(uIdx);

    const rating = r === 0 ? 5 : r === 1 ? (Math.random() > 0.3 ? 5 : 4) : pick([3, 4, 4, 5, 5, 5], 1)[0];
    const comments = reviewComments[rating];
    const titles = reviewTitles[rating];
    const reply = vendorReplies[randomBetween(0, vendorReplies.length - 1)];

    reviews.push({
      vendorId: vId,
      userId: userIds[uIdx],
      userName: usersData[uIdx].fullName,
      rating,
      title: titles[randomBetween(0, titles.length - 1)],
      comment: comments[randomBetween(0, comments.length - 1)],
      vendorReply: reply ? { text: reply, repliedAt: daysAgo(randomBetween(1, 15)) } : undefined,
      helpfulVotes: Math.random() > 0.5 ? [userIds[(uIdx + 1) % userIds.length]] : [],
      reportedBy: [],
      isApproved: true,
      isHidden: false,
      createdAt: daysAgo(randomBetween(5, 180)),
      updatedAt: new Date(),
    });
  }
}
if (reviews.length > 0) {
  await db.collection("reviews").insertMany(reviews);
}
console.log(`⭐ Reviews: ${reviews.length} created`);

// ═══════════════════════════════════════════════════════════════
//  5. INQUIRIES (80+)
// ═══════════════════════════════════════════════════════════════

const inquiryMessages = [
  "We are looking for elevator installation for our new residential project. Please share your company profile and pricing.",
  "Need a quotation for annual maintenance contract for 4 passenger lifts in our society.",
  "Interested in a home lift for our G+2 residence. What are the dimensions and cost options?",
  "We need a freight elevator for our warehouse. Capacity requirement is 2000kg. Please advise.",
  "Looking for escalator installation for our 3-floor shopping complex. Please send details.",
  "Our existing elevator is 15 years old and needs modernization. Can you help with an upgrade?",
  "Need a hospital bed elevator for our new clinic. Must accommodate stretchers. Please quote.",
  "We are building a 20-floor residential tower and need passenger lift specifications and pricing.",
  "Looking for dumbwaiter installation for our restaurant kitchen. What are the available sizes?",
  "Need emergency repair service for our building's elevator. It has been non-functional for 2 days.",
  "Interested in glass panoramic elevator for our hotel lobby. Please share your portfolio.",
  "We need car elevator installation for our new multi-level parking facility.",
  "Looking for AMC service for 6 elevators in our commercial complex. Please send your plans.",
  "Need elevator installation for a heritage hotel. The solution must match the building's aesthetic.",
  "We want to upgrade our old hydraulic lift to a modern MRL system. Is this possible?",
];

const inquiries = [];
for (let i = 0; i < approvedVendorIds.length; i++) {
  const numInq = randomBetween(2, 4);
  for (let j = 0; j < numInq; j++) {
    const uIdx = (i + j) % userIds.length;
    inquiries.push({
      vendorId: approvedVendorIds[i],
      userName: usersData[uIdx].fullName,
      userEmail: usersData[uIdx].email,
      message: inquiryMessages[(i + j) % inquiryMessages.length],
      isRead: Math.random() > 0.4,
      date: daysAgo(randomBetween(1, 60)),
    });
  }
}
await db.collection("inquiries").insertMany(inquiries);
console.log(`📩 Inquiries: ${inquiries.length} created`);

// ═══════════════════════════════════════════════════════════════
//  6. QUOTES (60+)
// ═══════════════════════════════════════════════════════════════

const liftTypes = ["Passenger Elevator", "Freight Elevator", "Home Lift", "Hospital Elevator", "Escalator", "MRL Elevator", "Hydraulic Lift", "Capsule Elevator", "Dumbwaiter"];
const buildingTypes = ["Residential", "Commercial", "Industrial", "Hospital", "Hotel", "Government"];
const installTypes = ["New Installation", "Modernization", "Renovation", "AMC"];
const budgets = ["₹3-5 Lakhs", "₹5-10 Lakhs", "₹10-25 Lakhs", "₹25-50 Lakhs", "₹50 Lakhs - 1 Crore", "₹1-5 Crores"];
const timelines = ["1 month", "2 months", "3 months", "6 months", "1 year"];
const statuses = ["pending", "viewed", "accepted", "rejected", "info_requested", "contacted", "completed"];
const quoteDescriptions = [
  "We are constructing a new building and need elevator installation. Please provide a detailed quotation with timeline.",
  "Our society needs annual maintenance contract for existing lifts. Looking for comprehensive AMC with 24/7 support.",
  "Need to modernize our old elevator with new controller, doors, and cabin. Building is occupied so minimal disruption needed.",
  "Planning a new hospital wing and need bed elevators with emergency backup. Must meet healthcare standards.",
  "Looking for freight elevator for our factory. Must handle heavy loads and operate 16 hours daily.",
  "Want to install a home lift in our villa. Need compact design that fits in existing stairwell.",
  "Our hotel needs a panoramic glass elevator in the lobby. Must be aesthetically impressive.",
  "Need escalator installation for our new shopping mall. 3 floors with heavy foot traffic.",
  "Looking for dumbwaiter for our restaurant. Need food-grade cabin with smooth operation.",
  "Emergency replacement needed for our building's main elevator. Must be fast-tracked.",
];
const vendorResponses = [
  "Thank you for your inquiry. We would be happy to schedule a site visit to assess your requirements and provide a detailed quotation.",
  "We've reviewed your requirements and can offer a competitive solution. Our team will prepare a detailed proposal within 3 business days.",
  "This is well within our expertise. We suggest scheduling a meeting to discuss specifications and timeline in detail.",
  "We can definitely help with this project. Please share building drawings and we'll prepare a comprehensive quote.",
  null, // No response yet
];

const quotes = [];
for (let i = 0; i < approvedVendorIds.length; i++) {
  const numQuotes = randomBetween(1, 3);
  for (let j = 0; j < numQuotes; j++) {
    const uIdx = (i + j + 2) % userIds.length;
    const status = statuses[randomBetween(0, statuses.length - 1)];
    const responded = ["accepted", "contacted", "completed"].includes(status);
    quotes.push({
      vendorId: approvedVendorIds[i],
      userId: userIds[uIdx],
      userName: usersData[uIdx].fullName,
      userEmail: usersData[uIdx].email,
      userPhone: usersData[uIdx].mobile,
      liftType: liftTypes[randomBetween(0, liftTypes.length - 1)],
      buildingType: buildingTypes[randomBetween(0, buildingTypes.length - 1)],
      floors: randomBetween(2, 30),
      installationType: installTypes[randomBetween(0, installTypes.length - 1)],
      description: quoteDescriptions[(i + j) % quoteDescriptions.length],
      budget: budgets[randomBetween(0, budgets.length - 1)],
      timeline: timelines[randomBetween(0, timelines.length - 1)],
      status,
      vendorResponse: responded ? vendorResponses[randomBetween(0, 3)] : null,
      quotedAmount: responded && Math.random() > 0.4 ? `₹${randomBetween(3, 50)} Lakhs` : null,
      viewedAt: ["viewed", "accepted", "contacted", "completed"].includes(status) ? daysAgo(randomBetween(1, 20)) : null,
      respondedAt: responded ? daysAgo(randomBetween(1, 15)) : null,
      completedAt: status === "completed" ? daysAgo(randomBetween(1, 10)) : null,
      createdAt: daysAgo(randomBetween(5, 90)),
      updatedAt: new Date(),
    });
  }
}
await db.collection("quotes").insertMany(quotes);
console.log(`📋 Quotes: ${quotes.length} created`);

// ═══════════════════════════════════════════════════════════════
//  7. UPDATE VENDOR DENORMALIZED COUNTS
// ═══════════════════════════════════════════════════════════════

for (let i = 0; i < vendorIds.length; i++) {
  const vId = vendorIds[i];
  const revs = reviews.filter((r) => r.vendorId.equals(vId));
  const avgRating = revs.length > 0 ? Math.round((revs.reduce((sum, r) => sum + r.rating, 0) / revs.length) * 10) / 10 : 0;
  const inqCount = inquiries.filter((inq) => inq.vendorId.equals(vId)).length;
  const quoteCount = quotes.filter((q) => q.vendorId.equals(vId)).length;

  await db.collection("vendors").updateOne({ _id: vId }, {
    $set: {
      averageRating: avgRating,
      totalReviews: revs.length,
      totalInquiries: inqCount,
      totalQuotes: quoteCount,
    },
  });
}
console.log("📊 Updated vendor denormalized counts");

// ═══════════════════════════════════════════════════════════════
//  8. NOTIFICATIONS (100+)
// ═══════════════════════════════════════════════════════════════

const notifications = [];

// Vendor notifications (inquiries + quotes)
for (let i = 0; i < Math.min(approvedVendorIds.length, 20); i++) {
  notifications.push({
    recipientId: approvedVendorIds[i], recipientRole: "vendor",
    type: "new_inquiry", title: "New Inquiry Received",
    message: `${usersData[i % userIds.length].fullName} sent you an inquiry about your services.`,
    isRead: Math.random() > 0.5, link: "/vendorDashboard/inquiries",
    createdAt: daysAgo(randomBetween(1, 30)), updatedAt: new Date(),
  });
  notifications.push({
    recipientId: approvedVendorIds[i], recipientRole: "vendor",
    type: "new_quote", title: "New Quote Request",
    message: `${usersData[(i + 1) % userIds.length].fullName} requested a quote for ${liftTypes[i % liftTypes.length]}.`,
    isRead: Math.random() > 0.6, link: "/vendorDashboard/quotes",
    createdAt: daysAgo(randomBetween(1, 30)), updatedAt: new Date(),
  });
  if (Math.random() > 0.5) {
    notifications.push({
      recipientId: approvedVendorIds[i], recipientRole: "vendor",
      type: "new_review", title: "New Review Posted",
      message: `${usersData[(i + 2) % userIds.length].fullName} left a review on your profile.`,
      isRead: Math.random() > 0.4, link: `/vendor/${approvedVendorIds[i]}`,
      createdAt: daysAgo(randomBetween(1, 30)), updatedAt: new Date(),
    });
  }
}

// Vendor approval notifications
for (let i = 0; i < approvedVendorIds.length; i++) {
  if (vendorsRaw[i].isVerified) {
    notifications.push({
      recipientId: approvedVendorIds[i], recipientRole: "vendor",
      type: "vendor_approved", title: "Profile Approved! 🎉",
      message: "Your vendor profile has been approved by admin. Your listing is now live and visible to users.",
      isRead: true, link: "/vendorDashboard",
      createdAt: daysAgo(randomBetween(30, 180)), updatedAt: new Date(),
    });
  }
}

// User notifications (quote updates + welcome)
for (let i = 0; i < userIds.length; i++) {
  notifications.push({
    recipientId: userIds[i], recipientRole: "user",
    type: "welcome", title: "Welcome to LiftLink! 👋",
    message: "Your account has been created. Start exploring India's largest elevator marketplace.",
    isRead: true, link: "/Explore",
    createdAt: daysAgo(randomBetween(30, 120)), updatedAt: new Date(),
  });
  notifications.push({
    recipientId: userIds[i], recipientRole: "user",
    type: "quote_update", title: "Quote Status Updated",
    message: "A vendor has responded to your quote request. Check the details.",
    isRead: Math.random() > 0.5, link: "/userDashboard/quotes",
    createdAt: daysAgo(randomBetween(1, 30)), updatedAt: new Date(),
  });
}

await db.collection("notifications").insertMany(notifications);
console.log(`🔔 Notifications: ${notifications.length} created`);

// ═══════════════════════════════════════════════════════════════
//  9. SAVED VENDORS (link some users to vendors)
// ═══════════════════════════════════════════════════════════════

for (let i = 0; i < userIds.length; i++) {
  const savedCount = randomBetween(2, 6);
  const saved = pick(approvedVendorIds, savedCount);
  await db.collection("users").updateOne({ _id: userIds[i] }, { $set: { savedVendors: saved } });
  // Also update vendor savedBy
  for (const sv of saved) {
    await db.collection("vendors").updateOne({ _id: sv }, { $addToSet: { savedBy: userIds[i] } });
  }
}
console.log("🔖 Saved vendors: linked users to vendors");

// ═══════════════════════════════════════════════════════════════
//  10. TEXT INDEX
// ═══════════════════════════════════════════════════════════════

try {
  await db.collection("vendors").createIndex(
    { companyName: "text", description: "text", location: "text", serviceCities: "text" },
    { name: "vendor_text_search" }
  );
  console.log("📇 Text index created on vendors");
} catch { console.log("   (Text index already exists)"); }

await mongoose.disconnect();

console.log("\n" + "═".repeat(60));
console.log("✅ SEED COMPLETE!");
console.log("═".repeat(60));
console.log(`
📊 Summary:
   Admin:          1
   Users:          ${userIds.length}
   Vendors:        ${vendorIds.length} (${approvedVendorIds.length} approved)
   Reviews:        ${reviews.length}
   Inquiries:      ${inquiries.length}
   Quotes:         ${quotes.length}
   Notifications:  ${notifications.length}

🏙️  Cities: Mumbai, Thane, Pune, Delhi, Gurugram, Bengaluru,
            Hyderabad, Ahmedabad, Surat, Chennai, Jaipur,
            Kolkata, Nashik, Nagpur, Aurangabad, Indore,
            Kochi, Thiruvananthapuram, Lucknow, Chandigarh, Panaji

🔑 Login Credentials (all passwords: Test@1234):
   Admin:     admin@liftlink.com
   Users:     arjun@test.com, sneha@test.com, rahul@test.com,
              priya.n@test.com, vikram@test.com, deepika@test.com,
              amit.g@test.com, kavita@test.com, sunil@test.com,
              meera@test.com
   Vendors:   Use the email shown in each vendor record
              (e.g. info@swiftlift.in, sales@apexelevators.in, etc.)
`);
