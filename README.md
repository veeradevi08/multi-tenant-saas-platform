# Multi-Tenant SaaS Platform

A full-stack multi-tenant SaaS application built with Node.js (Express), PostgreSQL, React + Vite, featuring tenant isolation, JWT authentication, role-based access control, user/project/task management, and subscription limits.

## Features Implemented
- Multi-tenancy with subdomain-based tenant isolation
- Authentication & Authorization using JWT (register, login, protected routes)
- Role-based access (super_admin, tenant_admin, user)
- User Management – CRUD operations (tenant_admin only)
- Project Management – Create, list, update, delete projects
- Task Management – Create, list, update, delete tasks within projects
- Subscription Limits – Enforced max users and max projects per tenant
- Data Isolation – All queries automatically scoped to the current tenant
- Health Check – Public `/api/health` endpoint
- Basic Frontend – React + Vite with login form (connects to backend API)

## Tech Stack
- Backend: Node.js, Express, PostgreSQL (pg library), JWT
- Frontend: React, Vite, axios, react-router-dom
- Database: PostgreSQL (local setup)
- Tools: Nodemon, dotenv, bcrypt

## Local Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm
- PostgreSQL (local installation)

### 1. Database Setup (PostgreSQL Local)
- Install PostgreSQL from https://www.postgresql.org/download/windows/
- Default user: `postgres`, password: `postgres123`
- Create database: `saas_db` (use pgAdmin or command: `createdb -U postgres saas_db`)

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
Runs on: http://localhost:5000
Test health: http://localhost:5000/api/health
Frontend Setup (Optional – Basic UI)
Bashcd frontend
npm install
npm run dev
Runs on: http://localhost:5173
Open http://localhost:5173/login to test login form

Test Credentials
Tenant Admin

Email: admin@freshtest.com
Password: FreshPass123!
Tenant Subdomain: freshtest2025

Login API Example (Thunder Client/Postman)
JSONPOST http://localhost:5000/api/auth/login
Body:
{
  "email": "admin@freshtest.com",
  "password": "FreshPass123!",
  "tenantSubdomain": "freshtest2025"
}
Key API Endpoints

POST/api/auth/register-tenant – Register new tenant
POST/api/auth/login – Login & get JWT token
GET/api/auth/me – Get current user (protected)
POST/api/tenants/:tenantId/users – Add user (tenant_admin only)
POST/api/projects – Create project
GET/api/projects – List projects
POST/api/projects/:projectId/tasks – Create task in project
GET/api/projects/:projectId/tasks – List tasks in project

Project Structure
textmulti-tenant-saas-platform/
├── backend/                # Node.js + Express API
│   ├── controllers/
│   ├── middleware/
│   ├── migrations/
│   ├── routes/
│   ├── config/db.js
│   ├── index.js
│   └── ...
├── frontend/               # React + Vite UI
│   ├── src/
│   │   ├── pages/
│   │   └── ...
│   └── ...
├── screenshots/            # Proof screenshots
└── README.md
Screenshots (in screenshots/ folder)

Backend startup logs
Health check response (/api/health)
Login success response
Current user response (/api/auth/me)
Projects list response
Task creation & list response
