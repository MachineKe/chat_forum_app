"use strict";
module.exports = (sequelize, DataTypes) => {
  const CommentLike = sequelize.define(
    "CommentLike",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      comment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Comments",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "CommentLikes",
      underscored: true,
      timestamps: true,
    }
  );

  CommentLike.associate = function (models) {
    CommentLike.belongsTo(models.Comment, { foreignKey: "comment_id", as: "comment" });
    CommentLike.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return CommentLike;
};
