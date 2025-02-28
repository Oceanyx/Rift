'use strict';

const { Role } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

// Helper function to generate random hex color
const randomColor = () => {
  return '#' + faker.string.hexadecimal({ length: 6, casing: 'lower' }).substring(2);
};

module.exports = {
  async up (queryInterface, Sequelize) {
    const roles = [];
    
    // For each server (10 total)
    for (let server_id = 1; server_id <= 10; server_id++) {
      // Every server has an admin role
      roles.push({
        server_id,
        name: 'Admin',
        color: '#FF0000', // Red
        permissions: 1023, // Full permissions (binary 1111111111)
        created_at: faker.date.past(),
        updated_at: faker.date.recent()
      });
      
      // Every server has a moderator role
      roles.push({
        server_id,
        name: 'Moderator',
        color: '#00FF00', // Green
        permissions: 511, // Moderate permissions (binary 0111111111)
        created_at: faker.date.past(),
        updated_at: faker.date.recent()
      });
      
      // Add 2-4 custom roles per server
      const numRoles = faker.number.int({ min: 2, max: 4 });
      const roleNames = ['VIP', 'Regular', 'Newbie', 'Contributor', 'Bot', 'Supporter', 'Programmer', 'Artist', 'Musician'];
      
      for (let i = 0; i < numRoles; i++) {
        const roleName = faker.helpers.arrayElement(roleNames);
        roles.push({
          server_id,
          name: roleName,
          color: randomColor(),
          permissions: faker.number.int({ min: 1, max: 255 }), // Limited permissions
          created_at: faker.date.past(),
          updated_at: faker.date.recent()
        });
      }
    }
    
    await Role.bulkCreate(roles, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Roles';
    return queryInterface.bulkDelete(options, {}, {});
  }
};