// backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// --- CORS Setup ---
const allowedOrigins = [
  'http://localhost:3000', // frontend default port
  'http://localhost:5173'  // Vite dev server
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  credentials: true
}));

app.use(express.json());

// --- Auth Routes (Public) ---
let authRoutes;
try {
  authRoutes = require('./routes/auth-routes');
  console.log('✅ Auth routes file loaded successfully');
} catch (err) {
  console.error('❌ Failed to load auth routes:', err.message);
}

if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes mounted at /api/auth');
}

// --- User Routes (Protected: Auth + Tenant Isolation + tenant_admin role) ---
const { authenticate } = require('./middleware/authMiddleware');
const { tenantIsolation } = require('./middleware/tenantIsolation');

let userRoutes;
try {
  userRoutes = require('./routes/user-routes');
  app.use('/api/tenants', authenticate, tenantIsolation, userRoutes);
  console.log('✅ User routes mounted at /api/tenants (protected)');
} catch (err) {
  console.error('❌ Failed to load user routes:', err.message);
}

// --- Project Routes (Protected: Auth + Tenant Isolation) ---
let projectRoutes;
try {
  projectRoutes = require('./routes/project-routes');
  app.use('/api/projects', authenticate, tenantIsolation, projectRoutes);
  console.log('✅ Project routes mounted at /api/projects (protected)');
} catch (err) {
  console.error('❌ Failed to load project routes:', err.message);
}

// --- Task Routes (Protected: Auth + Tenant Isolation) ---
let taskRoutes;
try {
  taskRoutes = require('./routes/task-routes');
  app.use('/api/tasks', authenticate, tenantIsolation, taskRoutes);
  console.log('✅ Task routes mounted at /api/tasks (protected)');
} catch (err) {
  console.error('❌ Failed to load task routes:', err.message);
}

// --- Health Check (Public) ---
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    message: 'Backend is alive'
  });
});

// --- Protected Test Route ---
app.get('/api/test-protected', authenticate, tenantIsolation, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    user: req.user,
    tenantId: req.tenantId
  });
});

// --- Root Route ---
app.get('/', (req, res) => {
  res.json({ message: 'Multi-Tenant SaaS Backend is running!' });
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('All protected endpoints require Bearer token + tenant isolation');
});
