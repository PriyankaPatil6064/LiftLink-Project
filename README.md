<div align="center">

# 🛗 LiftLink

### Professional Elevator Marketplace Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens)](https://jwt.io)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://render.com)

*A full-stack MERN SaaS platform connecting customers with verified elevator installation companies.*

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [API Overview](#api-overview)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security](#security)
- [Future Enhancements](#future-enhancements)

---

## 🏗️ Overview

**LiftLink** is a production-grade marketplace platform that solves the discovery and vetting problem in the elevator industry. It enables:

- **Customers** to search, compare, and connect with verified elevator companies — submit inquiries, request detailed quotes, and leave reviews.
- **Elevator companies** to build professional profiles, showcase their work, and manage incoming business through a streamlined dashboard.
- **Administrators** to govern the ecosystem — approving vendors, moderating content, and monitoring platform health.

### Why LiftLink?

| Problem | LiftLink Solution |
|---------|-------------------|
| Fragmented vendor discovery | Centralised, searchable marketplace with filters |
| No standardised vendor vetting | Admin-approved profiles with certifications and portfolios |
| Manual quote management | Structured quotation workflow with status tracking |
| No review transparency | Verified user reviews with ratings and helpfulness votes |
| Communication gaps | In-app notifications + automated email alerts |

---

## ✨ Key Features

### 👤 User Portal
- **Authentication** — Registration, login, password reset via email
- **Vendor Discovery** — Search by city, lift type, rating, experience
- **Vendor Profiles** — Detailed pages with gallery, projects, certifications
- **Save & Compare** — Bookmark vendors and compare up to 3 side-by-side
- **Inquiries** — Send direct inquiries to approved vendors
- **Quotations** — Submit structured quote requests; track status through pending → viewed → accepted → completed
- **Reviews & Ratings** — Rate vendors, vote reviews as helpful
- **Notifications** — Real-time in-app alerts for all key events
- **Profile Management** — Edit personal details and change password

### 🏢 Vendor Portal
- **Company Registration** — Extended business profile with logo, banner, and certifications
- **Analytics Dashboard** — Profile views, inquiry count, quote trends, rating summary
- **Profile Management** — Logo, cover image, tagline, team size, experience, social links
- **Portfolio** — Showcase completed projects with images, title, year, and location
- **Service Catalogue** — Manage listed services with categories and descriptions
- **Inquiry Management** — View and respond to customer inquiries
- **Quote Management** — Accept, reject, or respond to quote requests with pricing
- **Notification Centre** — Alerts for new inquiries, quotes, and reviews

### 🔧 Admin Panel
- **Secure Admin Authentication** — Separate JWT context with role-guarded middleware
- **Platform Dashboard** — Live statistics across vendors, users, quotes, reviews, and inquiries
- **Vendor Approval Workflow** — Approve or reject pending vendors with automated email notifications
- **User Management** — View, search, and manage all registered users
- **Review Moderation** — Show or hide reported reviews
- **Quote & Inquiry Monitoring** — Full cross-vendor view of all platform activity
- **Search & Pagination** — Paginated, searchable tables across all entities

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework with hooks and lazy loading |
| React Router v6 | Client-side routing with protected routes |
| Axios | HTTP client with request/response interceptors |
| Bootstrap 5 | Responsive layout and utility classes |
| React Toastify | Toast notification system |
| React Icons | Iconography |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js | Server runtime |
| Express.js | RESTful API framework |
| MongoDB + Mongoose | NoSQL database with ODM |
| JSON Web Tokens | Stateless authentication |
| bcryptjs | Salted password hashing |
| Nodemailer | Transactional email delivery |
| Multer | File upload handling |
| Helmet | Security HTTP headers |
| express-rate-limit | API rate limiting |
| express-mongo-sanitize | NoSQL injection prevention |

### Infrastructure
| Service | Role |
|---------|------|
| MongoDB Atlas | Cloud database |
| Vercel | Frontend hosting with SPA routing |
| Render | Backend API hosting |
| Cloudinary | Cloud image storage |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  React Frontend                  │
│        (Vercel — SPA with lazy loading)          │
└───────────────────────┬─────────────────────────┘
                        │ REST API (Axios)
                        ▼
┌─────────────────────────────────────────────────┐
│               Express.js Backend                 │
│             (Render — Node.js API)               │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │   JWT    │  │  RBAC    │  │ Rate Limiting │  │
│  │   Auth   │  │Middleware│  │   + Helmet    │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└──────┬──────────────┬──────────────┬────────────┘
       │              │              │
       ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│  MongoDB   │ │ Nodemailer │ │ Cloudinary │
│   Atlas    │ │   (SMTP)   │ │  (Images)  │
└────────────┘ └────────────┘ └────────────┘
```

**User Roles & Access Control:**
```
GUEST  → Browse home, about, contact, public vendor profiles
USER   → + Save vendors, send inquiries, request quotes, write reviews
VENDOR → + Dashboard, manage profile/services/projects, respond to business
ADMIN  → + Approve vendors, moderate reviews, monitor all platform activity
```

---

## 📁 Project Structure

```
liftlink/
├── backend/                     # Express API server
│   ├── config/                  # Database connection with retry logic
│   ├── middleware/              # Auth (JWT + RBAC) and error handling
│   ├── models/                  # Mongoose schemas (User, Vendor, Admin,
│   │                            #   Inquiry, Quote, Review, Notification)
│   ├── routes/                  # RESTful route handlers
│   ├── scripts/                 # Database utilities
│   ├── utils/                   # Email service, notification helpers
│   ├── .env.example             # Environment variable template
│   ├── render.yaml              # Render deployment configuration
│   └── server.js                # Application entry point
│
├── client/                      # React SPA
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Page and UI components
│   │   │   ├── admin/           # Admin dashboard and login
│   │   │   ├── Explore.jsx      # Vendor search + filters
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── VendorDashboard.jsx
│   │   │   ├── VendorPublicProfile.jsx
│   │   │   ├── CompareVendors.jsx
│   │   │   └── ...              # 20+ components
│   │   ├── AuthContext.jsx      # Authentication state (React Context)
│   │   ├── api.js               # Axios instance + interceptors
│   │   ├── App.jsx              # Router config + lazy loading
│   │   └── index.js             # Entry point
│   ├── .env.example             # Frontend environment template
│   └── vercel.json              # Vercel SPA routing + security headers
│
├── docs/                        # Technical documentation
│   ├── API_REFERENCE.md         # Complete REST API reference
│   ├── ARCHITECTURE.md          # System architecture deep-dive
│   ├── DATABASE_SCHEMA.md       # MongoDB schema documentation
│   └── DEPLOYMENT.md            # Deployment guide
│
├── assets/                      # Application screenshots
└── README.md
```

---

## 📸 Screenshots

<div align="center">

| Home Page | Vendor Marketplace |
|:---------:|:------------------:|
| ![Home](assets/Screenshot%202025-04-24%20210826.png) | ![Explore](assets/Screenshot%202025-04-24%20210852.png) |

| Vendor Profile | Vendor Dashboard |
|:--------------:|:----------------:|
| ![Profile](assets/Screenshot%202025-04-24%20210929.png) | ![Dashboard](assets/Screenshot%202025-04-24%20211237.png) |

| User Dashboard | Admin Panel |
|:--------------:|:-----------:|
| ![User](assets/Screenshot%202025-04-24%20211057.png) | ![Admin](assets/Screenshot%202025-04-24%20211034.png) |

</div>

---

## 📡 API Overview

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Module | Endpoints | Description |
|--------|-----------|-------------|
| `/api/users` | 8 routes | Registration, login, password reset, profile, saved vendors |
| `/api/vendor/auth` | 2 routes | Vendor registration and login |
| `/api/vendor` | 10 routes | Search, public profiles, dashboard analytics, profile management |
| `/api/quotes` | 5 routes | Submit, track, update, and cancel quotations |
| `/api/reviews` | 4 routes | Submit reviews, vote helpful, vendor replies |
| `/api/inquiries` | 3 routes | Send, view, and manage inquiries |
| `/api/notifications` | 5 routes | Notification CRUD, mark read, clear all |
| `/api/admin` | 11 routes | Platform stats, vendor approval, user/review/quote management |

> 📖 Full endpoint documentation available in [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md)

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local installation or [MongoDB Atlas](https://cloud.mongodb.com) account)
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/PriyankaPatil6064/LiftLink-Project.git
cd LiftLink-Project
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in your own credentials (see [Environment Variables](#environment-variables)).

```bash
npm run dev
```

Backend starts at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
```

Open `client/.env` and set the API URL.

```bash
npm start
```

Frontend starts at `http://localhost:3000`

---

### Frontend (`client/.env`)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API base URL |

> 📖 See `backend/.env.example` and `client/.env.example` for the complete templates.

---

## 🌐 Deployment

| Component | Platform | Configuration |
|-----------|----------|---------------|
| **Frontend** | [Vercel](https://vercel.com) | `vercel.json` handles SPA routing and security headers |
| **Backend** | [Render](https://render.com) | `render.yaml` pre-configured for Node.js deployment |
| **Database** | [MongoDB Atlas](https://cloud.mongodb.com) | Cloud-hosted MongoDB cluster |
| **Images** | [Cloudinary](https://cloudinary.com) | Cloud image storage and delivery |

All production secrets are configured through each platform's environment variable settings — **no credentials are stored in the codebase**.

> 📖 Step-by-step deployment instructions available in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

---


## 🚀 Future Enhancements

- [ ] Real-time chat between users and vendors (Socket.io)
- [ ] Payment integration for premium vendor listings
- [ ] Mobile app (React Native)
- [ ] Advanced analytics with charts and export
- [ ] Multi-language support (i18n)
- [ ] AI-powered vendor recommendations
- [ ] Vendor verification badges with document upload
- [ ] SMS notifications via Twilio



<div align="center">

Built with ❤️ for the elevator industry

</div>
