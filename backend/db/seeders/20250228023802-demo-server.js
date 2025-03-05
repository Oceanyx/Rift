'use strict';

const { User } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // Only apply schema in production
}
options.tableName = 'Servers';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, fetch all existing users to ensure we reference valid user IDs
    const users = await require('../models').User.findAll();
    
    if (users.length === 0) {
      console.error("No users found. Please run the user seeder first.");
      return;
    }
    
    const demoUser = users[0];
    const otherUsers = users.slice(1);
    
    const servers = [
      {
        name: 'Demo Server',
        description: 'A server for demonstrating the application functionality',
        icon_url: 'https://example.com/icons/demo-server.png',
        owner_id: demoUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gaming Hangout',
        description: 'A place for all gamers to chat and coordinate',
        icon_url: faker.image.urlLoremFlickr({ category: 'gaming' }),
        owner_id: demoUser.id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      }
    ];
    
    const numServersToCreate = Math.min(8, otherUsers.length);
    for (let i = 0; i < numServersToCreate; i++) {
      const owner = otherUsers[i];
      const server_theme = faker.helpers.arrayElement(['gaming', 'tech', 'music', 'art', 'sports', 'food', 'science', 'books']);
      
      servers.push({
        name: faker.company.name(),
        description: faker.lorem.paragraph(),
        icon_url: faker.image.urlLoremFlickr({ category: server_theme }),
        owner_id: owner.id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      });
    }
    
    // Use queryInterface.bulkInsert to insert servers with our options
    return queryInterface.bulkInsert(options, servers, {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete(options, {}, {});
  }
};
