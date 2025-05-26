/**
 * Script to clean up existing posts with <img src="..."> in content.
 * - Extracts the image path from the <img> tag
 * - Sets media_type to "image" and media_path to the src
 * - Removes the <img> tag from content
 * - Leaves other content intact
 * 
 * Usage: node backend/scripts/fix_existing_image_posts.js
 */

require("dotenv").config();

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_HOST:", process.env.DB_HOST);

const { Post } = require("../models");
const sequelize = require("../services/sequelize");

async function fixImagePosts() {
  const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/i;
  const posts = await Post.findAll();
  let updated = 0;

  for (const post of posts) {
    if (post.content && imgRegex.test(post.content)) {
      const match = post.content.match(imgRegex);
      const imgSrc = match[1];
      // Remove the <img> tag from content
      const newContent = post.content.replace(imgRegex, "").trim();
      post.content = newContent;
      post.media_type = "image";
      post.media_path = imgSrc;
      await post.save();
      updated++;
      console.log(`Updated post ID ${post.id}: set media_type=image, media_path=${imgSrc}`);
    }
  }

  console.log(`Done. Updated ${updated} posts.`);
  await sequelize.close();
}

fixImagePosts().catch(err => {
  console.error("Error updating posts:", err);
  sequelize.close();
});
