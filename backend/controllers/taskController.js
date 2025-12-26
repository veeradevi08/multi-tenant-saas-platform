// backend/controllers/taskController.js
const pool = require('../config/db');
const { errorResponse, successResponse } = require('../utils/auth');

async function createTask(req, res) {
  const tenantId = req.tenantId;
  const { projectId } = req.params;
  const { title, description, priority = 'medium', dueDate, assignedTo } = req.body;

  if (!title) {
    return errorResponse(res, 400, 'Task title is required');
  }

  try {
    // Verify project belongs to tenant
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );
    if (projectCheck.rows.length === 0) {
      return errorResponse(res, 404, 'Project not found in this tenant');
    }

    // Verify assignedTo if provided
    if (assignedTo) {
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, tenantId]
      );
      if (userCheck.rows.length === 0) {
        return errorResponse(res, 400, 'Assigned user not in this tenant');
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks (project_id, tenant_id, title, description, priority, due_date, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, description, status, priority, due_date, assigned_to`,
      [projectId, tenantId, title, description || null, priority, dueDate || null, assignedTo || null]
    );

    successResponse(res, 201, { task: result.rows[0] }, 'Task created successfully');
  } catch (err) {
    console.error('Create task error:', err.stack);
    errorResponse(res, 500, 'Error creating task');
  }
}

// List tasks in a project
async function listTasks(req, res) {
  const tenantId = req.tenantId;
  const { projectId } = req.params;

  try {
    // Verify project exists in tenant
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );
    if (projectCheck.rows.length === 0) {
      return errorResponse(res, 404, 'Project not found in this tenant');
    }

    const result = await pool.query(
      `SELECT 
         t.id, t.title, t.description, t.status, t.priority, t.due_date, t.assigned_to,
         u.full_name AS "assignedToName"
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1 AND t.tenant_id = $2
       ORDER BY t.priority DESC, t.due_date ASC NULLS LAST`,
      [projectId, tenantId]
    );

    successResponse(res, 200, { tasks: result.rows }, 'Tasks fetched successfully');
  } catch (err) {
    console.error('List tasks error:', err.stack);
    errorResponse(res, 500, 'Error fetching tasks');
  }
}

// Update full task
async function updateTask(req, res) {
  const { taskId } = req.params;
  const tenantId = req.tenantId;
  const { title, description, status, priority, assignedTo, dueDate } = req.body;

  try {
    // Verify task exists in tenant
    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2',
      [taskId, tenantId]
    );
    if (taskCheck.rows.length === 0) {
      return errorResponse(res, 404, 'Task not found');
    }

    // If assignedTo changed, verify user in tenant
    if (assignedTo !== undefined) {
      if (assignedTo) {
        const userCheck = await pool.query(
          'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
          [assignedTo, tenantId]
        );
        if (userCheck.rows.length === 0) {
          return errorResponse(res, 400, 'Assigned user not in this tenant');
        }
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (title) {
      fields.push(`title = $${idx++}`);
      values.push(title);
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (status) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }
    if (priority) {
      fields.push(`priority = $${idx++}`);
      values.push(priority);
    }
    if (assignedTo !== undefined) {
      fields.push(`assigned_to = $${idx++}`);
      values.push(assignedTo || null);
    }
    if (dueDate !== undefined) {
      fields.push(`due_date = $${idx++}`);
      values.push(dueDate || null);
    }

    if (fields.length === 0) return errorResponse(res, 400, 'No fields to update');

    values.push(tenantId, taskId);
    const query = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE tenant_id = $${idx++} AND id = $${idx}
      RETURNING id, title, description, status, priority, due_date, assigned_to
    `;

    const result = await pool.query(query, values);

    successResponse(res, 200, { task: result.rows[0] }, 'Task updated successfully');
  } catch (err) {
    console.error('Update task error:', err.stack);
    errorResponse(res, 500, 'Error updating task');
  }
}

// Update task status only (PATCH)
async function updateTaskStatus(req, res) {
  const { taskId } = req.params;
  const tenantId = req.tenantId;
  const { status } = req.body;

  if (!status || !['todo', 'in_progress', 'completed'].includes(status)) {
    return errorResponse(res, 400, 'Invalid status');
  }

  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING id, title, status',
      [status, taskId, tenantId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Task not found');
    }

    successResponse(res, 200, { task: result.rows[0] }, 'Task status updated');
  } catch (err) {
    console.error('Update task status error:', err.stack);
    errorResponse(res, 500, 'Error updating task status');
  }
}

// Delete task
async function deleteTask(req, res) {
  const { taskId } = req.params;
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [taskId, tenantId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Task not found');
    }

    successResponse(res, 200, {}, 'Task deleted successfully');
  } catch (err) {
    console.error('Delete task error:', err.stack);
    errorResponse(res, 500, 'Error deleting task');
  }
}
// Update full task (PUT)
async function updateTask(req, res) {
  const { taskId } = req.params;
  const tenantId = req.tenantId;
  const { title, description, status, priority, assignedTo, dueDate } = req.body;

  try {
    const taskCheck = await pool.query(
      'SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2',
      [taskId, tenantId]
    );
    if (taskCheck.rows.length === 0) {
      return errorResponse(res, 404, 'Task not found');
    }

    if (assignedTo !== undefined && assignedTo) {
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
        [assignedTo, tenantId]
      );
      if (userCheck.rows.length === 0) {
        return errorResponse(res, 400, 'Assigned user not in tenant');
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (title) { fields.push(`title = $${idx++}`); values.push(title); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (status) { fields.push(`status = $${idx++}`); values.push(status); }
    if (priority) { fields.push(`priority = $${idx++}`); values.push(priority); }
    if (assignedTo !== undefined) { fields.push(`assigned_to = $${idx++}`); values.push(assignedTo || null); }
    if (dueDate !== undefined) { fields.push(`due_date = $${idx++}`); values.push(dueDate || null); }

    if (fields.length === 0) return errorResponse(res, 400, 'No fields to update');

    values.push(tenantId, taskId);
    const query = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE tenant_id = $${idx++} AND id = $${idx}
      RETURNING id, title, description, status, priority, due_date, assigned_to
    `;

    const result = await pool.query(query, values);

    successResponse(res, 200, { task: result.rows[0] }, 'Task updated');
  } catch (err) {
    console.error('Update task error:', err.stack);
    errorResponse(res, 500, 'Error updating task');
  }
}

// Update status only (PATCH)
async function updateTaskStatus(req, res) {
  const { taskId } = req.params;
  const tenantId = req.tenantId;
  const { status } = req.body;

  if (!status || !['todo', 'in_progress', 'completed'].includes(status)) {
    return errorResponse(res, 400, 'Invalid status');
  }

  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 AND tenant_id = $3 RETURNING id, title, status',
      [status, taskId, tenantId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Task not found');
    }

    successResponse(res, 200, { task: result.rows[0] }, 'Task status updated');
  } catch (err) {
    console.error('Update status error:', err.stack);
    errorResponse(res, 500, 'Error updating status');
  }
}

// Delete task
async function deleteTask(req, res) {
  const { taskId } = req.params;
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [taskId, tenantId]
    );

    if (result.rows.length === 0) {
      return errorResponse(res, 404, 'Task not found');
    }

    successResponse(res, 200, {}, 'Task deleted');
  } catch (err) {
    console.error('Delete task error:', err.stack);
    errorResponse(res, 500, 'Error deleting task');
  }
}
module.exports = {
  createTask,
  listTasks,
  updateTask,
  updateTaskStatus,
  deleteTask
};