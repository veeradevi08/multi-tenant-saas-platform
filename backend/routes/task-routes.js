// backend/routes/task-routes.js
const express = require('express');
const {
  createTask,
  listTasks,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');
const { authenticate } = require('../middleware/authMiddleware');
const { tenantIsolation } = require('../middleware/tenantIsolation');

const router = express.Router();

// Apply authentication + tenant isolation to all task routes
router.use(authenticate, tenantIsolation);

// Correct route paths to match /api/projects/:projectId/tasks

// Create task in a project
router.post('/projects/:projectId/tasks', createTask);

// List tasks in a project
router.get('/projects/:projectId/tasks', listTasks);

// Update full task
router.put('/tasks/:taskId', updateTask);

// Update task status only
router.patch('/tasks/:taskId/status', updateTaskStatus);

// Delete task
router.delete('/tasks/:taskId', deleteTask);

module.exports = router;
