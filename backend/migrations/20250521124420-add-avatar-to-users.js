'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'avatar', {
      type: Sequelize.STRING(255),
      allowNull: false,
      defaultValue: ''
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'avatar');
  }
};
