# LiftLink — Database Schema Reference

All collections are stored in MongoDB. Schemas are defined with Mongoose ODM.

---

## Collections Overview

| Collection | Documents | Purpose |
|------------|-----------|---------|
| `vendors` | Elevator companies | Core business entity |
| `users` | End customers | Platform consumers |
| `admins` | Platform operators | Moderators/superadmins |
| `quotes` | Quote requests | User→Vendor quote pipeline |
| `reviews` | Vendor reviews | Rating and trust system |
| `inquiries` | Direct messages | User→Vendor contact |
| `notifications` | In-app alerts | Event-driven notification feed |
| `services` | Service catalogue | Vendor service definitions |

---

## vendors

The most complex document in the system. Represents an elevator company.

```
Field                 Type              Required  Notes
──────────────────────────────────────────────────────────────────────
_id                   ObjectId          auto
fullname              String            ✅        Owner's full name
companyName           String            ✅        Business name
companyType           String                      "Elevator Service Provider" | "Manufacturer" | "Contractor"
email                 String            ✅        Unique, indexed
password              String            ✅        bcrypt hash, select:false
tagline               String
description           String                      Company overview
logo                  String                      URL
coverBanner           String                      URL

location              String                      "City, State" format
contact               String
mobile                String
serviceCities         [String]                    List of cities served
serviceAreas          [String]                    List of regions served
workingHours          String

experience            Number                      Years in business
teamSize              String                      "10-50" | "50-100" | "100-500"
liftCategories        [String]                    ["Passenger Lifts", "Freight Lifts", ...]

services              [ServiceObject]             Embedded — see below
projects              [ProjectObject]             Embedded — see below
certifications        [CertObject]                Embedded — see below
socialLinks           Object                      { website, linkedin, instagram, ... }

isApproved            Boolean           default:false  Must be set by Admin
isActive              Boolean           default:true
isVerified            Boolean           default:false  Premium badge

averageRating         Number            default:0   Denormalized from reviews
totalReviews          Number            default:0   Denormalized count
totalInquiries        Number            default:0   Denormalized count
totalQuotes           Number            default:0   Denormalized count
profileViews          Number            default:0   Increment on profile visit
savedBy               [ObjectId]                   Users who saved this vendor

createdAt             Date              auto
updatedAt             Date              auto
```

### Embedded: ServiceObject
```
serviceName    String    ✅
category       String       "Installation" | "Maintenance" | "Repair" | "Modernization"
description    String
price          String       Optional display price
```

### Embedded: ProjectObject
```
title          String    ✅
description    String
images         [String]
year           Number
location       String
client         String
```

### Embedded: CertObject
```
name           String    ✅    e.g., "ISO 9001:2015"
issuedBy       String
year           Number
documentUrl    String
```

### Indexes on `vendors`
```javascript
{ email: 1 }                            // unique
{ isApproved: 1, isActive: 1 }          // Explore filter
{ averageRating: -1 }                   // sort by rating
{ companyName: "text", description: "text", location: "text", serviceCities: "text" }
                                         // full-text search
```

---

## users

```
Field                     Type       Required  Notes
────────────────────────────────────────────────────────────
_id                       ObjectId   auto
username                  String     ✅        Unique
fullName                  String     ✅
email                     String     ✅        Unique
password                  String     ✅        bcrypt, select:false
mobile                    String
profilePicture            String     URL

savedVendors              [ObjectId] ref:Vendor

resetPasswordToken        String
resetPasswordExpires      Date

createdAt                 Date       auto
updatedAt                 Date       auto
```

---

## admins

```
Field          Type       Required  Notes
─────────────────────────────────────────────────────────────
_id            ObjectId   auto
name           String     ✅
email          String     ✅        Unique
password       String     ✅        bcrypt via pre-save hook
role           String              "superadmin" | "moderator"
isActive       Boolean             default: true
lastLogin      Date                Updated on each login
createdAt      Date       auto
updatedAt      Date       auto
```

> ⚠️ Admin must be created via `POST /api/admin/seed` (not raw DB insert) to ensure the pre-save password hashing hook runs correctly.

