// messages.js
const express = require('express');
const { Message, Channel, User, ServerMember } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { broadcastToChannel } = require('../../socket');
const { Op } = require('sequelize');

const router = express.Router();

// Validation for message creation
const validateMessage = [
  check('content')
    .exists({ checkFalsy: true })
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  handleValidationErrors
];

// Create a new message
router.post('/channel/:channelId', requireAuth, validateMessage, async (req, res) => {
  const { channelId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    // Check if channel exists
    const channel = await Channel.findByPk(channelId);
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is a member of the server
    const membership = await ServerMember.findOne({
      where: { 
        server_id: channel.server_id,
        user_id: userId
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'You must be a member of the server to send messages' });
    }

    // Create message
    const message = await Message.create({
      channel_id: channelId,
      user_id: userId,
      content,
      has_attachment: false,
      created_at: new Date(),
      updatedAt: new Date()
    });

    // Get user information for the response
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'avatar_url']
    });

    const messageWithUser = {
      ...message.toJSON(),
      User: user
    };

    // Broadcast new message to channel
    broadcastToChannel(channelId, {
      type: 'MESSAGE_CREATED',
      message: messageWithUser
    });

    res.status(201).json({ message: messageWithUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create message' });
  }
});

// Get messages for a channel
router.get('/channel/:channelId', requireAuth, async (req, res) => {
  const { channelId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  const before = req.query.before ? new Date(req.query.before) : null;
  const userId = req.user.id;

  try {
    // Check if channel exists
    const channel = await Channel.findByPk(channelId);
    
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if user is a member of the server
    const membership = await ServerMember.findOne({
      where: { 
        server_id: channel.server_id,
        user_id: userId
      }
    });

    if (!membership) {
      return res.status(403).json({ message: 'You must be a member of the server to view messages' });
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
      messages: messages.reverse() // Return in ascending order for display
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve messages' });
  }
});

// Update a message
router.put('/:messageId', requireAuth, validateMessage, async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const message = await Message.findByPk(messageId, {
      include: [
        {
          model: Channel,
        },
        {
          model: User,
          attributes: ['id', 'username', 'avatar_url']
        }
      ]
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only the author can edit their messages
    if (message.user_id !== userId) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    // Update message
    await message.update({
      content,
      updatedAt: new Date()
    });

    // Broadcast message update
    broadcastToChannel(message.channel_id, {
      type: 'MESSAGE_UPDATED',
      message: message.toJSON()
    });

    res.json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update message' });
  }
});

// Delete a message
router.delete('/:messageId', requireAuth, async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  try {
    const message = await Message.findByPk(messageId, {
      include: [{ model: Channel }]
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Only the author can delete their messages
    // (or server owner, but for simplicity we're just checking author)
    if (message.user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    const channelId = message.channel_id;

    // Delete message
    await message.destroy();

    // Broadcast message deletion
    broadcastToChannel(channelId, {
      type: 'MESSAGE_DELETED',
      messageId,
      channelId
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

module.exports = router;