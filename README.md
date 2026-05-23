# ⚡ Smart EV Charging Station Management System

A full-stack AI-powered web application that helps electric vehicle users find the best nearby charging station using a multi-factor scoring algorithm, real-time slot availability, and smart recommendations.

🔴 **Live Demo:** [ev-charging-managment-system.vercel.app](https://ev-charging-managment-system.vercel.app)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router DOM v6 |
| Animations | Framer Motion |
| Backend | Supabase (BaaS) |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (JWT) |
| Security | Row Level Security (RLS) |
| AI Engine | Custom Scoring Algorithm (TypeScript) |
| Maps | OpenStreetMap |
| Charts | Recharts |
| Deployment | Vercel |

---

## ✨ Features

### 👤 User Features
- 🔐 Email/Password Authentication (Register & Login)
- 📍 Interactive map showing all EV charging stations
- 🤖 AI-powered station recommendation with score out of 100
- ⏱️ Predicted waiting time for every station
- 🔍 Search stations by name or location
- 🔽 Filter by charging speed, availability, sort by score/distance/price
- 📋 Book a charging slot (date, time, duration)
- 💰 Live estimated cost calculator before booking
- 📁 View and cancel personal bookings

### 🛠️ Admin Features
- ➕ Add new charging stations
- ✏️ Edit / Delete existing stations
- 📊 View all user bookings
- 📈 Analytics dashboard with charts (bar, pie, line)

---

## 🤖 AI Recommendation Engine

The AI engine is a **multi-factor weighted scoring algorithm** built in TypeScript (`src/lib/ai-recommendation.ts`). It scores every station out of 100 using 5 factors:

| Factor | Weight | Logic |
|--------|--------|-------|
| Distance | 25% | Closer = higher score |
| Wait Time | 25% | Less waiting = higher score |
| Availability | 20% | More free slots = higher score |
| Charging Speed | 15% | Faster charger = higher score |
| Price | 15% | Cheaper = higher score |

### Haversine Formula
Distance between user and each station is calculated using the **Haversine formula** — accounts for Earth's curvature using GPS coordinates (latitude/longitude).

### Wait Time Prediction
```
predictedWait = (occupancy × 30) + (loadFactor × 20) + (speedFactor × 10) + (distance × 2)
```

The station with the highest score receives the **⭐ AI Recommended** badge.

---

## 🗄️ Database Schema (PostgreSQL)

### `stations` table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| name | Text | Station name |
| location | Text | Address |
| latitude / longitude | Number | GPS coordinates |
| total_slots | Integer | Total chargers |
| available_slots | Integer | Currently free slots |
| charging_speed | Text | standard / fast / superfast / ultra |
| current_load | Number | Electrical load (0–100%) |
| price_per_unit | Number | Cost in ₹ per unit |
| waiting_time | Number | Estimated wait in minutes |

### `bookings` table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key → auth user |
| station_id | UUID | Foreign key → station |
| booking_time | Timestamp | Session start time |
| charging_duration | Integer | 30 / 60 / 90 / 120 minutes |
| status | Text | confirmed / cancelled |

### `user_roles` table
| Column | Type | Description |
|--------|------|-------------|
| user_id | UUID | Foreign key → auth user |
| role | Enum | user / admin |

---

## 🔐 Security

- **JWT Authentication** — Supabase Auth issues tokens on login, stored in localStorage
- **Row Level Security (RLS)** — PostgreSQL policies ensure:
  - Users can only view their own bookings
  - Only admins can add/edit/delete stations
  - New users auto-assigned `user` role via database trigger

---

## 📄 Pages

| Route | Page | Access |
|-------|------|--------|
| `/` | Home Page | Public |
| `/auth` | Login / Register | Public |
| `/dashboard` | User Dashboard | Protected |
| `/stations` | All Stations | Protected |
| `/stations/:id` | Station Details | Protected |
| `/book/:stationId` | Booking Page | Protected |
| `/bookings` | My Bookings | Protected |
| `/admin` | Admin Dashboard | Admin Only |
| `/admin/analytics` | Analytics Charts | Admin Only |

---

## 🛠️ Run Locally

```bash
# Clone the repository
git clone https://github.com/vivek28n/Smart-EV-charging-managment-system.git

# Navigate to project folder
cd Smart-EV-charging-managment-system

# Install dependencies
npm install

# Add your Supabase credentials in .env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Start development server
npm run dev
```

---


## 👨‍💻 Developer

**Vivek Nigam**  
B.Tech CSE (AI Specialization) — 2nd Year  
📧 Connect on [LinkedIn](https://linkedin.com/in/vivek-nigam-28n)  
💻 [GitHub](https://github.com/vivek28n)

---

## 📝 License

This project is for academic purposes.
