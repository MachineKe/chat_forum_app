const { DataTypes } = require('sequelize');
const sequelize = require('../services/sequelize');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  media_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'media',
      key: 'id'
    }
  },
  media_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  media_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'posts',
  timestamps: false
});

const PostLike = require('./PostLike');
const Media = require('./Media');

// Associations
Post.hasMany(PostLike, { foreignKey: 'post_id', as: 'likes' });
Post.belongsTo(Media, { foreignKey: 'media_id', as: 'media' });

module.exports = Post;
