// backend/routes/project-routes.js
const express = require('express');
const { createProject, listProjects, updateProject, deleteProject } = require('../controllers/projectController');
const { authenticate } = require('../middleware/authMiddleware');
const { tenantIsolation } = require('../middleware/tenantIsolation'); // ← Import this line (fixes the crash!)

const router = express.Router();

// Apply authentication + tenant isolation to all project routes
router.use(authenticate, tenantIsolation);

// Create new project
router.post('/', createProject);

// List all projects for the tenant
router.get('/', listProjects);

// Update a project
router.put('/:projectId', updateProject);

// Delete a project
router.delete('/:projectId', deleteProject);

module.exports = router;