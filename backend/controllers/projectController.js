// backend/controllers/projectController.js
const pool = require('../config/db');
const { errorResponse, successResponse } = require('../utils/auth');

async function createProject(req, res) {
  const tenantId = req.tenantId;
  const { name, description, status = 'active' } = req.body;
  const createdBy = req.user.userId;

  if (!name) {
    return errorResponse(res, 400, 'Project name is required');
  }

  try {
    const result = await pool.query(
      `INSERT INTO projects (tenant_id, name, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, description, status, created_by`,
      [tenantId, name, description || null, status, createdBy]
    );

    successResponse(res, 201, { project: result.rows[0] }, 'Project created successfully');
  } catch (err) {
    console.error('Create project error:', err.stack);
    errorResponse(res, 500, 'Error creating project');
  }
}

async function listProjects(req, res) {
  const tenantId = req.tenantId;

  try {
    const result = await pool.query(
      `SELECT 
         p.id, 
         p.name, 
         p.description, 
         p.status, 
         p.created_by, 
         u.full_name AS "creatorName",
         (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS "taskCount",
         (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') AS "completedTaskCount"
       FROM projects p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.tenant_id = $1
       ORDER BY p.created_at DESC`,
      [tenantId]
    );

    successResponse(res, 200, { projects: result.rows }, 'Projects fetched successfully');
  } catch (err) {
    console.error('List projects error:', err.stack);
    errorResponse(res, 500, 'Error fetching projects');
  }
}

async function updateProject(req, res) {
  const { projectId } = req.params;
  const tenantId = req.tenantId;
  const { name, description, status } = req.body;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const projectResult = await pool.query(
      'SELECT created_by FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    if (projectResult.rows.length === 0) {
      return errorResponse(res, 404, 'Project not found');
    }

    const projectCreator = projectResult.rows[0].created_by;

    if (userRole !== 'tenant_admin' && userId !== projectCreator) {
      return errorResponse(res, 403, 'Only tenant admin or project creator can update');
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (status) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }

    if (fields.length === 0) return errorResponse(res, 400, 'No fields to update');

    values.push(tenantId, projectId);
    const query = `
      UPDATE projects
      SET ${fields.join(', ')}
      WHERE tenant_id = $${idx++} AND id = $${idx}
      RETURNING id, name, description, status, created_by
    `;

    const result = await pool.query(query, values);

    successResponse(res, 200, { project: result.rows[0] }, 'Project updated');
  } catch (err) {
    console.error('Update project error:', err.stack);
    errorResponse(res, 500, 'Error updating project');
  }
}

async function deleteProject(req, res) {
  const { projectId } = req.params;
  const tenantId = req.tenantId;
  const userId = req.user.userId;
  const userRole = req.user.role;

  try {
    const projectResult = await pool.query(
      'SELECT created_by FROM projects WHERE id = $1 AND tenant_id = $2',
      [projectId, tenantId]
    );

    if (projectResult.rows.length === 0) {
      return errorResponse(res, 404, 'Project not found');
    }

    const projectCreator = projectResult.rows[0].created_by;

    if (userRole !== 'tenant_admin' && userId !== projectCreator) {
      return errorResponse(res, 403, 'Only tenant admin or project creator can delete');
    }

    await pool.query('DELETE FROM projects WHERE id = $1 AND tenant_id = $2', [projectId, tenantId]);

    successResponse(res, 200, {}, 'Project deleted successfully');
  } catch (err) {
    console.error('Delete project error:', err.stack);
    errorResponse(res, 500, 'Error deleting project');
  }
}

module.exports = { createProject, listProjects, updateProject, deleteProject };