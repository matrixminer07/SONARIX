# Plan: SONARIX Frontend Dashboard

## Context

The user provided the SONARIX frontend architecture document — a spec for a web dashboard that lets analysts upload side-scan sonar imagery, review AI-generated anomaly detections, verify/reject findings, and export structured reports. The existing project already has a "TideWatch" ocean-debris theme with a dark deep-ocean palette (background `#050a0e`, teal primary `#00e5c4`, JetBrains Mono + Inter + Roboto Slab) that is essentially perfect for SONARIX. We reuse those tokens as-is and build the full application on top of them.

---

## Aesthetic stance

**Stance:** Technical dark-ops / oceanographic instrument panel. Full commitment to the existing deep-ocean ground. No changes to `theme.css` — the tokens already map well:

| Token | Value | Role |
|---|---|---|
| `--background` | `#050a0e` | Page ground |
| `--primary` | `#00e5c4` | Teal accent, interactive |
| `--destructive` | `#ff3b3b` | Critical / reject |
| `--secondary` | `#112030` | Cards, panels |
| `--muted-foreground` | `#6a9db5` | Labels, captions |
| `--border` | `rgba(0,229,196,0.15)` | Hairline rules |
| `--radius` | `0rem` | Sharp corners throughout |

Fonts remain **Roboto Slab** (headings/numbers), **Inter** (body), **JetBrains Mono** (labels, data, status badges). No font changes needed.

---

## Architecture decisions

Since this is a Figma Make single-file environment, all logic lives in `src/app/App.tsx`. Navigation between pages is state-driven (`currentPage` + optional `jobId` params) rather than React Router (no router setup available). All data is realistic mock data — no API calls.

---

## Pages to implement

### 1. Login page
- Centered card on full dark background with SONARIX brand mark
- Email + Password fields, Login button
- Demo credentials hint: `analyst@sonarix.io / demo`
- On submit → transition to Dashboard

### 2. Dashboard page
- Top stat cards: Total Uploads, Active Jobs, Detections, Anomalies, Pending Reviews
- Recharts `AreaChart` for detection trend over 30 days
- Recharts `BarChart` for detections by class (mine, cable, UXO, wreck, unknown)
- Recent Jobs table with status badges
- Quick-action buttons: New Upload, View Reports

### 3. Upload page
- Drag-and-drop dropzone with visual feedback states (idle, hover, file-selected)
- Metadata form: Mission ID, Location (lat/lon), Depth (m), Sonar Type, Operator, Notes
- Validation: required fields highlighted, file type must be `.png/.jpg/.tiff`
- Submit button with simulated loading → success toast → navigates to Review

### 4. Review page
- Left: sonar image viewer (realistic monochrome gradient SVG simulating sonar data) with colored bounding boxes for each detection, click to select
- Right: Detection list with filter tabs (All / Verified / Rejected / Uncertain / Unreviewed)
- Bottom drawer (or right panel on wide screens): selected detection detail — class, confidence %, depth, coordinates, and action buttons (Verify ✓, Reject ✗, Uncertain ?, Add Comment)
- Badge colors: `--primary` teal = verified, `--destructive` red = rejected, orange = uncertain, gray = unreviewed

### 5. Reports page
- Filterable table: Job ID, Mission, Date, Detections, Status, Actions
- Download button per row (simulated)
- Export All button (top right)
- Empty state when no results match filter

### 6. Settings page
- Detection threshold slider (0.0–1.0)
- Class label management (editable chips for mine, cable, UXO, wreck, unknown)
- User role selector (Analyst / Reviewer / Admin)
- Theme toggle (dark — already dark)
- Save button with success toast

---

## Layout architecture

```
┌─────────────────────────────────────────────────────┐
│  Navbar: Logo | SONARIX | breadcrumb | user avatar  │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ Sidebar  │   Main content area                      │
│ (fixed   │   (scrollable, padded)                   │
│  left)   │                                          │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

- Mobile (< 1024px): sidebar collapses to hamburger drawer overlay
- Sidebar items: Dashboard, Upload, Review, Reports, Settings
- Active item highlighted with teal left border + teal text
- Login page has no sidebar/navbar

---

## Key components (all in-file)

- `Navbar` — top bar with logo, page title, notification bell, avatar
- `Sidebar` — collapsible navigation
- `StatCard` — icon + number + label + delta badge
- `SonarViewer` — SVG-based sonar image with overlay bounding boxes
- `DetectionList` — scrollable list with filter tabs
- `DetectionDetail` — selected detection panel with review actions
- `UploadDropzone` — drag-and-drop with file validation
- `MetadataForm` — controlled inputs with inline errors
- `ReportTable` — sortable/filterable jobs table
- `SettingsPanel` — grouped settings controls

---

## Mock data

Realistic mock: 
- 5 recent jobs with IDs like `JOB-2024-0892`, locations like `Gulf of Mexico 28.3°N 89.1°W`
- 12–28 detections per job, each with class, confidence, coordinates, depth, review status
- 30-day trend data for charts
- SVG sonar viewer: gradient radial fills in grayscale to simulate side-scan returns; bounding boxes colored by class

---

## Files to modify

| File | Change |
|---|---|
| `src/app/App.tsx` | Full replacement — complete SONARIX app |
| `src/styles/fonts.css` | No change (fonts already correct) |
| `src/styles/theme.css` | No change (tokens already perfect for SONARIX) |

---

## Verification

1. Login with `analyst@sonarix.io` → lands on Dashboard
2. Dashboard shows stat cards and two charts with realistic data
3. Click "New Upload" → Upload page with working dropzone and form validation
4. Submit upload → navigates to Review page for that job
5. In Review, click detections on sonar viewer and list; use Verify/Reject/Uncertain buttons
6. Navigate to Reports → table with download actions
7. Navigate to Settings → controls respond, Save shows toast
8. Mobile view (< 1024px): sidebar collapses, hamburger opens drawer
