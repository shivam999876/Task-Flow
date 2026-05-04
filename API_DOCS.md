# TaskFlow API Documentation

All API endpoints are prefixed with `/api`.
Authentication relies on an `Authorization: Bearer <token>` header for access, and an HTTP-only cookie for refresh tokens.

---

## Authentication (`/api/auth`)

### `POST /signup`
Registers a new user.
- **Body:** `{ name, email, password }`
- **Response (201):** `{ success: true, accessToken, user }` (Sets HTTP-only `refreshToken` cookie)

### `POST /login`
Authenticates a user.
- **Body:** `{ email, password }`
- **Response (200):** `{ success: true, accessToken, user }` (Sets HTTP-only `refreshToken` cookie)

### `POST /refresh`
Issues a new access token using the HTTP-only refresh token cookie.
- **Response (200):** `{ success: true, accessToken }`

### `POST /logout`
Logs out user and clears cookies.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** `{ success: true, message: 'Logged out successfully.' }`

### `GET /me`
Returns current authenticated user info.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** `{ success: true, user }`

---

## Projects (`/api/projects`)

### `GET /`
Lists all projects the user is a member of.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** `{ success: true, count, projects: [...] }`

### `POST /`
Creates a new project. Creator becomes an Admin.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ title, description, color }`
- **Response (201):** `{ success: true, project }`

### `GET /:id`
Gets details of a specific project. User must be a member.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** `{ success: true, project, isAdmin: boolean }`

### `PUT /:id`
Updates project details. **(Admin only)**
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ title, description, color }`
- **Response (200):** `{ success: true, project }`

### `DELETE /:id`
Deletes a project and all associated tasks/activity. **(Admin only)**
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** `{ success: true, message: '...' }`

---

## Project Members (`/api/projects/:id/members`)

### `POST /`
Adds a user to the project by email. **(Admin only)**
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ email, role: 'Admin' | 'Member' }`
- **Response (200):** `{ success: true, project }`

### `DELETE /:userId`
Removes a member from the project. **(Admin only)**
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** `{ success: true, message: '...' }`

---

## Tasks (`/api/projects/:id/tasks` & `/api/tasks`)

### `GET /api/projects/:id/tasks`
Lists tasks for a project. Members only see their assigned tasks; Admins see all.
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?status=...&priority=...&assignedTo=...`
- **Response (200):** `{ success: true, count, tasks: [...] }`

### `POST /api/projects/:id/tasks`
Creates a task in the project. **(Admin only)**
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ title, description, dueDate, priority, status, assignedTo, tags }`
- **Response (201):** `{ success: true, task }`

### `PUT /api/tasks/:id`
Updates a task. Members can only update the `status` of their own tasks. Admins can update anything.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** Any task fields.
- **Response (200):** `{ success: true, task }`

### `PATCH /api/tasks/:id/move`
Optimized endpoint for Kanban drag-and-drop operations.
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ status, position }`
- **Response (200):** `{ success: true, task }`

### `DELETE /api/tasks/:id`
Deletes a task. **(Admin only)**
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** `{ success: true, message: '...' }`

---

## Analytics & Logs

### `GET /api/dashboard`
Returns aggregated analytics across all user projects.
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** `{ success: true, stats: { totalTasks, tasksByStatus, ... } }`

### `GET /api/projects/:id/activity`
Returns the activity log for a specific project.
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?page=1&limit=20`
- **Response (200):** `{ success: true, activities: [...], pagination: {...} }`
