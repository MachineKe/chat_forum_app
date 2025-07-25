const { DataTypes } = require('sequelize');
const sequelize = require('../services/sequelize');

const Comment = sequelize.define('Comment', {
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
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    media_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  media_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  media_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  media_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'comments',
  timestamps: false
});

module.exports = Comment;
