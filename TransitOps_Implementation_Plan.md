# TransitOps — Smart Transport Operations Platform
### Implementation Plan for AI Coding Agent & Team

**Event:** Odoo Hackathon (8-hour build)
**Team:** 3 members — 1 Frontend/UI, 2 Backend/API
**This document is the single source of truth.** The AI coding agent implementing the frontend should follow it phase by phase, in order, without skipping any item. Backend teammates should use Section 6 (API Contract) and Section 5 (Data Models) as their build spec so both sides integrate without renegotiation mid-hackathon.

---

## 1. Objective

Build **TransitOps**, a centralized web platform that digitizes the full lifecycle of transport operations — vehicle registry, driver management, trip dispatching, maintenance, and fuel/expense tracking — while automatically enforcing business rules (license validity, capacity limits, status transitions) and surfacing operational insights via a dashboard and reports.

**Design intent:** The reference mockup (image provided) shows *what data and workflows* are required — it is a wireframe, not the target visual style. The actual UI must look like a **polished, modern SaaS product** (Linear / Vercel / Stripe-dashboard tier), not a hackathon wireframe. Same features, different visual language.

## 2. Success Criteria

- [ ] Every mandatory feature in Section 3 of the original brief is implemented and demoable.
- [ ] Every business rule in Section 7 of this document is enforced in the UI (not just visually implied).
- [ ] The Example Workflow (Section 10) runs start-to-finish without errors in the live demo.
- [ ] Frontend and backend integrate with zero last-hour surprises because both built against the same contract (Section 6).
- [ ] UI is responsive and role-aware (Section 8).

## 3. Role Naming Clarification (read this first)

The original brief's Section 2 ("Target Users") calls one role **"Driver"** but describes dispatcher behavior: *"Creates trips, assigns vehicles and drivers, monitors active deliveries."* The reference mockup correctly renames this role **Dispatcher** in its Settings/RBAC screen. This plan uses the mockup's naming since it matches the actual permission matrix:

| Role | Real responsibility |
|---|---|
| **Fleet Manager** | Vehicle lifecycle, maintenance, fleet efficiency |
| **Dispatcher** | Creates & manages trips, assigns vehicles/drivers |
| **Safety Officer** | Driver compliance, license validity, safety scores |
| **Financial Analyst** | Expenses, fuel cost, maintenance cost, profitability/ROI |

---

## 4. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18 + Vite + TypeScript | Fast HMR, strict typing keeps contract violations visible at compile time |
| Styling | Tailwind CSS + shadcn/ui | Themeable, avoids "default Bootstrap" look |
| Routing | React Router v6 | Nested routes for role-guarded layout |
| Forms/Validation | React Hook Form + Zod | Shared Zod schemas double as the mock-API's validation layer |
| State | Zustand (or Context if team prefers) | One store per domain entity, see Section 9 |
| Charts | Recharts | Dashboard + Reports |
| Dates | date-fns | License expiry, trip timestamps |
| HTTP | fetch wrapped in `services/api.ts` | Swappable base client — mock now, real later |

> If the backend teammates are building in a different stack (Django/Node/Odoo modules), that's fine — Section 6 is stack-agnostic; only the JSON shapes matter.

---

## 5. Data Models

All frontend state and mock API responses conform to these shapes. Backend should mirror field names and types exactly to avoid mapping code.

```typescript
// ---- Enums ----
type UserRole = "FleetManager" | "Dispatcher" | "SafetyOfficer" | "FinancialAnalyst";
type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";
type DriverStatus = "Available" | "On Trip" | "Off Duty" | "Suspended";
type TripStatus = "Draft" | "Dispatched" | "Completed" | "Cancelled";
type MaintenanceStatus = "Active" | "Completed";
type ExpenseType = "Toll" | "Misc" | "Maintenance";

// ---- Core Entities ----
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO
}

interface Vehicle {
  id: string;
  registrationNumber: string; // UNIQUE — enforced client + server
  name: string;               // e.g. "Van-05"
  type: string;                // "Van" | "Truck" | "Mini" | custom
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region?: string;             // used by dashboard filter
  createdAt: string;
  updatedAt: string;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;     // e.g. "LMV", "HMV"
  licenseExpiryDate: string;   // ISO date
  contactNumber: string;
  safetyScore: number;         // 0-100
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

interface Trip {
  id: string;
  tripCode: string;            // e.g. "TR001"
  source: string;
  destination: string;
  vehicleId: string | null;
  driverId: string | null;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  actualDistanceKm?: number;   // filled on completion
  fuelConsumedLiters?: number; // filled on completion
  status: TripStatus;
  dispatchedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType: string;         // "Oil Change", "Engine Repair"...
  cost: number;
  date: string;
  status: MaintenanceStatus;
  notes?: string;
}

interface FuelLog {
  id: string;
  vehicleId: string;
  tripId?: string;
  liters: number;
  cost: number;
  date: string;
}

interface Expense {
  id: string;
  tripId?: string;
  vehicleId?: string;
  type: ExpenseType;
  amount: number;
  date: string;
}
```

