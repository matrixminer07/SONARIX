# SONARIX — AI-Powered Underwater Debris & Anomaly Detection Platform

SONARIX is an AI-assisted platform for automated detection of marine debris and unknown anomalies in side-scan sonar imagery. It helps survey operators, environmental teams, and AUV mission planners reduce manual review time and prioritize cleanup operations.

## 🎯 Features

- **Automated Debris Detection** — Classifies debris and marine objects directly from side-scan sonar imagery
- **Unknown Anomaly Flagging** — Surfaces patterns that don't fit known classes for human review
- **Geotagged Reporting** — Every export carries coordinates, timestamp, and sonar range
- **Confidence Scoring** — Every detection carries a confidence and anomaly score
- **Fast Human Verification** — Verify, reject, or mark uncertain in one click
- **Responsive Dashboard** — Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

### Demo Credentials
- **Username:** `admin`
- **Password:** `123456`

## 📁 Project Structure

```
SONARIX/
├── src/
│   └── app/
│       └── App.tsx          # Main React application (Dashboard)
├── sonarix-home.html        # Landing page
├── sonarix-login.html       # Authentication page
├── index.html               # Built React app entry point
├── dist/                    # Production build output
├── package.json
├── vite.config.ts
└── assets/                  # Videos, logos, images
    ├── backgoundintro.mp4   # Home page background video
    ├── login_bg.mp4         # Login page background video
    └── logo-*.png           # Logo variants
```

## 🔐 Authentication Flow

1. **Home Page** (`sonarix-home.html`) — Landing page with "Experience Sonarix" CTA
2. **Login Page** (`sonarix-login.html`) — Enter credentials (admin/123456)
3. **Dashboard** (`index.html`) — React-based mission control dashboard

Session stored in `localStorage` as `isLoggedIn`.

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + Lucide React icons
- **Charts:** Recharts
- **State:** React hooks (useState, useContext)
- **Notifications:** Sonner

## 📱 Responsive Design

- Mobile-first approach with breakpoints at 640px, 768px, 1024px, 1280px
- Touch-friendly controls (44px minimum tap targets)
- Fluid typography using `clamp()`
- Optimized video backgrounds (disabled on mobile for performance)
- Flexible grid layouts that adapt to screen size

## 🎨 Design System

CSS custom properties for theming:
```css
:root {
  --sx-abyss: #040a12;
  --sx-deep: #081826;
  --sx-panel: #0b1f30;
  --sx-teal: #2dd4bf;
  --sx-cyan: #67e8f9;
  --sx-amber: #f0b429;
  --sx-red: #e8615a;
  --sx-text: #e7f2f4;
  --sx-muted: #7d97a8;
}
```

## 📦 Building for Production

```bash
pnpm run build
```

Output goes to `dist/` directory.

## 📄 License

SIH 2026 MVP — Internal prototype