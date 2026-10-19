# Task Management REST API (Backend)

Enterprise-grade RESTful API built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** featuring JWT authentication, server-side validation pipeline, and performance response time tracking.

---

## Architecture & Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 5.x
- **Database**: MongoDB via Mongoose ODM
- **Authentication**: JSON Web Token (JWT) with bearer header verification
- **Password Security**: Bcryptjs salt hashing
- **CORS**: Cross-Origin Resource Sharing enabled for React frontend
- **Performance**: Response-time tracking headers (`X-Response-Time`)

---

## API Endpoints

### 1. Authentication Routes

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user with hashed password & return token |
| `POST` | `/auth/login` | Public | Authenticate user credentials & issue JWT token |
| `GET` | `/auth/me` | Protected | Retrieve authenticated user profile via Bearer token |

#### Example Login Request:
```json
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Example Login Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6732f91...",
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

---

### 2. Task Management Routes (Protected)

All task endpoints require the header:  
`Authorization: Bearer <your_jwt_token>`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | Fetch all tasks for authenticated user |
| `POST` | `/tasks` | Create task with server-side validation pipeline |
| `PUT` | `/tasks/:id` | Update task title, description, priority, or completion status |
| `DELETE` | `/tasks/:id` | Delete a task by ID |

---

## Performance & Optimization

1. **Lean Query Projection**: High-frequency task queries select only relevant user fields to minimize MongoDB memory footprint.
2. **Response-Time Tracking**: Added request duration middleware setting `X-Response-Time` header to monitor API latency alongside frontend chunk loading.
3. **Optimized Validation Pipeline**: Input sanitization and length bounds verified prior to database transactions.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally at `mongodb://127.0.0.1:27017`

### Setup Environment
Create `.env` file in the backend root:
```env
MONGO_URI=mongodb://127.0.0.1:27017/taskdb
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

### Run Locally

```bash
# Install dependencies
npm install

# Start production server
npm start

# Run with hot reload (nodemon)
npm run dev
```

Server starts on `http://localhost:5000` with automated health check at `GET /`.