---

## 6. API Contract

Base path: `/api`. All responses `application/json`. All list endpoints support `?status=&type=&region=&search=` query params where applicable (needed for Dashboard filters and table search bars).

| Method | Endpoint | Purpose | Notes |
|---|---|---|---|
| POST | `/auth/login` | `{email, password}` → `{token, user}` | |
| POST | `/auth/logout` | Invalidate session | |
| GET | `/auth/me` | Return current user | Used to hydrate RBAC on app load |
| GET | `/vehicles` | List vehicles | filters: type, status, region, search |
| POST | `/vehicles` | Create vehicle | server must re-validate uniqueness of registrationNumber |
| GET | `/vehicles/:id` | Single vehicle | |
| PUT | `/vehicles/:id` | Update vehicle | |
| DELETE | `/vehicles/:id` | Retire/remove vehicle | prefer soft-delete via status=Retired |
| GET | `/drivers` | List drivers | filters: status, search |
| POST | `/drivers` | Create driver | |
| PUT | `/drivers/:id` | Update driver | |
| GET | `/trips` | List trips | filters: status, search |
| POST | `/trips` | Create trip (status=Draft) | server validates cargo ≤ vehicle capacity |
| PUT | `/trips/:id` | Edit draft trip | |
| POST | `/trips/:id/dispatch` | Draft → Dispatched | server flips vehicle+driver → On Trip |
| POST | `/trips/:id/complete` | `{actualDistanceKm, fuelConsumedLiters}` Dispatched → Completed | server flips vehicle+driver → Available |
| POST | `/trips/:id/cancel` | Dispatched → Cancelled | server restores vehicle+driver → Available |
| GET | `/maintenance` | List maintenance logs | filters: vehicleId, status |
| POST | `/maintenance` | Create record (status=Active) | server flips vehicle → In Shop |
| POST | `/maintenance/:id/close` | Active → Completed | server flips vehicle → Available (unless Retired) |
| GET | `/fuel-logs` | List fuel logs | filters: vehicleId |
| POST | `/fuel-logs` | Create fuel log | |
| GET | `/expenses` | List expenses | filters: vehicleId, tripId |
| POST | `/expenses` | Create expense | |
| GET | `/dashboard/kpis` | KPI summary | `{activeVehicles, availableVehicles, inMaintenance, activeTrips, pendingTrips, driversOnDuty, fleetUtilizationPct}` |
| GET | `/reports/analytics` | `{fuelEfficiency, fleetUtilization, operationalCost, vehicleROI, monthlyRevenue[], topCostliestVehicles[]}` | |
| GET | `/reports/export.csv` | CSV download | |

**Status-mutation endpoints (dispatch/complete/cancel/close) are intentionally separate POST actions**, not generic PUTs — this keeps the business-rule enforcement (Section 7) centralized on the server and makes it trivial for the frontend to disable/enable buttons based on current status.

---

## 7. Mandatory Business Rules (must be enforced, not just displayed)

1. `registrationNumber` must be unique across all vehicles.
2. Vehicles with status `Retired` or `In Shop` must never appear in the trip-dispatch vehicle selector.
3. Drivers with an expired `licenseExpiryDate` or status `Suspended` must never appear in the trip-dispatch driver selector.
4. A vehicle or driver already `On Trip` cannot be assigned to another trip.
5. `cargoWeightKg` must not exceed the selected vehicle's `maxLoadCapacityKg` — block dispatch with an inline error if violated.
6. Dispatching a trip → vehicle status = `On Trip`, driver status = `On Trip`.
7. Completing a trip → vehicle status = `Available`, driver status = `Available`.
8. Cancelling a **dispatched** trip → vehicle status = `Available`, driver status = `Available`.
9. Creating an **active** maintenance record → vehicle status = `In Shop`.
10. Closing a maintenance record → vehicle status = `Available`, *unless* the vehicle is `Retired`.
11. Total Operational Cost (per vehicle) = SUM(fuel logs cost) + SUM(maintenance cost).
12. Vehicle ROI = `(Revenue - (Maintenance + Fuel)) / Acquisition Cost`.
13. Fuel Efficiency = `Distance / Fuel` (per vehicle or fleet-wide).

