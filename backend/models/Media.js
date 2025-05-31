const { DataTypes } = require('sequelize');
const sequelize = require('../services/sequelize');

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  uploader_id: {
    type: DataTypes.INTEGER,
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
  tableName: 'media',
  timestamps: false
});

module.exports = Media;
