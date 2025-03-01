// channels.js
const express = require('express');
const { Channel, Message, Server, User } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { broadcastToServer, broadcastToChannel } = require('../../socket');

const router = express.Router();

// Validation for channel creation/update
const validateChannel = [
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ min: 1, max: 32 })
    .withMessage('Channel name must be between 1 and 32 characters')
    .matches(/^[a-z0-9_-]+$/)
    .withMessage('Channel name can only contain lowercase letters, numbers, hyphens, and underscores'),
  check('type')
    .isIn(['text', 'voice', 'announcement'])
    .withMessage('Channel type must be text, voice, or announcement'),
  check('description')
    .optional()
    .isLength({ max: 1024 })
    .withMessage('Description cannot exceed 1024 characters'),
  handleValidationErrors
];

// Create a new channel in a server
router.post('/server/:serverId', requireAuth, validateChannel, async (req, res) => {
  const { serverId } = req.params;
  const { name, type, description } = req.body;
  const userId = req.user.id;

  try {
    // Check if server exists and user is a member
    const server = await Server.findByPk(serverId);
    
    if (!server) {
      return res.status(404).json({ message: 'Server not found' });
    }

    // Only owner or members with proper permissions should create channels
    // For simplicity, I'm only checking if it's the owner here
    if (server.owner_id !== userId) {
      return res.status(403).json({ message: 'You need proper permissions to create channels' });
    }

    // Create channel
    const channel = await Channel.create({
      server_id: serverId,
      name,
      type,
      description: description || null,
      created_at: new Date(),
      updated_at: new Date()
    });

    // Broadcast new channel to server members
    broadcastToServer(serverId, {
      type: 'CHANNEL_CREATED',
      channel: channel.toJSON()
    });

    res.status(201).json({ channel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Channel creation failed' });
  }
});

// Get all channels in a server
router.get('/server/:serverId', requireAuth, async (req, res) => {
  const { serverId } = req.params;

  try {
    const channels = await Channel.findAll({
      where: { server_id: serverId },
      order: [['created_at', 'ASC']]
    });

    res.json({ channels });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve channels' });
  }
});

// Get a specific channel with messages
router.get('/:channelId', requireAuth, async (req, res) => {
  const { channelId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const before = req.query.before ? new Date(req.query.before) : null;

  try {
    // Get the channel
    const channel = await Channel.findByPk(channelId);
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Build message query
    const messageQuery = {
      where: { channel_id: channelId },
      limit,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'avatar_url']
        }
      ]
    };

    // Add before condition if provided
    if (before) {
      messageQuery.where.created_at = { [Op.lt]: before };
    }

    // Get messages
    const messages = await Message.findAll(messageQuery);

    res.json({ 
      channel,
      messages: messages.reverse() // Return in ascending order for display
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve channel' });
  }
});

// Update a channel
router.put('/:channelId', requireAuth, validateChannel, async (req, res) => {
  const { channelId } = req.params;
  const { name, type, description } = req.body;
  const userId = req.user.id;

  try {
    const channel = await Channel.findByPk(channelId, {
      include: [{ model: Server }]
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check permissions (only server owner for simplicity)
    if (channel.Server.owner_id !== userId) {
      return res.status(403).json({ message: 'You need proper permissions to update this channel' });
    }

    // Update channel
    await channel.update({
      name: name || channel.name,
      type: type || channel.type,
      description: description !== undefined ? description : channel.description,
      updated_at: new Date()
    });

    // Broadcast channel update
    broadcastToServer(channel.server_id, {
      type: 'CHANNEL_UPDATED',
      channel: channel.toJSON()
    });

    res.json({ channel });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update channel' });
  }
});

// Delete a channel
router.delete('/:channelId', requireAuth, async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user.id;

  try {
    const channel = await Channel.findByPk(channelId, {
      include: [{ model: Server }]
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check permissions (only server owner for simplicity)
    if (channel.Server.owner_id !== userId) {
      return res.status(403).json({ message: 'You need proper permissions to delete this channel' });
    }

    const serverId = channel.server_id;

    // Delete channel
    await channel.destroy();

    // Broadcast channel deletion
    broadcastToServer(serverId, {
      type: 'CHANNEL_DELETED',
      channelId,
      serverId
    });

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete channel' });
  }
});

module.exports = router;