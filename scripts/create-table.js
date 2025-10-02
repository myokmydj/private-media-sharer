const { db } = require('@vercel/postgres');
require('dotenv').config({ path: './.env.local' });

async function createTable() {
  // Vercel Postgres는 process.env를 직접 읽으므로,
  // 사실상 위 require('dotenv').config()만 있으면 됩니다.
  const client = await db.connect();
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS media (
        id VARCHAR(21) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        content_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table "media" created successfully.');
  } catch (error) {
    console.error('Error creating table:', error);
  } finally {
    await client.release();
  }
}

createTable();