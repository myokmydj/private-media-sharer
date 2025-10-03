import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

function getPublicUrl(filename: string): string {
  const publicUrlBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;
  return `${publicUrlBase.replace(/\/$/, '')}/${filename}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '파일이 없습니다.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = nanoid(10); // 짧은 고유 ID
    const key = `${uniqueId}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });
    
    await s3Client.send(command);

    const publicUrl = getPublicUrl(key);

    // 이제 DB에 저장하지 않고, 업로드된 파일의 URL과 파일명만 반환합니다.
    return NextResponse.json({ success: true, url: publicUrl, filename: file.name });

  } catch (error) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: '파일 업로드 중 서버에서 에러가 발생했습니다.' }, { status: 500 });
  }
}