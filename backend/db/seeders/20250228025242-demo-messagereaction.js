'use strict';

const { MessageReaction, Message, Emoji, ServerMember, Channel } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    // Fetch necessary data
    const messages = await Message.findAll();
    const emojis = await Emoji.findAll();
    const channels = await Channel.findAll();
    const serverMembers = await ServerMember.findAll();
    
    // Group members by server_id for easier access
    const membersByServer = {};
    serverMembers.forEach(member => {
      if (!membersByServer[member.server_id]) {
        membersByServer[member.server_id] = [];
      }
      membersByServer[member.server_id].push(member);
    });
    
    // Create a channel to server mapping
    const channelToServer = {};
    channels.forEach(channel => {
      channelToServer[channel.id] = channel.server_id;
    });
    
    // Standard emojis (no server_id)
    const standardEmojis = emojis.filter(emoji => !emoji.custom);
    
    // Group custom emojis by server_id
    const customEmojisByServer = {};
    emojis.filter(emoji => emoji.custom).forEach(emoji => {
      if (!customEmojisByServer[emoji.server_id]) {
        customEmojisByServer[emoji.server_id] = [];
      }
      customEmojisByServer[emoji.server_id].push(emoji);
    });
    
    const messageReactions = [];
    
    // For each message
    for (const message of messages) {
      // Determine which server this message belongs to
      const channelId = message.channel_id;
      const serverId = channelToServer[channelId];
      
      // Skip if we can't determine the server
      if (!serverId) continue;
      
      // Find available members who could react to this message
      const availableMembers = membersByServer[serverId] || [];
      
      // Skip if no members available
      if (availableMembers.length === 0) continue;
      
      // Get available emojis for this server (standard + custom for this server)
      const availableEmojis = [
        ...standardEmojis,
        ...(customEmojisByServer[serverId] || [])
      ];
      
      // 50% chance of a message getting any reactions
      if (Math.random() < 0.5) {
        // This message gets 1-5 different emoji reactions
        const numDifferentEmojis = faker.number.int({ min: 1, max: 5 });
        
        // Shuffle and select random emojis
        const shuffledEmojis = [...availableEmojis].sort(() => 0.5 - Math.random());
        const selectedEmojis = shuffledEmojis.slice(0, numDifferentEmojis);
        
        // For each selected emoji
        for (const emoji of selectedEmojis) {
          // 1-4 users react with this emoji
          const numReactors = faker.number.int({ min: 1, max: 4 });
          
          // Shuffle and select random members
          const shuffledMembers = [...availableMembers].sort(() => 0.5 - Math.random());
          const reactors = shuffledMembers.slice(0, numReactors);
          
          // Create reactions
          for (const reactor of reactors) {
            messageReactions.push({
              message_id: message.id,
              user_id: reactor.user_id,
              emoji_id: emoji.id,
              created_at: faker.date.recent({ days: 7 })
            });
          }
        }
      }
    }
    
    await MessageReaction.bulkCreate(messageReactions, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'MessageReactions';
    return queryInterface.bulkDelete(options, {}, {});
  }
};