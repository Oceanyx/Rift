'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('DirectMessageReactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      direct_message_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'DirectMessages',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      emoji_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Emojis',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at',
        defaultValue: Sequelize.fn('now')
      }
    });

    // Add unique constraint
    await queryInterface.addIndex('DirectMessageReactions', ['direct_message_id', 'user_id', 'emoji_id'], {
      unique: true,
      name: 'dm_reactions_dm_id_user_id_emoji_id_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('DirectMessageReactions');
  }
};