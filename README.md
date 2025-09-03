# Nexus - Modern Educational Platform

A cutting-edge educational platform designed specifically for Gen Z and Gen Alpha, featuring modern glassmorphism aesthetics, smooth animations, and intuitive UX for physics and mathematics education.

![Nexus Website](https://github.com/user-attachments/assets/1183a4c8-2e7d-4bef-a5bb-d4c63f8e84a9)

## 🎯 Project Overview

Nexus is a modern educational website that combines beautiful design with functionality, targeting the new generation of learners. The platform features:

- **Modern Glassmorphism Design**: Semi-transparent backgrounds with backdrop blur effects
- **Bilingual Support**: Complete RTL support for Arabic content with language toggle
- **Responsive Layout**: Mobile-first design optimized for all devices
- **Smooth Animations**: Framer Motion and AOS for engaging user interactions
- **Interactive Components**: Registration modals, course enrollment, and form validation

![Registration Modal](https://github.com/user-attachments/assets/8992d2f6-31d7-4139-871c-330c6fdcce2e)

## 🚀 Features

### Design & UX
- **Glassmorphism Effects**: Beautiful semi-transparent cards with backdrop blur
- **Gradient Overlays**: Dynamic color schemes with neon accents
- **Smooth Animations**: 60fps optimized animations using Framer Motion
- **Responsive Design**: Mobile-first approach with breakpoints for all devices
- **Dark Theme**: Modern dark interface with vibrant accent colors

### Functionality
- **Language Toggle**: Switch between English and Arabic with RTL support
- **Course Management**: Interactive course cards with enrollment functionality
- **Pricing Plans**: Three-tier pricing with registration modal
- **Statistics Counter**: Animated counters with scroll-triggered animations
- **Contact Integration**: Social media links and contact information
- **Newsletter Signup**: Email subscription with validation

### Accessibility
- **WCAG 2.1 AA Compliance**: Accessible design for all users
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Properly structured HTML with ARIA labels
- **High Contrast**: Sufficient color contrast ratios

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS 3.x with custom glassmorphism utilities
- **Animations**: Framer Motion + AOS (Animate On Scroll)
- **Icons**: Lucide React
- **Fonts**: Inter & Poppins from Google Fonts
- **Build Tool**: Vite for fast development and optimized builds

## 🏁 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/obieda-hussien/Nexus.git
   cd Nexus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 768px
- **Tablet**: 769px - 1024px  
- **Desktop**: 1025px - 1440px
- **Large Desktop**: 1441px+

## 🎨 Design System

### Color Palette
```css
:root {
  --primary-bg: #0a0a0a;
  --secondary-bg: #1a1a1a;
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --neon-blue: #00d4ff;
  --neon-purple: #8b5cf6;
  --neon-green: #10f566;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
}
```

### Typography
- **Primary Font**: Inter (UI Text)
- **Display Font**: Poppins (Headings)
- **Font Weights**: 300, 400, 500, 600, 700

## 📂 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   └── Input.jsx
│   └── sections/        # Page sections
│       ├── Navigation.jsx
│       ├── Hero.jsx
│       ├── Courses.jsx
│       ├── Stats.jsx
│       ├── Instructor.jsx
│       ├── Pricing.jsx
│       └── Footer.jsx
├── styles/
│   └── index.css        # Global styles & Tailwind imports
└── App.jsx              # Main application component
```

## 🌐 Deployment

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure custom domain (optional)

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Deploy automatically on push

### Deploy to GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run: `npm run deploy`

## 🚀 Performance Optimizations

- **Code Splitting**: Dynamic imports for lazy loading
- **Image Optimization**: WebP format with fallbacks
- **CSS Purging**: Unused CSS removed in production
- **Bundle Analysis**: Optimized chunk sizes
- **CDN Ready**: Static assets optimized for CDN delivery

## 🌍 Internationalization

The platform supports both English and Arabic with:
- **RTL Layout**: Complete right-to-left text direction
- **Dynamic Language Switching**: Toggle between languages
- **Localized Content**: All text content translated
- **Cultural Adaptation**: UI patterns adapted for MENA region

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Lead Developer**: [obieda-hussien](https://github.com/obieda-hussien)
- **Design**: Modern glassmorphism inspired by contemporary UI trends
- **Content**: Educational focus on physics and mathematics

## 🙏 Acknowledgments

- Inspired by modern educational platforms and glassmorphism design trends
- Built with love for the next generation of learners
- Special thanks to the open-source community for amazing tools and libraries

---

**Made with ❤️ in Egypt**
