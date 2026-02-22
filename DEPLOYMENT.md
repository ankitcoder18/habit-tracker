# Habit Tracker Deployment Guide

## Vercel Deployment (Both Frontend + Backend)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Setup Vercel deployment"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to **Vercel Dashboard** → https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository `ankitcoder18/habit-tracker`
4. **Configure Project:**
   - **Framework**: Leave as is (auto-detect)
   - **Root Directory**: `.` (root)
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install` (keep default)

### Step 3: Add Environment Variables
In Vercel Project Settings → **Environment Variables**, add:

- `MONGODB_URI` = Your MongoDB Atlas connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/habittracker`
  
- `JWT_SECRET` = Your JWT secret key
  - Example: `your_secret_key_here_12345`

### Step 4: Deploy
Click **Deploy** and wait for completion.

### Step 5: Get Your Backend URL
After deployment, your backend URL will be: `https://your-project-name.vercel.app`

### Step 6: Add Frontend Environment Variable
In Vercel Project Settings → **Environment Variables**, add:
- `VITE_BACKEND_URL` = `https://your-project-name.vercel.app`

Then deploy again.

---

## Local Development

### Backend
```bash
cd backend
node server.js
# Runs on http://localhost:3000
```

### Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## Troubleshooting

### 404 Error
- Check if vercel.json is in root directory
- Verify api/index.js exists
- Check Environment Variables are set correctly

### CORS Error
- Update CORS origin in backend/server.js
- Add your Vercel domain to the origin list

### Database Connection Error
- Verify MONGODB_URI is correct
- Check MongoDB Network Access allows Vercel IPs
- Add `0.0.0.0/0` to MongoDB IP Whitelist (not recommended for production)

---

## File Structure After Setup
```
root/
├── vercel.json
├── .vercelignore
├── api/
│   └── index.js
├── backend/
│   └── server.js (now exports app)
└── frontend/
    └── src/
        └── context/
            └── HabitContext.jsx (uses import.meta.env.VITE_BACKEND_URL)
```
