# 🎓 SUNYswap

**A campus marketplace platform for SUNY students to buy, sell, and exchange items within their university community.**

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Firebase-12.5.0-FFCA28?logo=firebase" alt="Firebase">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.18-38B2AC?logo=tailwind-css" alt="Tailwind">
</p>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 About

SUNYswap is a secure, student-focused marketplace designed specifically for the SUNY (State University of New York) community. It provides a trusted platform where students can list items for sale, browse available products, communicate with sellers, and build a safer campus trading environment.

### Why SUNYswap?

- **Campus-Specific**: Restricted to verified SUNY student emails
- **Safe & Secure**: Built-in reporting system and Firebase authentication
- **Easy to Use**: Intuitive interface with real-time updates
- **Community-Driven**: Designed by students, for students

---

## ✨ Features

### 🔐 Authentication & Security
- **Email Verification System**: Fast 6-digit code verification via Gmail/Nodemailer
- **Firebase Authentication**: Robust user authentication and session management
- **SQLite Database**: Secure storage for verification codes and user accounts
- **Protected Routes**: Authenticated-only access to sensitive pages
- **Report System**: Flag suspicious listings with detailed reporting options

### 📦 Marketplace Functionality
- **Browse Listings**: View all available items with image galleries and detailed descriptions
- **Advanced Search**: Filter items by category, price, condition, and more
- **Item Details**: Comprehensive product pages with multiple images and seller information
- **Sell Items**: Easy-to-use form for creating new listings with multiple image uploads (up to 5)
- **Image Preview Grid**: See all your uploaded images before posting with delete option
- **Category System**: 9+ categories including Electronics, Textbooks, Dorm Supplies, and more
- **Condition Labels**: Clear condition indicators (Brand New, Like New, Good, Used)
- **User Profiles**: View and manage your listings, account details, and activity
- **Price Validation**: Ensures valid pricing and prevents zero or negative values

### 💬 Communication
- **Messaging System**: Direct communication between buyers and sellers
- **Real-time Updates**: Instant message notifications and status changes
- **Email Notifications**: Get notified via email when you receive new messages
- **Conversation Threading**: Organized message threads per item listing
- **Message Preview**: See recent message snippets in conversation list

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Image Modal Viewer**: Full-screen image viewing with navigation
- **Multiple Image Uploads**: Upload up to 5 images per listing with preview
- **Image Management**: Delete unwanted images before posting
- **Loading States**: Smooth loading indicators and error handling
- **Modern UI**: Clean, intuitive interface with consistent design patterns
- **Custom Styled Dropdowns**: Beautiful, consistent form controls across all inputs

### 🛡️ Content Moderation
- **Report Button**: Available on all listings (detail pages and card views)
- **Report Reasons**: Spam, scams, inappropriate content, prohibited items, duplicates
- **Banned Words Filter**: Automatic detection of inappropriate content in listings
- **Comprehensive Filter List**: Blocks explicit content, drug references, and common scams
- **Real-time Validation**: Checks title and description before posting
- **Firestore Storage**: All reports logged for manual review
- **User Protection**: Cannot report own listings

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **React Router DOM 7.9.5** - Client-side routing
- **Vite 7.2.4** - Build tool and dev server
- **Tailwind CSS 3.4.18** - Utility-first CSS framework

### Backend & Services
- **Firebase 12.5.0** - Backend services
  - Authentication
  - Firestore Database (conversations, messages, items, reports)
  - Cloud Storage (image uploads)
  - Real-time listeners for live updates
- **Firebase Admin 13.6.0** - Server-side Firebase operations
- **Express 5.2.1** - Server framework for email verification
- **Nodemailer 7.0.11** - Email delivery via Gmail for verification codes
- **Resend API** - Transactional email service for message notifications
- **SQLite3 5.1.7** - Verification code storage
- **Body-Parser 2.2.1** - Request parsing middleware
- **Dotenv 17.2.3** - Environment variable management
- **CORS** - Cross-origin resource sharing for API endpoints

### Development Tools
- **ESLint 9.39.1** - Code linting
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.22** - CSS vendor prefixing

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Firebase account** with a project set up
- **Gmail account** with App Password for email verification

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Cyrila7/SunySwap.git
   cd SUNYswap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Gmail Configuration (for email verification)
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password

   # Server Configuration
   PORT=3000
   ```

   **To generate Gmail App Password:**
   1. Enable 2-Step Verification on your Gmail account
   2. Go to Google Account → Security → 2-Step Verification → App passwords
   3. Generate a new app password for "Mail"
   4. Copy the 16-character password (remove spaces)

4. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Set up Storage for image uploads

5. **Start the servers**
   
   **Terminal 1 - Email Verification Server:**
   ```bash
   node server.js
   ```
   Server will run on `http://localhost:3000`

   **Terminal 2 - React Development Server:**
   ```bash
   npm run dev
   ```
   App will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
