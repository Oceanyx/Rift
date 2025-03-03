// servers.js
const express = require('express');
const { Server, Channel, ServerMember, Role, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { broadcastToServer } = require('../../socket');

const router = express.Router();

// Validation for server creation
const validateServerCreation = [
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ min: 3, max: 50 })
    .withMessage('Server name must be between 3 and 50 characters'),
  check('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description cannot exceed 255 characters'),
  handleValidationErrors
];

// Create a new server
router.post('/', requireAuth, validateServerCreation, async (req, res) => {
  const { name, description, icon_url } = req.body;
  const userId = req.user.id;

  try {
    // Create server
    const server = await Server.create({
      name,
      description,
      icon_url,
      owner_id: userId,
      created_at: new Date(),
      updatedAt: new Date()
    });

    // Create default channels
    const generalChannel = await Channel.create({
      server_id: server.id,
      name: 'general',
      type: 'text',
      description: 'General discussion',
      created_at: new Date(),
      updatedAt: new Date()
    });

    // Create default "everyone" role
    const everyoneRole = await Role.create({
      server_id: server.id,
      name: '@everyone',
      color: '#99AAB5',
      permissions: 1, // basic permissions
      created_at: new Date(),
      updatedAt: new Date()
    });

    // Add creator as a member
    await ServerMember.create({
      server_id: server.id,
      user_id: userId,
      nickname: null,
      joined_at: new Date()
    });

    res.status(201).json({ 
      server,
      channels: [generalChannel],
      roles: [everyoneRole]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server creation failed' });
  }
});

// Get all servers a user is a member of
router.get('/me', requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const memberships = await ServerMember.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Server,
          include: [
            {
              model: Channel,
              limit: 5, // Just get first 5 channels for preview
              order: [['createdAt', 'ASC']]
            }
          ]
        }
      ]
    });

    const servers = memberships.map(membership => membership.Server);
    res.json({ servers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve servers' });
  }
});

// Get a specific server with channels and roles
router.get('/:serverId', requireAuth, async (req, res) => {
  const { serverId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is a member
    const membership = await ServerMember.findOne({
      where: { server_id: serverId, user_id: userId }
    });

    if (!membership) {
      return res.status(403).json({ message: 'Not a member of this server' });
    }

    // Get server with channels
    const server = await Server.findByPk(serverId, {
      include: [
        {
          model: Channel,
          order: [['created_at', 'ASC']]
        },
        {
          model: Role,
          order: [['created_at', 'ASC']]
        },
        {
          model: ServerMember,
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'avatar_url']
            }
          ]
        }
      ]
    });

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    res.json({ server });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve server' });
  }
});

// Update a server
router.put('/:serverId', requireAuth, validateServerCreation, async (req, res) => {
  const { serverId } = req.params;
  const { name, description, icon_url } = req.body;
  const userId = req.user.id;

  try {
    const server = await Server.findByPk(serverId);

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Check if user is the owner
    if (server.owner_id !== userId) {
      return res.status(403).json({ message: 'You must be the server owner to update it' });
    }

    // Update server
    await server.update({
      name: name || server.name,
      description: description !== undefined ? description : server.description,
      icon_url: icon_url || server.icon_url,
      updatedAt: new Date()
    });

    // Broadcast update to all connected clients in this server
    broadcastToServer(serverId, {
      type: 'SERVER_UPDATED',
      server: server.toJSON()
    });

    res.json({ server });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update server' });
  }
});

// Delete a server
router.delete('/:serverId', requireAuth, async (req, res) => {
  const { serverId } = req.params;
  const userId = req.user.id;

  try {
    const server = await Server.findByPk(serverId);

    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Check if user is the owner
    if (server.owner_id !== userId) {
      return res.status(403).json({ message: 'You must be the server owner to delete it' });
    }

    // Delete server (cascade will handle related records)
    await server.destroy();

    // Broadcast deletion to all connected clients in this server
    broadcastToServer(serverId, {
      type: 'SERVER_DELETED',
      serverId
    });

    res.json({ message: 'Server deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete server' });
  }
});

// Join a server (with an invite code - you'd need to implement this)
router.post('/:serverId/join', requireAuth, async (req, res) => {
  const { serverId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is already a member
    const existingMembership = await ServerMember.findOne({
      where: { server_id: serverId, user_id: userId }
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'Already a member of this server' });
    }

    // Create membership
    const member = await ServerMember.create({
      server_id: serverId,
      user_id: userId,
      joined_at: new Date()
    });

    // Get user info
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'avatar_url']
    });

    // Broadcast new member to server
    broadcastToServer(serverId, {
      type: 'MEMBER_JOINED',
      serverId,
      member: {
        ...member.toJSON(),
        User: user
      }
    });

    res.json({ message: 'Successfully joined server', member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to join server' });
  }
});

// Leave a server
router.delete('/:serverId/leave', requireAuth, async (req, res) => {
  const { serverId } = req.params;
  const userId = req.user.id;

  try {
    const server = await Server.findByPk(serverId);
    
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Can't leave if you're the owner
    if (server.owner_id === userId) {
      return res.status(400).json({ message: 'Server owner cannot leave, transfer ownership first or delete the server' });
    }

    // Find and delete membership
    const membership = await ServerMember.findOne({
      where: { server_id: serverId, user_id: userId }
    });

    if (!membership) {
      return res.status(404).json({ message: 'Not a member of this server' });
    }

    await membership.destroy();

    // Broadcast member leave to server
    broadcastToServer(serverId, {
      type: 'MEMBER_LEFT',
      serverId,
      userId
    });

    res.json({ message: 'Successfully left server' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to leave server' });
  }
});

module.exports = router;