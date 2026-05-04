# TaskFlow - Team Task Management Application

TaskFlow is a production-ready Team Task Management Web Application, modeled after a simplified Trello or Asana. It provides a secure, role-based environment for teams to collaborate on projects using Kanban-style boards.

## 🚀 Features

- **Authentication & Security:** JWT-based authentication (Access headers + HTTP-only Refresh cookies) with Bcrypt password hashing.
- **Role-Based Access Control (RBAC):** Admin and Member roles. Only Admins can add/remove members or delete projects/tasks.
- **Project Management:** Create projects, manage team members, and view aggregated tasks.
- **Kanban Task Board:** Drag-and-drop tasks across statuses (To Do, In Progress, Done) using `@hello-pangea/dnd`.
- **Advanced Dashboard:** Real-time analytics using MongoDB aggregation pipelines and `recharts` for visualization.
- **Activity Logs:** Automatic tracking of project and task updates.
- **Modern UI/UX:** Responsive, dark-themed, glassmorphism UI built with React, Vite, and Tailwind CSS.

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Zustand, Axios, Recharts, React Router, `@hello-pangea/dnd`, React Hot Toast.

**Backend:** Node.js, Express, MongoDB (Mongoose ODM), JWT, Bcryptjs, Joi.

---

## 🏗️ Folder Structure

```
Task/
├── backend/
│   ├── server.js                          # Entry point
│   ├── .env                               # Environment variables
│   ├── src/
│   │   ├── app.js                         # Express app setup (CORS, Helmet, Rate Limiting)
│   │   ├── config/                        # MongoDB connection config
│   │   ├── controllers/                   # Route controllers (Auth, Projects, Tasks, etc.)
│   │   ├── middleware/                    # Auth, RBAC, Validation, Error Handling
│   │   ├── models/                        # Mongoose Schemas (User, Project, Task, Activity)
│   ├── routes/                            # Express routes
│   ├── services/                          # Email notification service
│   │   └── utils/                         # Token generators, Joi schemas
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.jsx                       # React entry
│   │   ├── App.jsx                        # Routing & Layout
│   │   ├── api/                           # Axios instance with interceptors
│   │   ├── components/                    # Reusable UI, Layout, Charts, Tasks components
│   │   ├── hooks/                         # Custom hooks
│   │   ├── pages/                         # Login, Signup, Dashboard, Projects, ProjectDetail
│   │   └── store/                         # Zustand global store
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas Cluster (or local MongoDB)

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory using the provided `.env.example` as a reference:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
# Railway and some cloud providers may use MONGODB_URI instead of MONGO_URI
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the backend development server:

```bash
npm start
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:

```bash
npm run dev
```

### 3. Open Application

Navigate to `http://localhost:5173` in your browser.

---

## 🚀 Deployment (Railway)

This application is ready to be deployed on Railway.

### Backend Deployment

1. Connect your GitHub repository to Railway.
2. Create a new service from the repo and set the Root Directory to `backend/`.
3. Under Variables, add all variables from your `.env` file (e.g., `MONGO_URI` or `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` pointing to your deployed frontend domain).
4. Railway will automatically detect `package.json` and start the server using `npm start`.

### Frontend Deployment

1. Create another service from the same repo and set the Root Directory to `frontend/`.
2. Add `VITE_API_URL` pointing to your deployed Railway backend URL (e.g., `https://your-backend-url.up.railway.app/api`).
3. Railway will build the Vite app and serve the static files.

---

## 🧪 Testing Instructions

1. **Signup/Login:** Create a new user. The first user created will be able to create projects.
2. **Create Project:** Go to Projects > New Project. As the creator, you are automatically assigned the 'Admin' role.
3. **Manage Members:** Add members via email and manage access roles.
4. **Kanban Board:** Add tasks and move them across columns. Observe the activity log updating in real-time.
5. **Dashboard:** Check aggregated metrics and project progress on the dashboard.

---

## 🧠 Database Schema Highlights

- **User:** Stores credentials (bcrypt hashed), name, email, and a refresh token for secure persistent sessions.
- **Project:** Contains project metadata and a `members` array storing user ObjectIds along with their specific role (`Admin` or `Member`) for that project.
- **Task:** Links to both a Project and a User (assignedTo), tracks Kanban `status` and `position` for drag-and-drop ordering.
- **Activity:** An append-only log tracking changes to tasks and projects for the Activity drawer.

---

**TaskFlow** - Built with ❤️ for productive teams.
