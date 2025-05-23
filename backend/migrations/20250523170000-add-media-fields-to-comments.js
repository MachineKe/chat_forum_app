'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('comments', 'media_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'media',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await queryInterface.addColumn('comments', 'media_type', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('comments', 'media_path', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('comments', 'media_id');
    await queryInterface.removeColumn('comments', 'media_type');
    await queryInterface.removeColumn('comments', 'media_path');
  }
};
