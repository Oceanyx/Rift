'use strict';

const { Channel } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const channels = [];
    
    for (let server_id = 1; server_id <= 10; server_id++) {
      channels.push({
        server_id,
        name: 'general',
        type: 'text',
        description: 'General discussion',
        createdAt: faker.date.past(), 
        updatedAt: faker.date.recent()
      });
      
      channels.push({
        server_id,
        name: 'welcome',
        type: 'announcement',
        description: 'Welcome messages and server announcements',
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      });
      
      channels.push({
        server_id,
        name: 'voice-chat',
        type: 'voice',
        description: 'Voice communication channel',
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      });

      const numRandomChannels = faker.number.int({ min: 2, max: 5 });
      const channelThemes = ['gaming', 'music', 'movies', 'sports', 'food', 'memes', 'pets', 'tech-talk', 'off-topic'];
      
      for (let i = 0; i < numRandomChannels; i++) {
        const theme = faker.helpers.arrayElement(channelThemes);
        channels.push({
          server_id,
          name: theme,
          type: 'text',
          description: `Channel for discussing ${theme}`,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent()
        });
      }
    }
    
    await Channel.bulkCreate(channels, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Channels';
    return queryInterface.bulkDelete(options, {}, {});
  }
};