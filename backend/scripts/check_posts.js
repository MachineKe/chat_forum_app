require('dotenv').config({ path: __dirname + '/../.env' });
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_HOST:", process.env.DB_HOST);

const { Post } = require("@models");
const sequelize = require("@services/sequelize");

async function main() {
  try {
    // Count total posts
    const total = await Post.count();
    console.log("Total posts:", total);

    // List 50 most recent posts
    const posts = await Post.findAll({
      order: [["created_at", "DESC"]],
      limit: 50,
      attributes: ["id", "created_at"]
    });

    console.log("50 most recent posts:");
    posts.forEach(post => {
      console.log(`ID: ${post.id}, created_at: ${post.created_at}`);
    });
  } catch (err) {
    console.error("Error checking posts:", err);
  } finally {
    await sequelize.close();
  }
}

main();
