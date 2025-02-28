'use strict';

const { DirectMessage } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const directMessages = [];
    
    // Demo user will have conversations with 5 other users
    const demoUserContacts = [2, 3, 4, 5, 6]; // User IDs of people demo user talks with
    
    // For each contact of the demo user
    for (const contactId of demoUserContacts) {
      // Generate 5-15 messages in the conversation
      const numMessages = faker.number.int({ min: 5, max: 15 });
      
      for (let i = 0; i < numMessages; i++) {
        // Determine sender and recipient (about 60% from demo, 40% from contact)
        const isFromDemo = Math.random() < 0.6;
        const sender_id = isFromDemo ? 1 : contactId;
        const recipient_id = isFromDemo ? contactId : 1;
        
        // Message content based on sender
        let content;
        if (isFromDemo) {
          content = faker.helpers.arrayElement([
            `Hey, how's it going?`,
            `Did you see the latest update to the server?`,
            faker.lorem.sentence(),
            `I was thinking about ${faker.lorem.words(3)}. What's your opinion?`,
            `Are you free to chat later?`
          ]);
        } else {
          content = faker.helpers.arrayElement([
            `Not bad, you?`,
            `Yes! I really like the new features.`,
            faker.lorem.sentence(),
            `Hmm, I'm not sure about ${faker.lorem.word()}. Let me think...`,
            `Sure, I'll be around!`
          ]);
        }
        
        // 10% chance of having an attachment
        const has_attachment = Math.random() < 0.1;
        
        directMessages.push({
          sender_id,
          recipient_id,
          content,
          has_attachment,
          created_at: faker.date.recent({ days: 14 })
        });
      }
    }
    
    // Generate 10 more random DM conversations (not with demo user)
    for (let i = 0; i < 10; i++) {
      // Random user IDs between 2-21
      let sender_id = faker.number.int({ min: 2, max: 21 });
      let recipient_id;
      do {
        recipient_id = faker.number.int({ min: 2, max: 21 });
      } while (recipient_id === sender_id);
      
      // Generate 3-8 messages in conversation
      const numMessages = faker.number.int({ min: 3, max: 8 });
      
      for (let j = 0; j < numMessages; j++) {
        // Alternate sender and recipient
        if (j % 2 === 1) {
          [sender_id, recipient_id] = [recipient_id, sender_id];
        }
        
        directMessages.push({
          sender_id,
          recipient_id,
          content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
          has_attachment: Math.random() < 0.1,
          created_at: faker.date.recent({ days: 21 })
        });
      }
    }
    
    await DirectMessage.bulkCreate(directMessages, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'DirectMessages';
    return queryInterface.bulkDelete(options, {}, {});
  }
};