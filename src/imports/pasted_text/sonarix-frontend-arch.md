Below is the **final frontend architecture document** for **SONARIX**, structured as a complete, implementation-ready specification. It consolidates the PRD, SRS, UI/UX, and architecture decisions into one clear frontend requirements document that your team can use to start building immediately.

***

# SONARIX Frontend Architecture & Requirements Document

## 1. Product overview

SONARIX is a web-based dashboard for detecting man-made debris and unknown anomalies in side-scan sonar imagery. The frontend must enable users to upload sonar images, inspect AI-generated detections, verify or reject findings, and export structured reports. The interface should be clean, responsive, and focused on the sonar image as the primary visual element. [nature](https://www.nature.com/articles/s41598-025-33164-7)

## 2. Frontend goals

- Provide a modern, responsive dashboard for sonar analysis.
- Support upload, review, and export workflows end-to-end.
- Display detections with confidence and anomaly indicators.
- Enable human verification and review actions.
- Work smoothly on desktop, tablet, and mobile.
- Be fast to implement using React + Tailwind + daisyUI. [medium](https://medium.com/@monicasaidasarajusridhar/building-a-responsive-dashboard-ui-using-react-and-tailwindcss-deb9cce4b0e9)

## 3. Tech stack

- **Framework:** React 18+ with TypeScript.
- **Build tool:** Vite.
- **Styling:** Tailwind CSS.
- **Component library:** daisyUI .
- **Routing:** React Router.
- **State management:** React Context or Zustand.
- **HTTP client:** Axios or fetch wrapper.
- **Icons:** Lucide React or Heroicons.
- **Form handling:** React Hook Form or controlled inputs.
- **Deployment:** Vercel or Netlify.

This stack is optimal for rapid hackathon development and responsive dashboards. [medium](https://medium.com/@monicasaidasarajusridhar/building-a-responsive-dashboard-ui-using-react-and-tailwindcss-deb9cce4b0e9)

## 4. Project structure

Use a feature-based folder layout:

```
sonarix-frontend/
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ AppRoutes.tsx
│  │  └─ providers/
│  ├─ features/
│  │  ├─ auth/
│  │  │  ├─ components/
│  │  │  ├─ hooks/
│  │  │  └─ types.ts
│  │  ├─ dashboard/
│  │  │  ├─ components/
│  │  │  └─ DashboardPage.tsx
│  │  ├─ upload/
│  │  │  ├─ components/
│  │  │  ├─ hooks/
│  │  │  └─ UploadPage.tsx
│  │  ├─ review/
│  │  │  ├─ components/
│  │  │  ├─ hooks/
│  │  │  └─ ReviewPage.tsx
│  │  ├─ reports/
│  │  │  ├─ components/
│  │  │  └─ ReportsPage.tsx
│  │  └─ settings/
│  │     ├─ components/
│  │     └─ SettingsPage.tsx
│  ├─ shared/
│  │  ├─ components/
│  │  │  ├─ Layout.tsx
│  │  │  ├─ Navbar.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  ├─ Button.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ Badge.tsx
│  │  │  ├─ Modal.tsx
│  │  │  └─ Toast.tsx
│  │  ├─ hooks/
│  │  ├─ api/
│  │  ├─ types/
│  │  └─ utils/
│  ├─ assets/
│  ├─ styles/
│  │  └─ index.css
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ index.html
├─ tailwind.config.js
├─ tsconfig.json
└─ package.json
```

This structure keeps features isolated and scalable. [gist.github](https://gist.github.com/joshcoolman-smc/07cce265a0e79c310fdaf23b006abbf4)

## 5. Routing

Define these routes:

- `/login` → Login page.
- `/dashboard` → Dashboard overview.
- `/upload` → Upload sonar image.
- `/review/:jobId` → Review detections for a job.
- `/reports` → Report list and exports.
- `/settings` → Settings page.

Wrap authenticated routes in a `ProtectedRoute` component.

## 6. Layout architecture

- **Navbar:** top bar with logo, project name, user menu, and theme toggle.
- **Sidebar:** left navigation with Dashboard, Upload, Review, Reports, Settings.
- **Main content area:** page content.

On desktop, show sidebar and navbar together. On mobile, collapse sidebar into a drawer. This pattern is standard for responsive dashboards and works well with Tailwind and daisyUI. [medium](https://medium.com/@monicasaidasarajusridhar/building-a-responsive-dashboard-ui-using-react-and-tailwindcss-deb9cce4b0e9)

## 7. Page requirements

### Login page
- Email/username field.
- Password field.
- Login button.
- Optional forgot password link.
- Minimal centered card layout.

### Dashboard page
- Summary cards for uploads, jobs, detections, anomalies, pending reviews.
- Recent activity list.
- Quick action buttons.

### Upload page
- Drag-and-drop file area.
- Metadata form fields.
- Validation feedback.
- Submit button with loading state.

### Review page
- Large sonar image viewer.
- Detection list with filters.
- Detail panel for selected detection.
- Review actions: verify, reject, uncertain, comment.

### Reports page
- Table of exports with filters.
- Download actions.

### Settings page
- Thresholds, class labels, user roles, theme.

## 8. Component requirements

### Shared components
- `Layout`
- `Navbar`
- `Sidebar`
- `Card`
- `Button`
- `Badge`
- `Modal`
- `Toast`
- `EmptyState`
- `Skeleton`

### Feature components
- `DashboardCards`
- `UploadDropzone`
- `MetadataForm`
- `SonarViewer`
- `DetectionList`
- `DetectionDetail`
- `ReviewActions`
- `ReportTable`

Use daisyUI components as the base and customize with Tailwind classes .

## 9. State management

Global state for:
- Auth state.
- Current user.
- Theme preference.
- Toast notifications.

Feature state for:
- Upload progress.
- Review filters.
- Detection selection.

Use React Context or Zustand for lightweight state. Avoid heavy Redux-like setups for MVP. [gist.github](https://gist.github.com/joshcoolman-smc/07cce265a0e79c310fdaf23b006abbf4)

## 10. API integration

Create an API layer in `src/shared/api`:

- `apiClient`: configured Axios or fetch wrapper.
- `authApi`: login, logout, user info.
- `uploadApi`: upload file, get job status.
- `reviewApi`: get detections, update review status.
- `reportApi`: list reports, export report.

Each feature should call these API functions rather than making raw fetch calls directly in components. [gist.github](https://gist.github.com/joshcoolman-smc/07cce265a0e79c310fdaf23b006abbf4)

## 11. Form requirements

Use controlled inputs or React Hook Form. Validate:
- Required fields.
- File type and size.
- Coordinate format.
- Numeric ranges.

Show inline errors and disable submit during processing. Use daisyUI form components for consistent styling. [medium](https://medium.com/@monicasaidasarajusridhar/building-a-responsive-dashboard-ui-using-react-and-tailwindcss-deb9cce4b0e9)

## 12. Loading, error, and empty states

- Use skeleton cards for dashboard and tables.
- Use spinners or progress bars for uploads and processing.
- Show clear error messages for failed actions.
- Use friendly empty states for no data scenarios.

This improves UX and makes the app feel polished even with limited data. [medium](https://medium.com/@monicasaidasarajusridhar/building-a-responsive-dashboard-ui-using-react-and-tailwindcss-deb9cce4b0e9)

## 13. Responsive requirements

- Use Tailwind breakpoints for responsive layout.
- Hide sidebar on small screens and show a drawer.
- Stack panels vertically on mobile.
- Keep the sonar viewer usable on all screen sizes.

Design mobile-first where possible, then enhance for larger screens. [medium](https://medium.com/@monicasaidasarajusridhar/building-a-responsive-dashboard-ui-using-react-and-tailwindcss-deb9cce4b0e9)

## 14. Accessibility requirements

- Use semantic HTML.
- Ensure keyboard navigation works.
- Provide visible focus states.
- Maintain good color contrast.
- Label all interactive elements.
- Do not rely on color alone for meaning.

daisyUI components are built with accessibility in mind, which helps here .

## 15. Styling and design system

Use Tailwind utility classes for most styling. Define in `tailwind.config.js`:

- Font family.
- Font sizes.
- Colors for primary, secondary, success, warning, error.
- Spacing scale.
- Border radius.

Keep custom CSS minimal. Use daisyUI themes for light and dark mode support. [gist.github](https://gist.github.com/joshcoolman-smc/07cce265a0e79c310fdaf23b006abbf4)

## 16. Deployment requirements

- Build the app with `npm run build`.
- Deploy to Vercel or Netlify.
- Configure environment variables for API base URL.
- Test the live build before demo.

This setup is fast and reliable for hackathon demos. [medium](https://medium.com/@monicasaidasarajusridhar/building-a-responsive-dashboard-ui-using-react-and-tailwindcss-deb9cce4b0e9)

## 17. Definition of done for frontend

A frontend feature is done only if:
- It works in the live demo path.
- It is responsive on desktop and mobile.
- It has validation and error handling.
- It is connected to the backend or a stable mock.
- It is testable by a judge without manual intervention.
- It has no blocking bugs.
- It is documented enough for the team to maintain.

## 18. Final frontend architecture summary

The best frontend architecture for SONARIX is:
- React + TypeScript + Vite.
- Tailwind CSS + daisyUI for responsive UI.
- Feature-based folder structure.
- Simple global state and API layer.
- Clean layout with navbar, sidebar, and content area.
- Responsive, accessible, and implementation-ready design. [medium](https://medium.com/@monicasaidasarajusridhar/building-a-responsive-dashboard-ui-using-react-and-tailwindcss-deb9cce4b0e9)

***

If you want, I can next generate a **starter code template** with the main folders, routes, and key components already set up so you can start coding immediately.