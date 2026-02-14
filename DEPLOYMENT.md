# 🚀 Deployment Guide - Smart City Complaint System

This guide will help you deploy the Smart City Complaint Management System to production using free-tier cloud services.

## 📋 Prerequisites

- GitHub account
- Railway/Render account (for backend + database)
- Vercel/Netlify account (for frontend)
- Google Cloud account (for Maps API)
- Mailtrap account (for testing) or SendGrid/Mailgun (for production)

## Part 1: Database Setup (Railway)

### Option A: Railway (Recommended)

1. **Sign up at [Railway.app](https://railway.app)**
2. **Create a new project** → "Provision PostgreSQL"
3. **Copy the DATABASE_URL** from the PostgreSQL service
   - Format: `postgresql://user:password@host:port/database`
4. **Save this URL** - you'll need it for backend deployment

### Option B: Render

1. **Sign up at [Render.com](https://render.com)**
2. **Create a new PostgreSQL database**
3. **Copy the Internal Database URL**

## Part 2: Backend Deployment (Railway)

### Step 1: Prepare Backend for Deployment

1. **Create a `.env` file locally** (don't commit this):

```env
DATABASE_URL=<your-railway-postgres-url>
JWT_SECRET=<generate-random-secret-key>
PORT=5000
NODE_ENV=production

EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=<your-mailtrap-user>
EMAIL_PASS=<your-mailtrap-pass>
EMAIL_FROM=noreply@smartcity.com

FRONTEND_URL=<will-add-after-frontend-deployment>
```

2. **Add a `start` script** to `backend/package.json` (already done):

```json
"scripts": {
  "start": "node dist/server.js",
  "build": "tsc"
}
```

### Step 2: Deploy to Railway

1. **Go to Railway dashboard** → "New Project" → "Deploy from GitHub repo"
2. **Connect your GitHub repository**
3. **Configure the service**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. **Add environment variables** in Railway dashboard:
   - Copy all variables from your `.env` file
   - Use the Railway PostgreSQL DATABASE_URL
5. **Deploy!** Railway will build and deploy automatically
6. **Copy your backend URL** (e.g., `https://your-app.up.railway.app`)

### Alternative: Deploy to Render

1. **Create a new Web Service** on Render
2. **Connect GitHub repository**
3. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. **Add environment variables** in Render dashboard
5. **Deploy**

## Part 3: Frontend Deployment (Vercel)

### Step 1: Update API URL

1. **Edit `frontend/js/api.js`**:

```javascript
const API_BASE_URL = 'https://your-backend-url.up.railway.app/api';
```

2. **Commit the change**:

```bash
git add frontend/js/api.js
git commit -m "Update API URL for production"
git push
```

### Step 2: Deploy to Vercel

1. **Sign up at [Vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Configure**:
   - Framework Preset: Other
   - Root Directory: `frontend`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
4. **Deploy!**
5. **Copy your frontend URL** (e.g., `https://your-app.vercel.app`)

### Alternative: Deploy to Netlify

1. **Sign up at [Netlify.com](https://netlify.com)**
2. **New site from Git** → Connect GitHub
3. **Configure**:
   - Base directory: `frontend`
   - Build command: (leave empty)
   - Publish directory: `.` (current directory)
4. **Deploy**

## Part 4: Update CORS Settings

1. **Go back to Railway** → Your backend service → Environment Variables
2. **Update `FRONTEND_URL`**:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. **Redeploy** the backend service

## Part 5: Google Maps API Setup

### Step 1: Create Google Cloud Project

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Create a new project** → "Smart City Complaint System"
3. **Enable APIs**:
   - Go to "APIs & Services" → "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"

### Step 2: Create API Credentials

1. **Go to "Credentials"** → "Create Credentials" → "API Key"
2. **Restrict the API key** (recommended):
   - Application restrictions: HTTP referrers
   - Add your Vercel domain: `https://your-app.vercel.app/*`
   - API restrictions: Maps JavaScript API only
3. **Copy the API key**

### Step 3: Update Frontend

1. **Edit `frontend/citizen-dashboard.html`**:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY"></script>
```

2. **Commit and push**:

```bash
git add frontend/citizen-dashboard.html
git commit -m "Add Google Maps API key"
git push
```

Vercel will automatically redeploy.

## Part 6: Email Service Setup

### For Testing (Mailtrap)

1. **Sign up at [Mailtrap.io](https://mailtrap.io)**
2. **Go to Email Testing** → Your Inbox → SMTP Settings
3. **Copy credentials** and add to Railway environment variables

### For Production (SendGrid)

1. **Sign up at [SendGrid.com](https://sendgrid.com)** (100 emails/day free)
2. **Create an API key**
3. **Update Railway environment variables**:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=<your-sendgrid-api-key>
   EMAIL_FROM=noreply@yourdomain.com
   ```

## Part 7: Testing Your Deployment

### 1. Test Backend API

Visit: `https://your-backend-url.up.railway.app/api/health`

Should return: `{"status":"OK","message":"Smart City Complaint System API is running"}`

### 2. Test Frontend

1. Visit your Vercel URL
2. Register a new account
3. Try all features:
   - Login
   - Submit a complaint
   - Check email notifications in Mailtrap
   - Test admin and officer dashboards

### 3. Test Database

1. Login to Railway
2. Go to PostgreSQL service → Data
3. Check if tables are created and data is being stored

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (random 64-character string)
- [ ] Restrict Google Maps API key to your domain
- [ ] Enable HTTPS (automatic on Vercel/Railway)
- [ ] Set NODE_ENV=production
- [ ] Don't commit `.env` files
- [ ] Use production email service (not Mailtrap)

## 📊 Monitoring

### Railway
- View logs in Railway dashboard
- Monitor database usage
- Check API response times

### Vercel
- View deployment logs
- Monitor bandwidth usage
- Check function invocations

## 🐛 Troubleshooting

### Backend not connecting to database
- Check DATABASE_URL format
- Verify PostgreSQL service is running
- Check Railway logs for errors

### CORS errors
- Verify FRONTEND_URL is set correctly
- Check that frontend URL matches exactly (with https://)

### Email not sending
- Verify email credentials
- Check Railway logs for email errors
- Test with Mailtrap first

### Google Maps not loading
- Check API key is correct
- Verify API is enabled in Google Cloud
- Check browser console for errors

## 💰 Cost Estimate

All services have generous free tiers:

- **Railway**: Free tier includes 500 hours/month, $5 credit
- **Vercel**: 100GB bandwidth, unlimited deployments
- **PostgreSQL**: 1GB storage on Railway free tier
- **SendGrid**: 100 emails/day free
- **Google Maps**: $200 free credit monthly

**Total monthly cost: $0** (within free tier limits)

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:

1. **Push to GitHub** → Automatic deployment
2. **Pull requests** → Preview deployments
3. **Main branch** → Production deployment

## 📝 Post-Deployment Tasks

1. **Update README** with live URLs
2. **Create admin accounts** for your team
3. **Add departments** relevant to your city
4. **Test all user flows** thoroughly
5. **Monitor error logs** for the first few days

## 🎉 Your App is Live!

**Frontend**: https://your-app.vercel.app
**Backend API**: https://your-backend.up.railway.app/api

Share these URLs with your users and start managing complaints!

---

Need help? Check the main README or open an issue on GitHub.
