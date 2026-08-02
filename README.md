# 🐔 Smart Chicken Farm IoT - Backend REST API & MQTT Telemetry Service

Robust, production-grade Node.js backend for Smart Chicken Farm Monitoring & Automation. Built with **Express.js**, **Prisma ORM**, **MySQL**, **Socket.IO WebSockets**, **MQTT Broker Protocol**, and **Jest Automated Testing**.

---

## 🌟 Key Features

- **📊 Real-time Telemetry & WebSockets:** Instant bi-directional streaming of infrared sensor status, feeder & water level distances, and relay state changes.
- **📡 Multi-Protocol Scale Ingestion:** Supports HTTP REST POST and MQTT topic subscriptions (`iot/ayam/log_berat`, `iot/ayam/weight`, `iot/ayam/timbangan`) with flexible hardware payload aliases (`weight_grams`, `weightGrams`, `weight`, `berat`, `gram`).
- **🔒 Enterprise Security & Auth:** Session management (`express-session`), bcrypt password hashing, Helmet security headers, CORS origin protection, and rate limiters (`express-rate-limit`).
- **🗄️ Prisma ORM & Database Layer:** Type-safe database queries mapped directly to MySQL schema with connection pooling.
- **⏰ Hardware RTC & Auto-Scheduling:** Automated timer controls and ESP32 RTC time synchronization.
- **🧪 Automated Unit Testing:** Comprehensive Jest unit test suite covering authentication, schedules, and scale hardware payloads.

---

## 🛠️ Technology Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database ORM:** Prisma ORM v6
- **Database Engine:** MySQL
- **Real-Time Communication:** Socket.IO v4 & MQTT (mqtt.js)
- **Security:** Helmet, Express Rate Limit, bcrypt, express-session
- **Testing:** Jest

---

## 📁 Project Directory Structure

```text
iot-peternakan-ayam/
├── __tests__/                  # Jest unit tests suite
│   ├── authController.test.js
│   ├── scheduleController.test.js
│   └── weightLogsController.test.js
├── config/                     # Database, MQTT & Socket.IO configurations
│   ├── prisma.js
│   ├── mqtt.js
│   └── socket.js
├── controllers/                # Request & business logic handlers
│   ├── authController.js
│   ├── feedLogsController.js
│   ├── modeController.js
│   ├── relayController.js
│   ├── scheduleController.js
│   ├── sensorController.js
│   ├── timeController.js
│   └── weightLogsController.js
├── db/                         # Connection pool helper
│   └── connection.js
├── middlewares/                # Security headers, rate limiting & error handlers
│   ├── errorMiddleware.js
│   └── securityMiddleware.js
├── prisma/                     # Database schema & migrations
│   └── schema.prisma
├── routes/                     # REST API route definitions
│   ├── authRoutes.js
│   ├── feedLogsRoutes.js
│   ├── modeRoutes.js
│   ├── relayRoutes.js
│   ├── scheduleRoutes.js
│   ├── sensorRoutes.js
│   ├── timeRoutes.js
│   └── weightLogsRoutes.js
├── .env                        # Environment variables configuration
├── index.js                    # Application entry point
├── mqttClient.js               # MQTT client connection handler
├── package.json
└── README.md
```

---

## 🚀 Environment Setup & Installation

### 1. Requirements
- Node.js (v18.0.0 or higher)
- MySQL Server
- MQTT Broker (Mosquitto or local broker at `mqtt://localhost:1883`)

### 2. Environment Variables (`.env`)
Create a `.env` file in the root of `iot-peternakan-ayam`:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://root:password@localhost:3306/iot_ayam"
SESSION_SECRET="supersecretkey_iot_ayam_2026"
FRONTEND_URL="http://localhost:5173"
MQTT_IP_BROKER="mqtt://localhost:1883"
```

### 3. Installation & Prisma Migration

```bash
# Install dependencies
npm install

# Pull database schema & generate Prisma Client
npx prisma db pull
npx prisma generate
```

### 4. Running the Server

```bash
# Start backend server
npm start

# Development mode with nodemon
npm run dev
```

---

## 📡 MQTT Topics & Payloads

| Topic | Direction | Payload Example | Description |
|---|---|---|---|
| `iot/ayam/ir1` | Hardware ➔ Backend | `"1"` / `"0"` | Status Wadah Pakan 1 (1 = Berisi, 0 = Kosong) |
| `iot/ayam/distance_feed` | Hardware ➔ Backend | `"15"` | Distance to main feed level in CM |
| `iot/ayam/distance_water` | Hardware ➔ Backend | `"8"` | Distance to water reservoir in CM |
| `iot/ayam/log_berat` | Hardware ➔ Backend | `{"weight_grams": 450}` | Automated weight scale reading log |
| `iot/ayam/control` | Backend ➔ Hardware | `{"type": "feed", "state": "on"}` | Manual Relay ON/OFF command |
| `iot/ayam/schedule` | Backend ➔ Hardware | `{"type": "water", "hour": 7, "minute": 0}` | Relay schedule configuration |

---

## 🌐 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register operator account.
- `POST /api/auth/login` - Authenticate admin (`admin@farm.com` / `admin123`).
- `GET /api/auth/session` - Validate active session.
- `POST /api/auth/logout` - Destroy session.

### Telemetry & Control (`/api/sensor`, `/api/relay`, `/api/mode`)
- `GET /api/sensor` - Fetch latest IR & distance readings.
- `GET /api/relay` - Fetch status of feed & water relays.
- `POST /api/relay/control` - Toggle relay (`{"type": "feed", "state": "on"}`).
- `GET /api/mode` - Get operational mode (`auto` / `manual`).
- `POST /api/mode` - Toggle mode.

### Schedules & Time (`/api/schedules`, `/api/time`)
- `GET /api/schedules` - List all active automation schedules.
- `POST /api/schedules` - Create schedule (`{"type": "feed", "hour": 6, "minute": 30}`).
- `PUT /api/schedules/:id/enable` - Enable schedule.
- `PUT /api/schedules/:id/disable` - Disable schedule.
- `DELETE /api/schedules/:id` - Remove schedule.
- `POST /api/time/rtc` - Synchronize ESP32 hardware RTC.

### Logs & Scales (`/api/weight-logs`, `/api/feed-logs`)
- `GET /api/weight-logs` - Fetch all chicken weight logs.
- `POST /api/weight-logs` - Record scale reading (Accepts `weight_grams`, `weight`, `berat`, `gram`, raw text).
- `GET /api/feed-logs` - Fetch feed refill logs.
- `POST /api/feed-logs` - Record feed refill (`{"amount_kg": 5.5}`).

---

## 🧪 Automated Unit Testing

Run Jest unit tests:

```bash
npm test
```

Test Results:
- `weightLogsController.test.js` - Hardware scale payload parsing.
- `authController.test.js` - Session & login verification.
- `scheduleController.test.js` - Relay schedule creation & toggling.

---

## 📄 License
MIT License. Developed for Smart Poultry Farm IoT Automation.
