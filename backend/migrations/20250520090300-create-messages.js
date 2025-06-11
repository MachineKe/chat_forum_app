'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      sender_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      receiver_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      media_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      media_type: {
        type: Sequelize.STRING,
        allowNull: true
      },
      media_title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      media_src: {
        type: Sequelize.STRING,
        allowNull: true
      },
      media_path: {
        type: Sequelize.STRING,
        allowNull: true
      },
      thumbnail: {
        type: Sequelize.STRING,
        allowNull: true
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('messages');
  }
};
