'use strict';

const { MemberRole, ServerMember, Role } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    // First, fetch all server members and roles to establish relationships
    const serverMembers = await ServerMember.findAll();
    const roles = await Role.findAll();
    
    // Group roles by server_id for easier access
    const rolesByServer = {};
    roles.forEach(role => {
      if (!rolesByServer[role.server_id]) {
        rolesByServer[role.server_id] = [];
      }
      rolesByServer[role.server_id].push(role);
    });
    
    const memberRoles = [];
    
    // Process each server member
    for (const member of serverMembers) {
      const serverRoles = rolesByServer[member.server_id] || [];
      if (serverRoles.length === 0) continue;
      
      // Determine if this member is the server owner (from servers seed)
      const isOwner = (member.server_id <= 2 && member.user_id === 1) || 
                      (member.server_id > 2 && member.user_id === member.server_id);
      
      if (isOwner) {
        // Server owner gets the Admin role
        const adminRole = serverRoles.find(role => role.name === 'Admin');
        if (adminRole) {
          memberRoles.push({
            member_id: member.id,
            role_id: adminRole.id
          });
        }
      } else {
        // Regular members get 0-3 random roles
        const numRoles = faker.number.int({ min: 0, max: 3 });
        const shuffledRoles = [...serverRoles].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < Math.min(numRoles, shuffledRoles.length); i++) {
          memberRoles.push({
            member_id: member.id,
            role_id: shuffledRoles[i].id
          });
        }
      }
    }
    
    await MemberRole.bulkCreate(memberRoles, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'MemberRoles';
    return queryInterface.bulkDelete(options, {}, {});
  }
};