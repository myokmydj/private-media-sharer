import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from '@vercel/postgres';
import { nanoid } from 'nanoid';

// R2/S3 클라이언트 설정
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

    // 파일 데이터를 버퍼로 변환
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 고유 ID 및 파일 정보 생성
    const id = nanoid();
    const filename = file.name;
    const contentType = file.type;
    // R2에 저장될 파일 키 (고유 ID와 원본 파일명을 조합하여 중복 방지)
    const key = `${id}-${filename}`;

    // R2(S3)에 파일 업로드 명령 생성
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    
    // R2에 파일 업로드 실행
    await s3Client.send(command);

    // Vercel Postgres에 미디어 메타데이터 저장
    await db.sql`
      INSERT INTO media (id, filename, content_type)
      VALUES (${id}, ${key}, ${contentType});
    `;

    // --- 🚀 URL 생성 로직 수정 🚀 ---
    // Vercel 환경에서는 VERCEL_URL 시스템 환경변수를 사용하고,
    // 로컬 개발 환경에서는 localhost:3000을 기본값으로 사용합니다.
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
      
    const generatedUrl = `${baseUrl}/view/${id}`;
    // --- 🚀 수정 완료 🚀 ---

    // 성공 응답으로 생성된 URL 반환
    return NextResponse.json({ success: true, url: generatedUrl });

  } catch (error) {
    console.error('Upload API Error:', error);
    // 에러 발생 시 서버에 로그를 남기고, 클라이언트에는 일반적인 에러 메시지 반환
    return NextResponse.json({ error: '파일 업로드 중 서버에서 에러가 발생했습니다.' }, { status: 500 });
  }
}