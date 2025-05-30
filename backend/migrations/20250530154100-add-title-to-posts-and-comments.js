'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Column 'title' already exists, so skip adding it to avoid duplicate error.
    // await queryInterface.addColumn('posts', 'title', {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    //   after: 'content'
    // });
    await queryInterface.addColumn('comments', 'title', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'content'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('posts', 'title');
    await queryInterface.removeColumn('comments', 'title');
  }
};
