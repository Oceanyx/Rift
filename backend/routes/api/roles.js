// roles.js
const express = require('express');
const { Role, Server, MemberRole, ServerMember } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { broadcastToServer } = require('../../socket');

const router = express.Router();

// Validation for role creation/update
const validateRole = [
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ min: 1, max: 32 })
    .withMessage('Role name must be between 1 and 32 characters'),
  check('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color code'),
  check('permissions')
    .isInt({ min: 0 })
    .withMessage('Permissions must be a valid integer'),
  handleValidationErrors
];

// Create a new role
router.post('/server/:serverId', requireAuth, validateRole, async (req, res) => {
  const { serverId } = req.params;
  const { name, color, permissions } = req.body;
  const userId = req.user.id;

  try {
    // Check if server exists
    const server = await Server.findByPk(serverId);
    
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Only the server owner can create roles
    if (server.owner_id !== userId) {
      return res.status(403).json({ message: 'Only the server owner can create roles' });
    }

    // Create role
    const role = await Role.create({
      server_id: serverId,
      name,
      color: color || '#99AAB5', // Default color
      permissions,
      created_at: new Date(),
      updatedAt: new Date()
    });

    // Broadcast new role to server
    broadcastToServer(serverId, {
      type: 'ROLE_CREATED',
      role: role.toJSON()
    });

    res.status(201).json({ role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Role creation failed' });
  }
});

// Get all roles for a server
router.get('/server/:serverId', requireAuth, async (req, res) => {
  const { serverId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is a member of the server
    const membership = await ServerMember.findOne({
      where: { server_id: serverId, user_id: userId }
    });

    if (!membership) {
      return res.status(403).json({ message: 'You must be a member of this server to view roles' });
    }

     // Get roles
     const roles = await Role.findAll({
        where: { server_id: serverId },
        order: [['created_at', 'ASC']]
      });
  
      res.json({ roles });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve roles' });
    }
  });
  
  // Update a role
  router.put('/:roleId', requireAuth, validateRole, async (req, res) => {
    const { roleId } = req.params;
    const { name, color, permissions } = req.body;
    const userId = req.user.id;
  
    try {
      const role = await Role.findByPk(roleId, {
        include: [{ model: Server }]
      });
  
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
  
      // Only server owner can update roles
      if (role.Server.owner_id !== userId) {
        return res.status(403).json({ message: 'Only the server owner can update roles' });
      }
  
      // Don't allow modifying @everyone role's permissions
      if (role.name === '@everyone' && permissions !== role.permissions) {
        return res.status(400).json({ message: 'Cannot modify @everyone role permissions' });
      }
  
      // Update role
      await role.update({
        name: name || role.name,
        color: color || role.color,
        permissions: permissions !== undefined ? permissions : role.permissions,
        updatedAt: new Date()
      });
  
      // Broadcast role update
      broadcastToServer(role.server_id, {
        type: 'ROLE_UPDATED',
        role: role.toJSON()
      });
  
      res.json({ role });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update role' });
    }
  });
  
  // Delete a role
  router.delete('/:roleId', requireAuth, async (req, res) => {
    const { roleId } = req.params;
    const userId = req.user.id;
  
    try {
      const role = await Role.findByPk(roleId, {
        include: [{ model: Server }]
      });
  
      if (!role) {
        return res.status(404).json({ message: 'Role not found' });
      }
  
      // Only server owner can delete roles
      if (role.Server.owner_id !== userId) {
        return res.status(403).json({ message: 'Only the server owner can delete roles' });
      }
  
      // Don't allow deleting @everyone role
      if (role.name === '@everyone') {
        return res.status(400).json({ message: 'Cannot delete @everyone role' });
      }
  
      const serverId = role.server_id;
  
      // Delete role
      await role.destroy();
  
      // Broadcast role deletion
      broadcastToServer(serverId, {
        type: 'ROLE_DELETED',
        roleId,
        serverId
      });
  
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete role' });
    }
  });
  
  // Assign a role to a member
  router.post('/member/:memberId', requireAuth, async (req, res) => {
    const { memberId } = req.params;
    const { roleId } = req.body;
    const userId = req.user.id;
  
    try {
      // Get the member and role information
      const member = await ServerMember.findByPk(memberId, {
        include: [{ model: Server }]
      });
  
      if (!member) {
        return res.status(404).json({ message: 'Server member not found' });
      }
  
      const role = await Role.findByPk(roleId);
  
      if (!role || role.server_id !== member.server_id) {
        return res.status(404).json({ message: 'Role not found or not part of this server' });
      }
  
      // Check permissions (only server owner can assign roles)
      if (member.Server.owner_id !== userId) {
        return res.status(403).json({ message: 'Only the server owner can assign roles' });
      }
  
      // Check if role is already assigned
      const existingAssignment = await MemberRole.findOne({
        where: {
          member_id: memberId,
          role_id: roleId
        }
      });
  
      if (existingAssignment) {
        return res.status(400).json({ message: 'Role is already assigned to this member' });
      }
  
      // Create role assignment
      const memberRole = await MemberRole.create({
        member_id: memberId,
        role_id: roleId
      });
  
      // Broadcast role assignment
      broadcastToServer(member.server_id, {
        type: 'ROLE_ASSIGNED',
        memberId,
        roleId,
        serverId: member.server_id
      });
  
      res.status(201).json({ memberRole });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to assign role' });
    }
  });
  
  // Remove a role from a member
  router.delete('/member/:memberId/role/:roleId', requireAuth, async (req, res) => {
    const { memberId, roleId } = req.params;
    const userId = req.user.id;
  
    try {
      // Get the member and role information
      const member = await ServerMember.findByPk(memberId, {
        include: [{ model: Server }]
      });
  
      if (!member) {
        return res.status(404).json({ message: 'Server member not found' });
      }
  
      const role = await Role.findByPk(roleId);
  
      if (!role || role.server_id !== member.server_id) {
        return res.status(404).json({ message: 'Role not found or not part of this server' });
      }
  
      // Check permissions (only server owner can remove roles)
      if (member.Server.owner_id !== userId) {
        return res.status(403).json({ message: 'Only the server owner can remove roles' });
      }
  
      // Find and delete role assignment
      const memberRole = await MemberRole.findOne({
        where: {
          member_id: memberId,
          role_id: roleId
        }
      });
  
      if (!memberRole) {
        return res.status(404).json({ message: 'Member does not have this role' });
      }
  
      await memberRole.destroy();
  
      // Broadcast role removal
      broadcastToServer(member.server_id, {
        type: 'ROLE_REMOVED',
        memberId,
        roleId,
        serverId: member.server_id
      });
  
      res.json({ message: 'Role removed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to remove role' });
    }
  });
  
  module.exports = router;