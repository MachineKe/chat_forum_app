require('dotenv').config({ path: __dirname + '/../.env' });

/**
 * Script to update comments with hardcoded media paths in content,
 * replacing them with the correct media_id in the comments table.
 * 
 * Usage: node backend/scripts/fix_comment_media_ids.js
 */

const { Comment, Media } = require("../models");
const sequelize = require("../services/sequelize");

async function main() {
  try {
    const comments = await Comment.findAll();
    let updatedCount = 0;

    for (const comment of comments) {
      // Look for a media path in the content (e.g., /uploads/...)
      const match = comment.content && comment.content.match(/\/uploads\/[^\s"']+/);
      if (match) {
        const mediaPath = match[0];
        // Find the media record with this url
        const media = await Media.findOne({ where: { url: mediaPath } });
        if (media) {
          // Update the comment's media_id if not already set
          if (comment.media_id !== media.id) {
            comment.media_id = media.id;
            // Optionally, remove the media path from content (uncomment if needed)
            // comment.content = comment.content.replace(mediaPath, "");
            await comment.save();
            updatedCount++;
            console.log(`Updated comment ${comment.id}: set media_id=${media.id} for path ${mediaPath}`);
          }
        } else {
          console.warn(`No media found for path ${mediaPath} in comment ${comment.id}`);
        }
      }
    }

    console.log(`Done. Updated ${updatedCount} comments.`);
    await sequelize.close();
  } catch (err) {
    console.error("Error updating comments:", err);
    await sequelize.close();
    process.exit(1);
  }
}

main();
