'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('media', 'title', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'type'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('media', 'title');
  }
};