SUNYswap/
├── public/                       # Static assets
│   ├── index.html                # Test page for email system
│   └── test-verification.html    # Verification test interface
├── api/                          # Serverless API functions (Vercel)
│   ├── notify-message.js         # Message notification endpoint
│   ├── register.js               # User registration
│   ├── resend-code.js            # Resend verification code
│   ├── send-verification.js      # Send verification email
│   ├── verify-email.js           # Verify email code
│   └── verify.js                 # Additional verification
├── src/
│   ├── assets/                   # Images and static files
│   ├── components/               # Reusable React components
│   │   ├── ImageModal.jsx        # Full-screen image viewer with navigation
│   │   ├── Navbar.jsx            # Navigation bar with auth state
│   │   └── RequireAuth.jsx       # Protected route wrapper
│   ├── context/                  # React Context providers
│   │   └── AuthContext.jsx       # Authentication state management
│   ├── lib/                      # Utility libraries
│   │   ├── firebase.js           # Firebase configuration
│   │   ├── notifications.js      # Email notification functions
│   │   └── notifications-example.js  # Example notification setup
│   ├── pages/                    # Page components
│   │   ├── AboutPage.jsx         # About SUNYswap page
│   │   ├── BrowsePage.jsx        # Browse all listings with filters
│   │   ├── FaqPage.jsx           # FAQ page
│   │   ├── HomePage.jsx          # Landing page
│   │   ├── ItemDetailPage.jsx    # Item details with image gallery
│   │   ├── LoginPage.jsx         # User login
│   │   ├── MessagesPage.jsx      # Real-time messaging interface
│   │   ├── ProfilePage.jsx       # User profile & listings management
│   │   ├── ResetPasswordPage.jsx # Password reset
│   │   ├── SellPage.jsx          # Create listing with multi-image upload
│   │   ├── SignupPage.jsx        # User registration
│   │   └── VerifyEmailPage.jsx   # Email verification with code
│   ├── App.jsx                   # Main app component with routing
│   ├── App.css                   # App-specific styles
│   ├── main.jsx                  # App entry point
│   └── index.css                 # Global styles with Tailwind
├── .env                          # Environment variables (not tracked)
├── .gitignore                    # Git ignore patterns
├── eslint.config.js              # ESLint configuration
├── index.html                    # HTML entry point
├── package.json                  # Project dependencies
├── postcss.config.js             # PostCSS configuration
├── server.js                     # Node.js/Express email verification server
├── tailwind.config.js            # Tailwind CSS configuration
├── users.db                      # SQLite database (not tracked)
└── vercel.json                   # Vercel deployment configuration
├── vercel.json                   # Vercel deployment config
└── vite.config.js                # Vite configuration
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | ✅ |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | ✅ |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | ✅ |
| `RESEND_API_KEY` | Resend API key for emails | ✅ |
| `FIREBASE_ADMIN_SERVICE_ACCOUNT` | Firebase admin service account JSON | ✅ |

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

---

## 🌐 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add environment variables** in Vercel dashboard under Project Settings → Environment Variables

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider (Netlify, Firebase Hosting, etc.)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Cyril Annoh**
- GitHub: [@Cyrila7](https://github.com/Cyrila7)
- Repository: [SUNYswap](https://github.com/Cyrila7/SunySwap)

---

## 🙏 Acknowledgments

- SUNY student community for inspiration and feedback
- Firebase for backend infrastructure and real-time database
- Gmail & Resend for fast, reliable email delivery services
- React and Vite teams for excellent development tools
- Tailwind CSS for beautiful, responsive styling

---

## 📊 Recent Updates (December 2025)

- ✅ Enhanced messaging system with email notifications
- ✅ Multiple image upload support (up to 5 images per listing)
- ✅ Image preview grid with delete functionality
- ✅ Comprehensive banned words filter for content moderation
- ✅ Custom styled dropdown menus for consistent UI
- ✅ Fixed duplicate key warnings in conversation creation
- ✅ Improved mobile responsiveness across all pages
- ✅ Added About page with platform information

---

<p align="center">Made with ❤️ for the SUNY community</p>
