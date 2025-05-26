'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'banner', {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: ""
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'banner');
  }
};
