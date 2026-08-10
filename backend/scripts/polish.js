/**
 * ═══════════════════════════════════════════════════════════════
 * LiftLink — Marketplace Data Polish Script
 * ═══════════════════════════════════════════════════════════════
 *
 * Improves realism of existing seeded data without changing schema.
 * Run AFTER seed.js has populated the database.
 *
 * Run:  node scripts/polish.js       (from backend/)
 *
 * Improvements:
 *  1. Add company registration numbers
 *  2. Fill missing projects for vendors with empty projects
 *  3. Fill missing certifications
 *  4. Fill missing social links
 *  5. Vary business hours per vendor
 *  6. Improve review distribution (add 2-star reviews, reduce 5-star bias)
 *  7. Add more unique review comments to reduce repetition
 *  8. Spread createdAt dates across 6 months for better admin charts
 *  9. Add varied taglines where weak
 * 10. Recalculate all denormalized vendor counts from actual data
 * ═══════════════════════════════════════════════════════════════
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
console.log("✅ Connected:", mongoose.connection.host, "/", mongoose.connection.name);
const db = mongoose.connection.db;

const randomBetween = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[randomBetween(0, arr.length - 1)];
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

let updatedVendors = 0;
let updatedReviews = 0;
let addedReviews = 0;

// ═══════════════════════════════════════════════════════════════
//  1. VENDOR PROFILE COMPLETENESS
// ═══════════════════════════════════════════════════════════════

console.log("\n📋 Step 1: Enriching vendor profiles...");

const vendors = await db.collection("vendors").find({}).toArray();
const users = await db.collection("users").find({}).toArray();
const userIds = users.map(u => u._id);

// CIN-style registration numbers
const stateCodesMap = {
  "Maharashtra": "MH", "Delhi": "DL", "Karnataka": "KA", "Telangana": "TG",
  "Gujarat": "GJ", "Tamil Nadu": "TN", "West Bengal": "WB", "Rajasthan": "RJ",
  "Madhya Pradesh": "MP", "Uttar Pradesh": "UP", "Punjab": "PB", "Haryana": "HR",
  "Kerala": "KL", "Goa": "GA", "NCR": "DL",
};

// Extra projects for vendors with empty project arrays
const extraProjects = {
  "UrbanLift Pune": [
    { title: "Kumar Pebble Park", description: "AMC for 8 passenger lifts in residential complex", year: 2023, location: "Pune" },
    { title: "Balewadi Housing Society", description: "Modernized 4 hydraulic lifts to MRL systems", year: 2024, location: "Pune" },
  ],
  "HydraLift Solutions": [
    { title: "Satyam Residency", description: "Installed 3 hydraulic lifts for G+5 apartments", year: 2023, location: "Hyderabad" },
    { title: "Gachibowli Clinic Complex", description: "2 oil-hydraulic lifts for medical offices", year: 2024, location: "Hyderabad" },
  ],
  "Marina Lift Works": [
    { title: "Shriram Apartments Tambaram", description: "AMC for 6 lifts across 3 towers", year: 2023, location: "Chennai" },
    { title: "Porur Medical Centre", description: "Emergency replacement of passenger lift controller", year: 2024, location: "Chennai" },
  ],
  "HomeRise Lifts": [
    { title: "Sadar Villa Complex", description: "Installed 4 compact home lifts for luxury villas", year: 2024, location: "Nagpur" },
  ],
  "NorthStar Lifts": [
    { title: "Udaipur Lake Palace Hotel", description: "Heritage-compatible capsule elevator installation", year: 2024, location: "Udaipur" },
  ],
  "Goa Vertical Solutions": [
    { title: "Alila Diwa Goa", description: "Installed panoramic glass lift for boutique resort", year: 2024, location: "Goa" },
    { title: "Café Central Panaji", description: "Dumbwaiter installation for multi-floor restaurant", year: 2023, location: "Panaji" },
  ],
  "Marathwada Elevator Co": [
    { title: "Aurangabad Municipal Building", description: "2 passenger lifts for government office", year: 2023, location: "Aurangabad" },
  ],
};

// Extra certifications for vendors with empty arrays
const extraCerts = {
  "ElevaTech Engineers": [
    { name: "MSME Registration", issuedBy: "Ministry of MSME", year: 2022 },
  ],
  "Marina Lift Works": [
    { name: "MSME Registration", issuedBy: "Ministry of MSME", year: 2023 },
  ],
  "HomeRise Lifts": [
    { name: "Startup India Certificate", issuedBy: "DPIIT", year: 2023 },
  ],
  "Goa Vertical Solutions": [
    { name: "Goa Industrial License", issuedBy: "Goa IDC", year: 2023 },
  ],
};

// Varied business hours
const businessHoursVariants = [
  // Standard 9-6, Sat half day
  [
    { day: "Monday", open: "09:00", close: "18:00", closed: false },
    { day: "Tuesday", open: "09:00", close: "18:00", closed: false },
    { day: "Wednesday", open: "09:00", close: "18:00", closed: false },
    { day: "Thursday", open: "09:00", close: "18:00", closed: false },
    { day: "Friday", open: "09:00", close: "18:00", closed: false },
    { day: "Saturday", open: "10:00", close: "14:00", closed: false },
    { day: "Sunday", open: "00:00", close: "00:00", closed: true },
  ],
  // 9:30-6:30, Sat full
  [
    { day: "Monday", open: "09:30", close: "18:30", closed: false },
    { day: "Tuesday", open: "09:30", close: "18:30", closed: false },
    { day: "Wednesday", open: "09:30", close: "18:30", closed: false },
    { day: "Thursday", open: "09:30", close: "18:30", closed: false },
    { day: "Friday", open: "09:30", close: "18:30", closed: false },
    { day: "Saturday", open: "09:30", close: "17:00", closed: false },
    { day: "Sunday", open: "00:00", close: "00:00", closed: true },
  ],
  // 10-7, Sun open
  [
    { day: "Monday", open: "10:00", close: "19:00", closed: false },
    { day: "Tuesday", open: "10:00", close: "19:00", closed: false },
    { day: "Wednesday", open: "10:00", close: "19:00", closed: false },
    { day: "Thursday", open: "10:00", close: "19:00", closed: false },
    { day: "Friday", open: "10:00", close: "19:00", closed: false },
    { day: "Saturday", open: "10:00", close: "16:00", closed: false },
    { day: "Sunday", open: "10:00", close: "14:00", closed: false },
  ],
  // 8:30-5:30, early bird
  [
    { day: "Monday", open: "08:30", close: "17:30", closed: false },
    { day: "Tuesday", open: "08:30", close: "17:30", closed: false },
    { day: "Wednesday", open: "08:30", close: "17:30", closed: false },
    { day: "Thursday", open: "08:30", close: "17:30", closed: false },
    { day: "Friday", open: "08:30", close: "17:30", closed: false },
    { day: "Saturday", open: "09:00", close: "13:00", closed: false },
    { day: "Sunday", open: "00:00", close: "00:00", closed: true },
  ],
];

for (let i = 0; i < vendors.length; i++) {
  const v = vendors[i];
  const updates = {};
  let changed = false;

  // 1a. Add company registration number if missing
  if (!v.companyRegistrationNumber) {
    const stateKey = Object.keys(stateCodesMap).find(k => v.location?.includes(k));
    const code = stateKey ? stateCodesMap[stateKey] : "MH";
    const year = 2024 - (v.experience || 5);
    updates.companyRegistrationNumber = `U29100${code}${year}PTC${String(100000 + i * 1337).slice(-6)}`;
    changed = true;
  }

  // 1b. Add projects if empty
  if ((!v.projects || v.projects.length === 0) && extraProjects[v.companyName]) {
    updates.projects = extraProjects[v.companyName].map(p => ({
      _id: new mongoose.Types.ObjectId(),
      ...p,
    }));
    changed = true;
  }

  // 1c. Add certifications if empty
  if ((!v.certifications || v.certifications.length === 0) && extraCerts[v.companyName]) {
    updates.certifications = extraCerts[v.companyName];
    changed = true;
  }

  // 1d. Fill missing socialLinks website
  if (v.isApproved && (!v.socialLinks || !v.socialLinks.website)) {
    const slug = v.companyName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    updates.socialLinks = {
      ...(v.socialLinks || {}),
      website: `https://${slug}.com`,
    };
    changed = true;
  }

  // 1e. Vary business hours
  updates.businessHours = businessHoursVariants[i % businessHoursVariants.length];
  changed = true;

  // 1f. Spread createdAt across 6 months for good admin chart distribution
  // Month assignment based on index to ensure good spread
  const monthOffset = i % 6; // 0-5 months ago
  const dayOffset = randomBetween(1, 28); // day within month
  const d = new Date();
  d.setMonth(d.getMonth() - monthOffset);
  d.setDate(dayOffset);
  d.setHours(randomBetween(6, 22), randomBetween(0, 59));
  updates.createdAt = d;

  if (changed) {
    await db.collection("vendors").updateOne({ _id: v._id }, { $set: updates });
    updatedVendors++;
  }
}

console.log(`   ✓ ${updatedVendors} vendor profiles enriched`);

// ═══════════════════════════════════════════════════════════════
//  2. IMPROVE REVIEW DISTRIBUTION
// ═══════════════════════════════════════════════════════════════

console.log("\n⭐ Step 2: Improving review realism...");

// Add more comment variety
const extra2StarComments = [
  "Below expectations. The installation was delayed by 3 weeks and the team was hard to reach during the process.",
  "Not satisfied with the after-sales service. Multiple complaints about noise were not addressed properly.",
  "Poor communication throughout the project. Had to follow up repeatedly for updates and the final quality was mediocre.",
];
const extra2StarTitles = ["Disappointing Experience", "Needs Improvement", "Below Average"];

const extra1StarComments = [
  "Very poor experience. The lift broke down within 2 months of installation and their service team took a week to respond.",
];
const extra1StarTitles = ["Terrible Service"];

// Get current reviews
const allReviews = await db.collection("reviews").find({}).toArray();

// Count rating distribution
const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
allReviews.forEach(r => { ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1; });
console.log("   Current distribution:", ratingDist);

// Randomly downgrade some 5-star reviews to 4 and some 4-star to 3 for more natural distribution
const fiveStarReviews = allReviews.filter(r => r.rating === 5);
const downgradeCount5to4 = Math.floor(fiveStarReviews.length * 0.15); // downgrade ~15%
const shuffled5 = [...fiveStarReviews].sort(() => 0.5 - Math.random());

const fourStarComments = [
  "Very good service overall. Installation was professional and timely. Minor delay in paperwork but the end result is excellent.",
  "Good quality lifts at competitive pricing. AMC team is responsive and professional. Would recommend.",
  "Solid performance from the installation team. The elevator works perfectly and they provided good training to our staff.",
  "Reliable company with good track record. The lift quality is above average and maintenance support is prompt.",
  "Happy with the installation. Communication could be slightly better during the project but the final result is great.",
  "Good value for money. The elevator is well-built and they honored all warranty commitments without any issues.",
  "Professional installation team. The project was completed with minimal disruption to our building operations.",
  "The service was reliable and the team was skilled. Only minor issues with scheduling but overall a positive experience.",
  "Decent elevator quality with responsive support. A few small cosmetic issues were resolved quickly after reporting.",
];
const fourStarTitles = ["Very Good Service", "Reliable Company", "Good Quality", "Satisfied Customer", "Would Recommend", "Solid Performance", "Good Experience"];

for (let i = 0; i < downgradeCount5to4; i++) {
  const rev = shuffled5[i];
  await db.collection("reviews").updateOne({ _id: rev._id }, { $set: {
    rating: 4,
    title: pick(fourStarTitles),
    comment: pick(fourStarComments),
  }});
  updatedReviews++;
}
console.log(`   ✓ Downgraded ${downgradeCount5to4} reviews from 5→4 stars`);

// Downgrade some 4→3
const fourStarReviews = allReviews.filter(r => r.rating === 4);
const downgradeCount4to3 = Math.floor(fourStarReviews.length * 0.12);
const shuffled4 = [...fourStarReviews].sort(() => 0.5 - Math.random());

const threeStarComments = [
  "Decent service but there were some delays during installation. The final quality is acceptable but not exceptional.",
  "Average experience. The elevator works fine but the after-sales support could be improved. Response times are a bit slow.",
  "OK service. Nothing outstanding but nothing terrible either. They did the job but there's room for improvement.",
  "The product quality is acceptable but the installation process was a bit chaotic. Better project management needed.",
  "Mixed experience. The lift itself is good but the installation timeline was not met and communication was lacking.",
  "Service was average. Expected better based on the reviews. The AMC response time needs significant improvement.",
];
const threeStarTitles = ["Average Experience", "Room for Improvement", "Decent Service", "OK Quality", "Acceptable", "Mixed Feelings"];

for (let i = 0; i < downgradeCount4to3; i++) {
  const rev = shuffled4[i];
  await db.collection("reviews").updateOne({ _id: rev._id }, { $set: {
    rating: 3,
    title: pick(threeStarTitles),
    comment: pick(threeStarComments),
  }});
  updatedReviews++;
}
console.log(`   ✓ Downgraded ${downgradeCount4to3} reviews from 4→3 stars`);

// Add a few 2-star reviews for realism (only on vendors with 4+ reviews)
const approvedVendors = vendors.filter(v => v.isApproved);
const vendorReviewCounts = {};
allReviews.forEach(r => {
  const vid = r.vendorId.toString();
  vendorReviewCounts[vid] = (vendorReviewCounts[vid] || 0) + 1;
});

// Find vendors that have enough reviews and available user slots for 2-star reviews
const vendorsForBadReviews = approvedVendors.filter(v =>
  (vendorReviewCounts[v._id.toString()] || 0) >= 4
);

// For up to 8 vendors, try to add a 2-star review
let twoStarAdded = 0;
for (const v of vendorsForBadReviews.slice(0, 8)) {
  // Find a user who hasn't reviewed this vendor
  const existingReviewUserIds = allReviews
    .filter(r => r.vendorId.toString() === v._id.toString())
    .map(r => r.userId.toString());

  const availableUser = users.find(u => !existingReviewUserIds.includes(u._id.toString()));
  if (!availableUser) continue;

  const is2Star = twoStarAdded < 6;
  const rating = is2Star ? 2 : 1;
  const comments = is2Star ? extra2StarComments : extra1StarComments;
  const titles = is2Star ? extra2StarTitles : extra1StarTitles;

  await db.collection("reviews").insertOne({
    vendorId: v._id,
    userId: availableUser._id,
    userName: availableUser.fullName,
    rating,
    title: pick(titles),
    comment: pick(comments),
    helpfulVotes: [],
    reportedBy: [],
    isApproved: true,
    isHidden: false,
    createdAt: daysAgo(randomBetween(20, 120)),
    updatedAt: new Date(),
  });
  addedReviews++;
  twoStarAdded++;
}
console.log(`   ✓ Added ${addedReviews} low-rating reviews (2-star and 1-star)`);

// Diversify existing review comments to reduce repetition
const additionalComments5 = [
  "Absolutely brilliant! From the initial consultation to the final handover, every step was handled with utmost professionalism. The lift quality is superb.",
  "Incredible team, incredible work. Our society had been struggling with an old lift for years and their modernization transformed the entire experience.",
  "We hired them for our new office building and they exceeded every expectation. The elevator is fast, quiet, and looks stunning.",
  "A truly world-class company. Their attention to safety standards is commendable and the after-sales support has been flawless.",
  "Top marks! The project was completed 2 weeks ahead of schedule and the entire team was a pleasure to work with.",
  "We compared 5 companies before choosing them, and we're so glad we did. Best quality and most professional team by far.",
  "Exceptional service from start to finish. Their engineers are highly knowledgeable and explained everything clearly to our team.",
  "The elevator they installed in our hospital has been running perfectly for 18 months. Smooth, quiet, and reliable — exactly what our patients need.",
];

const additionalComments4 = [
  "Really good company to work with. The lift quality is excellent and their AMC team is prompt. One minor concern was resolved quickly.",
  "We're happy with the installation. The team was professional, though we had a small miscommunication about the cabin finish which was sorted out.",
  "Reliable and efficient. The entire project from planning to handover was handled well. Would consider them for our next project.",
  "Good quality elevator and responsive maintenance team. The pricing was fair and transparent. No hidden costs.",
  "Solid work overall. Installation was clean and the elevator functions perfectly. Response time for AMC calls could be slightly faster.",
  "We've been their AMC client for 2 years now and the service is consistently good. Quarterly inspections are thorough.",
  "Professional company with good expertise. The lift they installed has had zero breakdowns in 14 months. Very satisfied.",
];

const additionalTitles5 = [
  "Absolutely Brilliant!", "World-Class Service", "Exceeded Expectations",
  "Couldn't Be Happier", "Premium Quality", "Top-Notch Company",
];
const additionalTitles4 = [
  "Happy Customer", "Great Work", "Impressed Overall",
  "Professional Service", "Solid Choice", "Recommended",
];

// Update some repetitive reviews with fresh unique text
const refreshReviews = await db.collection("reviews").find({}).toArray();
const commentsSeen = new Map();
let deduped = 0;

for (const rev of refreshReviews) {
  const key = rev.comment;
  const count = commentsSeen.get(key) || 0;
  commentsSeen.set(key, count + 1);

  // If this comment has appeared more than twice, replace it
  if (count >= 2) {
    const newData = {};
    if (rev.rating === 5) {
      newData.comment = additionalComments5[deduped % additionalComments5.length];
      newData.title = additionalTitles5[deduped % additionalTitles5.length];
    } else if (rev.rating === 4) {
      newData.comment = additionalComments4[deduped % additionalComments4.length];
      newData.title = additionalTitles4[deduped % additionalTitles4.length];
    } else if (rev.rating === 3) {
      newData.comment = threeStarComments[deduped % threeStarComments.length];
      newData.title = threeStarTitles[deduped % threeStarTitles.length];
    }
    if (newData.comment) {
      await db.collection("reviews").updateOne({ _id: rev._id }, { $set: newData });
      deduped++;
    }
  }
}
console.log(`   ✓ Deduplicated ${deduped} repetitive review comments`);

// ═══════════════════════════════════════════════════════════════
//  3. RECALCULATE ALL VENDOR DENORMALIZED COUNTS
// ═══════════════════════════════════════════════════════════════

console.log("\n📊 Step 3: Recalculating vendor statistics...");

const finalReviews = await db.collection("reviews").find({}).toArray();
const finalInquiries = await db.collection("inquiries").find({}).toArray();
const finalQuotes = await db.collection("quotes").find({}).toArray();

for (const v of vendors) {
  const vReviews = finalReviews.filter(r => r.vendorId.toString() === v._id.toString());
  const avgRating = vReviews.length > 0
    ? Math.round((vReviews.reduce((sum, r) => sum + r.rating, 0) / vReviews.length) * 10) / 10
    : 0;
  const inqCount = finalInquiries.filter(inq => inq.vendorId.toString() === v._id.toString()).length;
  const quoteCount = finalQuotes.filter(q => q.vendorId.toString() === v._id.toString()).length;

  await db.collection("vendors").updateOne({ _id: v._id }, { $set: {
    averageRating: avgRating,
    totalReviews: vReviews.length,
    totalInquiries: inqCount,
    totalQuotes: quoteCount,
  }});
}
console.log("   ✓ All vendor averageRating, totalReviews, totalInquiries, totalQuotes recalculated");

// ═══════════════════════════════════════════════════════════════
//  4. SPREAD INQUIRY/QUOTE DATES FOR DASHBOARD CHARTS
// ═══════════════════════════════════════════════════════════════

console.log("\n📅 Step 4: Spreading dates for realistic charts...");

// Spread inquiries across last 6 months
const allInquiries = await db.collection("inquiries").find({}).toArray();
for (let i = 0; i < allInquiries.length; i++) {
  const monthsAgo = i % 6;
  const dayInMonth = randomBetween(1, 28);
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(dayInMonth);
  d.setHours(randomBetween(8, 20));
  await db.collection("inquiries").updateOne({ _id: allInquiries[i]._id }, { $set: { date: d } });
}
console.log(`   ✓ Spread ${allInquiries.length} inquiries across 6 months`);

// Spread quotes across last 6 months
const allQuotes = await db.collection("quotes").find({}).toArray();
for (let i = 0; i < allQuotes.length; i++) {
  const monthsAgo = i % 6;
  const dayInMonth = randomBetween(1, 28);
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(dayInMonth);
  d.setHours(randomBetween(8, 20));
  const up = { createdAt: d, updatedAt: new Date() };
  // Set viewedAt/respondedAt for non-pending quotes
  const q = allQuotes[i];
  if (["viewed", "accepted", "contacted", "completed"].includes(q.status)) {
    up.viewedAt = new Date(d.getTime() + randomBetween(1, 3) * 86400000);
  }
  if (["accepted", "contacted", "completed"].includes(q.status)) {
    up.respondedAt = new Date(d.getTime() + randomBetween(2, 5) * 86400000);
  }
  if (q.status === "completed") {
    up.completedAt = new Date(d.getTime() + randomBetween(14, 45) * 86400000);
  }
  await db.collection("quotes").updateOne({ _id: q._id }, { $set: up });
}
console.log(`   ✓ Spread ${allQuotes.length} quotes across 6 months`);

// Spread reviews across last 6 months
const allRevsForSpread = await db.collection("reviews").find({}).toArray();
for (let i = 0; i < allRevsForSpread.length; i++) {
  const monthsAgo = i % 6;
  const dayInMonth = randomBetween(1, 28);
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(dayInMonth);
  d.setHours(randomBetween(8, 20));
  await db.collection("reviews").updateOne({ _id: allRevsForSpread[i]._id }, { $set: { createdAt: d, updatedAt: new Date() } });
}
console.log(`   ✓ Spread ${allRevsForSpread.length} reviews across 6 months`);

// Spread notifications
const allNotifs = await db.collection("notifications").find({}).toArray();
for (let i = 0; i < allNotifs.length; i++) {
  const monthsAgo = i % 4;
  const dayInMonth = randomBetween(1, 28);
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  d.setDate(dayInMonth);
  await db.collection("notifications").updateOne({ _id: allNotifs[i]._id }, { $set: { createdAt: d, updatedAt: new Date() } });
}
console.log(`   ✓ Spread ${allNotifs.length} notifications across 4 months`);

// ═══════════════════════════════════════════════════════════════
//  5. FINAL VERIFICATION & REPORT
// ═══════════════════════════════════════════════════════════════

console.log("\n🔍 Step 5: Final verification...");

// Re-count everything
const finalVendors = await db.collection("vendors").find({}).toArray();
const finalRevs = await db.collection("reviews").find({}).toArray();
const finalInqs = await db.collection("inquiries").find({}).toArray();
const finalQts = await db.collection("quotes").find({}).toArray();
const finalNotifs = await db.collection("notifications").find({}).toArray();

// Rating distribution
const newDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
finalRevs.forEach(r => { newDist[r.rating] = (newDist[r.rating] || 0) + 1; });

// Vendor completeness
let vendorsWithProjects = 0, vendorsWithCerts = 0, vendorsWithWebsite = 0, vendorsWithCRN = 0;
finalVendors.forEach(v => {
  if (v.projects?.length > 0) vendorsWithProjects++;
  if (v.certifications?.length > 0) vendorsWithCerts++;
  if (v.socialLinks?.website) vendorsWithWebsite++;
  if (v.companyRegistrationNumber) vendorsWithCRN++;
});

// Unique review comments
const uniqueComments = new Set(finalRevs.map(r => r.comment)).size;

// Check date distribution for admin chart
const monthDist = {};
finalVendors.forEach(v => {
  const m = v.createdAt.getMonth() + 1;
  monthDist[m] = (monthDist[m] || 0) + 1;
});

await mongoose.disconnect();

console.log("\n" + "═".repeat(60));
console.log("✅ MARKETPLACE POLISH COMPLETE!");
console.log("═".repeat(60));
console.log(`
📊 FINAL STATISTICS:
   Vendors:        ${finalVendors.length} (${finalVendors.filter(v => v.isApproved).length} approved)
   Users:          ${users.length}
   Reviews:        ${finalRevs.length}
   Inquiries:      ${finalInqs.length}
   Quotes:         ${finalQts.length}
   Notifications:  ${finalNotifs.length}

⭐ REVIEW DISTRIBUTION (after polish):
   ★★★★★ (5): ${newDist[5]}
   ★★★★☆ (4): ${newDist[4]}
   ★★★☆☆ (3): ${newDist[3]}
   ★★☆☆☆ (2): ${newDist[2]}
   ★☆☆☆☆ (1): ${newDist[1]}
   Total:     ${finalRevs.length}
   Unique comments: ${uniqueComments}

📋 VENDOR PROFILE COMPLETENESS:
   With projects:       ${vendorsWithProjects}/${finalVendors.length}
   With certifications: ${vendorsWithCerts}/${finalVendors.length}
   With website:        ${vendorsWithWebsite}/${finalVendors.length}
   With CRN:            ${vendorsWithCRN}/${finalVendors.length}

📅 VENDOR REGISTRATION SPREAD (by month):
   ${Object.entries(monthDist).map(([m, c]) => `Month ${m}: ${c} vendors`).join("\n   ")}

🔧 CHANGES MADE:
   Vendors enriched:    ${updatedVendors}
   Reviews modified:    ${updatedReviews}
   Reviews added:       ${addedReviews}
   Comments deduped:    ${deduped}
`);
