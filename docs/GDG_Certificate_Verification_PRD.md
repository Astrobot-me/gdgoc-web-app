# GDG on Campus — Certificate Verification Platform
### Roorkee Institute of Technology, Roorkee

**Product Requirements Document**

| Field | Value |
|---|---|
| Version | 1.0.0 — Initial Release |
| Status | Draft — Pending Review |
| Tech Stack | Next.js 14 · Prisma · PostgreSQL · Zod · shadcn/ui |
| Author | GDG on Campus, RIT Roorkee |
| Community Page | [gdg.community.dev/gdg-on-campus-roorkee-institute-of-technology-roorkee-india](https://gdg.community.dev/gdg-on-campus-roorkee-institute-of-technology-roorkee-india) |

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas](#3-user-personas)
4. [Technical Architecture](#4-technical-architecture)
5. [Data Model](#5-data-model-prisma--postgresql)
6. [Routes & Endpoints](#6-routes--endpoints)
7. [Feature Specifications](#7-feature-specifications)
8. [Zod Validation Schemas](#8-zod-validation-schemas)
9. [Analytics & Data Visualisation](#9-analytics--data-visualisation)
10. [UX & Design Guidelines](#10-ux--design-guidelines)
11. [Security Considerations](#11-security-considerations)
12. [Development Milestones](#12-development-milestones)
13. [Environment Variables](#13-environment-variables)
14. [Out of Scope / Future](#14-out-of-scope-for-v1--future-considerations)
- [Appendix A — Excel Upload Format](#appendix-a--excel-upload-format)
- [Appendix B — Certificate Image Specification](#appendix-b--certificate-image-specification)

---

## 1. Product Overview

GDG on Campus at Roorkee Institute of Technology organises developer events, workshops, and hackathons throughout the academic year. Today, certificate distribution is manual and verification depends entirely on trust — there is no automated mechanism for employers or peers to confirm whether a certificate is genuine.

This document specifies a full-stack **Certificate Verification Platform** built with Next.js 14, Prisma ORM, PostgreSQL, Zod schema validation, and shadcn/ui. The platform eliminates certificate fraud, streamlines admin operations, and adds an analytics layer that gives chapter leads actionable insights into event participation and engagement.

> **Community Link**
> All certificate links, verification QR codes, and the public landing page carry a redirect to the official GDG chapter page:
> https://gdg.community.dev/gdg-on-campus-roorkee-institute-of-technology-roorkee-india

---

## 2. Goals & Success Metrics

### 2.1 Primary Goals

- Provide a publicly accessible URL for instant certificate authenticity checks
- Give chapter admins a protected dashboard to manage events and bulk-upload participant data
- Generate certificate images on the fly using server-side canvas rendering — no static images stored in the database
- Visualise event and participation analytics for chapter organisers
- Redirect all public touchpoints to the official GDG chapter community page

### 2.2 Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Verification page load time | < 800 ms p95 | Vercel Analytics |
| Certificate image generation | < 400 ms per request | Server timing headers |
| Admin bulk upload (1 000 rows) | < 10 s end-to-end | Timer in UI |
| Invalid certificate false-positive rate | 0% | QA testing |
| Uptime | > 99.5% | Uptime monitor |

---

## 3. User Personas

### 3.1 Chapter Admin
- **Audience:** GDG on Campus lead organisers and co-leads
- **Goal:** Create events, upload participant Excel sheets, monitor engagement via analytics
- **Frequency:** Regular — every event cycle

### 3.2 Certificate Holder (Participant)
- **Audience:** Students and developers who attended events
- **Goal:** Share their certificate URL with employers or on LinkedIn
- **Frequency:** One-off — typically when applying for jobs or internships

### 3.3 Verifier (Third Party)
- **Audience:** Recruiters, professors, hackathon organisers
- **Goal:** Instantly confirm that a certificate is genuine
- **Frequency:** Ad hoc

---

## 4. Technical Architecture

### 4.1 Stack Summary

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Components, Route Handlers) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL 15 via Prisma ORM |
| Validation | Zod — all API inputs and form data |
| UI Library | shadcn/ui (Radix primitives + Tailwind CSS) |
| Auth | NextAuth.js v5 — credentials provider (admin only) |
| Image Generation | node-canvas / @napi-rs/canvas — server-side, per-request |
| File Parsing | xlsx (SheetJS) — Excel upload processing |
| Charts / Analytics | Recharts — embedded in React Server Components |
| Hosting | Vercel (edge-optimised) + Neon / Supabase PostgreSQL |
| Styling | Tailwind CSS + CSS Variables via shadcn/ui theme |

### 4.2 Folder Structure

```
app/
  (auth)/login/           — admin sign-in page
  admin/
    events/               — event list + create
    events/[eventId]/     — event detail, upload, analytics
    events/[eventId]/certificates/[certId]/   — certificate detail
  verify/[certId]/        — public verification page
  page.tsx                — public landing page (GDG redirect)

api/
  admin/events/           — CRUD for events
  admin/events/[id]/upload    — Excel bulk import
  certificate/[certId]/image  — dynamic image generation (GET)
  verify/[certId]         — public verification JSON

prisma/schema.prisma      — data models
lib/                      — db client, auth, canvas util, zod schemas
components/               — shared shadcn/ui components
```

---

## 5. Data Model (Prisma + PostgreSQL)

### 5.1 Events Table

```prisma
model Event {
  id          String        @id @default(cuid())
  name        String
  description String?
  eventDate   DateTime
  venue       String?
  bannerUrl   String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  certificates Certificate[]
}
```

| Column | Type | Description |
|---|---|---|
| id | UUID (PK) | Auto-generated primary key (cuid) |
| name | String | Event display name |
| description | String? | Optional markdown description |
| eventDate | DateTime | Date of the event |
| venue | String? | Physical or virtual venue name |
| bannerUrl | String? | Optional external banner image URL |
| createdAt | DateTime | Record creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| certificates | Certificate[] | Relation — one event has many certificates |

### 5.2 Certificates Table

```prisma
model Certificate {
  id          String    @id
  eventId     String
  holderName  String
  rollNumber  String
  branch      String
  issuedAt    DateTime  @default(now())
  revokedAt   DateTime?
  createdAt   DateTime  @default(now())
  event       Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
}
```

| Column | Type | Description |
|---|---|---|
| id | String (PK) | Unique certificate ID — used in public URL |
| eventId | String (FK) | References Event.id |
| holderName | String | Participant full name (from Excel) |
| rollNumber | String | University roll number |
| branch | String | Academic branch (e.g., CSE, IT, ECE) |
| issuedAt | DateTime | Certificate issue date |
| revokedAt | DateTime? | Null unless admin revokes certificate |
| createdAt | DateTime | Record creation timestamp |
| event | Event | Relation back to Event |

> **Design Note — No Image Storage**
> Certificate images are generated on every `GET /api/certificate/[certId]/image` request using node-canvas. The database stores only text data. This eliminates storage costs, keeps the schema simple, and ensures the certificate image always reflects the latest event and holder details.

### 5.3 Admin Model (NextAuth)

Admin credentials are stored separately via NextAuth with a credentials provider. For simplicity in v1, a single admin account is seeded via environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`). In v2, this can be extended to a full `Admin` table with invite flows.

---

## 6. Routes & Endpoints

### 6.1 Public Routes

| Route | Method | Description |
|---|---|---|
| `/` | GET | Landing page — GDG chapter info, stats, redirect to community page |
| `/verify/[certId]` | GET | Public certificate verification page (HTML) |
| `/api/verify/[certId]` | GET | Public verification JSON — used by third-party integrations |
| `/api/certificate/[certId]/image` | GET | Server-rendered PNG certificate image |

### 6.2 Protected Admin Routes

| Route | Method | Description |
|---|---|---|
| `/admin/events` | GET | List all events with cert counts and analytics summary |
| `/api/admin/events` | POST | Create a new event |
| `/api/admin/events/[id]` | PATCH | Update event details |
| `/api/admin/events/[id]` | DELETE | Delete event and all its certificates |
| `/api/admin/events/[id]/upload` | POST | Bulk upload Excel — parses and upserts certificates |
| `/admin/events/[eventId]/certificates/[certId]` | GET | Certificate detail with preview, revoke action |
| `/api/admin/certificates/[certId]/revoke` | POST | Soft-revoke a certificate (sets revokedAt) |

> **Auth Guard**
> All `/admin/*` page routes and `/api/admin/*` route handlers are wrapped by NextAuth middleware. Unauthenticated requests to admin paths are redirected to `/auth/login`. API routes return HTTP `401` with a JSON error body.

---

## 7. Feature Specifications

### 7.1 Public Landing Page `/`

The root page serves as the public face of the GDG chapter on campus. It is a statically generated (ISR) page with a 24-hour revalidation window.

**Content Sections:**
- **Hero section** — GDG on Campus branding, chapter name, institution name
- **About section** — brief description of GDG on Campus mission and the RIT Roorkee chapter
- **Stats strip** — total events hosted, total certificates issued, total participants (fetched from DB at build time)
- **Upcoming / recent events feed** — last 3 events with date, name, and participant count
- **Prominent CTA button** — "Visit our Community Page" linking externally to the official GDG community URL
- **Footer** — GDG logo, social links, copyright

---

### 7.2 Public Certificate Verification `/verify/[certId]`

This is the most performance-critical public page. It must render under 800 ms at the 95th percentile.

**Valid Certificate:**
- Green verification banner: "Certificate Verified" with a checkmark icon
- Holder name, roll number, branch, event name, event date, issued date
- Embedded certificate image (loaded from `/api/certificate/[certId]/image`)
- Event description and venue
- QR code that links back to the same `/verify/[certId]` URL
- Share button — copies verification URL to clipboard
- "Powered by GDG on Campus, RIT Roorkee" footer with redirect to community page

**Invalid / Revoked Certificate:**
- Red error banner with clear language: "Certificate Not Found" or "Certificate Revoked"
- Revocation reason is not exposed publicly — only "This certificate has been revoked" is shown
- Link to contact the GDG chapter for disputes

---

### 7.3 Admin Login `/auth/login`

- Email + password form using shadcn/ui `Form` and `Input` components
- Zod schema validation on client and server
- Error state: "Invalid credentials" toast notification
- Redirects to `/admin/events` on success
- Session stored in a secure HTTP-only cookie via NextAuth

---

### 7.4 Admin Events Dashboard `/admin/events`

**Events Table:**
- Columns: Event Name, Date, Venue, Total Certificates, Actions
- Sortable by date and certificate count
- Search / filter by event name
- Pagination (20 events per page)

**Create Event Modal:**
- Fields: Name (required), Date (required), Venue (optional), Description (optional)
- Validated with Zod on submit — inline field errors
- On success: event appears in the table without full page reload (optimistic update)

**Analytics Summary Cards:**
- Total events count
- Total certificates issued
- Total unique participants (by roll number)
- Most active branch (branch with highest certificate count)

---

### 7.5 Admin Event Detail `/admin/events/[eventId]`

**Certificate Table:**
- Columns: Certificate ID, Holder Name, Roll Number, Branch, Issued At, Status (Active / Revoked), Actions
- Inline search by name or roll number
- CSV export of all certificates for the event

**Excel Upload Panel:**
- Drag-and-drop or click-to-select `.xlsx` / `.xls` / `.csv` upload
- Expected columns: `Credential ID`, `Name`, `Branch`, `Roll Number` (case-insensitive header matching)
- Preview table shows first 10 rows before committing
- Validation: duplicate certificate IDs within same event are rejected with row-level error messages
- Progress indicator during upload
- Post-upload summary: X inserted, Y updated, Z errors

**Event Analytics Charts (Recharts):**
- **Certificates per Branch** — horizontal bar chart, colour-coded by branch
- **Certificates issued over time** — line chart grouped by day
- **Certificate status breakdown** — donut chart (Active vs Revoked)
- **Verification activity** — line chart of `/verify` requests over the last 30 days

---

### 7.6 Admin Certificate Detail `/admin/events/[eventId]/certificates/[certId]`

- Full certificate image preview (rendered via `/api/certificate/[certId]/image`)
- Metadata panel: all certificate fields, event details
- Revoke / Restore toggle with confirmation dialog
- Copy verification link button
- Download certificate image button

---

### 7.7 Server-Side Certificate Image Generation

> **Key Design Decision**
> Images are generated entirely on the server on every request. There is no image field in the database. The Route Handler at `/api/certificate/[certId]/image` queries PostgreSQL for certificate + event data, draws the certificate on a `node-canvas`, and streams the result back as `image/png` with `Cache-Control: public, max-age=3600` so repeat requests are served from edge cache rather than re-rendering.

**Certificate Canvas Layout (1200 × 850 px):**
- Background: white canvas with a decorative Google-colour border strip
- GDG logo top-left, chapter name top-right
- Large centred heading: "Certificate of Participation" or "Certificate of Completion"
- Body text: *"This is to certify that [Holder Name] of [Branch], Roll No. [Roll No.] participated in [Event Name] held on [Event Date]."*
- Certificate ID in monospace font, bottom-left, small
- Decorative QR code bottom-right linking to `/verify/[certId]`
- GDG on Campus watermark diagonally across the certificate at low opacity

**Performance Considerations:**
- Font files loaded once at module initialisation — not per request
- Edge `Cache-Control` headers ensure CDN caches the image for 1 hour
- If the certificate is revoked, the image endpoint returns `404` (no image served for revoked certs)

---

## 8. Zod Validation Schemas

```ts
// Event creation
const CreateEventSchema = z.object({
  name: z.string().min(3),
  eventDate: z.coerce.date(),
  venue: z.string().optional(),
  description: z.string().optional(),
});

const UpdateEventSchema = CreateEventSchema.partial();

// Excel row
const ExcelRowSchema = z.object({
  credentialId: z.string().min(1),
  holderName: z.string().min(1),
  rollNumber: z.string().min(1),
  branch: z.string().min(1),
});

const BulkUploadSchema = z.array(ExcelRowSchema).min(1).max(5000);

// Admin auth
const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// URL param
const CertIdParamSchema = z.object({
  certId: z.string().min(1).max(100).regex(/^[a-zA-Z0-9-]+$/),
});
```

| Schema | Fields |
|---|---|
| `CreateEventSchema` | name (min 3), eventDate (date), venue? (string), description? (string) |
| `UpdateEventSchema` | `Partial<CreateEventSchema>` |
| `ExcelRowSchema` | credentialId (min 1), holderName (min 1), rollNumber (min 1), branch (min 1) |
| `BulkUploadSchema` | `z.array(ExcelRowSchema)` (min 1, max 5 000) |
| `AdminLoginSchema` | email (z.email()), password (min 8) |
| `CertIdParamSchema` | certId (min 1, max 100, alphanumeric + hyphens) |

---

## 9. Analytics & Data Visualisation

### 9.1 Admin-Level Metrics

All charts are rendered as React Server Components using Recharts and hydrated on the client for interactivity. Data is fetched directly from Prisma queries — no separate analytics service in v1.

| Chart | Type | Data Source |
|---|---|---|
| Certificates per Branch | Horizontal Bar | `GROUP BY branch` on Certificates |
| Certificates Issued Over Time | Line Chart | `GROUP BY DATE(issuedAt)` |
| Status Breakdown | Donut Chart | Count active vs. `revokedAt IS NOT NULL` |
| Events per Month | Bar Chart | `GROUP BY MONTH(eventDate)` on Events |
| Top Events by Participation | Ranked List | `COUNT` certificates per event, top 5 |

### 9.2 Export

- CSV export of all certificates per event (available in event detail page)
- JSON export via `/api/admin/events/[id]/export` route (protected)

---

## 10. UX & Design Guidelines

### 10.1 Design System

- UI library: **shadcn/ui** with the default Zinc theme, overridden with GDG Google-brand accent colours
- Primary: `#4285F4` (Google Blue), Secondary: `#34A853` (Google Green), Warning: `#FBBC04`, Destructive: `#EA4335`
- Typography: Inter for UI, monospace for certificate IDs and code snippets
- All interactive elements have keyboard focus rings and `aria-label`s for accessibility (WCAG 2.1 AA target)

### 10.2 Responsive Layout

- Admin dashboard: sidebar navigation on desktop, bottom tab bar on mobile
- Verification page: single-column stacked layout, certificate image scaled to viewport width
- Landing page: full-width hero, responsive 2-column stats, single-column on mobile

### 10.3 State & Feedback

- shadcn/ui `Toast` notifications for all async operations (success and error)
- Skeleton loaders for tables and charts during data fetching
- Optimistic UI updates for event creation and certificate revocation
- Confirmation dialogs (`AlertDialog`) for destructive actions — delete event, revoke certificate

---

## 11. Security Considerations

- All `/admin/*` routes checked by NextAuth middleware — server-side session validation
- CSRF protection via NextAuth built-in CSRF token
- Zod validation on every API route input — rejects malformed data before DB access
- Certificate IDs use `cuid2` — non-sequential, collision-resistant, URL-safe
- Password stored as bcrypt hash (cost factor 12) — never plain text
- Excel uploads limited to 10 MB; MIME type and extension validated before parsing
- Rate limiting on `/api/verify/*` to prevent scraping (10 req/s per IP, via Vercel Edge Middleware)
- Revoked certificates return valid verification page with revoked status — they are NOT deleted, preserving audit trail

---

## 12. Development Milestones

| Phase | Timeline | Deliverables |
|---|---|---|
| 1 | Week 1–2 | Project scaffold, Prisma schema, DB migrations, NextAuth setup, admin login |
| 2 | Week 3–4 | Admin events CRUD, Excel bulk upload with Zod validation, event list page |
| 3 | Week 5 | Server-side certificate image generation with node-canvas |
| 4 | Week 6 | Public verification page, QR code, share functionality |
| 5 | Week 7 | Analytics charts (Recharts), stats cards, CSV export |
| 6 | Week 8 | Landing page, GDG redirect, responsive polish, accessibility pass |
| 7 | Week 9 | Security hardening, rate limiting, end-to-end testing, staging deploy |
| 8 | Week 10 | Production deploy, seed data, chapter handoff and documentation |

---

## 13. Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Prisma) |
| `NEXTAUTH_SECRET` | NextAuth JWT signing secret (min 32 chars) |
| `NEXTAUTH_URL` | Canonical base URL for NextAuth callbacks |
| `ADMIN_EMAIL` | Seeded admin email address |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of admin password |
| `NEXT_PUBLIC_APP_URL` | Public base URL — used in QR codes and share links |
| `GDG_COMMUNITY_URL` | Official GDG chapter page URL (for redirects) |

---

## 14. Out of Scope for v1 / Future Considerations

- Multi-admin support with role-based permissions (v2)
- Email delivery of certificates to participants (v2)
- WhatsApp / LinkedIn share deep links for certificates (v2)
- QR code scanning via mobile camera on the verification page (v2)
- Certificate template customisation per event (v2)
- Public event listing page for non-admin visitors (v2)
- Verification request logging and analytics (v2)
- Integration with GDG Bevy API for auto-importing events (v3)

---

## Appendix A — Excel Upload Format

The admin bulk-upload feature accepts `.xlsx`, `.xls`, and `.csv` files. The first row must be a header row. Column names are matched **case-insensitively**.

| Credential ID | Name | Branch | Roll Number |
|---|---|---|---|
| GDG-2024-001 | Aarav Sharma | CSE | 21CS001 |
| GDG-2024-002 | Priya Singh | IT | 21IT045 |
| GDG-2024-003 | Rohit Verma | ECE | 21EC012 |

> Additional columns in the file are ignored. Missing required columns will cause the entire upload to be rejected with a descriptive error.

---

## Appendix B — Certificate Image Specification

| Property | Value |
|---|---|
| Canvas size | 1200 × 850 px |
| Format | PNG (lossless) |
| Background | White (`#FFFFFF`) |
| Border | 4 px Google-colour strip (Blue / Red / Yellow / Green) |
| Primary font | Inter Bold — loaded from `/public/fonts` at startup |
| Body font | Inter Regular |
| Certificate ID font | JetBrains Mono — monospace for easy reading |
| QR code | Bottom-right, 120 × 120 px, links to `/verify/[certId]` |
| Cache-Control | `public, max-age=3600, stale-while-revalidate=86400` |
| Revoked state | `404 Not Found` — no image generated for revoked certificates |

---

*GDG on Campus — Roorkee Institute of Technology, Roorkee, India*
*https://gdg.community.dev/gdg-on-campus-roorkee-institute-of-technology-roorkee-india*
