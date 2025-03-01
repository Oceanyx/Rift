// server-members.js
const express = require('express');
const { ServerMember, Server, User, Role, MemberRole } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { broadcastToServer } = require('../../socket');

const router = express.Router();

// Validation for member update
const validateMemberUpdate = [
  check('nickname')
    .optional()
    .isLength({ min: 1, max: 32 })
    .withMessage('Nickname must be between 1 and 32 characters'),
  handleValidationErrors
];

// Get all members of a server
router.get('/server/:serverId', requireAuth, async (req, res) => {
  const { serverId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is a member of the server
    const userMembership = await ServerMember.findOne({
      where: { server_id: serverId, user_id: userId }
    });

    if (!userMembership) {
      return res.status(403).json({ message: 'You must be a member of this server to view members' });
    }

    // Get all members with their user information
    const members = await ServerMember.findAll({
      where: { server_id: serverId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'avatar_url']
        },
        {
          model: MemberRole,
          include: [{ model: Role }]
        }
      ]
    });

    res.json({ members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve server members' });
  }
});

// Update a member (set nickname)
router.put('/:memberId', requireAuth, validateMemberUpdate, async (req, res) => {
  const { memberId } = req.params;
  const { nickname } = req.body;
  const userId = req.user.id;

  try {
    const member = await ServerMember.findByPk(memberId, {
      include: [
        { model: Server },
        { model: User, attributes: ['id', 'username', 'avatar_url'] }
      ]
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Users can only update their own nickname unless they're the server owner
    if (member.user_id !== userId && member.Server.owner_id !== userId) {
      return res.status(403).json({ message: 'You can only change your own nickname unless you are the server owner' });
    }

    // Update member
    await member.update({
      nickname: nickname
    });

    // Broadcast member update
    broadcastToServer(member.server_id, {
      type: 'MEMBER_UPDATED',
      member: member.toJSON()
    });

    res.json({ member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update member' });
  }
});

// Kick a member from a server
router.delete('/:memberId', requireAuth, async (req, res) => {
  const { memberId } = req.params;
  const userId = req.user.id;

  try {
    const member = await ServerMember.findByPk(memberId, {
      include: [
        { model: Server },
        { model: User, attributes: ['id', 'username'] }
      ]
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Only server owner can kick members
    if (member.Server.owner_id !== userId) {
      return res.status(403).json({ message: 'Only the server owner can remove members' });
    }

    // Cannot kick the server owner
    if (member.user_id === member.Server.owner_id) {
      return res.status(400).json({ message: 'Cannot remove the server owner' });
    }

    const serverId = member.server_id;
    const kickedUserId = member.user_id;

    // Delete member
    await member.destroy();

    // Broadcast member kick
    broadcastToServer(serverId, {
      type: 'MEMBER_KICKED',
      memberId,
      userId: kickedUserId,
      serverId
    });

    res.json({ message: 'Member removed from server' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to remove member' });
  }
});

module.exports = router;