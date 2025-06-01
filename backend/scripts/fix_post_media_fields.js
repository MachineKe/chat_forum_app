require('dotenv').config();
/**
 * Script to migrate media info from content field to media_type and media_path fields in posts table.
 * Usage: node backend/scripts/fix_post_media_fields.js
 */
const { Post } = require('@models');
const sequelize = require('@services/sequelize');

async function parseMedia(content) {
  // Patterns for audio, video, pdf
  const audioRegex = /<audio[^>]*src="([^"]+)"[^>]*>/i;
  const videoRegex = /<video[^>]*src="([^"]+)"[^>]*>/i;
  const pdfRegex = /<embed[^>]*type="application\/pdf"[^>]*src="([^"]+)"[^>]*>/i;

  if (audioRegex.test(content)) {
    const match = content.match(audioRegex);
    return { type: 'audio', path: match[1], text: '' };
  }
  if (videoRegex.test(content)) {
    const match = content.match(videoRegex);
    return { type: 'video', path: match[1], text: '' };
  }
  if (pdfRegex.test(content)) {
    const match = content.match(pdfRegex);
    return { type: 'pdf', path: match[1], text: '' };
  }
  // If no media, return text only (remove any "+ audio", "+ video", "+ pdf" markers)
  const cleanText = content.replace(/^\s*\+\s*(audio|video|pdf)\s*$/i, '').replace(/<[^>]+>/g, '').trim();
  return { type: null, path: null, text: cleanText };
}

async function migrate() {
  const posts = await Post.findAll();
  for (const post of posts) {
    const { type, path, text } = await parseMedia(post.content);
    let needsUpdate = false;
    if (type || path) {
      post.media_type = type;
      post.media_path = path;
      post.content = text;
      needsUpdate = true;
    } else if (post.content !== text) {
      post.content = text;
      needsUpdate = true;
    }
    if (needsUpdate) {
      await post.save();
      console.log(`Updated post ${post.id}: type=${type}, path=${path}, content="${text}"`);
    }
  }
  console.log('Migration complete.');
}

sequelize.authenticate()
  .then(() => migrate())
  .then(() => sequelize.close())
  .catch(err => {
    console.error('Migration failed:', err);
    sequelize.close();
  });
