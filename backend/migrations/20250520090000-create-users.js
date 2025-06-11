'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      bio: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: ""
      },
      full_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: ""
      },
      avatar: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: ""
      },
      banner: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: ""
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      is_ldap_user: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
