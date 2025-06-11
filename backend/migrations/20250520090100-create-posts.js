'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('posts', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      media_title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      media_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      media_type: {
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
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      view_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('posts');
  }
};
