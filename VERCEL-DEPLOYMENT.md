# 🚀 Vercel Deployment Guide for SUNYswap

## ⚙️ Environment Variables to Add in Vercel

Go to your Vercel project → Settings → Environment Variables and add these:

### Firebase Configuration
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Gmail Configuration (for email verification)
```
GMAIL_USER=sunyswap@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

## 📝 Important Notes

### Gmail App Password Setup:
1. Log into your Gmail account
2. Enable 2-Step Verification
3. Go to Security → 2-Step Verification → App passwords
4. Generate a new app password for "Mail"
5. Copy the 16-character password (no spaces)
6. Add it to Vercel environment variables

### Deployment Steps:
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

### API Routes:
- **Register:** `https://your-domain.vercel.app/register`
- **Verify:** `https://your-domain.vercel.app/verify`

The code automatically detects if it's running locally or in production and uses the correct URL.

## 🔧 How It Works

### Local Development:
- Uses `http://localhost:3000/register` and `/verify`
- Requires running `node server.js` locally

### Production (Vercel):
- Uses Vercel Serverless Functions at `/api/register.js` and `/api/verify.js`
- No need to run separate server
- Automatically scales

## ⚠️ Limitations

**In-Memory Storage:** The current implementation uses in-memory storage for verification codes, which means:
- Codes are lost when the serverless function scales down
- Not suitable for high traffic

**Solutions for Production:**
1. **Redis** (Recommended): Use Vercel KV or Upstash Redis
2. **Firestore**: Store codes in Firebase
3. **PostgreSQL**: Use Vercel Postgres

Would you like me to implement Redis or Firestore storage?
