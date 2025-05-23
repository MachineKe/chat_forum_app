"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("posts", "media_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "media",
        key: "id"
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("posts", "media_id");
  }
};
