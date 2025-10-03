// scripts/add-editor-styles-columns.js
const { db } = require('@vercel/postgres');
require('dotenv').config({ path: './.env.local' });

async function addColumns() {
  const client = await db.connect();
  try {
    await client.sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS letter_spacing VARCHAR(20) DEFAULT 'normal',
      ADD COLUMN IF NOT EXISTS line_height VARCHAR(20) DEFAULT '1.75';
    `;
    console.log('Columns "letter_spacing" and "line_height" added to "posts" table successfully.');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    await client.release();
  }
}

addColumns();