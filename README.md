# GameSquad - Teammate Finder Platform

A modern web application for finding gaming teammates across multiple popular games including Valorant, Apex Legends, Fortnite, and 2XKO. Built with Next.js, Firebase, and Razorpay.

## 🎮 Features

- **Multi-Game Support**: Find teammates for Valorant (5v5), Apex Legends (3v3), Fortnite (Squads), and 2XKO (2v2)
- **Unique Game Themes**: Each game has its own custom-designed UI theme matching the game's aesthetic
- **Team Size Options**:
  - Duo: ₹50
  - Trio: ₹150
  - 5-Stack/Squad: ₹250
- **Secure Payments**: Integrated with Razorpay for safe and secure transactions
- **User Dashboard**: Track your team requests and matches
- **Firebase Authentication**: Google Sign-In for easy access
- **Real-time Updates**: Live status updates for team requests
- **Guest Browsing**: Users can explore the platform without signing in

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **Payments**: Razorpay
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before setting up the project, make sure you have:

- Node.js 18+ installed
- A Firebase account and project
- A Razorpay account (for payment integration)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd teammate-finder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Authentication** → **Google Sign-In**
4. Create a **Firestore Database**
5. Go to Project Settings → General → Your apps → Web app
6. Copy your Firebase configuration

### 4. Razorpay Setup

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up/Login to your account
3. Navigate to Settings → API Keys
4. Generate API keys (Key ID and Key Secret)
5. For testing, use **Test Mode** keys

### 5. Environment Variables

Create a `.env.local` file in the root directory and add:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 6. Firestore Security Rules

Set up the following Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /teamRequests/{request} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Project Structure

```
teammate-finder/
├── app/
│   ├── api/
│   │   └── razorpay/
│   │       └── create-order/     # Razorpay order creation API
│   ├── dashboard/                 # User dashboard page
│   ├── games/
│   │   └── [gameId]/             # Dynamic game pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
├── components/
│   └── Navbar.tsx                # Navigation component
├── contexts/
│   └── AuthContext.tsx           # Firebase auth context
├── lib/
│   ├── firebase.ts               # Firebase configuration
│   ├── gameConfigs.ts            # Game configurations
│   └── types.ts                  # TypeScript types
└── public/                       # Static assets
```

## 🎨 Game Themes

Each game has a unique color scheme:

- **Valorant**: Red (#FF4655) & Black (#0F1923)
- **Apex Legends**: Orange (#F89A1E) & Red (#DA292E)
- **Fortnite**: Purple (#7B3FF2) & Blue (#00D9FF)
- **2XKO**: Gold (#D4AF37) & Dark Blue (#0A1428)

## 💳 Payment Flow

1. User selects a game and team size
2. Fills in player details (rank, region, play time)
3. Clicks "Pay & Find Teammates"
4. Razorpay payment gateway opens
5. After successful payment, request is saved to Firestore
6. User is redirected to dashboard

## 📱 Pages

- **Home** (`/`): Game selection with hero section
- **Game Pages** (`/games/[gameId]`): Individual game pages with unique themes
- **Dashboard** (`/dashboard`): User's team requests and status

## 🔐 Authentication

- Google Sign-In via Firebase Auth
- Guest browsing allowed for exploring games
- Authentication required only for payment and dashboard access

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

### Environment Variables in Vercel

Add all the variables from `.env.local` to your Vercel project settings.

## 📝 Future Enhancements

- Email notifications for matched teammates
- In-app messaging system
- Advanced filters (skill level, language, etc.)
- Team rating and review system
- Discord integration
- Admin panel for matchmaking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues or questions, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ for gamers, by gamers.
