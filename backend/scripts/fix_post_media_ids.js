require('dotenv').config({ path: __dirname + '/../.env' });

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS ? "***" : "(empty)");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_HOST:", process.env.DB_HOST);

/**
 * Script to update posts with hardcoded media paths in content,
 * replacing them with the correct media_id in the posts table.
 * 
 * Usage: node backend/scripts/fix_post_media_ids.js
 */

const { Post, Media } = require("../models");
const sequelize = require("../services/sequelize");

async function main() {
  try {
    const posts = await Post.findAll();
    let updatedCount = 0;

    for (const post of posts) {
      // Look for a media path in the content (e.g., /uploads/...)
      const match = post.content && post.content.match(/\/uploads\/[^\s"']+/);
      if (match) {
        const mediaPath = match[0];
        // Find the media record with this url
        const media = await Media.findOne({ where: { url: mediaPath } });
        if (media) {
          // Update the post's media_id if not already set
          if (post.media_id !== media.id) {
            post.media_id = media.id;
            // Optionally, remove the media path from content (uncomment if needed)
            // post.content = post.content.replace(mediaPath, "");
            await post.save();
            updatedCount++;
            console.log(`Updated post ${post.id}: set media_id=${media.id} for path ${mediaPath}`);
          }
        } else {
          console.warn(`No media found for path ${mediaPath} in post ${post.id}`);
        }
      }
    }

    console.log(`Done. Updated ${updatedCount} posts.`);
    await sequelize.close();
  } catch (err) {
    console.error("Error updating posts:", err);
    await sequelize.close();
    process.exit(1);
  }
}

main();
