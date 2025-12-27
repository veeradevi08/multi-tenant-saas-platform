# Multi-Tenant SaaS Platform

## Overview
Full-stack multi-tenant SaaS application with tenant isolation, JWT authentication, user/project/task management, and subscription limits.

## Features Implemented
- Tenant registration & login (subdomain-based)
- Role-based access (super_admin, tenant_admin, user)
- User CRUD (tenant_admin only)
- Project & Task CRUD
- Protected routes with tenant isolation
- Subscription limits (max users/projects)

## Tech Stack
- Backend: Node.js, Express, PostgreSQL
- Frontend: React + Vite (basic login form)
- Database: PostgreSQL (local)

## Local Setup Instructions
1. **Database** (local PostgreSQL):
   - Install PostgreSQL
   - Create database: saas_db
   - User: postgres, Password: postgres123

2. **Backend** (in backend folder):