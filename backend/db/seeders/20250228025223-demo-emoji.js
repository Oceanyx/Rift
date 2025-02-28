'use strict';

const { Emoji } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    const emojis = [];
    
    // Standard emojis (no server_id)
    const standardEmojis = [
      { name: 'smile', unicode_character: '😊', custom: false, server_id: null },
      { name: 'thumbs_up', unicode_character: '👍', custom: false, server_id: null },
      { name: 'heart', unicode_character: '❤️', custom: false, server_id: null },
      { name: 'laughing', unicode_character: '😂', custom: false, server_id: null },
      { name: 'clap', unicode_character: '👏', custom: false, server_id: null },
      { name: 'fire', unicode_character: '🔥', custom: false, server_id: null },
      { name: 'thinking', unicode_character: '🤔', custom: false, server_id: null },
      { name: 'tada', unicode_character: '🎉', custom: false, server_id: null },
      { name: 'angry', unicode_character: '😠', custom: false, server_id: null },
      { name: 'sob', unicode_character: '😭', custom: false, server_id: null }
    ];
    
    emojis.push(...standardEmojis.map(emoji => ({
      ...emoji,
      image_url: null,
      created_at: new Date()
    })));
    
    // Custom emojis for each server
    for (let server_id = 1; server_id <= 10; server_id++) {
      // Each server gets 2-5 custom emojis
      const numCustomEmojis = faker.number.int({ min: 2, max: 5 });
      
      for (let i = 0; i < numCustomEmojis; i++) {
        const name = faker.helpers.arrayElement([
          'cool_' + server_id + '_' + i,
          'awesome_' + server_id + '_' + i,
          'server_' + server_id + '_special',
          'custom_' + faker.word.adjective(),
          'special_' + faker.word.noun()
        ]);
        
        emojis.push({
          name,
          unicode_character: null,
          custom: true,
          server_id,
          image_url: faker.image.url(),
          created_at: faker.date.past()
        });
      }
    }
    
    await Emoji.bulkCreate(emojis, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Emojis';
    return queryInterface.bulkDelete(options, {}, {});
  }
};