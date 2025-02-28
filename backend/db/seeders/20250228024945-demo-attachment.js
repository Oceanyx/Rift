'use strict';

const { Attachment, Message } = require('../models');
const { faker } = require('@faker-js/faker');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    // Get all messages that have attachments
    const messagesWithAttachments = await Message.findAll({
      where: { has_attachment: true }
    });
    
    const attachments = [];
    
    // File type options
    const fileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'audio/mp3'];
    const fileExtensions = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
      'audio/mp3': '.mp3'
    };
    
    // For each message with an attachment
    for (const message of messagesWithAttachments) {
      const fileType = faker.helpers.arrayElement(fileTypes);
      const fileName = faker.system.fileName({ extensionCount: 0 }) + fileExtensions[fileType];
      
      let fileUrl;
      if (fileType.startsWith('image')) {
        fileUrl = faker.image.url();
      } else if (fileType === 'audio/mp3') {
        fileUrl = `https://example.com/audio/${fileName}`;
      } else {
        fileUrl = `https://example.com/files/${fileName}`;
      }
      
      attachments.push({
        message_id: message.id,
        file_url: fileUrl,
        file_type: fileType,
        file_name: fileName,
        created_at: message.created_at
      });
    }
    
    await Attachment.bulkCreate(attachments, { validate: true });
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Attachments';
    return queryInterface.bulkDelete(options, {}, {});
  }
};