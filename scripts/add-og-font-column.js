// scripts/add-og-font-column.js
const { db } = require('@vercel/postgres');
require('dotenv').config({ path: './.env.local' });

async function addColumn() {
  const client = await db.connect();
  try {
    await client.sql`
      ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS og_font VARCHAR(50) DEFAULT 'Pretendard';
    `;
    console.log('Column "og_font" added to "posts" table successfully.');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await client.release();
  }
}

addColumn();