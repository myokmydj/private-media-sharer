// scripts/create-memos-table.js
const { db } = require('@vercel/postgres');
require('dotenv').config({ path: './.env.local' });

async function createMemosTable() {
  const client = await db.connect();
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS memos (
        id VARCHAR(21) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        spoiler_icon VARCHAR(10) DEFAULT '🔑',
        visibility VARCHAR(20) DEFAULT 'public',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table "memos" created successfully.');
  } catch (error) {
    console.error('Error creating memos table:', error);
  } finally {
    await client.release();
  }
}

createMemosTable();