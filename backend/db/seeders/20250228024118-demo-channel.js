'use strict';

const { Channel } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const channels = [];
    
    // Create standard channels for each server (10 servers created in server seeder)
    for (let server_id = 1; server_id <= 10; server_id++) {
      // Every server will have a general text channel
      channels.push({
        server_id,
        name: 'general',
        type: 'text',
        description: 'General discussion',
        created_at: faker.date.past(),
        updated_at: faker.date.recent()
      });
      
      // Every server will have a welcome announcement channel
      channels.push({
        server_id,
        name: 'welcome',
        type: 'announcement',
        description: 'Welcome messages and server announcements',
        created_at: faker.date.past(),
        updated_at: faker.date.recent()
      });
      
      // Every server will have a voice channel
      channels.push({
        server_id,
        name: 'voice-chat',
        type: 'voice',
        description: 'Voice communication channel',
        created_at: faker.date.past(),
        updated_at: faker.date.recent()
      });
      
      // Add 2-5 random text channels per server
      const numRandomChannels = faker.number.int({ min: 2, max: 5 });
      const channelThemes = ['gaming', 'music', 'movies', 'sports', 'food', 'memes', 'pets', 'tech-talk', 'off-topic'];
      
      for (let i = 0; i < numRandomChannels; i++) {
        const theme = faker.helpers.arrayElement(channelThemes);
        channels.push({
          server_id,
          name: theme,
          type: 'text',
          description: `Channel for discussing ${theme}`,
          created_at: faker.date.past(),
          updated_at: faker.date.recent()
        });
      }
    }
    
    await Channel.bulkCreate(channels, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Channels';
    return queryInterface.bulkDelete(options, {}, {});
  }
};