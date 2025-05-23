'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('posts', 'media_type', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'media_id'
    });
    await queryInterface.addColumn('posts', 'media_path', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'media_type'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('posts', 'media_type');
    await queryInterface.removeColumn('posts', 'media_path');
  }
};
