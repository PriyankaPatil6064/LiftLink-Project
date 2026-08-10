<div align="center">

# 🛗 LiftLink

### The Professional SaaS Platform Connecting Clients with Elevator Companies

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com)

*Find, compare, and connect with certified elevator installation companies across India.*

[Live Demo](#) · [API Docs](#rest-api-reference) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Seeding](#database-seeding)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🏗️ About the Project

LiftLink is a **production-grade MERN SaaS platform** that solves the discovery and vetting problem in the elevator industry. Businesses looking to install, maintain, or upgrade elevators can browse verified vendor profiles, compare companies, send inquiries, request detailed quotes, and leave reviews — all in one place.

Elevator companies (vendors) get a professional business profile, a management dashboard, and a streamlined workflow for handling incoming quote requests and inquiries.

Administrators manage the entire ecosystem: approving vendors, moderating reviews, monitoring platform activity, and ensuring data quality.

### Why LiftLink?

- 🔍 **Centralised Discovery** — Search vendors by city, lift category, experience, and rating
- 🏆 **Verified Profiles** — Admin-approved vendor pages with portfolios, certifications, and team info
- 📊 **Analytics** — Vendors track profile views, inquiry trends, and quote conversion
- 🔔 **Real-time Notifications** — In-app alerts for every significant event
- 📧 **Email Automation** — Welcome emails, inquiry alerts, quote updates, password resets
- 🛡️ **Enterprise Security** — Helmet, CORS, rate limiting, JWT, mongo-sanitize, RBAC

---

## ✨ Key Features

### 👤 User Portal
| Feature | Description |
|---------|-------------|
| Registration & Login | JWT authentication, password hashing with bcrypt |
| Forgot / Reset Password | Token-based email reset (1-hour expiry) |
| Vendor Discovery | Full-text search, filters (city, lift type, rating, experience) |
| Vendor Profiles | Detailed pages with gallery, projects, certifications, hours |
| Save Vendors | Bookmark favourite companies for later |
| Compare Vendors | Side-by-side comparison of up to 3 vendors |
| Send Inquiry | Direct inquiry to any approved vendor |
| Request Quote | Structured quote request with lift type, floors, budget, timeline |
| Quote Tracking | Track status: pending → viewed → accepted → completed |
| Reviews & Ratings | Submit, view, and vote "helpful" on vendor reviews |
| Notifications | In-app feed for quote updates, approval events |

### 🏢 Vendor Portal
| Feature | Description |
|---------|-------------|
| Company Registration | Extended profile with logo, cover banner, certifications |
| Professional Dashboard | Analytics cards, recent activity, quick stats |
| Analytics | Profile views, inquiry count, quote trends, rating summary |
| Profile Management | Logo, cover, tagline, team size, experience, social links |
| Portfolio | Add/remove project images with title, year, location |
| Service Catalogue | List services with category and description |
| Inquiry Management | View and reply to customer inquiries via email |
| Quote Management | Accept, reject, respond, provide quoted amount |
| Notification Centre | Alerts for new inquiries, quotes, reviews |

### 🔧 Admin Panel
| Feature | Description |
|---------|-------------|
| Secure Admin Login | Separate JWT context, role-guarded middleware |
| Platform Stats | Live counts for vendors, users, quotes, reviews, inquiries |
| Vendor Approval | Approve/reject pending vendors with email notification |
| User Management | View all users, deactivate accounts |
| Review Moderation | Show/hide reported reviews |
| Quote Monitoring | Full cross-vendor view of all quotes with status |
| Inquiry Monitoring | Platform-wide inquiry log |
| Search & Pagination | Paginated tables across all entities |

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| React Router DOM | v6 | Client-side routing |
| Axios | latest | HTTP client with interceptors |
| Bootstrap | 5 | Responsive layout, utility classes |
| React Toastify | latest | Toast notification UI |
| React Icons | latest | Icon library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express | 4.x | HTTP server framework |
| Mongoose | 8.x | MongoDB ODM |
| bcryptjs | 3.x | Password hashing |
| jsonwebtoken | 9.x | JWT authentication |
| Nodemailer | 9.x | Email delivery |
| Multer | 1.x | File upload handling |
| Helmet | 8.x | Security HTTP headers |
| express-rate-limit | 7.x | Rate limiting |
| express-mongo-sanitize | 2.x | NoSQL injection prevention |
| cors | 2.x | Cross-origin resource sharing |

### Database & Infrastructure
| Technology | Purpose |
|-----------|---------|
| MongoDB Atlas | Cloud database (production) |
| MongoDB Local | Development database |
| Vercel | Frontend hosting + SPA rewrite |
| Render | Backend API hosting |
| Cloudinary | Image storage (production) |

---

## 📁 Project Structure

```
liftlink/
├── backend/                        # Express API server
│   ├── config/
│   │   └── db.js                   # MongoDB connection with retry logic
│   ├── middleware/
│   │   ├── authMiddleware.js        # protect() + authorize() for RBAC
│   │   └── errorMiddleware.js       # Global error handler
│   ├── models/
│   │   ├── Admin.js                 # Admin schema + matchPassword()
│   │   ├── Inquiry.js               # Inquiry schema + compound indexes
│   │   ├── Notification.js          # In-app notification schema
│   │   ├── Quote.js                 # Quote request lifecycle schema
│   │   ├── Review.js                # Vendor review + helpful votes
│   │   ├── Service.js               # Embedded service schema
│   │   ├── User.js                  # User schema + pre-save hook
│   │   └── Vendor.js                # Rich vendor schema + methods
│   ├── routes/
│   │   ├── adminRoutes.js           # /api/admin/* (login, CRUD, stats)
│   │   ├── inquiryRoutes.js         # /api/inquiries/* (send, view, delete)
│   │   ├── notificationRoutes.js    # /api/notifications/* (CRUD, mark-read)
│   │   ├── quoteRoutes.js           # /api/quotes/* (submit, status, cancel)
│   │   ├── reviewRoutes.js          # /api/reviews/* (CRUD, helpful, reply)
│   │   ├── serviceRoutes.js         # /api/services/* (vendor services)
│   │   ├── userRoutes.js            # /api/users/* (auth, profile, saved)
│   │   ├── vendorAuthRoutes.js      # /api/vendor/auth/* (register, login)
│   │   └── vendorRoutes.js          # /api/vendor/* (profile, search, analytics)
│   ├── scripts/
│   │   ├── diagnose.js              # DB diagnostic + connection test
│   │   └── seed.js                  # Full data seeder for demo/testing
│   ├── utils/
│   │   ├── emailService.js          # Nodemailer templates (welcome, reset, etc.)
│   │   └── notificationHelper.js    # createNotification() helper
│   ├── .env                         # Environment variables (not committed)
│   ├── .env.example                 # Template for required variables
│   ├── render.yaml                  # Render deployment config
│   └── server.js                    # Express app entry point
│
├── client/                         # React SPA
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx   # Full admin panel (nested routes)
│   │   │   │   └── AdminLogin.jsx       # Admin-specific login page
│   │   │   ├── About.jsx
│   │   │   ├── CompareVendors.jsx       # Side-by-side vendor comparison
│   │   │   ├── Contact.jsx
│   │   │   ├── CTASection.jsx
│   │   │   ├── Explore.jsx              # Vendor search + filter + inquiry
│   │   │   ├── Footer.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── LogSign.jsx              # Role-choice gate (user/vendor)
│   │   │   ├── Login.jsx                # User login
│   │   │   ├── LoginVendor.jsx          # Vendor login
│   │   │   ├── ManageInquiries.jsx      # Vendor: inbox management
│   │   │   ├── ManageProfile.jsx        # Vendor: profile editor
│   │   │   ├── ManageServices.jsx       # Vendor: service catalogue
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotFound.jsx             # 404 page
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Signup.jsx               # User registration
│   │   │   ├── UserDashboard.jsx        # User portal (nested routes)
│   │   │   ├── VendorDashboard.jsx      # Vendor portal (nested routes)
│   │   │   ├── VendorPublicProfile.jsx  # Public vendor detail page
│   │   │   └── Vendor_register.jsx      # Vendor registration
│   │   ├── App.jsx                      # Router config + lazy loading
│   │   ├── App.css                      # Global styles
│   │   ├── AuthContext.jsx              # Auth state (React Context)
│   │   ├── api.js                       # Axios instance + interceptors
│   │   └── index.js                     # React entry point
│   ├── .env                             # REACT_APP_API_URL
│   ├── .env.example
│   └── vercel.json                      # Vercel SPA rewrite + security headers
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas account
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/liftlink.git
cd liftlink
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values (see Environment Variables section)
npm run dev
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Set REACT_APP_API_URL=http://localhost:5000
npm start
```

Frontend runs at: `http://localhost:3000`

### 4. Seed Demo Data

```bash
# From backend/ directory (with server running)
node scripts/seed.js
```

This creates:
- 1 Admin account
- 2 User accounts
- 4 Vendor accounts (3 approved, 1 pending)
- Sample reviews, inquiries, quotes, notifications

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/liftlink

# Server
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your-64-char-random-secret-here

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# App URL (for email links)
CLIENT_URL=http://localhost:3000

# Email (Gmail with App Password)
EMAIL_FROM=your@gmail.com
EMAIL_PASSWORD=your-app-password

# Cloudinary (for production image uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (`client/.env`)

```env
REACT_APP_API_URL=http://localhost:5000
```

---

## 🌱 Database Seeding

```bash
# Diagnose connection and current data
node scripts/diagnose.js

# Seed full demo dataset
node scripts/seed.js

# Test a specific Atlas URI
node scripts/diagnose.js --check-uri "mongodb+srv://..."
```

**Demo Credentials (after seeding):**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@liftlink.com | Test@1234 |
| User | arjun@test.com | Test@1234 |
| User | sneha@test.com | Test@1234 |
| Vendor (Approved) | rajesh@swiftlift.com | Test@1234 |
| Vendor (Approved) | priya@apexelevators.com | Test@1234 |
| Vendor (Pending) | meena@globallift.com | Test@1234 |

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api`

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/signup` | ❌ | Register new user |
| POST | `/users/login` | ❌ | User login → JWT |
| POST | `/users/forgot-password` | ❌ | Send reset email |
| POST | `/users/reset-password/:token` | ❌ | Reset with token |
| POST | `/vendor/auth/register` | ❌ | Register vendor |
| POST | `/vendor/auth/login` | ❌ | Vendor login → JWT |
| POST | `/admin/login` | ❌ | Admin login → JWT |

### Vendors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/vendor/all` | ❌ | Search + filter vendors |
| GET | `/vendor/:id` | ❌ | Vendor public profile |
| GET | `/vendor/dashboard/analytics` | Vendor | Analytics data |
| GET | `/vendor/profile/:id` | Vendor | Own profile |
| PUT | `/vendor/profile` | Vendor | Update profile |
| POST | `/vendor/upload-logo` | Vendor | Upload logo |
| POST | `/vendor/upload-banner` | Vendor | Upload cover |
| POST | `/vendor/projects` | Vendor | Add project |
| DELETE | `/vendor/projects/:pid` | Vendor | Remove project |

### Quotes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/quotes` | User | Submit quote request |
| GET | `/quotes/user` | User | My quotes |
| GET | `/quotes/vendor` | Vendor | Incoming quotes |
| PATCH | `/quotes/:id/status` | Vendor | Update status |
| PATCH | `/quotes/:id/cancel` | User | Cancel quote |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reviews` | User | Submit review |
| GET | `/reviews/:vendorId` | ❌ | Get vendor reviews |
| PATCH | `/reviews/:id/helpful` | User | Vote helpful |
| POST | `/reviews/:id/reply` | Vendor | Reply to review |

### Inquiries
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/inquiries/send` | User | Send inquiry |
| GET | `/inquiries/:vendorId` | Vendor | View inquiries |
| DELETE | `/inquiries/:id` | Vendor | Delete inquiry |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Any | Get notifications |
| PATCH | `/notifications/:id/read` | Any | Mark as read |
| PATCH | `/notifications/mark-all-read` | Any | Mark all read |
| DELETE | `/notifications/:id` | Any | Delete one |
| DELETE | `/notifications` | Any | Clear all |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/stats` | Admin | Platform statistics |
| GET | `/admin/vendors` | Admin | All vendors + filters |
| PATCH | `/admin/vendors/:id/approve` | Admin | Approve vendor |
| PATCH | `/admin/vendors/:id/reject` | Admin | Reject vendor |
| DELETE | `/admin/vendors/:id` | Admin | Delete vendor |
| GET | `/admin/users` | Admin | All users |
| DELETE | `/admin/users/:id` | Admin | Delete user |
| GET | `/admin/reviews` | Admin | All reviews |
| PATCH | `/admin/reviews/:id/hide` | Admin | Hide review |
| GET | `/admin/quotes` | Admin | All quotes |
| GET | `/admin/inquiries` | Admin | All inquiries |

---

## 👥 User Roles

```
GUEST  → Browse home, about, contact, public vendor profiles
USER   → + Register/Login, save vendors, send inquiries, request quotes, review vendors
VENDOR → + Vendor dashboard, manage profile/services/projects, respond to inquiries and quotes
ADMIN  → + Approve vendors, moderate reviews, monitor all platform activity
```

---

## 🚀 Deployment

### Backend → Render

1. Connect GitHub repo to Render
2. Set **Root Directory** to `backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add all environment variables from `.env.example`
6. Deploy — `render.yaml` is already configured

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Set **Root Directory** to `client`
3. Add environment variable: `REACT_APP_API_URL=https://your-backend.onrender.com`
4. Deploy — `vercel.json` handles SPA routing and security headers automatically

### Post-Deployment
```bash
# Create admin account (first deploy only)
POST https://your-backend.onrender.com/api/admin/seed
{ "name": "Admin", "email": "admin@liftlink.com", "password": "SecurePass@123" }
```

---

## 🔒 Security Features

- **Helmet.js** — Secure HTTP headers (XSS, CSRF, clickjacking protection)
- **CORS** — Strict origin allowlist
- **Rate Limiting** — Auth endpoints: 20 req/15min; API: 300 req/15min
- **mongo-sanitize** — Prevents NoSQL injection
- **bcryptjs** — Salted password hashing (10 rounds)
- **JWT** — Stateless auth, 7-day expiry for users, 1-day for admins
- **RBAC** — `protect()` + `authorize(role)` middleware on every route
- **Input Validation** — Required fields, ObjectId validation, file type/size limits

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ for the elevator industry | <a href="#">Live Demo</a> | <a href="#">Documentation</a>
</div>
