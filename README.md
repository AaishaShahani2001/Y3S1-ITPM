# MindBridge

MindBridge is a university wellbeing and counseling platform that supports:

- student appointment booking and tracking
- counselor queue/availability management
- admin approval and operational oversight
- mood analysis and mood tracking workflows

---

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router

### Backend
- Go (Golang)
- Gin
- PostgreSQL
- GORM
- JWT authentication
- Brevo SMTP email notifications

---

## Project Structure

```text
MindBridge
├── backend
│   ├── controllers
│   ├── email
│   ├── initializers
│   ├── middleware
│   ├── models
│   ├── routes
│   └── main.go
├── frontend
│   ├── public
│   └── src
└── README.md
```

---

## Environment Variables

Create `backend/.env`:

```env
PORT=3000
SECRET_KEY=replace_with_secure_secret
DB=host=localhost user=postgres password=yourpassword dbname=itpmDB port=5432 sslmode=disable

# Optional email notifications (Brevo SMTP)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_smtp_user
BREVO_SMTP_KEY=your_brevo_smtp_key
BREVO_SMTP_FROM="MindBridge <no-reply@yourdomain.com>"
```

Notes:
- If Brevo vars are not set, APIs still work, but email sending is skipped/fails safely.
- `PORT` defaults to `3000` when not provided.

---

## Local Setup

### Backend

```bash
cd backend
go mod tidy
go run main.go
```

Backend URL: `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

---

## Authentication

Most protected APIs require:

```http
Authorization: Bearer <jwt-token>
```

Use `POST /api/login` to obtain token.

---

## API Workflows

All routes are registered from:
- `routes.SetupRoutes(r)`
- `routes.EventRoutes(r)`

### 1) Auth Workflow

- `POST /api/signup` - register user
- `POST /api/login` - login and get JWT
- `GET /api/validate` - validate token and return authenticated user

---

### 2) Counselor Application/Profile Workflow

- `POST /api/counsellor/apply` (auth) - submit counselor application
- `GET /api/counsellor/all` - list approved counselors
- `GET /api/counsellor/profile/:userId` - get counselor profile
- `PUT /api/counsellor/profile/:userId` - update counselor profile
- `POST /api/counsellor/profile-image/:userId` - upload profile image
- `DELETE /api/counsellor/profile-image/:userId` - remove profile image

#### Counselor Location Assignment
- `GET /api/counsellor/location/all` (auth) - list counselors for assignment
- `GET /api/counsellor/location/me` (auth) - current counselor assigned location
- `PUT /api/counsellor/location/:userId` (auth) - assign/update counselor location

---

### 3) Admin Workflow

Base group: `/api/admin` (all auth protected)

- `GET /api/admin/applications` - list counselor applications
- `PUT /api/admin/applications/:id/approve` - approve counselor
- `PUT /api/admin/applications/:id/reject` - reject counselor
- `GET /api/admin/appointments` - list all appointments for admin dashboards

---

### 4) Availability Workflow (Counselor slots)

- `GET /api/counsellor/availability/:id` - get counselor availability
- `POST /api/counsellor/availability` - add slot
- `PUT /api/counsellor/availability/:id` - update slot
- `DELETE /api/counsellor/availability/:id` - delete slot

---

### 5) Appointment Booking Workflow

Base group: `/api/appointments`

- `POST /api/appointments/create` (auth) - create student appointment
- `GET /api/appointments/booked-slots` - get booked slots for counselor/date
- `GET /api/appointments/student` (auth) - student appointment list
- `GET /api/appointments/counselor` (auth) - counselor appointment queue
- `PUT /api/appointments/:id/student` (auth) - student edits pending appointment
- `DELETE /api/appointments/:id/student` (auth) - student delete/request cancel
- `PUT /api/appointments/:id/status` (auth) - counselor status flow (Pending -> Confirmed -> Completed)
- `PUT /api/appointments/:id/counselor-cancel` (auth) - counselor cancels with note
- `PUT /api/appointments/:id/cancellation/approve` (auth) - counselor approves student cancel request

#### Appointment Email Notifications

Triggered from appointment controller:
- Student gets email when counselor confirms appointment.
- Student gets email when counselor cancels appointment.

---

### 6) Appointment Waitlist Workflow

Base group: `/api/appointments`

- `POST /api/appointments/waitlist` (auth) - join waitlist
- `GET /api/appointments/waitlist/student` (auth) - student's waitlist entries
- `GET /api/appointments/waitlist/counselor` (auth) - counselor waitlist entries
- `DELETE /api/appointments/waitlist/:id` (auth) - leave waitlist

When a slot opens, the waitlist pipeline can notify students by email.

---

### 7) Mood Analyze + Mood Tracker Workflow

Base group: `/api/mood`

- `POST /api/mood/analyze` - rules-based mood analysis
  - returns mood, suggested counselor category, urgency

#### Mood Tracker (student personal records)
- `GET /api/mood/tracker` (auth) - list records
- `POST /api/mood/tracker` (auth) - upsert record for a day
- `PUT /api/mood/tracker/:id` (auth) - update record by ID
- `DELETE /api/mood/tracker/:id` (auth) - delete record by ID
- `DELETE /api/mood/tracker?date=YYYY-MM-DD` (auth) - compatibility delete path

Each record stores:
- daily wellbeing metrics (sleep, social, physical, mindfulness, stress, energy)
- recommended counselor category
- recommendation urgency
- matched approved counselors by specialization

---

### 8) Treatment Plan Workflow

- `POST /api/treatment-plans` - create plan
- `GET /api/treatment-plans` (auth) - list plans
- `GET /api/treatment-plans/student/:studentId` (auth) - student-specific plans
- `PUT /api/treatment-plans/:id` - update plan
- `DELETE /api/treatment-plans/:id` - delete plan

---

### 9) Events Workflow

#### Protected (`/api` + auth)
- `POST /api/events/register` - register student to event
- `GET /api/student/events` - get student's event registrations
- `DELETE /api/registration/:id` - remove event registration

#### Public
- `POST /api/events` - create event
- `GET /api/events` - list events
- `GET /api/events/:id` - get event by id
- `PUT /api/events/:id` - update event
- `DELETE /api/events/:id` - delete event
- `GET /api/events/registrations` - list all registrations
- `GET /api/events/:id/registrations` - list registrations for one event
- `GET /api/events/:id/analytics` - event analytics

---

## Data/Model Notes

- Mood tracker enforces one record per student per day using a composite unique index:
  - `(student_id, date)`
- Appointment workflow stores status progression and cancellation notes.
- Uploaded reports are served from:
  - `GET /uploads/...`

---

## Quick Verification Checklist

- Auth: signup -> login -> validate token.
- Student flow: create appointment -> counselor confirms -> student receives confirmation email.
- Counselor flow: cancel appointment with note -> student receives cancellation email.
- Mood flow: save daily tracker -> verify recommended category/counselors in response.
- Admin flow: approve/reject counselor applications.

---

## Team

SLIIT - IT Project Management (ITPM)  
University Student Wellbeing Counselling Management System

- Aaisha Shahani
- Pravinath
- Dheena
- Sadhushan


