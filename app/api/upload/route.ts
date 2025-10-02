import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@vercel/postgres';
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const id = nanoid();
    const filename = file.name;
    const contentType = file.type;
    const key = `${id}-${filename}`;

    // R2에 파일 업로드
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    await s3Client.send(command);

    // Vercel Postgres에 메타데이터 저장
    await db.sql`
      INSERT INTO media (id, filename, content_type)
      VALUES (${id}, ${key}, ${contentType});
    `;

    const generatedUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/view/${id}`;

    return NextResponse.json({ success: true, url: generatedUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '업로드 중 에러가 발생했습니다.' }, { status: 500 });
  }
}