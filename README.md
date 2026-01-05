# CUNYswap 🛍️ brother to SUNYswap

**A campus-only marketplace built by students, for students.**

CUNYswap is a student-led web platform that enables verified college students to buy and sell items safely within their campus community. The goal is to reduce waste, improve safety, and make end-of-semester selling easier by keeping transactions on campus.

Currently piloted with CUNY students and designed to scale across CUNY campuses.

🔗 **Live Site:** [https://cunyswap.vercel.app](https://cunyswap.vercel.app)

---

## ✨ Features

- 🔐 **Campus-only verification** – School email required for signup
- 🛒 **Buy & sell items** – Textbooks, electronics, dorm supplies, clothing, etc.
- 🔍 **Advanced filters** – Category, condition, price range
- 💬 **Real-time messaging** – Built-in chat between buyers and sellers with email notifications
- 🖼️ **Multi-image uploads** – Up to 5 images per listing with expandable gallery
- 🏷️ **Mark items as SOLD** – No deletion, full transparency
- 👀 **Public browsing** – No login required to view listings
- 👤 **User dashboard** – Manage posted items and view activity
- 📬 **Email verification** – 6-digit code via NodeMailer (Gmail SMTP)
- 🛡️ **Content moderation** – Report system and banned words filter

---

## 🚧 Upcoming Features

- ⭐ Ratings & reviews | 📷 Image sharing in chat | ❤️ Favorites
- 🎨 UI redesign | 📦 Contactless campus drop-off

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router  
**Backend:** Firebase (Auth, Firestore, Storage), Node.js, Express  
**Email:** NodeMailer (Gmail SMTP), Resend API (notifications)  
**Database:** Firebase Firestore, SQLite (verification codes)  
**Deployment:** Vercel (frontend), Custom Node server (email)

---

## 🔐 Security & Trust

- ✅ Email verification (CUNY/school emails only)
- ✅ Firebase authentication & session management
- ✅ Content filtering (banned words, report system)
- ✅ No payments on platform (peer-to-peer only)
- ✅ On-campus public meetups encouraged

**Disclaimer:** CUNYswap is not affiliated with or endorsed by the City University of New York (CUNY).

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Firebase account
- Gmail account with App Password

### Installation
```bash
git clone https://github.com/cyrila7/CUNYswap.git
cd CUNYswap
npm install
```

### Environment Setup
Create `.env` file:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
RESEND_API_KEY=your_resend_key
```

### Run
```bash
# Terminal 1 - Email server
node server.js

# Terminal 2 - React app
npm run dev
```

App runs at: **http://localhost:5173** | Server: **http://localhost:3000**

---

## 📁 Project Structure

```
CUNYswap/
├── api/           # Serverless functions (Vercel)
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Main pages (Browse, Sell, Messages, Profile)
│   ├── context/       # Auth state management
│   └── lib/           # Firebase config & utilities
├── server.js      # Email verification server
└── vercel.json    # Deployment config
```

---

## 📈 Project Status

- **MVP:** ✅ Complete
- **User Testing:** ✅ Done (7+ testers)
- **Core Features:** ✅ Stable & deployed
- **Iteration Phase:** 🚧 Ongoing
- **School Partnerships:** 🚧 In progress

---

## 🎯 Key Achievements

- Built full-stack marketplace from scratch
- Implemented real-time messaging with Firebase
- Integrated email verification & notification system
- Deployed production app serving real users
- Designed mobile-responsive UI with Tailwind CSS
- Created content moderation & safety features

---

## 🤝 Contributing

This project is maintained by a single developer. Feedback and suggestions welcome via issues or pull requests im still a beginner haha.

---

## 👨🏾‍💻 Author

**Cyril Annoh**  
Computer Systems / CS Student  
GitHub: [@cyrila7](https://github.com/cyrila7)

---

<p align="center">Built with ❤️ for the CUNY community</p>
