const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { jwtConfig } = require('../config');
const { Op } = require('sequelize');
const { 
  User, 
  Message, 
  Server, 
  Channel, 
  ServerMember,
  DirectMessage,
  Attachment,
  Role,
  MemberRole,
  Emoji,
  MessageReaction,
  DirectMessageReaction
} = require('../db/models');


// Store active connections
const connections = new Map();

function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws, req) => {
    try {
      // Extract token from cookies
      const cookieString = req.headers.cookie || '';
      const tokenMatch = cookieString.match(/token=([^;]+)/);
      
      if (!tokenMatch) {
        ws.close(4001, 'Authentication required');
        return;
      }
      
      const token = tokenMatch[1];
      
      // Verify the JWT token
      let userData;
      try {
        const decoded = jwt.verify(token, jwtConfig.secret);
        userData = decoded.data;
      } catch (error) {
        console.error('WebSocket authentication error:', error);
        ws.close(4001, 'Invalid authentication');
        return;
      }
      
      const userId = userData.id;
      
      // Verify user exists in database
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'avatar_url', 'status']
      });
      
      if (!user) {
        ws.close(4001, 'User not found');
        return;
      }

      // Store connection with user ID as key
      if (!connections.has(userId)) {
        connections.set(userId, []);
      }
      connections.get(userId).push(ws);
      
      // Set user data on socket for later use
      ws.userId = userId;
      ws.userData = user.toJSON();

      // Send initial connection confirmation
      ws.send(JSON.stringify({ 
        type: 'CONNECTION_ESTABLISHED', 
        user: ws.userData
      }));

      // Handle incoming messages
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message);
          
          switch (data.type) {
            case 'JOIN_SERVER':
              // Subscribe to server events and verify membership
              if (data.serverId) {
                // Verify user is a member of this server
                const membership = await ServerMember.findOne({
                  where: {
                    server_id: data.serverId,
                    user_id: userId
                  }
                });
                
                if (!membership) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'You are not a member of this server' 
                  }));
                  return;
                }
                
                ws.serverId = data.serverId;
                
                // Fetch server details including roles
                const server = await Server.findByPk(data.serverId, {
                  include: [
                    {
                      model: Channel,
                      attributes: ['id', 'name', 'type', 'description']
                    },
                    {
                      model: Role,
                      attributes: ['id', 'name', 'color', 'permissions']
                    }
                  ]
                });
                
                // Fetch user roles in this server
                const memberRoles = await MemberRole.findAll({
                  where: {
                    member_id: membership.id
                  },
                  include: [
                    {
                      model: Role,
                      attributes: ['id', 'name', 'color', 'permissions']
                    }
                  ]
                });
                
                const userRoles = memberRoles.map(mr => mr.Role);
                
                ws.send(JSON.stringify({ 
                  type: 'SERVER_JOINED', 
                  server: server,
                  userRoles: userRoles
                }));
              }
              break;
              
            case 'JOIN_CHANNEL':
              // Subscribe to channel events and verify access
              if (data.channelId) {
                // Verify channel exists and user has access
                const channel = await Channel.findByPk(data.channelId);
                
                if (!channel) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Channel not found' 
                  }));
                  return;
                }
                
                // Check if user is a member of the server this channel belongs to
                const serverMembership = await ServerMember.findOne({
                  where: {
                    server_id: channel.server_id,
                    user_id: userId
                  }
                });
                
                if (!serverMembership) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'You do not have access to this channel' 
                  }));
                  return;
                }
                
                ws.channelId = data.channelId;
                ws.serverId = channel.server_id;
                
                // Fetch recent messages with reactions and attachments
                const messages = await Message.findAll({
                  where: { channel_id: data.channelId },
                  limit: 50,
                  order: [['created_at', 'DESC']],
                  include: [
                    {
                      model: User,
                      attributes: ['id', 'username', 'avatar_url']
                    },
                    {
                      model: Attachment,
                      attributes: ['id', 'file_url', 'file_type', 'file_name']
                    },
                    {
                      model: MessageReaction,
                      include: [
                        {
                          model: User,
                          attributes: ['id', 'username']
                        },
                        {
                          model: Emoji,
                          attributes: ['id', 'name', 'unicode_character', 'image_url']
                        }
                      ]
                    }
                  ]
                });
                
                ws.send(JSON.stringify({ 
                  type: 'CHANNEL_JOINED', 
                  channelId: data.channelId,
                  messages: messages
                }));
              }
              break;
              
            case 'NEW_MESSAGE':
              // Handle new message creation
              if (data.channelId && data.content) {
                // Verify channel exists and user has access
                const channel = await Channel.findByPk(data.channelId);
                
                if (!channel) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Channel not found' 
                  }));
                  return;
                }
                
                // Check if user is a member of the server this channel belongs to
                const serverMembership = await ServerMember.findOne({
                  where: {
                    server_id: channel.server_id,
                    user_id: userId
                  }
                });
                
                if (!serverMembership) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'You do not have access to this channel' 
                  }));
                  return;
                }
                
                // Check for attachments
                let hasAttachment = false;
                if (data.attachments && data.attachments.length > 0) {
                  hasAttachment = true;
                }
                
                // Create message in database
                const newMessage = await Message.create({
                  channel_id: data.channelId,
                  user_id: userId,
                  content: data.content,
                  has_attachment: hasAttachment,
                  created_at: new Date(),
                  updated_at: new Date()
                });
                
                // Create attachments if any
                if (hasAttachment) {
                  for (const attachment of data.attachments) {
                    await Attachment.create({
                      message_id: newMessage.id,
                      file_url: attachment.url,
                      file_type: attachment.type,
                      file_name: attachment.name,
                      created_at: new Date()
                    });
                  }
                }
                
                // Fetch the complete message with user data and attachments
                const completeMessage = await Message.findByPk(newMessage.id, {
                  include: [
                    {
                      model: User,
                      attributes: ['id', 'username', 'avatar_url']
                    },
                    {
                      model: Attachment,
                      attributes: ['id', 'file_url', 'file_type', 'file_name']
                    }
                  ]
                });
                
                // Broadcast message to all clients in the channel
                broadcastToChannel(data.channelId, {
                  type: 'MESSAGE_CREATED',
                  message: completeMessage
                });
              }
              break;
              
            case 'NEW_DIRECT_MESSAGE':
              // Handle direct message creation
              if (data.recipientId && data.content) {
                // Verify recipient exists
                const recipient = await User.findByPk(data.recipientId);
                
                if (!recipient) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Recipient not found' 
                  }));
                  return;
                }
                
                // Check for attachments
                let hasAttachment = false;
                if (data.attachments && data.attachments.length > 0) {
                  hasAttachment = true;
                }
                
                // Create direct message in database
                const newDirectMessage = await DirectMessage.create({
                  sender_id: userId,
                  recipient_id: data.recipientId,
                  content: data.content,
                  has_attachment: hasAttachment,
                  created_at: new Date()
                });
                
                // Create attachments if any
                if (hasAttachment) {
                  for (const attachment of data.attachments) {
                    await Attachment.create({
                      message_id: newDirectMessage.id,
                      file_url: attachment.url,
                      file_type: attachment.type,
                      file_name: attachment.name,
                      created_at: new Date()
                    });
                  }
                }
                
                // Get the complete DM for broadcasting
                const completeDirectMessage = await DirectMessage.findByPk(newDirectMessage.id, {
                  include: [
                    {
                      model: User,
                      as: 'sender',
                      attributes: ['id', 'username', 'avatar_url']
                    },
                    {
                      model: Attachment,
                      attributes: ['id', 'file_url', 'file_type', 'file_name']
                    }
                  ]
                });
                
                // Send to sender
                broadcastToUser(userId, {
                  type: 'DIRECT_MESSAGE_CREATED',
                  message: completeDirectMessage
                });
                
                // Send to recipient
                broadcastToUser(data.recipientId, {
                  type: 'DIRECT_MESSAGE_CREATED',
                  message: completeDirectMessage
                });
              }
              break;
              
            case 'JOIN_DIRECT_CHAT':
              // Handle joining direct message chat
              if (data.otherUserId) {
                // Verify user exists
                const otherUser = await User.findByPk(data.otherUserId, {
                  attributes: ['id', 'username', 'avatar_url', 'status']
                });
                
                if (!otherUser) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'User not found' 
                  }));
                  return;
                }
                
                // Fetch recent direct messages
                const directMessages = await DirectMessage.findAll({
                  where: {
                    [Op.or]: [
                      { sender_id: userId, recipient_id: data.otherUserId },
                      { sender_id: data.otherUserId, recipient_id: userId }
                    ]
                  },
                  limit: 50,
                  order: [['created_at', 'DESC']],
                  include: [
                    {
                      model: User,
                      as: 'sender',
                      attributes: ['id', 'username', 'avatar_url']
                    },
                    {
                      model: Attachment,
                      attributes: ['id', 'file_url', 'file_type', 'file_name']
                    },
                    {
                      model: DirectMessageReaction,
                      include: [
                        {
                          model: User,
                          attributes: ['id', 'username']
                        },
                        {
                          model: Emoji,
                          attributes: ['id', 'name', 'unicode_character', 'image_url']
                        }
                      ]
                    }
                  ]
                });
                
                ws.directChatWith = data.otherUserId;
                
                ws.send(JSON.stringify({ 
                  type: 'DIRECT_CHAT_JOINED', 
                  user: otherUser,
                  messages: directMessages
                }));
              }
              break;
              
            case 'MESSAGE_REACTION':
              // Handle message reaction
              if (data.messageId && data.emojiId) {
                // Find the message
                const message = await Message.findByPk(data.messageId);
                
                if (!message) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Message not found' 
                  }));
                  return;
                }
                
                // Verify the emoji exists
                const emoji = await Emoji.findByPk(data.emojiId);
                
                if (!emoji) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Emoji not found' 
                  }));
                  return;
                }
                
                // Create or remove reaction
                if (data.action === 'add') {
                  await MessageReaction.create({
                    message_id: data.messageId,
                    user_id: userId,
                    emoji_id: data.emojiId,
                    created_at: new Date()
                  });
                } else if (data.action === 'remove') {
                  await MessageReaction.destroy({
                    where: {
                      message_id: data.messageId,
                      user_id: userId,
                      emoji_id: data.emojiId
                    }
                  });
                }
                
                // Broadcast reaction update to channel
                broadcastToChannel(message.channel_id, {
                  type: 'MESSAGE_REACTION_UPDATED',
                  messageId: data.messageId,
                  userId: userId,
                  emojiId: data.emojiId,
                  action: data.action,
                  emoji: emoji
                });
              }
              break;
              
            case 'DIRECT_MESSAGE_REACTION':
              // Handle direct message reaction
              if (data.messageId && data.emojiId) {
                // Find the direct message
                const directMessage = await DirectMessage.findByPk(data.messageId);
                
                if (!directMessage) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Message not found' 
                  }));
                  return;
                }
                
                // Verify the emoji exists
                const emoji = await Emoji.findByPk(data.emojiId);
                
                if (!emoji) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Emoji not found' 
                  }));
                  return;
                }
                
                // Verify user is part of this conversation
                if (directMessage.sender_id !== userId && directMessage.recipient_id !== userId) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'You do not have access to this message' 
                  }));
                  return;
                }
                
                // Create or remove reaction
                if (data.action === 'add') {
                  await DirectMessageReaction.create({
                    direct_message_id: data.messageId,
                    user_id: userId,
                    emoji_id: data.emojiId,
                    created_at: new Date()
                  });
                } else if (data.action === 'remove') {
                  await DirectMessageReaction.destroy({
                    where: {
                      direct_message_id: data.messageId,
                      user_id: userId,
                      emoji_id: data.emojiId
                    }
                  });
                }
                
                // Notify both participants
                const otherUserId = directMessage.sender_id === userId ? 
                  directMessage.recipient_id : directMessage.sender_id;
                
                const reactionData = {
                  type: 'DIRECT_MESSAGE_REACTION_UPDATED',
                  messageId: data.messageId,
                  userId: userId,
                  emojiId: data.emojiId,
                  action: data.action,
                  emoji: emoji
                };
                
                broadcastToUser(userId, reactionData);
                broadcastToUser(otherUserId, reactionData);
              }
              break;
              
            case 'UPDATE_MEMBER_ROLE':
              // Handle role assignments (admin only)
              if (data.serverId && data.memberId && data.roleIds) {
                // Verify server exists
                const server = await Server.findByPk(data.serverId);
                
                if (!server) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Server not found' 
                  }));
                  return;
                }
                
                // Verify user is the server owner
                if (server.owner_id !== userId) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Only the server owner can update roles' 
                  }));
                  return;
                }
                
                // Verify member exists
                const member = await ServerMember.findByPk(data.memberId);
                
                if (!member || member.server_id !== data.serverId) {
                  ws.send(JSON.stringify({ 
                    type: 'ERROR', 
                    message: 'Member not found in this server' 
                  }));
                  return;
                }
                
                // Verify roles exist and belong to this server
                for (const roleId of data.roleIds) {
                  const role = await Role.findByPk(roleId);
                  if (!role || role.server_id !== data.serverId) {
                    ws.send(JSON.stringify({ 
                      type: 'ERROR', 
                      message: `Role with ID ${roleId} not found in this server` 
                    }));
                    return;
                  }
                }
                
                // Remove existing roles
                await MemberRole.destroy({
                  where: { member_id: data.memberId }
                });
                
                // Add new roles
                for (const roleId of data.roleIds) {
                  await MemberRole.create({
                    member_id: data.memberId,
                    role_id: roleId
                  });
                }
                
                // Get updated member with roles
                const updatedMember = await ServerMember.findByPk(data.memberId, {
                  include: [
                    {
                      model: User,
                      attributes: ['id', 'username', 'avatar_url']
                    },
                    {
                      model: Role,
                      through: MemberRole,
                      attributes: ['id', 'name', 'color', 'permissions']
                    }
                  ]
                });
                
                // Broadcast role update to server
                broadcastToServer(data.serverId, {
                  type: 'MEMBER_ROLES_UPDATED',
                  member: updatedMember
                });
              }
              break;
              
            case 'TYPING_INDICATOR':
              // Handle typing indicators
              if (data.channelId) {
                broadcastToChannel(data.channelId, {
                  type: 'USER_TYPING',
                  channelId: data.channelId,
                  userId: userId,
                  username: ws.userData.username
                }, userId); // Exclude the sender
              } else if (data.recipientId) {
                // Direct message typing indicator
                broadcastToUser(data.recipientId, {
                  type: 'USER_TYPING_DIRECT',
                  userId: userId,
                  username: ws.userData.username
                });
              }
              break;
              
            default:
              ws.send(JSON.stringify({ 
                type: 'ERROR', 
                message: 'Unknown message type' 
              }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
          ws.send(JSON.stringify({ 
            type: 'ERROR', 
            message: 'Failed to process message' 
          }));
        }
      });

      // Handle disconnection
      ws.on('close', () => {
        const userConnections = connections.get(userId);
        if (userConnections) {
          const index = userConnections.indexOf(ws);
          if (index !== -1) {
            userConnections.splice(index, 1);
          }
          if (userConnections.length === 0) {
            connections.delete(userId);
            
            // Notify others that user is offline
            broadcastUserStatus(userId, 'offline');
          }
        }
      });
      
      // Update user status to online
      await User.update({ status: 'online' }, { where: { id: userId } });
      
      // Broadcast user status change
      broadcastUserStatus(userId, 'online');
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close(4001, 'Connection error');
    }
  });

  return wss;
}

