'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'full_name', {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: ''
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'full_name');
  }
};
