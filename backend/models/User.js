const { DataTypes } = require('sequelize');
const sequelize = require('../services/sequelize');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bio: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ""
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ""
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ""
  },
  banner: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: ""
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  is_ldap_user: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;
