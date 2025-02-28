'use strict';

const { ServerMember } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const serverMembers = [];
    
    // For each server (10 total)
    for (let server_id = 1; server_id <= 10; server_id++) {
      // The owner (from servers seed) is always a member
      const owner_id = server_id === 1 || server_id === 2 ? 1 : server_id; // Server 1 & 2 owned by demo user
      
      serverMembers.push({
        server_id,
        user_id: owner_id,
        nickname: null, // Owners often don't use nicknames
        joined_at: faker.date.past()
      });
      
      // Demo user joins all servers
      if (owner_id !== 1) {
        serverMembers.push({
          server_id,
          user_id: 1, // Demo user
          nickname: faker.helpers.arrayElement([null, 'DemoNick', 'TheDemo', 'DemoGuy']),
          joined_at: faker.date.past()
        });
      }
      
      // Add 5-15 random members to each server
      const numMembers = faker.number.int({ min: 5, max: 15 });
      const usedUserIds = new Set([owner_id, 1]); // Track users already added
      
      for (let i = 0; i < numMembers; i++) {
        // Generate random user_id from 2-21 (our 20 fake users + demo)
        let user_id;
        do {
          user_id = faker.number.int({ min: 2, max: 21 });
        } while (usedUserIds.has(user_id));
        
        usedUserIds.add(user_id);
        
        serverMembers.push({
          server_id,
          user_id,
          nickname: faker.helpers.arrayElement([null, faker.internet.userName(), faker.word.adjective() + faker.word.noun()]),
          joined_at: faker.date.past()
        });
      }
    }
    
    await ServerMember.bulkCreate(serverMembers, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'ServerMembers';
    return queryInterface.bulkDelete(options, {}, {});
  }
};