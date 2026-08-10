/**
 * LiftLink Database Diagnostic & Seed Script
 * 
 * Usage:
 *   node scripts/diagnose.js             — diagnose current connection + data
 *   node scripts/diagnose.js --seed      — seed 3 sample approved vendors
 *   node scripts/diagnose.js --check-uri "mongodb+srv://..." — test a specific URI
 * 
 * Run from: backend/
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const args = process.argv.slice(2);
const shouldSeed = args.includes("--seed");
const customUri = args.includes("--check-uri") ? args[args.indexOf("--check-uri") + 1] : null;

const uri = customUri || process.env.MONGO_URI;

// ─── Simple schemas for diagnosis ───
const VendorSchema = new mongoose.Schema({}, { strict: false });
const Vendor = mongoose.model("Vendor", VendorSchema, "vendors");

async function diagnose() {
  console.log("\n🔍 LiftLink Database Diagnostic\n" + "=".repeat(50));
  console.log(`URI: ${uri?.replace(/:[^@]+@/, ":***@") || "NOT SET"}`);

  if (!uri) {
    console.error("❌ MONGO_URI not set. Add it to backend/.env");
    process.exit(1);
  }

  // Step 1: DNS check
  console.log("\n[1/5] Testing connection...");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log(`✅ Connected to: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);
  } catch (err) {
    console.error(`❌ Connection failed: ${err.message}`);
    console.log("\n💡 To fix:");
    console.log("   1. Open MongoDB Atlas → your cluster → Connect → Drivers");
    console.log("   2. Copy the connection string");
    console.log("   3. Update MONGO_URI in backend/.env");
    console.log("   4. Run: node scripts/diagnose.js");
    process.exit(1);
  }

  // Step 2: List collections
  console.log("\n[2/5] Checking collections...");
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);
  console.log(`   Collections found: ${names.join(", ") || "NONE"}`);

  // Step 3: vendors collection
  console.log("\n[3/5] Checking vendors collection...");
  const totalVendors = await Vendor.countDocuments({});
  const approvedVendors = await Vendor.countDocuments({ isApproved: true });
  const activeVendors = await Vendor.countDocuments({ isApproved: true, isActive: true });
  console.log(`   Total vendors: ${totalVendors}`);
  console.log(`   Approved vendors: ${approvedVendors}`);
  console.log(`   Approved + Active (shows in Explore): ${activeVendors}`);

  // Step 4: Show sample vendors
  if (totalVendors > 0) {
    console.log("\n[4/5] Sample vendors:");
    const samples = await Vendor.find({}).limit(3).select("companyName isApproved isActive email").lean();
    samples.forEach(v => {
      console.log(`   - ${v.companyName} | approved:${v.isApproved} | active:${v.isActive} | ${v.email}`);
    });
  } else {
    console.log("\n[4/5] No vendors found.");
  }

  // Step 5: Test /api/vendor/all equivalent query
  console.log("\n[5/5] Simulating GET /api/vendor/all filter...");
  const exploreResults = await Vendor.find({ isApproved: true, isActive: true })
    .select("companyName location averageRating")
    .limit(5)
    .lean();
  console.log(`   Results for Explore page: ${exploreResults.length} vendor(s)`);
  exploreResults.forEach(v => console.log(`   ✅ ${v.companyName} (${v.location || "no location"})`));

  if (exploreResults.length === 0 && shouldSeed) {
    console.log("\n🌱 --seed flag detected. Seeding sample vendors...");
    await seedVendors();
  } else if (exploreResults.length === 0) {
    console.log("\n💡 No approved+active vendors found.");
    console.log("   Run: node scripts/diagnose.js --seed  to add 3 sample vendors");
  }

  await mongoose.disconnect();
  console.log("\n✅ Diagnostic complete.\n");
}

async function seedVendors() {
  const bcrypt = (await import("bcryptjs")).default;
  const hash = await bcrypt.hash("Vendor@123", 10);

  const sampleVendors = [
    {
      fullname: "Rajesh Kumar",
      companyName: "SwiftLift Solutions",
      companyType: "Elevator Service Provider",
      email: "rajesh@swiftlift.com",
      password: hash,
      location: "Mumbai, Maharashtra",
      contact: "+91 98765 43210",
      description: "Premium elevator installation and maintenance services across Mumbai and Pune.",
      isApproved: true,
      isActive: true,
      isVerified: true,
      experience: 12,
      teamSize: "50-100",
      averageRating: 4.5,
      totalReviews: 38,
      liftCategories: ["Passenger Lifts", "Freight Lifts", "Home Lifts"],
      serviceCities: ["Mumbai", "Pune", "Thane", "Nashik"],
      services: [
        { serviceName: "Elevator Installation", category: "Installation", description: "Full installation service" },
        { serviceName: "Annual Maintenance Contract", category: "Maintenance", description: "AMC packages" },
      ],
    },
    {
      fullname: "Priya Sharma",
      companyName: "Apex Elevators Pvt Ltd",
      companyType: "Elevator Manufacturer",
      email: "priya@apexelevators.com",
      password: hash,
      location: "Delhi, NCR",
      contact: "+91 87654 32109",
      description: "ISO certified elevator manufacturer with 15+ years of excellence in Delhi NCR.",
      isApproved: true,
      isActive: true,
      isVerified: true,
      experience: 15,
      teamSize: "100-500",
      averageRating: 4.8,
      totalReviews: 92,
      liftCategories: ["Passenger Lifts", "Escalators", "Hydraulic Lifts"],
      serviceCities: ["Delhi", "Gurgaon", "Noida", "Faridabad"],
      services: [
        { serviceName: "Escalator Installation", category: "Installation", description: "Commercial escalators" },
        { serviceName: "24/7 Breakdown Support", category: "Maintenance", description: "Emergency repairs" },
      ],
    },
    {
      fullname: "Suresh Patel",
      companyName: "ElevaTech Engineers",
      companyType: "Elevator Contractor",
      email: "suresh@elevatech.com",
      password: hash,
      location: "Nashik, Maharashtra",
      contact: "+91 76543 21098",
      description: "Trusted elevator contractor serving residential and commercial projects across Nashik.",
      isApproved: true,
      isActive: true,
      isVerified: false,
      experience: 8,
      teamSize: "10-50",
      averageRating: 4.2,
      totalReviews: 24,
      liftCategories: ["Home Lifts", "Passenger Lifts"],
      serviceCities: ["Nashik", "Ahmednagar", "Aurangabad"],
      services: [
        { serviceName: "Home Lift Installation", category: "Installation", description: "Residential lifts" },
        { serviceName: "Modernization & Upgrades", category: "Maintenance", description: "Elevator upgrades" },
      ],
    },
  ];

  const inserted = await Vendor.insertMany(sampleVendors);
  console.log(`   ✅ Seeded ${inserted.length} sample vendors:`);
  inserted.forEach(v => console.log(`      - ${v.companyName} (${v.location})`));
}

diagnose().catch(err => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
