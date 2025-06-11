'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('comments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      post_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true
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
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('comments');
  }
};
