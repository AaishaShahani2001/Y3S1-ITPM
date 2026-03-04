# MindBridge – University Student Wellbeing Counselling Management System

MindBridge is a web-based platform designed to support university students’ mental wellbeing by enabling easy access to counselling services.
The system allows students to book counselling appointments, track their sessions, and receive guidance while enabling counsellors and administrators to manage appointments efficiently.

---

# Tech Stack

Frontend

* React (Vite)
* Tailwind CSS
* React Router

Backend

* Go (Golang)
* Gin Framework
* PostgreSQL
* GORM
* JWT Authentication

---

# Project Structure

```
MindBridge
│
├── backend
│   ├── controllers
│   ├── initializers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── .env
│   ├── main.go
│   ├── go.mod
│   └── go.sum
│
├── frontend
│   ├── public
│   ├── src
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Backend Setup (Go + Gin)

### 1. Navigate to backend folder

```
cd backend
```

### 2. Install dependencies

```
go mod tidy
```

### 3. Configure environment variables

Create a `.env` file inside the backend folder.

Example:

```
PORT=3000
SECRET_KEY=xxxxxxxxxxxxxxxxxxxxx
DB="host=localhost user=postgres password=xxxxxxxx dbname=itpmDB port=5432 sslmode=disable"
```

### 4. Run the backend server

```
go run main.go
```

The backend server will start at:

```
http://localhost:3000
```

---

# Frontend Setup (React + Vite)

### 1. Navigate to frontend folder

```
cd frontend
```

### 2. Install dependencies

```
npm install
```

### 3. Run the development server

```
npm run dev
```

The frontend will run at:

```
http://localhost:5173
```

---

# Features Implemented (Current Stage)

* User Authentication (Login / Register)
* Backend API Setup
* React Frontend Setup
* Authentication Integration between frontend and backend
* Responsive Navbar and UI layout

---

# Team

SLIIT – IT Project Management (ITPM)

Group Project: University Student Wellbeing Counselling Management System

Members:

* Aaisha Shahani
* (Add other members)

---

