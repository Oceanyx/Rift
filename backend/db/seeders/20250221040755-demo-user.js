'use strict';

const bcrypt = require("bcryptjs");
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // Only apply schema in production
}
options.tableName = 'Users';

module.exports = {
  async up (queryInterface, Sequelize) {
    const users = [
      {
        email: 'demo1@user.io',
        username: 'Demo1',
        hashedPassword: bcrypt.hashSync('password'),
        firstName: 'Demo',
        lastName: 'User',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo1',
        status: 'online',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'demo2@user.io',
        username: 'Demo2',
        hashedPassword: bcrypt.hashSync('password'),
        firstName: 'Demo',
        lastName: 'User',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo2',
        status: 'online',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Generate 20 additional fake users
    for (let i = 0; i < 20; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.username({ firstName, lastName });
      
      users.push({
        email: faker.internet.email({ firstName, lastName }),
        username,
        hashedPassword: bcrypt.hashSync('password'),
        firstName,
        lastName,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        status: faker.helpers.arrayElement(['online', 'idle', 'do not disturb', 'invisible', 'offline']),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent()
      });
    }
    
    try {
      await queryInterface.bulkInsert(options, users, {});
      console.log('Successfully created users');
    } catch (error) {
      console.error('Error creating users:', error.message);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete(options, {}, {});
  }
};