// Helper functions for broadcasting messages
function broadcastToUser(userId, data) {
  const userConnections = connections.get(userId);
  if (userConnections) {
    const message = JSON.stringify(data);
    userConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }
}

function broadcastToChannel(channelId, data, excludeUserId = null) {
  const message = JSON.stringify(data);
  
  // Send to all connections with matching channelId
  for (const [userId, userConnections] of connections.entries()) {
    // Skip if this is the excluded user
    if (excludeUserId && userId === excludeUserId) continue;
    
    userConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN && ws.channelId === channelId) {
        ws.send(message);
      }
    });
  }
}

function broadcastToServer(serverId, data, excludeUserId = null) {
  const message = JSON.stringify(data);
  
  // Send to all connections with matching serverId
  for (const [userId, userConnections] of connections.entries()) {
    // Skip if this is the excluded user
    if (excludeUserId && userId === excludeUserId) continue;
    
    userConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN && ws.serverId === serverId) {
        ws.send(message);
      }
    });
  }
}

function broadcastUserStatus(userId, status) {
  // Get user info
  User.findByPk(userId, {
    attributes: ['id', 'username', 'avatar_url']
  }).then(user => {
    if (!user) return;
    
    // First update all servers this user is a member of
    ServerMember.findAll({
      where: { user_id: userId },
      attributes: ['server_id']
    }).then(memberships => {
      const serverIds = memberships.map(m => m.server_id);
      
      // Broadcast to each server
      serverIds.forEach(serverId => {
        broadcastToServer(serverId, {
          type: 'USER_STATUS_CHANGED',
          user: {
            ...user.toJSON(),
            status
          }
        });
      });
    });
  }).catch(err => {
    console.error('Error broadcasting user status:', err);
  });
}


module.exports = {
  setupWebSocketServer,
  broadcastToUser,
  broadcastToChannel,
  broadcastToServer
};