---

## quotes

```
Field              Type       Required  Notes
────────────────────────────────────────────────────────────────
_id                ObjectId   auto
vendorId           ObjectId   ✅        ref: Vendor
userId             ObjectId   ✅        ref: User

userName           String     ✅        Denormalized
userEmail          String     ✅        Denormalized
userPhone          String

liftType           String     ✅        "Passenger Lift" | "Freight Lift" | ...
buildingType       String               "Residential" | "Commercial" | "Industrial"
floors             Number
installationType   String
description        String     ✅        Free-text requirements
budget             String               "Under 5 Lakhs" | "5-10 Lakhs" | ...
timeline           String

status             String               pending → viewed → accepted | rejected → completed
vendorResponse     String               Vendor's text reply
vendorNote         String               Internal vendor note
quotedAmount       String               Vendor's price estimate

respondedAt        Date
completedAt        Date
createdAt          Date       auto
updatedAt          Date       auto
```

### Quote Status FSM
```
                    ┌─── rejected
pending → viewed ───┤
                    └─── accepted → contacted → completed
                         info_requested ────────┘
user → cancelled (from pending or viewed)
```

---

## reviews

```
Field              Type       Required  Notes
────────────────────────────────────────────────────────────────
_id                ObjectId   auto
vendorId           ObjectId   ✅        ref: Vendor, indexed
userId             ObjectId   ✅        ref: User

userName           String     ✅        Denormalized
rating             Number     ✅        1–5 integer
title              String
comment            String     ✅

vendorReply        String               Public vendor response
vendorRepliedAt    Date

helpfulVotes       [ObjectId]           User IDs who voted helpful
isHidden           Boolean              Admin moderation
isReported         Boolean
reportReason       String

createdAt          Date       auto
updatedAt          Date       auto
```

**Business rule:** One review per `(userId, vendorId)` pair — enforced in route logic.

---

## inquiries

```
Field       Type       Required  Notes
──────────────────────────────────────────────────────────
_id         ObjectId   auto
vendorId    ObjectId   ✅        ref: Vendor
userName    String     ✅
userEmail   String     ✅
message     String     ✅
isRead      Boolean              default: false
date        Date                 Set at submission time
createdAt   Date       auto
```

**Compound index:** `{ vendorId: 1, date: -1 }` — vendor inbox sorted by date.

---

## notifications

```
Field           Type       Required  Notes
──────────────────────────────────────────────────────────────
_id             ObjectId   auto
recipientId     ObjectId   ✅        userId or vendorId
recipientRole   String     ✅        "user" | "vendor" | "admin"

type            String     ✅        See types below
title           String     ✅
message         String     ✅
link            String               Deep link e.g. "/vendorDashboard/quotes"

isRead          Boolean              default: false

refId           ObjectId             Related document (polymorphic)
refModel        String               "Quote" | "Inquiry" | "Review"

createdAt       Date       auto
updatedAt       Date       auto
```

**Notification types:**
```
new_inquiry        vendor     User sent an inquiry
new_quote          vendor     User submitted a quote request
quote_update       user       Vendor updated quote status
new_review         vendor     User left a review
vendor_approved    vendor     Admin approved the vendor
vendor_rejected    vendor     Admin rejected the vendor
```

**Compound index:** `{ recipientId: 1, recipientRole: 1, createdAt: -1 }`

---

## Entity Relationship Diagram

```
users ──────────────────────────────────────────── vendors
  │ saves many                              is reviewed by │
  │ sends many inquiries                    receives many  │
  │ submits many quotes                     quotes         │
  │                                                        │
  ▼                                                        ▼
inquiries                quotes                        reviews
  └─► vendorId           ├─► vendorId                  └─► vendorId
                         └─► userId                    └─► userId

admins ──── moderates ──── vendors (isApproved)
       │                              └─► users (isActive)
       └─── moderates ──── reviews (isHidden)

notifications ──► recipientId (userId or vendorId)
               └─► refId (quoteId | inquiryId | reviewId)
```
