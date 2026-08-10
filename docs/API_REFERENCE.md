# LiftLink — REST API Reference

**Base URL**
```
Development:  http://localhost:5000/api
Production:   https://your-backend.onrender.com/api
```

**Authentication**  
All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

**Rate Limits**  
- Auth endpoints (`/login`, `/signup`): 20 requests / 15 minutes  
- All other API routes: 300 requests / 15 minutes

---

## Endpoints

### Health
| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/health` | ❌ | `{ status, timestamp, env }` |

---

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/users/signup` | ❌ | Register user |
| POST | `/users/login` | ❌ | Login → JWT |
| GET | `/users/profile` | User | Own profile |
| PUT | `/users/profile` | User | Update profile |
| POST | `/users/forgot-password` | ❌ | Send reset email |
| POST | `/users/reset-password/:token` | ❌ | Reset password |
| POST | `/users/save-vendor/:id` | User | Save/unsave vendor |
| GET | `/users/saved-vendors` | User | Saved vendor list |

### Vendors (Auth)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/vendor/auth/register` | ❌ | Register vendor |
| POST | `/vendor/auth/login` | ❌ | Vendor login |

### Vendors (Public & Profile)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/vendor/all` | ❌ | Search + filter vendors |
| GET | `/vendor/:id` | ❌ | Public vendor profile |
| GET | `/vendor/dashboard/analytics` | Vendor | Analytics data |
| GET | `/vendor/profile/:id` | Vendor | Own profile |
| PUT | `/vendor/profile` | Vendor | Update own profile |
| POST | `/vendor/upload-logo` | Vendor | Upload logo image |
| POST | `/vendor/upload-banner` | Vendor | Upload cover banner |
| POST | `/vendor/projects` | Vendor | Add portfolio project |
| DELETE | `/vendor/projects/:pid` | Vendor | Remove project |

### Quotes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/quotes` | User | Submit quote request |
| GET | `/quotes/user` | User | My quote history |
| GET | `/quotes/vendor` | Vendor | Incoming quotes |
| PATCH | `/quotes/:id/status` | Vendor | Update status + response |
| PATCH | `/quotes/:id/cancel` | User | Cancel pending quote |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reviews` | User | Submit review |
| GET | `/reviews/:vendorId` | ❌ | Get vendor reviews |
| PATCH | `/reviews/:id/helpful` | User | Vote helpful |
| DELETE | `/reviews/:id` | User | Delete own review |
| POST | `/reviews/:id/reply` | Vendor | Vendor reply |
| POST | `/reviews/:id/report` | User | Report review |

### Inquiries
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/inquiries/send` | Optional | Send inquiry |
| GET | `/inquiries/:vendorId` | Vendor | View inbox |
| PATCH | `/inquiries/:id/read` | Vendor | Mark as read |
| DELETE | `/inquiries/:id` | Vendor | Delete inquiry |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Any | Get all notifications |
| PATCH | `/notifications/mark-all-read` | Any | Mark all read |
| PATCH | `/notifications/:id/read` | Any | Mark one read |
| DELETE | `/notifications/:id` | Any | Delete one |
| DELETE | `/notifications` | Any | Clear all |

### Services
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/services` | ❌ | List all service categories |
| POST | `/services` | Vendor | Add service |
| PUT | `/services/:id` | Vendor | Update service |
| DELETE | `/services/:id` | Vendor | Remove service |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/admin/login` | ❌ | Admin login |
| POST | `/admin/seed` | ❌ | Create first admin |
| GET | `/admin/stats` | Admin | Platform statistics |
| GET | `/admin/vendors` | Admin | All vendors (paginated) |
| PATCH | `/admin/vendors/:id/approve` | Admin | Approve vendor |
| PATCH | `/admin/vendors/:id/reject` | Admin | Reject vendor |
| DELETE | `/admin/vendors/:id` | Admin | Delete vendor |
| GET | `/admin/users` | Admin | All users (paginated) |
| DELETE | `/admin/users/:id` | Admin | Delete user |
| GET | `/admin/reviews` | Admin | All reviews |
| PATCH | `/admin/reviews/:id/hide` | Admin | Show/hide review |
| GET | `/admin/quotes` | Admin | All quotes |
| GET | `/admin/inquiries` | Admin | All inquiries |

---

## Common Request/Response Examples

### POST /users/login
```json
// Request
{ "email": "user@example.com", "password": "Password@123" }

// 200 Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "username": "user123", "email": "user@example.com", "fullName": "..." }
}

// 400 Error
{ "message": "Invalid email or password" }
```

### GET /vendor/all?search=mumbai&liftType=Passenger&sortBy=rating&page=1&limit=12
```json
// 200 Response
{
  "vendors": [
    {
      "_id": "...",
      "companyName": "SwiftLift Solutions",
      "location": "Mumbai, Maharashtra",
      "averageRating": 4.5,
      "totalReviews": 38,
      "experience": 12,
      "liftCategories": ["Passenger Lifts", "Freight Lifts"],
      "services": [{ "serviceName": "Installation", "category": "Installation" }],
      "isVerified": true
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1,
  "hasMore": false
}
```

### POST /quotes (User Auth)
```json
// Request
{
  "vendorId": "6a660d31...",
  "liftType": "Freight Lift",
  "buildingType": "Industrial",
  "floors": 5,
  "description": "Need 2000kg freight elevator",
  "budget": "5-10 Lakhs",
  "timeline": "2 months",
  "userPhone": "9876543210"
}

// 201 Response
{
  "message": "Quote request sent successfully",
  "quote": {
    "_id": "...",
    "status": "pending",
    "liftType": "Freight Lift",
    "vendorId": "...",
    "createdAt": "2026-07-26T13:00:00Z"
  }
}
```

### PATCH /quotes/:id/status (Vendor Auth)
```json
// Request — valid statuses: viewed, accepted, rejected, info_requested, contacted, completed
{
  "status": "accepted",
  "vendorResponse": "Thank you! We will arrange a site visit on Monday.",
  "quotedAmount": "₹7.5 Lakhs"
}

// 200 Response
{ "message": "Quote status updated", "quote": { ... } }
```

### GET /admin/stats (Admin Auth)
```json
// 200 Response
{
  "totalVendors": 4,
  "pendingVendors": 1,
  "approvedVendors": 3,
  "totalUsers": 2,
  "totalReviews": 4,
  "totalInquiries": 4,
  "totalQuotes": 4,
  "quoteTrend": [
    { "_id": "pending", "count": 2 },
    { "_id": "accepted", "count": 1 },
    { "_id": "completed", "count": 1 }
  ]
}
```

---

## Error Response Format

All errors follow this structure:
```json
{
  "message": "Human-readable error description",
  "stack": "..." // only in NODE_ENV=development
}
```

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (missing/invalid fields) |
| 401 | Unauthorized (missing or invalid JWT) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
