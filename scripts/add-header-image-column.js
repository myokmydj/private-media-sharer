// scripts/add-header-image-column.js
const { db } = require('@vercel/postgres');
require('dotenv').config({ path: './.env.local' });

async function addHeaderImageColumn() {
  const client = await db.connect();
  try {
    // users 테이블에 header_image 컬럼이 없는 경우에만 추가합니다.
    await client.sql`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS header_image VARCHAR(255);
    `;
    console.log('Column "header_image" added to "users" table successfully.');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await client.release();
  }
}

addHeaderImageColumn();