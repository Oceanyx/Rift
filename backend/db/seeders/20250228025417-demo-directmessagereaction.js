'use strict';

const { DirectMessageReaction, DirectMessage, Emoji } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    // Fetch necessary data
    const directMessages = await DirectMessage.findAll();
    const standardEmojis = await Emoji.findAll({
      where: { custom: false }
    });
    
    const directMessageReactions = [];
    
    // For each direct message
    for (const dm of directMessages) {
      // 30% chance of a direct message getting any reactions
      if (Math.random() < 0.3) {
        // This DM gets 1-3 different emoji reactions
        const numDifferentEmojis = faker.number.int({ min: 1, max: 3 });
        
        // Shuffle and select random emojis (only standard emojis for DMs)
        const shuffledEmojis = [...standardEmojis].sort(() => 0.5 - Math.random());
        const selectedEmojis = shuffledEmojis.slice(0, numDifferentEmojis);
        
        // For each selected emoji
        for (const emoji of selectedEmojis) {
          // The recipient can react
          directMessageReactions.push({
            direct_message_id: dm.id,
            user_id: dm.recipient_id,
            emoji_id: emoji.id,
            created_at: faker.date.recent({ days: 5 })
          });
          
          // 20% chance the sender also reacts to their own message
          if (Math.random() < 0.2) {
            directMessageReactions.push({
              direct_message_id: dm.id,
              user_id: dm.sender_id,
              emoji_id: emoji.id,
              created_at: faker.date.recent({ days: 5 })
            });
          }
        }
      }
    }
    
    await DirectMessageReaction.bulkCreate(directMessageReactions, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'DirectMessageReactions';
    return queryInterface.bulkDelete(options, {}, {});
  }
};