These rules should be enforced **server-side as the source of truth**, but the frontend must mirror them client-side for instant feedback (disabled dropdown options, inline validation errors) — never rely on the server round-trip alone for UX.

---

## 8. RBAC Matrix

| Screen | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|---|---|---|---|---|
| Dashboard | Full | Full | View | View |
| Vehicle Registry | Full | View | — | View |
| Driver Management | Full | View | Full | — |
| Trip Dispatcher | View | Full | View | — |
| Maintenance | Full | — | — | View |
| Fuel & Expenses | Full | — | — | Full |
| Reports & Analytics | Full | — | View | Full |
| Settings | Full | — | — | — |

"Full" = create/edit/act. "View" = read-only, no action buttons. "—" = route hidden entirely, redirect to Dashboard (or nearest allowed screen) if accessed directly.

---

## 9. Frontend Architecture

```
src/
  components/       # shared UI: DataTable, StatusBadge, KpiCard, Modal, FilterBar...
  layouts/           # AppShell (sidebar+topbar), AuthLayout
  pages/
    auth/            # Login
    dashboard/
    vehicles/
    drivers/
    trips/
    maintenance/
    fuel-expenses/
    reports/
    settings/
  services/
    api.ts           # single fetch wrapper, swap base URL / mock flag here
    vehicles.ts       # one file per entity, mock now → real fetch later, same function signatures
    drivers.ts
    trips.ts
    maintenance.ts
    fuelExpenses.ts
    dashboard.ts
    reports.ts
    auth.ts
  store/
    authStore.ts      # current user, role, token
    vehicleStore.ts
    driverStore.ts
    tripStore.ts       # trip actions also update vehicleStore/driverStore statuses
  types/               # the interfaces in Section 5
  mocks/
    data.ts            # seed data matching Section 5 shapes
    handlers.ts         # fake async functions with artificial latency
  schemas/              # Zod schemas shared by forms + mock validation
```

**Golden rule for cross-module sync:** dispatching/completing/cancelling a trip, or opening/closing a maintenance record, must update the *vehicle and driver stores*, not just the trip/maintenance store. Build a single `applyStatusChange()` helper used by both mock and real service layers so this logic lives in exactly one place.

---

## 10. Mock-API Strategy (so frontend never blocks on backend)

1. Every function in `services/*.ts` returns a `Promise` and has the **exact same signature** it will have once wired to the real API (e.g. `dispatchTrip(id: string): Promise<Trip>`).
2. A single flag (`USE_MOCK = true/false` in `services/api.ts`) switches all of them between `mocks/handlers.ts` and real `fetch` calls.
3. Mock handlers enforce the same Section 7 business rules as the real backend is expected to, so the demo works identically before and after the swap.
4. Backend team builds directly against Section 6 — as soon as one real endpoint is ready, flip that one service file over and test in isolation; no big-bang integration at hour 7.

---

## 11. Design System Guidelines

- Visual language: clean SaaS dashboard — generous whitespace, card-based sections with soft shadows (not heavy borders), one clear accent color, consistent 4/8px spacing scale, readable sans-serif type hierarchy (e.g. Inter).
- Status badges use consistent color coding across every screen: `Available`/`Completed` = green, `On Trip`/`Dispatched`/`Active` = blue, `In Shop`/`Pending`/`Draft` = amber, `Retired`/`Suspended`/`Cancelled`/expired = red.
- Tables: sticky header, search bar, column-level filters, row hover state, empty/loading/error states everywhere — never a blank screen.
- Forms: inline validation messages (Zod), disabled submit until valid, clear success/error toasts.
- Support a dark mode toggle (bonus feature, Section 14) but design tokens should be theme-variable-driven from the start so it's cheap to add later.

---

## 12. Phase-by-Phase Implementation Plan

