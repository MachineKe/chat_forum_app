const { DataTypes } = require('sequelize');
const sequelize = require('../services/sequelize');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  media_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  media_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  media_title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  media_src: {
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
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'messages',
  timestamps: false
});

module.exports = Message;
