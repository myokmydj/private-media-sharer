// scripts/add-avatar-column.js
const { db } = require('@vercel/postgres');
require('dotenv').config({ path: './.env.local' });

async function addAvatarColumn() {
  const client = await db.connect();
  try {
    // users 테이블에 image 컬럼이 없는 경우에만 추가합니다.
    await client.sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS image VARCHAR(255);
    `;
    console.log('Column "image" added to "users" table successfully.');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await client.release();
  }
}

addAvatarColumn();