Each phase lists **Tasks**, **Definition of Done**, and **Backend Integration Point** (what your teammates should have ready by then, ideally — doesn't block you since mocks cover the gap).

### Phase 0 — Setup & Contracts (0:00–0:30)
- [ ] Scaffold Vite + React + TS project, install Tailwind/shadcn, React Router, RHF+Zod, Zustand, Recharts, date-fns.
- [ ] Create folder structure from Section 9.
- [ ] Write `types/` from Section 5 verbatim.
- [ ] Write `mocks/data.ts` with ~5 vehicles, ~5 drivers, ~6 trips (including at least one Draft, Dispatched, Completed, Cancelled), 2-3 maintenance logs, a few fuel logs/expenses — covering every status value at least once.
- [ ] Share Section 5 + 6 with backend teammates; confirm no disagreements before building further.
- **Definition of Done:** app boots, mock data importable, types compile clean.

### Phase 1 — App Shell, Auth, RBAC (0:30–1:15)
- [ ] Login page: email/password form, validation, error state ("invalid credentials"), role implied by the authenticated user (not manually selected by the end user in the real app — the mockup's role dropdown on login is a demo convenience only).
- [ ] `authStore` holding user/role/token; protected route wrapper redirecting unauthenticated users to `/login`.
- [ ] `AppShell` layout: collapsible sidebar (nav items filtered by Section 8 matrix), topbar (search, role badge, avatar, dark-mode toggle placeholder).
- [ ] Route guard component that hides/redirects screens the current role can't access.
- **DoD:** logging in as each of the 4 roles shows a different sidebar; direct URL access to a disallowed route redirects safely.
- **Backend integration point:** `/auth/login`, `/auth/me`.

### Phase 2 — Dashboard (1:15–2:00)
- [ ] KPI cards: Active Vehicles, Available Vehicles, Vehicles in Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization %.
- [ ] Filter bar: vehicle type, status, region — filters must actually recompute KPIs/recent lists, not just visually reset.
- [ ] Recent Trips widget + Vehicle Status breakdown (chart or segmented bar).
- **DoD:** changing a filter changes the numbers on screen using mock data.
- **Backend integration point:** `/dashboard/kpis`.

### Phase 3 — Vehicle Registry (2:00–2:45)
- [ ] Table: Reg No, Name/Model, Type, Max Load Capacity, Odometer, Acquisition Cost, Status — with search + sort + status/type filter.
- [ ] Add/Edit modal with Zod schema; **client-side uniqueness check** on `registrationNumber` against current store data, surfaced inline.
- [ ] Manual "Retire" action; other status changes are system-driven (read-only in this screen).
- **DoD:** duplicate registration number is blocked before submit; retiring a vehicle removes it from later trip-dispatch options (verify once Phase 5 exists).
- **Backend integration point:** `/vehicles` CRUD.

### Phase 4 — Driver Management (2:45–3:30)
- [ ] Table: Name, License No., Category, Expiry Date, Contact, Safety Score, Status — search + filter.
- [ ] Add/Edit modal.
- [ ] Expired or soon-to-expire license → visible badge/red highlight (feeds Phase 5 rule 3 and the bonus reminder feature).
- **DoD:** a driver with a past `licenseExpiryDate` is visually flagged and excluded from dispatch (verify in Phase 5).
- **Backend integration point:** `/drivers` CRUD.

### Phase 5 — Trip Management (3:30–4:45, largest phase)
- [ ] Trip creation form: source, destination, vehicle select, driver select, cargo weight, planned distance.
- [ ] Vehicle select excludes `Retired`/`In Shop`/`On Trip`.
- [ ] Driver select excludes `Suspended`, expired-license, `On Trip`.
- [ ] Inline validation: cargo weight vs. selected vehicle's max capacity, blocking dispatch with a clear error if exceeded.
- [ ] Lifecycle UI (stepper or status pill): Draft → Dispatched → Completed → Cancelled.
- [ ] "Dispatch" action → calls `applyStatusChange`, flips vehicle+driver to On Trip everywhere in the UI (Vehicle Registry and Driver Management must reflect it without a manual refresh).
- [ ] "Complete" action → form for final odometer + fuel consumed → flips both back to Available.
- [ ] "Cancel" action (only enabled from Dispatched) → restores both to Available.
- [ ] Trip list/table filterable by status.
- **DoD:** run the full Section 10 workflow manually in the UI; every status flip is reflected live in Vehicle Registry and Driver Management screens.
- **Backend integration point:** `/trips` CRUD + `/trips/:id/dispatch|complete|cancel`.

### Phase 6 — Maintenance (4:45–5:25)
- [ ] Create maintenance record form: vehicle, service type, cost, date.
- [ ] Creating an active record instantly flips vehicle → `In Shop` and removes it from the Phase 5 vehicle selector.
- [ ] "Close" action → vehicle back to `Available` unless `Retired`.
- [ ] History table filterable by vehicle.
- **DoD:** create a maintenance record for a vehicle, confirm it disappears from Trip dispatch immediately; close it, confirm it reappears.
- **Backend integration point:** `/maintenance` + `/maintenance/:id/close`.

### Phase 7 — Fuel & Expense Management (5:25–6:05)
- [ ] Fuel log form (vehicle, liters, cost, date).
- [ ] Expense form (trip, type, amount, date).
- [ ] Per-vehicle Total Operational Cost = fuel + maintenance, computed and displayed live.
- **DoD:** adding a fuel log or maintenance cost immediately updates that vehicle's operational cost figure.
- **Backend integration point:** `/fuel-logs`, `/expenses`.

### Phase 8 — Reports & Analytics (6:05–6:50)
- [ ] KPI cards: Fuel Efficiency, Fleet Utilization, Operational Cost, Vehicle ROI.
- [ ] Charts: monthly revenue trend, top costliest vehicles (Recharts bar charts).
- [ ] **CSV export** (mandatory) — client-side blob download of the current report data.
- [ ] PDF export — optional, only if time remains (defer to Phase 10).
- **DoD:** CSV downloads and opens with correct headers/rows; ROI formula matches Section 7 rule 12 exactly.
- **Backend integration point:** `/reports/analytics`, `/reports/export.csv`.

### Phase 9 — Real API Wiring & RBAC Hardening (6:50–7:30)
- [ ] Flip `USE_MOCK` off per service file as backend endpoints come online; test each in isolation.
- [ ] Enforce Section 8 matrix at the component level too (disable/hide action buttons, not just route guarding).
- [ ] Loading/empty/error states audit across every table and form.
- [ ] Responsive pass: sidebar collapses on mobile, tables scroll horizontally, modals stack correctly on small screens.
- **DoD:** app works fully on the real API with no mock fallbacks left active; a Safety Officer login shows correctly restricted UI.

### Phase 10 — Bonus Features + Demo Prep (7:30–8:00, only what fits)
Priority order:
1. [ ] Dark mode toggle (cheap if design tokens were theme-variable-driven from Phase 0).
2. [ ] Email reminder UI stub for expiring licenses (can be a visual "reminder sent" state, doesn't need real email).
3. [ ] Vehicle document management (simple file-attach UI on Vehicle Registry).
4. [ ] PDF export.
5. [ ] Final search/filter/sort polish pass.
- [ ] Seed realistic demo data covering every status and role.
- [ ] Do one full run-through of Section 10's workflow live.
- [ ] Record a fallback screen-capture of the working demo in case of live glitches.

---

## 13. Feature Coverage Checklist (nothing skipped)

- [ ] Authentication + RBAC
- [ ] Dashboard with KPIs + filters
- [ ] Vehicle Registry CRUD + unique registration number
- [ ] Driver Management CRUD + license expiry flagging
- [ ] Trip lifecycle (Draft → Dispatched → Completed → Cancelled) with all validation rules
- [ ] Maintenance workflow with automatic vehicle status sync
- [ ] Fuel & Expense tracking with automatic cost rollup
- [ ] Reports: Fuel Efficiency, Fleet Utilization, Operational Cost, Vehicle ROI
- [ ] CSV export
- [ ] Responsive layout
- [ ] Bonus features (as time allows, in priority order from Phase 10)

---

## 14. Example Workflow — Use This as the Demo/QA Script

1. Register vehicle `Van-05`, max capacity 500 kg, status = Available.
2. Register driver `Alex` with a valid (non-expired) license.
3. Create a trip with cargo weight = 450 kg.
4. System validates 450 ≤ 500 and allows dispatch.
5. On dispatch, vehicle and driver both flip to `On Trip`.
6. Complete the trip, entering final odometer and fuel consumed.
7. Vehicle and driver both flip back to `Available`.
8. Create a maintenance record (e.g. Oil Change) for `Van-05`. Vehicle flips to `In Shop` and disappears from trip dispatch.
9. Reports update operational cost and fuel efficiency based on the new trip and fuel log.

Run this exact sequence once the app is wired to the real API — it is the fastest way to catch a broken cross-module sync before the judges see it.
