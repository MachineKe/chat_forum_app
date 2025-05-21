const sequelize = require('../services/sequelize');
const User = require('./User');
const Message = require('./Message');
const Post = require('./Post');
const Comment = require('./Comment');
const UserFollow = require('./UserFollow')(sequelize, require('sequelize').DataTypes);

// Associations
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

User.belongsToMany(User, {
  as: "Followers",
  through: UserFollow,
  foreignKey: "following_id",
  otherKey: "follower_id",
});
User.belongsToMany(User, {
  as: "Following",
  through: UserFollow,
  foreignKey: "follower_id",
  otherKey: "following_id",
});

module.exports = {
  sequelize,
  User,
  Message,
  Post,
  Comment,
  UserFollow,
};
