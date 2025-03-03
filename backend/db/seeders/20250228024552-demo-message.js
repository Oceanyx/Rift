'use strict';

const { Message, Channel, ServerMember } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    // First, fetch all channels and server members to establish relationships
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
    
    const messages = [];
    
    // For each channel
    for (const channel of channels) {
      // Skip voice channels as they don't have text messages
      if (channel.type === 'voice') continue;
      
      const serverMembers = membersByServer[channel.server_id] || [];
      if (serverMembers.length === 0) continue;
      
      // Generate 5-25 messages per channel
      const numMessages = faker.number.int({ min: 5, max: 25 });
      
      for (let i = 0; i < numMessages; i++) {
        // Randomly select a member of this server
        const randomMember = faker.helpers.arrayElement(serverMembers);
        
        // Message content with diverse themes based on channel type
        let content;
        if (channel.type === 'announcement') {
          content = faker.helpers.arrayElement([
            `📢 ${faker.lorem.sentence()}`,
            `🎉 Welcome ${faker.person.firstName()} to the server!`,
            `🚨 Important update: ${faker.lorem.paragraph()}`,
            `📆 Event scheduled for ${faker.date.future().toLocaleDateString()}: ${faker.lorem.sentence()}`
          ]);
        } else {
          content = faker.helpers.arrayElement([
            faker.lorem.paragraph(),
            `Hello everyone!`,
            `Has anyone tried ${faker.commerce.productName()} yet?`,
            `I just found this cool website: ${faker.internet.url()}`,
            `What do you all think about ${faker.lorem.words(3)}?`,
            `${faker.lorem.sentences(2)}`,
            `I made ${faker.lorem.words(2)} today!`,
            `Anyone want to chat about ${faker.lorem.word()}?`
          ]);
        }

        const has_attachment = Math.random() < 0.2;
        
        messages.push({
          channel_id: channel.id,
          user_id: randomMember.user_id,
          content,
          has_attachment,
          created_at: faker.date.recent({ days: 30 }),
          updatedAt: faker.date.recent()
        });
      }
    }
    
    // Ensure the demo user has some messages in the first server's general channel
    const demoServerChannel = channels.find(c => c.server_id === 1 && c.name === 'general');
    if (demoServerChannel) {
      messages.push({
        channel_id: demoServerChannel.id,
        user_id: 1, // Demo user
        content: "Hey everyone! This is the demo user. Feel free to explore the server!",
        has_attachment: false,
        created_at: faker.date.recent({ days: 2 }),
        updatedAt: faker.date.recent()
      });
    }
    
    await Message.bulkCreate(messages, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Messages';
    return queryInterface.bulkDelete(options, {}, {});
  }
};