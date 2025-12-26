// backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import middlewares
const { authenticate } = require('./middleware/authMiddleware');
const { tenantIsolation } = require('./middleware/tenantIsolation');

dotenv.config();

const app = express();

// Global middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());

// Load and mount auth routes (register, login, me) - public
let authRoutes;
try {
  authRoutes = require('./routes/auth-routes');
  console.log('✅ AUTH ROUTES FILE LOADED SUCCESSFULLY');
} catch (err) {
  console.error('❌ FAILED TO LOAD AUTH ROUTES:', err.message);
}

if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes mounted at /api/auth');
} else {
  console.log('❌ Auth routes NOT mounted');
}

// Mount user routes - protected with auth + tenant isolation + tenant_admin role
const userRoutes = require('./routes/user-routes');
app.use('/api/tenants', authenticate, tenantIsolation, userRoutes);
console.log('✅ User routes mounted at /api/tenants (protected)');

// Mount project routes - protected with auth + tenant isolation
const projectRoutes = require('./routes/project-routes');
app.use('/api/projects', authenticate, tenantIsolation, projectRoutes);
console.log('✅ Project routes mounted at /api/projects (protected)');

// Mount task routes - protected with auth + tenant isolation
const taskRoutes = require('./routes/task-routes');
app.use('/api', authenticate, tenantIsolation, taskRoutes);
console.log('✅ Task routes mounted at /api (protected)');

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Backend is alive'
  });
});

// Protected test route (for debugging)
app.get('/api/test-protected', authenticate, tenantIsolation, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    user: req.user,
    tenantId: req.tenantId
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Multi-Tenant SaaS Backend is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('All protected endpoints require Bearer token + tenant isolation');
});