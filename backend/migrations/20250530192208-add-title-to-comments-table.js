'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('comments', 'title', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'content'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('comments', 'title');
  }
};
