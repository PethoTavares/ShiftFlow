# ShiftFlow

A workforce and event staffing management platform built with Next.js, TypeScript, PostgreSQL, Prisma, and Auth.js.

## Overview

ShiftFlow helps operations teams plan events, create shifts, assign staff, and keep workforce scheduling visible from one application.

The project is intentionally built as a portfolio-ready full-stack SaaS MVP:

- real PostgreSQL persistence
- server-side authorization
- practical staffing business rules
- browser-level E2E coverage
- clear, interview-friendly architecture

## The Problem

Event staffing usually breaks down when teams manage work across spreadsheets, chat threads, and ad hoc notes.

That creates real operational problems:

- managers cannot quickly see open staffing positions
- employees can accidentally be double-booked
- inactive employees can remain in scheduling flows
- cancelled work can stay visible in upcoming schedules
- role-specific information can leak without strict authorization

## The Solution

ShiftFlow centralizes staffing operations in one workflow:

- managers create employees, events, and shifts
- managers assign staff with overlap and capacity protection
- staffing state updates when assignments are added or removed
- employees see only their own upcoming work
- lifecycle rules keep cancelled and completed work out of the wrong views

## Core Features

Implemented today:

- role-based authentication
- manager and employee accounts
- employee management
- event management
- shift scheduling
- staffing assignments
- shift capacity enforcement
- overlapping shift prevention
- cancelled/completed lifecycle handling
- employee upcoming schedule views
- responsive authenticated UI
- automated unit, integration, and E2E testing
- GitHub Actions CI

## Engineering Highlights

- Server-side authorization protects manager-only pages and mutations.
- Passwords are hashed with `bcryptjs`.
- Shift assignments are protected by both application logic and a database-level unique constraint.
- Zod validates auth and business-form payloads.
- Overlap detection runs during assignment creation on the server.
- Staffing capacity is enforced from active assignments only.
- Employee deactivation is blocked when future active work still exists.
- Assignment removal recalculates shift staffing state immediately.
- Feature-oriented modules keep route composition, business logic, and persistence concerns understandable.

## Tech Stack

- Next.js 16.3.1
- React 19.2.8
- TypeScript 5
- Tailwind CSS 4
- PostgreSQL 17 via Docker Compose
- Prisma 7.9.1 with `@prisma/adapter-pg`
- Auth.js via `next-auth`
- Zod
- Vitest
- Playwright
- GitHub Actions

## Architecture

Typical request flow:

```text
Next.js App Router page
↓
Server Component / Form
↓
Server Action or Feature Query
↓
Zod validation
↓
Authorization helper
↓
Business rules
↓
Prisma
↓
PostgreSQL
```

Not every route uses every layer, but this is the dominant pattern in the application.

## Project Structure

```text
src/
  app/
    (auth)/
    (dashboard)/
    api/
  components/
    layout/
    ui/
  features/
    assignments/
    auth/
    dashboard/
    employees/
    events/
    schedule/
    settings/
    shifts/
  lib/
    auth.ts
    db.ts
    generated/prisma/
    utils.ts
prisma/
  migrations/
  schema.prisma
  seed.ts
tests/
  e2e/
  integration/
  unit/
```

## Database Model

### Entities

- `User`
- `Employee`
- `Event`
- `Shift`
- `ShiftAssignment`

### Relationship summary

- A `User` can be a manager or an employee.
- An `Employee` belongs to one `User`.
- An `Event` is created by a manager user.
- A `Shift` belongs to one `Event`.
- A `ShiftAssignment` joins one employee to one shift.

### Mermaid ER Diagram

```mermaid
erDiagram
  User ||--o| Employee : has_profile
  User ||--o{ Event : creates
  Event ||--o{ Shift : contains
  Employee ||--o{ ShiftAssignment : receives
  Shift ||--o{ ShiftAssignment : contains
```

## Local Development

Tested local flow:

```bash
npm install
```

Create `.env`:

Unix/macOS:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start PostgreSQL:

```bash
npm run db:up
```

Generate Prisma client:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Seed development data:

```bash
npm run db:seed
```

Start the app:

```bash
npm run dev
```

Stop PostgreSQL when finished:

```bash
npm run db:down
```

## Environment Variables

Required local variables:

```env
DATABASE_URL=
AUTH_SECRET=
NEXTAUTH_URL=
```

The provided `.env.example` uses safe local placeholders only.

## Development Accounts

These are development seed credentials only.

Manager:

- email: `manager@shiftflow.dev`
- password: `DevelopmentPassword123!`

Employee:

- email: `maya@shiftflow.dev`
- password: `DevelopmentPassword123!`

The seed creates additional fictional employee accounts, events, shifts, and assignments as useful test data.

Important seed context:

- The current environment date is `Saturday, August 15, 2026`.
- Seeded events and shifts later in August 2026 are intentionally future-dated so upcoming scheduling flows remain testable.

## Testing

Run quality checks:

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
```

### Test layers

- Unit: auth boundaries and calculation helpers
- Integration: business rules with a real test database
- E2E: critical staffing workflow and cancellation lifecycle

### Recommended verification order

```bash
npm run db:up
npm run db:generate
npm run db:migrate
npm run db:seed
npm run lint
npm run typecheck
npm test
npm run test:e2e
```

## CI

GitHub Actions currently verifies:

- dependency installation
- Prisma generation
- Prisma migrations
- lint
- typecheck
- Vitest suite
- production build

E2E is intentionally documented for local execution and is not yet part of CI.

## Prisma Generated Client

The Prisma client is intentionally generated into:

```text
src/lib/generated/prisma
```

It remains committed for now because:

- the project imports from that custom output path directly
- the current generator configuration is not using Prisma's default location
- keeping it committed avoids breaking the existing working architecture during setup

If this is revisited later, the change should only be made together with a verified generation/setup flow.

## Deployment Requirements

Do not deploy without configuring these production values:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL`

Production notes:

- use a hosted PostgreSQL database
- run Prisma migrations before serving traffic
- do not run the development seed automatically in production
- replace the development Auth secret with a real secret

## Screenshots

### Manager Dashboard
<!-- Add final screenshot here -->

### Shift Staffing
<!-- Add final screenshot here -->

### Employee Schedule
<!-- Add final screenshot here -->

## Future Improvements

Not implemented yet:

- employee availability management
- assignment confirmation and decline flows
- notifications
- richer calendar and schedule views
- reporting and analytics
- multi-tenant organization support
