"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Messages", "media_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("Messages", "media_type", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Messages", "media_title", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Messages", "media_src", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Messages", "media_path", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Messages", "thumbnail", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Messages", "parent_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Messages",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Messages", "media_id");
    await queryInterface.removeColumn("Messages", "media_type");
    await queryInterface.removeColumn("Messages", "media_title");
    await queryInterface.removeColumn("Messages", "media_src");
    await queryInterface.removeColumn("Messages", "media_path");
    await queryInterface.removeColumn("Messages", "thumbnail");
    await queryInterface.removeColumn("Messages", "parent_id");
  },
};
