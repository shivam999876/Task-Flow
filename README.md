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

## 🚀 Deployment (Render)

This application is ready to be deployed on Render with both frontend and backend as separate services.

### Backend Deployment

1. Go to [render.com](https://render.com) and sign in.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository (`shivam999876/Task-Flow`).
4. Configure the service:
   - **Name:** `taskflow-backend`
   - **Language:** `Node`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Under **Environment**, add all variables:
   ```
   PORT=5000
   NODE_ENV=production
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
   JWT_SECRET=<your_jwt_secret>
   JWT_REFRESH_SECRET=<your_refresh_secret>
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your_email>
   EMAIL_PASS=<your_app_password>
   EMAIL_FROM=noreply@taskflow.app
   ALLOWED_ORIGINS=https://<your-frontend-render-domain>
   ```
6. Click **Create Web Service** and wait for deployment.
7. Copy the backend URL (e.g., `https://taskflow-backend-xyz.onrender.com`).

### Frontend Deployment

1. Click **New +** → **Web Service**.
2. Connect the same GitHub repository.
3. Configure the service:
   - **Name:** `taskflow-frontend`
   - **Language:** `Node`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Under **Environment**, add:
   ```
   VITE_API_URL=https://<your-backend-render-domain>/api
   ```
   > Replace `<your-backend-render-domain>` with the backend URL from Step 7 above.
5. Click **Create Web Service** and wait for deployment.
6. Copy the frontend URL (e.g., `https://taskflow-frontend-xyz.onrender.com`).

### Post-Deployment Configuration

After the frontend is deployed, update the backend service:

1. Go to **taskflow-backend** → **Environment**.
2. Edit `ALLOWED_ORIGINS` to match your frontend domain:
   ```
   ALLOWED_ORIGINS=https://<your-frontend-render-domain>
   ```
3. Save and Render will automatically redeploy the backend.

Your application is now live! Visit the frontend URL to access TaskFlow.

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
