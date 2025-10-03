// scripts/create-notifications-table.js
const { db } = require('@vercel/postgres');
require('dotenv').config({ path: './.env.local' });

async function createNotificationsTable() {
  const client = await db.connect();
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        actor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL, -- e.g., 'NEW_FOLLOWER'
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table "notifications" created successfully.');
  } catch (error) {
    console.error('Error creating notifications table:', error);
  } finally {
    await client.release();
  }
}

createNotificationsTable();