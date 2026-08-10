# LiftLink — Architecture Overview

## System Design

LiftLink follows a **client-server architecture** with clear separation between the React SPA frontend and the Node.js REST API backend.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│                   React SPA — Vercel CDN                         │
│                                                                   │
│  ┌──────────────┐  ┌────────────────┐  ┌─────────────────────┐  │
│  │  User Portal │  │  Vendor Portal │  │   Admin Panel       │  │
│  │              │  │                │  │                     │  │
│  │  /login      │  │  /loginvendor  │  │  /admin/login       │  │
│  │  /Explore    │  │  /vendor*      │  │  /admin/*           │  │
│  │  /userDash*  │  │  /vendorDash*  │  │                     │  │
│  └──────┬───────┘  └───────┬────────┘  └──────────┬──────────┘  │
│         │                  │                       │             │
│         └──────────────────┴───────────────────────┘             │
│                            │                                     │
│          Axios Instance (api.js) — Bearer JWT                    │
│          Request Interceptor: auto-attach token                  │
│          Response Interceptor: 401 → clear + redirect            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                        API LAYER                                  │
│                   Node.js + Express — Render                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Security Middleware Stack (in order)                    │    │
│  │  1. Helmet      — Security HTTP headers                  │    │
│  │  2. CORS        — Allow only frontend origin             │    │
│  │  3. Rate Limit  — Auth: 20/15min, API: 300/15min         │    │
│  │  4. MongoSanitize — Strip $ operators from inputs        │    │
│  │  5. express.json — Parse JSON body                       │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Auth Middleware                                          │    │
│  │  protect()     — JWT verify → req.user/vendor/admin      │    │
│  │  authorize()   — role check → 403 if mismatch            │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐   │
│  │  /users  │ │ /vendor  │ │ /admin   │ │ /quotes /reviews  │   │
│  │          │ │          │ │          │ │ /inquiries /notif │   │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Global Error Handler — errorMiddleware.js               │    │
│  │  Structured JSON errors, stack trace in dev only         │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │ Mongoose ODM
┌────────────────────────────▼────────────────────────────────────┐
│                      DATABASE LAYER                               │
│                   MongoDB Atlas / Local                          │
│                                                                   │
│  vendors    users    admins    quotes                            │
│  reviews    inquiries          notifications                     │
│                                                                   │
│  Indexes:                                                         │
│  - vendors: text index (full-text search)                        │
│  - vendors: { isApproved, isActive, averageRating }              │
│  - inquiries: { vendorId, date } compound                        │
│  - notifications: { recipientId, recipientRole }                 │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                              │
│                                                                   │
│  Nodemailer (Gmail SMTP)  Cloudinary (CDN)  MongoDB Atlas        │
│  - Welcome emails         - Vendor logos    - Cloud DB           │
│  - Password reset         - Cover banners   - Auto-backup        │
│  - Inquiry alerts         - Portfolio imgs  - Replica set        │
│  - Quote notifications                                            │
│  sendEmailSafe() wrapper                                          │
│  — never blocks main flow                                         │
└──────────────────────────────────────────────────────────────────┘
```

---

## Request Lifecycle (Example: Quote Submission)

```
[React] QuoteForm.jsx
  → user clicks Submit
  → api.post("/api/quotes", formData)

[Axios] api.js interceptor
  → reads JWT from localStorage
  → adds "Authorization: Bearer <token>" header
  → sends POST to http://localhost:5000/api/quotes

[Express] server.js
  → apiLimiter middleware (rate check)
  → router match: /api/quotes → quoteRoutes.js

[Middleware] protect()
  → extracts Bearer token
  → jwt.verify(token, JWT_SECRET)
  → User.findById(decoded.id)
  → attaches req.user

[Middleware] authorize("user")
  → checks req.userRole === "user"
  → passes (403 if vendor or admin)

[Route Handler] quoteRoutes.js POST /
  → validates: vendorId, liftType, description required
  → Vendor.findById(vendorId) — vendor must exist
  → Quote.create({ vendorId, userId, ...fields, status: "pending" })
  → Vendor.findByIdAndUpdate(vendorId, { $inc: { totalQuotes: 1 } })
  → createNotification({ recipientId: vendorId, type: "new_quote", ... })
  → sendEmailSafe(sendQuoteNotification, { vendorEmail, ... })
    └── [Nodemailer] sends email to vendor (or fails silently)
  → res.status(201).json({ message, quote })

[Axios] response received
[React] toast.success("Quote sent!") + navigate to dashboard
```

---

## Authentication Architecture

```
Three separate authentication contexts:

USER                    VENDOR                   ADMIN
───────────────────     ──────────────────────   ────────────────────
POST /users/login       POST /vendor/auth/login  POST /admin/login
bcrypt.compare()        bcrypt.compare()         bcrypt.compare()
jwt.sign({ id, role:   jwt.sign({ id, role:      jwt.sign({ id, role:
  "user" }, secret,      "vendor" }, secret,       "admin" }, secret,
  "7d")                  "7d")                     "1d")   ← shorter
stored localStorage     stored localStorage       stored localStorage
key: "user"             key: "vendor"             key: "vendor" or "admin"

protect() reads JWT → finds document in matching collection based on role
```

---

## Data Flow Diagram

```
                              ADMIN
                                │
                         Approve/Reject
                                │
                                ▼
USER ──── Browse ──────► VENDOR PROFILES ◄──── VENDOR (edits)
  │        │              (isApproved=true       profile, services,
  │        │               isActive=true)        projects, certs
  │        │
  │        ├──── Send Inquiry ──────────────────► VENDOR Inbox
  │        │                                         │ reads
  │        │                                         ▼
  │        ├──── Request Quote ─────────────────► VENDOR Quotes
  │        │                                         │ responds
  │        │◄── Quote Status Update (notification) ──┘
  │        │
  │        └──── Write Review ──────────────────► VENDOR Reviews
  │                                                   │ can reply
  │◄── Review Reply Notification ─────────────────────┘

NOTIFICATIONS → created on every event, fetched by frontend polling
EMAILS        → sent via Nodemailer after every notification (with safe fallback)
```

---

## Component Architecture (Frontend)

```
App.jsx (Router)
├── Public Routes
│   ├── / → Home.jsx
│   ├── /Explore → Explore.jsx
│   ├── /vendor/:id → VendorPublicProfile.jsx
│   ├── /compare → CompareVendors.jsx
│   ├── /about → About.jsx
│   ├── /contact → Contact.jsx
│   ├── /logsign → LogSign.jsx
│   ├── /login → Login.jsx
│   ├── /loginvendor → LoginVendor.jsx
│   ├── /vendor_login → LoginVendor.jsx (alias)
│   ├── /explore → Explore.jsx (alias, lowercase)
│   ├── /signup → Signup.jsx
│   ├── /vendor_register → Vendor_register.jsx
│   ├── /forgot-password → ForgotPassword.jsx
│   └── /reset-password/:token → ResetPassword.jsx
│
├── Protected: User Routes
│   └── /userDashboard/* → UserDashboard.jsx
│       ├── (index) → Dashboard home
│       ├── /profile → Profile editor
│       ├── /saved → Saved vendors
│       ├── /quotes → Quote history
│       ├── /notifications → Notification feed
│       └── /reviews → My reviews
│
├── Protected: Vendor Routes
│   └── /vendorDashboard/* → VendorDashboard.jsx
│       ├── (index) → Dashboard overview
│       ├── /analytics → Analytics cards
│       ├── /profile → ManageProfile.jsx
│       ├── /services → ManageServices.jsx
│       ├── /inquiries → ManageInquiries.jsx
│       ├── /quotes → Quote management
│       ├── /reviews → Reviews + replies
│       └── /notifications → Notification feed
│
├── Protected: Admin Routes
│   └── /admin/* → AdminDashboard.jsx
│       ├── /login → AdminLogin.jsx
│       ├── (dashboard) → Stats + quick links
│       ├── /vendors → Vendor approval table
│       ├── /users → User management table
│       ├── /reviews → Review moderation
│       ├── /quotes → Quote monitoring
│       └── /inquiries → Inquiry log
│
└── /* → NotFound.jsx
```

---

## Security Layers

| Layer | Mechanism | Protection |
|-------|-----------|-----------|
| Transport | HTTPS (Vercel + Render) | Data in transit |
| Headers | Helmet.js | XSS, clickjacking, MIME sniff |
| Origin | CORS allowlist | Cross-site requests |
| Abuse | Rate limiting | Brute force, DoS |
| Input | mongo-sanitize | NoSQL injection |
| Auth | JWT + bcrypt | Identity verification |
| Authz | RBAC middleware | Privilege escalation |
| Data | select:false on passwords | Data exposure |
| IDOR | ID ownership checks | Horizontal privilege escalation |
| Upload | MIME + extension filter | File upload attacks |
