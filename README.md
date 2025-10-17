# 🚀 Nexus - Open Course Marketplace & Teaching Platform

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.2-orange.svg)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-4.5-purple.svg)](https://vitejs.dev/)
[![Made in Egypt](https://img.shields.io/badge/Made%20in-Egypt%20🇪🇬-red.svg)](https://github.com/obieda-hussien/Nexus)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/obieda-hussien/Nexus/pulls)

> **The Platform Where Educators Become Entrepreneurs:** Create, publish, and sell your courses to students worldwide. From high school prep to university-level content, build your teaching business with zero upfront costs! 🎓

![Enhanced Nexus Website](https://github.com/user-attachments/assets/c9ab467a-3cc1-45fb-8f6a-2df17193cb16)

## 💡 What's This About?

Nexus is an **open course marketplace** where ANY teacher or instructor can publish and sell their courses. Whether you're a high school teacher preparing students for exams, a university professor sharing advanced knowledge, or an expert teaching specialized skills - this platform empowers you to reach students globally and earn from your expertise.

### 🎯 Perfect For:
- **High School Teachers**: Create online lessons, practice tests, and exam prep courses
- **University Professors**: Share lectures, assignments, and advanced coursework
- **Subject Matter Experts**: Teach physics, math, chemistry, computer science, or any subject
- **Online Tutors**: Build your teaching business with built-in payment processing
- **Educational Content Creators**: Monetize your knowledge with course sales

### ✨ Why Choose Nexus?

| Feature | Nexus | Other Platforms |
|---------|-------|-----------------|
| 🎓 **Open to All Instructors** | ✅ Anyone can teach | ⚠️ Limited access |
| 💰 **Instructor Earnings** | ✅ 85-90% revenue share | ❌ 50-70% typical |
| 💳 **Payment Processing** | ✅ Built-in (PayPal + Local) | ⚠️ External setup needed |
| 📊 **Earnings Dashboard** | ✅ Full transparency | ⚠️ Limited |
| 🏦 **Easy Withdrawals** | ✅ Bank, PayPal, Vodafone Cash | ⚠️ Limited options |
| 📝 **Course Creation** | ✅ Full control & flexibility | ⚠️ Template restrictions |
| 📺 **Live Sessions** | ✅ HD streaming + interactive tools | ⚠️ Basic or none |
| 🎯 **For All Levels** | ✅ High school to university | ⚠️ Limited range |
| 🚀 **No Upfront Costs** | ✅ 100% free to start | ❌ Platform fees |

## 🎨 Platform Features

### For Instructors (Teach & Earn 💰)
- **Course Creation Studio**: Full control over your course structure, lessons, and pricing
- **Live Teaching Tools**: HD video streaming with real-time chat and digital whiteboard
- **Earnings Dashboard**: Track sales, revenue, and student enrollment in real-time
- **Flexible Withdrawals**: Multiple payout options (Bank transfer, PayPal, Vodafone Cash)
- **Student Management**: See who enrolled, track progress, and communicate directly
- **Tax Reporting**: Automated financial reports for easy accounting
- **No Setup Fees**: Start teaching immediately with zero upfront costs

### For Students (Learn Anything 📚)
- **Wide Course Catalog**: Physics, Math, Chemistry, Computer Science, and more
- **Interactive Learning**: Live sessions, quizzes, assignments, and practice exams
- **Progress Tracking**: Monitor your learning journey and achievements
- **Flexible Payment**: Pay per course, monthly subscriptions, or semester packages
- **Student Reviews**: Read real feedback before enrolling
- **Mobile Friendly**: Learn on any device, anywhere, anytime
- **Certificates**: Earn certificates upon course completion

### Platform Technology 🤓
- **Frontend**: React 18 + Vite (blazing fast)
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion + AOS
- **Backend**: Firebase (Authentication, Realtime Database, Firestore)
- **Payments**: PayPal + Local Egyptian gateways (Fawry, Vodafone Cash)
- **Email**: EmailJS for notifications (200 free emails/month)

## 🏃 Quick Start (Let's Go!)

### Requirements
- Node.js 16.20.0+ (we support older versions too, you're welcome)
- npm 8.0.0+

### Installation (5 Minutes Max)

```bash
# 1. Clone this bad boy
git clone https://github.com/obieda-hussien/Nexus.git
cd Nexus

# 2. Install dependencies (grab a coffee ☕)
npm install

# 3. Fire up the dev server
npm run dev

# 4. Open browser and go to http://localhost:5173
```

### Build for Production

```bash
# Build it
npm run build

# Preview the build
npm run preview

# Or do both at once
npm run preview:build
```

### Available Scripts

| Command | What It Does |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run dev:open` | Start dev + auto-open browser |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🔥 Firebase Setup (Important!)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project or use existing one
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Enable **Realtime Database**

### Step 2: Get Your Config
```javascript
// Add to your .env file
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 3: Setup Firestore Rules
Go to Firestore Database → Rules and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Courses are public to read, auth required to write
    match /courses/{courseId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // User progress is private
    match /user_progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 4: Setup Realtime Database Rules
Go to Realtime Database → Rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid",
        "withdrawalHistory": {
          ".indexOn": ["requestedAt", "status", "amount"]
        }
      }
    },
    "courses": {
      ".read": "auth != null",
      ".indexOn": ["instructorId", "category", "price", "createdAt"]
    }
  }
}
```

## 💳 Payment Integration (Money Moves 💰)

### PayPal Integration
We've integrated PayPal for international payments with:
- Smart Payment Buttons (looks clean af)
- Sandbox testing environment
- Currency conversion (EGP → USD)
- Real-time course enrollment
- Instructor earnings tracking (90/10 split)

**Setup:**
```bash
# Add to .env
VITE_PAYPAL_CLIENT_ID=your_client_id
VITE_PAYPAL_CLIENT_SECRET=your_secret
VITE_PAYPAL_SANDBOX=true
```

### EmailJS for Notifications (100% FREE!)
Instead of paying for SendGrid ($15/month), we use EmailJS:
- 200 free emails/month
- Professional Arabic RTL templates
- Instructor payout notifications
- Course payment alerts
- Monthly earnings reports

**Savings: $180/year** 🎉

**Setup:**
```bash
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_EMAILJS_TEMPLATE_ID=your_template_id
```

### Local Egyptian Payment Gateways
- **Fawry**: 2% + 1 EGP per transaction
- **Vodafone Cash**: 1.5% (lowest fees!)
- **Bank Transfer**: 0% (completely free)

### Payment Fees Breakdown

| Gateway | Transaction Fee | Fixed Fee | Notes |
|---------|----------------|-----------|-------|
| PayPal | 3.5% | $0.15 | International |
| Stripe | 2.9% | $0.30 | Cards |
| Fawry | 2.0% | 1 EGP | Local Egypt |
| Vodafone Cash | 1.5% | 20 EGP max | Digital wallet |
| Bank Transfer | 0% | 0 | Manual verification |

## 🎓 Withdrawal System for Instructors

We built a complete earnings management system:

### Features
- **Payment Methods**: Bank accounts, PayPal, Vodafone Cash
- **Profit Calculator**: Auto-calculates after platform commission (10%) and tax (5%)
- **Transaction History**: Full tracking of all withdrawals
- **Auto Withdrawal**: Schedule monthly automatic payouts
- **Quick Withdraw**: Buttons for 25%, 50%, 75%, or full amount

### Earnings Breakdown
```
Course Price: 310 EGP
- Platform Fee (10%): -31 EGP
- Tax (5%): -15.5 EGP
= Instructor Gets: 263.5 EGP (85%)
```

### Processing Time
- **Vodafone Cash**: 1-2 business days
- **Bank Transfer**: 3-5 business days
- **PayPal**: 2-3 business days

## 📊 Project Structure (For Devs)

```
Nexus/
├── src/
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   └── Input.jsx
│   │   └── sections/               # Page sections
│   │       ├── Navigation.jsx      # Nav bar
│   │       ├── Hero.jsx            # Hero section
│   │       ├── Courses.jsx         # Course catalog
│   │       ├── Stats.jsx           # Statistics
│   │       ├── CompetitiveAdvantages.jsx
│   │       ├── LiveSessions.jsx    # Live streaming
│   │       ├── Instructor.jsx      # Instructor profiles
│   │       ├── TestimonialsReviews.jsx
│   │       ├── Pricing.jsx         # Pricing plans
│   │       └── Footer.jsx
│   ├── services/
│   │   ├── paymentGateways.js      # Payment processing
│   │   ├── emailNotifications.js   # Email service
│   │   ├── taxReporting.js         # Tax reports
│   │   └── firebase.js             # Firebase config
│   ├── hooks/
│   │   └── useAdSense.js           # Google AdSense hook
│   ├── styles/
│   │   └── index.css               # Global styles
│   └── App.jsx                     # Main app
├── public/                         # Static assets
├── firebase-rules-withdrawal.json  # Firebase rules
└── package.json
```

## 🚀 Deployment Options

### Vercel (Recommended - It's Free!)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# That's it! 🎉
```

### Netlify
```bash
# Build first
npm run build

# Drag & drop the `dist` folder to Netlify
# Or connect your GitHub repo for auto-deploys
```

### GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
{
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
npm run deploy
```

## 🎯 Strategic Development Plan

### Phase 1: Infrastructure (Months 1-2) ✅ DONE
- [x] Modern UI with glassmorphism
- [x] Firebase integration
- [x] Payment systems (PayPal, local gateways)
- [x] Withdrawal management
- [x] Email notifications

### Phase 2: Content Expansion (Months 2-4) 🔄 IN PROGRESS
- [ ] Add 50+ courses
- [ ] Multiple subject areas
- [ ] Different difficulty levels
- [ ] Video content library

### Phase 3: AI Integration (Months 3-5) 📅 PLANNED
- [ ] AI-powered recommendations
- [ ] Personalized learning paths
- [ ] Smart content suggestions
- [ ] Automated grading

### Phase 4: Community Features (Months 4-6) 📅 PLANNED
- [ ] Discussion forums
- [ ] Study groups
- [ ] Live Q&A sessions
- [ ] Student achievements & badges

## 💰 Business Model & ROI

### Investment Required (Year 1)
- Development: 500,000 EGP
- Marketing: 200,000 EGP
- Infrastructure: 100,000 EGP
- Content Creation: 300,000 EGP
- **Total: 1,100,000 EGP**

### Revenue Projections
- **Year 1**: 2,000,000 EGP (82% ROI)
- **Year 2**: 5,000,000 EGP (355% ROI)
- **Year 3**: 10,000,000 EGP (809% ROI)
- **Break-even**: Month 8

### Pricing Plans
```javascript
{
  basic: {
    monthly: 99,      // EGP
    semester: 450,    // 25% discount
    yearly: 800       // 33% discount
  },
  premium: {
    monthly: 199,
    yearly: 1600
  },
  enterprise: {
    custom: true,
    features: ['unlimited_users', 'custom_branding']
  }
}
```

## 🔧 Technical Details

### Performance Stats
- **Bundle Size**: 405KB (optimized!)
- **CSS**: 57KB (purged and compressed)
- **Load Time**: < 2 seconds
- **Lighthouse Score**: 90+ across the board

### Design System
```css
/* Color Palette (Dark Theme Supremacy) */
--primary-bg: #0a0a0a;
--secondary-bg: #1a1a1a;
--glass-bg: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.2);
--neon-blue: #00d4ff;
--neon-purple: #8b5cf6;
--neon-green: #10f566;
```

### Responsive Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 769px - 1024px
- **Desktop**: 1025px - 1440px
- **Large**: 1441px+

### Browser Support
- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Mobile browsers: ✅ Full support

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based auth
- **Firebase Rules**: Strict database access control
- **HTTPS Only**: All connections encrypted
- **Input Validation**: XSS & SQL injection protection
- **Rate Limiting**: API abuse prevention
- **Payment Security**: PCI-DSS compliant gateways

## 📈 Analytics & Tracking

### Google AdSense Integration
```javascript
// Already configured with:
Publisher ID: ca-pub-2807035108453262
Auto Ads: ✅ Ready
Manual Placement: ✅ Available
```

### User Analytics
- Course completion rates
- Student engagement metrics
- Revenue tracking
- Instructor performance
- Payment success rates

## 🐛 Troubleshooting (When Things Break)

### Firebase Permission Errors
**Error**: `Permission denied`
**Fix**: Update Firestore rules (see Firebase Setup section above)

### PayPal Button Not Loading
**Error**: Button won't show up
**Fix**: 
```bash
# Check your .env file has:
VITE_PAYPAL_CLIENT_ID=your_id
# Make sure it starts with "AQ" for sandbox
```

### Build Fails
**Error**: Build crashes during `npm run build`
**Fix**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### EmailJS Not Sending
**Error**: Emails not going through
**Fix**: 
1. Check your EmailJS dashboard
2. Verify service is active
3. Make sure you have emails remaining (200/month free)

### Node Version Issues
**Error**: `Node version incompatible`
**Fix**:
```bash
# Use nvm to switch versions
nvm use 16.20.0
# Or install Node 16+
```

## 🤝 Contributing (Join the Squad!)

We love contributions! Here's how to get involved:

1. **Fork the repo** (top right button)
2. **Create a branch**: `git checkout -b feature/your-cool-feature`
3. **Make your changes** (make it fire 🔥)
4. **Test everything**: `npm run lint && npm run build`
5. **Commit**: `git commit -m 'Add some fire feature'`
6. **Push**: `git push origin feature/your-cool-feature`
7. **Open a PR** (pull request)

### Contribution Guidelines
- Write clean, readable code
- Add comments where needed
- Test your changes
- Update docs if you add features
- Keep the Gen Z vibes alive

## 📞 Support & Community

### Get Help
- **Issues**: [GitHub Issues](https://github.com/obieda-hussien/Nexus/issues)
- **Discussions**: [GitHub Discussions](https://github.com/obieda-hussien/Nexus/discussions)
- **Email**: support@nexus-edu.com

### Stay Updated
- **Star this repo** ⭐ (seriously, it helps!)
- **Watch releases** 👀
- **Join our Discord** (coming soon!)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

TL;DR: Do whatever you want with it, just give credit where it's due.

## 👥 Team & Credits

### Core Team
- **Lead Dev**: [obieda-hussien](https://github.com/obieda-hussien)
- **Design**: Modern glassmorphism vibes
- **Content**: Physics & Math educators

### Built With Love Using
- React & Vite (speed demons)
- Tailwind CSS (utility class heaven)
- Firebase (backend without the backend)
- Framer Motion (smooth animations)
- A lot of coffee ☕ and late nights 🌙

### Special Thanks
- Open source community (you rock!)
- Egyptian students who inspired this
- Everyone who believed in the vision
- Stack Overflow (obviously)

---

## 🌟 Star History

If this project helped you, consider giving it a star! ⭐

It literally takes 2 seconds and makes us feel awesome 😎

---

<div align="center">

## 💪 Made with Power in Egypt 🇪🇬

**Nexus Educational Platform**

Disrupting traditional education, one student at a time.

[Website](https://obieda-hussien.github.io/Nexus/) • [Report Bug](https://github.com/obieda-hussien/Nexus/issues) • [Request Feature](https://github.com/obieda-hussien/Nexus/issues)

### We're just getting started! 🚀

</div>
