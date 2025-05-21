module.exports = (sequelize, DataTypes) => {
  const UserFollow = sequelize.define(
    "UserFollow",
    {
      follower_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
      },
      following_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
      },
    },
    {
      tableName: "user_follows",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["follower_id", "following_id"],
        },
      ],
    }
  );

  UserFollow.associate = (models) => {
    UserFollow.belongsTo(models.User, { as: "follower", foreignKey: "follower_id" });
    UserFollow.belongsTo(models.User, { as: "following", foreignKey: "following_id" });
  };

  return UserFollow;
};
