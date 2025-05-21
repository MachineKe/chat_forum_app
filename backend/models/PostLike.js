const { DataTypes } = require('sequelize');
const sequelize = require('../services/sequelize');

const PostLike = sequelize.define('PostLike', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'post_likes',
  timestamps: false
});

module.exports = PostLike;
