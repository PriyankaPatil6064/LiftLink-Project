# LiftLink — Deployment Guide

Complete step-by-step guide to deploying LiftLink on Render (backend) and Vercel (frontend) with MongoDB Atlas and Gmail.

---

## Prerequisites

- [ ] GitHub account with LiftLink repository pushed
- [ ] MongoDB Atlas account (free) — [cloud.mongodb.com](https://cloud.mongodb.com)
- [ ] Render account (free) — [render.com](https://render.com)
- [ ] Vercel account (free) — [vercel.com](https://vercel.com)
- [ ] Gmail account (for email delivery)
- [ ] Cloudinary account (free, for image storage) — [cloudinary.com](https://cloudinary.com)

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create Cluster
1. Log in → **"Build a Database"**
2. Choose **M0 Free** tier
3. Select provider (AWS) and region closest to your users
4. Name it `LiftLinkCluster`
5. Click **Create**

### 1.2 Create Database User
1. **Database Access** → **Add New Database User**
2. Username: `liftlink-app`
3. Password: Generate a secure password (save it!)
4. Privileges: **Read and write to any database**
5. Click **Add User**

### 1.3 Network Access (IP Allowlist)
1. **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** → this sets `0.0.0.0/0`
   > ⚠️ Required because Render uses dynamic IPs on the free tier
3. Click **Confirm**

### 1.4 Get Connection String
1. **Database** → **Connect** → **Drivers** → **Node.js**
2. Copy the connection string:
   ```
   mongodb+srv://liftlink-app:<password>@liftlinkcluster.xxxxx.mongodb.net/...
   ```
3. Replace `<password>` with your actual password
4. Append `/liftlink` before `?` to set the database name:
   ```
   mongodb+srv://liftlink-app:YourPass@liftlinkcluster.xxxxx.mongodb.net/liftlink?retryWrites=true&w=majority
   ```

---

## Step 2: Gmail App Password

1. Log into your Gmail account
2. **Google Account** → **Security**
3. Enable **2-Step Verification** (required)
4. Search "App Passwords" in Security settings
5. App: **Mail** | Device: **Windows Computer**
6. Click **Generate** → Copy the 16-character password (no spaces)

---

## Step 3: Cloudinary Setup

1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Dashboard → Note your:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## Step 4: Deploy Backend on Render

### 4.1 Connect Repository
1. [render.com](https://render.com) → **New** → **Web Service**
2. Connect GitHub → Select your `liftlink` repository
3. Configure:
   - **Name:** `liftlink-api`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

### 4.2 Set Environment Variables
In Render → **Environment** tab → add each:

| Key | Value |
|-----|-------|
| `MONGO_URI` | Your Atlas connection string (with `/liftlink`) |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | 64-character random string (use a generator) |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
| `CLIENT_URL` | `https://your-app.vercel.app` |
| `EMAIL_FROM` | Your Gmail address |
| `EMAIL_PASSWORD` | 16-char Gmail App Password |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |

> 💡 For `JWT_SECRET`, generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 4.3 Deploy
Click **Create Web Service** → Render will build and deploy.

**Test:** `https://liftlink-api.onrender.com/api/health` should return `{ "status": "ok" }`

> ⚠️ Render free tier sleeps after 15 minutes of inactivity. First request takes ~30 seconds to wake up.

---

## Step 5: Deploy Frontend on Vercel

### 5.1 Connect Repository
1. [vercel.com](https://vercel.com) → **New Project** → Import GitHub
2. Select your `liftlink` repository
3. Configure:
   - **Root Directory:** `client`
   - **Framework Preset:** Create React App (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`

### 5.2 Environment Variables
Add in Vercel → **Environment Variables:**

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://liftlink-api.onrender.com` |

### 5.3 Deploy
Click **Deploy** → Vercel will build and publish.

The `vercel.json` in `client/` handles:
- SPA rewrite (all routes → `index.html`)
- Security headers (CORS, X-Frame-Options, etc.)

**Test:** Open your Vercel URL — the home page should load and `/Explore` should show vendors.

---

## Step 6: Post-Deployment Setup

### 6.1 Create Admin Account
```bash
curl -X POST https://liftlink-api.onrender.com/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"name":"LiftLink Admin","email":"admin@yourdomain.com","password":"SecureAdmin@123"}'
```

Expected: `{ "message": "Admin created", "email": "admin@yourdomain.com" }`

> Note: This endpoint only works when 0 admins exist. Subsequent calls return 400.

### 6.2 Seed Demo Vendors (Optional)
Run the seed script pointing to your production Atlas URI:
```bash
# In backend/ with production .env
MONGO_URI="your-atlas-uri" node scripts/seed.js
```

### 6.3 Verify Full Flow
1. ✅ `GET /api/health` returns OK
2. ✅ `GET /api/vendor/all` returns vendors
3. ✅ Register as a vendor on the frontend
4. ✅ Log in as admin → approve vendor
5. ✅ Vendor appears in Explore page

---

## Step 7: Update ALLOWED_ORIGINS

After Vercel assigns your domain:
1. Render → Environment → Update `ALLOWED_ORIGINS` with your exact Vercel URL
2. Render will redeploy automatically

If you add a custom domain later, also add it to `ALLOWED_ORIGINS`.

---

## Troubleshooting

| Problem | Check |
|---------|-------|
| Backend 500 on startup | MONGO_URI correct? Atlas IP allowlist set to 0.0.0.0/0? |
| CORS error in browser | ALLOWED_ORIGINS matches exact frontend URL (no trailing slash) |
| Email not sending | Gmail App Password correct? 2FA enabled? Less secure app access off? |
| Vendor images not saving | Cloudinary credentials correct? CLOUDINARY_CLOUD_NAME set? |
| Frontend shows blank page | REACT_APP_API_URL set in Vercel? No trailing slash? |
| Admin login fails | Created via `/api/admin/seed`? (not raw DB insert) |
| Vendors not showing | Admin approved them? `isApproved: true` in DB? |

---

## Environment Variables Reference

### Backend (Render)
```env
MONGO_URI=                     # Atlas connection string with /liftlink
PORT=5000
NODE_ENV=production
JWT_SECRET=                    # 64-char random hex string
ALLOWED_ORIGINS=               # Comma-separated: https://app.vercel.app
CLIENT_URL=                    # Frontend URL for email links
EMAIL_FROM=                    # Gmail address
EMAIL_PASSWORD=                # Gmail 16-char App Password
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=             # https://your-backend.onrender.com
```

---

## Render Auto-Deploy

Push to your main branch → Render automatically rebuilds and redeploys the backend.

## Vercel Auto-Deploy

Push to your main branch → Vercel automatically rebuilds and redeploys the frontend.

This gives you a complete CI/CD pipeline via GitHub for free.
