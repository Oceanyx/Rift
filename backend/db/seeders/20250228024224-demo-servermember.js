'use strict';

const { ServerMember } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const serverMembers = [];

    // Define server ownership
    const serverOwners = {
      1: 1,  // Server 1 -> Demo1
      2: 1,  // Server 2 -> Demo1
      3: 2,  // Server 3 -> Demo2
      4: 2,  // Server 4 -> Demo2
    };

    // Assign owners for servers 5-10 (defaulting to server_id)
    for (let i = 5; i <= 10; i++) {
      serverOwners[i] = i;
    }

    // Iterate through servers and add owner & members
    for (let server_id = 1; server_id <= 10; server_id++) {
      const owner_id = serverOwners[server_id];

      // Add owner to the server
      serverMembers.push({
        server_id,
        user_id: owner_id,
        nickname: null,
        joined_at: faker.date.past()
      });

      // Ensure both Demo1 (1) and Demo2 (2) are in all servers
      [1, 2].forEach(demoUserId => {
        if (demoUserId !== owner_id) {
          serverMembers.push({
            server_id,
            user_id: demoUserId,
            nickname: faker.helpers.arrayElement([null, 'DemoNick', 'TheDemo', 'DemoGuy']),
            joined_at: faker.date.past()
          });
        }
      });

      // Add 5-15 random members per server
      const numMembers = faker.number.int({ min: 5, max: 15 });
      const usedUserIds = new Set([owner_id, 1, 2]); // Track users already added

      for (let i = 0; i < numMembers; i++) {
        let user_id;
        do {
          user_id = faker.number.int({ min: 3, max: 22 }); // **Fixed range: includes 3-21**
        } while (usedUserIds.has(user_id));

        usedUserIds.add(user_id);

        serverMembers.push({
          server_id,
          user_id,
          nickname: faker.helpers.arrayElement([null, faker.internet.username(), faker.word.adjective() + faker.word.noun()]),
          joined_at: faker.date.past()
        });
      }
    }

    await ServerMember.bulkCreate(serverMembers, { validate: true });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ServerMembers';
    return queryInterface.bulkDelete(options, {}, {});
  }
};