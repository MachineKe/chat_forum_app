"use strict";
module.exports = (sequelize, DataTypes) => {
  const PushSubscription = sequelize.define(
    "PushSubscription",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      endpoint: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      keys: {
        type: DataTypes.JSON,
        allowNull: false,
      },
    },
    {
      tableName: "PushSubscriptions",
      timestamps: true,
    }
  );

  PushSubscription.associate = function (models) {
    PushSubscription.belongsTo(models.User, { foreignKey: "userId" });
  };

  return PushSubscription;
};
