# 🏨 Hotel Management System

A full-stack Hotel Management System built with **AngularJS 1.x**, **Node.js/Express**, and **MySQL**.

---

## 📁 Folder Structure

```
hotel-management/
├── database/
│   └── schema.sql              ← MySQL schema + seed data
├── backend/
│   ├── config/
│   │   └── db.js               ← MySQL connection pool
│   ├── routes/
│   │   ├── hotels.js
│   │   ├── rooms.js
│   │   ├── guests.js
│   │   ├── staff.js
│   │   ├── reservations.js
│   │   ├── payments.js
│   │   ├── inventory.js
│   │   ├── maintenance.js
│   │   ├── feedback.js
│   │   └── dashboard.js
│   ├── server.js               ← Express entry point
│   └── package.json
└── frontend/
    ├── css/
    │   └── style.css
    ├── views/
    │   ├── dashboard.html
    │   ├── rooms.html
    │   ├── guests.html
    │   ├── reservations.html
    │   ├── staff.html
    │   ├── inventory.html
    │   ├── maintenance.html
    │   ├── feedback.html
    │   └── payments.html
    ├── controllers/
    │   └── controllers.js
    ├── app.js                  ← AngularJS module + routing
    └── index.html              ← Shell with sidebar/topbar
```

---

## 🛠️ Prerequisites

- **Node.js** v14+ → https://nodejs.org
- **MySQL** v5.7+ or v8+ → https://dev.mysql.com/downloads/
- A terminal / command prompt

---

## ⚙️ Step-by-Step Setup

### Step 1 — Set Up the Database

1. Open MySQL Workbench or your MySQL client.
2. Run the schema file:
   ```sql
   source /path/to/hotel-management/database/schema.sql
   ```
   Or paste the contents of `database/schema.sql` directly into the MySQL client and execute.

3. Verify tables were created:
   ```sql
   USE hotel_management;
   SHOW TABLES;
   ```
   You should see: Hotel, Room, Guest, Staff, Reservation, Payment, Inventory, Maintenance, Feedback.

---

### Step 2 — Configure the Backend

1. Open `backend/config/db.js`
2. Update your MySQL credentials:
   ```js
   const pool = mysql.createPool({
     host: 'localhost',
     user: 'root',           // ← your MySQL username
     password: 'yourpassword', // ← your MySQL password
     database: 'hotel_management'
   });
   ```

---

### Step 3 — Install Backend Dependencies

```bash
cd hotel-management/backend
npm install
```

This installs: `express`, `mysql2`, `cors`, `nodemon`

---

### Step 4 — Start the Backend Server

```bash
# From the backend/ directory:
node server.js

# OR with auto-reload during development:
npm run dev
```

You should see:
```
✅ Hotel Management Server running at http://localhost:3000
📊 API available at http://localhost:3000/api
```

---

### Step 5 — Open the Frontend

The backend already serves the frontend. Just open your browser:

```
http://localhost:3000
```

The AngularJS frontend will load automatically.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET/POST | `/api/hotels` | List / create hotels |
| GET/PUT/DELETE | `/api/hotels/:id` | Single hotel CRUD |
| GET/POST | `/api/rooms` | List / create rooms |
| GET/PUT/DELETE | `/api/rooms/:id` | Single room CRUD |
| GET/POST | `/api/guests` | List / create guests |
| GET/PUT/DELETE | `/api/guests/:id` | Single guest CRUD |
| GET/POST | `/api/reservations` | List / create reservations |
| GET/PUT/DELETE | `/api/reservations/:id` | Single reservation CRUD |
| GET/POST | `/api/staff` | List / create staff |
| GET/PUT/DELETE | `/api/staff/:id` | Single staff CRUD |
| GET/POST | `/api/inventory` | List / create inventory |
| GET/PUT/DELETE | `/api/inventory/:id` | Single inventory CRUD |
| GET/POST | `/api/maintenance` | List / create maintenance |
| GET/PUT/DELETE | `/api/maintenance/:id` | Single maintenance CRUD |
| GET/POST | `/api/payments` | List / create payments |
| PUT/DELETE | `/api/payments/:id` | Single payment CRUD |
| GET/POST | `/api/feedback` | List / create feedback |
| DELETE | `/api/feedback/:id` | Delete feedback |

---

## ✨ Features

- **Dashboard** — Live stats: rooms, guests, reservations, revenue, maintenance, ratings
- **Rooms** — Full CRUD, room type/status management
- **Guests** — Guest profiles with ID proof tracking
- **Reservations** — Booking with auto-calculated total based on room price × nights
- **Payments** — Payment recording linked to reservations, auto-fills reservation amount
- **Staff** — Staff management with hotel assignment and salaries
- **Inventory** — Stock tracking with low-stock alerts (highlighted in red)
- **Maintenance** — Room maintenance requests with staff assignment
- **Feedback** — Guest ratings and comments

---

## 🐛 Troubleshooting

**`Error: connect ECONNREFUSED`** → MySQL is not running. Start it: `sudo service mysql start`

**`Unknown database 'hotel_management'`** → Run the schema.sql first.

**`Access denied for user 'root'`** → Wrong MySQL password in `backend/config/db.js`

**Blank page on frontend** → Make sure backend is running at `http://localhost:3000`

**CORS error** → Already handled. Make sure you're accessing via `http://localhost:3000` not via file://
