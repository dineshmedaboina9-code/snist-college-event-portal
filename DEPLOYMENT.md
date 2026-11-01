# 🚀 SNIST College Event Portal – Production Deployment Guide

This repository is pre-configured for seamless, zero-cost deployment across **Render**, **Railway**, **Vercel**, and **Docker**.

---

## ⚡ Option 1: 1-Click Full-Stack Deployment on Render (Recommended)

Render can build the React frontend and serve it directly from the Express backend as a unified web service on a single free domain.

### Step 1: Create a Free Cloud MySQL Database
Since Render's free tier specializes in web services, you can obtain a free MySQL database in under 2 minutes from:
* **[Aiven MySQL Free Tier](https://aiven.io/mysql)** (Free forever, managed MySQL)
* **[TiDB Serverless](https://tidb.cloud/)** (Free 5GB MySQL-compatible cluster)
* Or **[Railway](https://railway.app/)** (Includes free MySQL plugin)

Copy the database connection details:
* `DB_HOST`
* `DB_USER`
* `DB_PASSWORD`
* `DB_NAME` (e.g. `college_event_portal`)

### Step 2: Push to Your GitHub Account
```bash
git remote add origin https://github.com/YOUR_USERNAME/snist-college-event-portal.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Blueprint**.
2. Connect your GitHub repository.
3. Render will automatically detect [`render.yaml`](./render.yaml).
4. Enter your cloud MySQL database credentials in the environment variables prompt.
5. Click **Apply**.
6. Render builds the React SPA and runs the API backend on your unique URL (e.g., `https://snist-cemp-portal.onrender.com`).

---

## 🌐 Option 2: Deploy Frontend to Vercel (Hobby Free Tier)

If you prefer to host the frontend separately on Vercel:

### Step 1: Push Frontend to Vercel
1. Run in terminal:
   ```bash
   cd frontend
   vercel
   ```
2. Or import your GitHub repository at [vercel.com/new](https://vercel.com/new).
3. Set **Root Directory** to `frontend`.
4. Vercel automatically detects the Vite framework and applies [`frontend/vercel.json`](./frontend/vercel.json).
5. Under **Environment Variables**, add:
   * `VITE_API_BASE_URL` = `https://your-backend-service.onrender.com/api`
6. Click **Deploy**.

---

## 🐳 Option 3: Deploy via Docker (Any VPS or Local Server)

Run both the MySQL database and the full-stack web application with one command:

```bash
docker compose up --build -d
```

* **Application URL:** `http://localhost:5001`
* **MySQL Database:** Running on port `3306` inside the container network.

---

## 🛠️ Verification Checklist After Deployment

1. **Health Check:** Visit `https://YOUR_DOMAIN/api/health` → Should return `{"status":"OK"}`.
2. **Seed Initial Data:** Run `npm run seed` against your production database to create the 6 tables and sample events.
3. **Student Pass Issuance:** Register a student account and test dynamic QR pass generation.
4. **Gatekeeper Scan:** Test the scanner at `https://YOUR_DOMAIN/scanner` to verify entrance pass validation.
