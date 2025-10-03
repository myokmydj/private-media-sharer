import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';
import { pretendardBold, pretendardRegular } from '@/.generated/fonts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ▼▼▼ 2. 깨진 아이콘 문제를 해결하기 위해 SVG를 문자열로 정의합니다 ▼▼▼
const nsfwIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="150" width="150" viewBox="0 0 640 512" fill="white"><path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7C559.7 341.5 584 285.4 597.8 232.2c1.1-4.4 1.1-9.1 0-13.5C580.5 164.6 539.4 96 468.6 41.2C408.4-1.9 344.7-13.5 283.5 1.7L38.8 5.1zM240 128a128 128 0 0 0-93.5 210.3L209.2 282c-10-24-8.5-52.3 5.8-74.3s38.3-36.8 63-38.2l51.9-41.5C301.7 132 272.1 128 240 128zM320 384c-35.3 0-68.7-12.1-96.6-33.9L262 311.9c13.4 10.9 30.6 17.1 48.8 17.1c52.9 0 96-43.1 96-96c0-18.2-5.2-35.4-14.2-50.2L427.2 215c15.2 21.5 24.8 47.3 24.8 74.2c0 88.4-71.6 160-160 160z"/></svg>`;
const nsfwIconDataUri = `data:image/svg+xml;base64,${Buffer.from(nsfwIconSvg).toString('base64')}`;
// ▲▲▲ 여기까지 추가 ▲▲▲

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get('title') || '제목 없음';
    const artist = searchParams.get('artist');
    const imageUrl = searchParams.get('imageUrl');
    const isBlurred = searchParams.get('isBlurred') === 'true';
    const isSpoiler = searchParams.get('isSpoiler') === 'true';
    const isNsfw = searchParams.get('isNsfw') === 'true';
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const backgroundColor = searchParams.get('bgColor') || '#28234D';
    const textColor = searchParams.get('textColor') || '#FFFFFF';

    let tagBackgroundColor = 'rgba(255, 255, 255, 0.15)';
    if (textColor === '#000000') {
      tagBackgroundColor = 'rgba(0, 0, 0, 0.1)';
    }
    const playButtonColor = backgroundColor;

    const previewText = artist
      ? artist
          .replace(/!\[.*?\]\(.*?\)/g, '')
          .replace(/<img[^>]*>/gi, '')
          .replace(/블러\[.*?\]/g, '')
          .replace(/\n/g, ' ')
          .trim()
      : '';

    return new ImageResponse(
      (
        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: backgroundColor, color: textColor, padding: '40px' }}>
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div style={{ position: 'relative', width: 550, height: 550, display: 'flex' }}>
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt=""
                  width={550}
                  height={550}
                  style={{
                    borderRadius: '20px',
                    objectFit: 'cover',
                    // ▼▼▼ 1. isBlurred 또는 isNsfw일 때 블러 효과 적용 ▼▼▼
                    filter: (isBlurred || isNsfw) ? 'blur(40px)' : 'none'
                  }}
                />
              )}
              {isNsfw && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* ▼▼▼ 2. 깨진 SVG 대신 데이터 URI를 사용하는 img 태그로 교체 ▼▼▼ */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={nsfwIconDataUri} width="150" height="150" alt="NSFW content" />
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '40px', flex: 1, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.8 }}>
                <svg xmlns="http://www.w3.org/2000/svg" height="80" width="80" viewBox="0 0 576 512" fill={textColor}><path d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/></svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', fontFamily: '"PretendardJP-Black"' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  {tags.map((tag) => ( <div key={tag} style={{ display: 'flex', padding: '6px 16px', backgroundColor: tagBackgroundColor, borderRadius: '9999px', fontSize: '28px', fontFamily: '"PretendardJP-Medium"', fontWeight: 400, lineHeight: 1.2, }}>{tag}</div> ))}
                </div>
                <div style={{ fontSize: '60px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>{title}</div>
                {previewText && (<div style={{ fontSize: '40px', marginTop: '10px', opacity: 0.7, wordBreak: 'break-all', lineHeight: 1.3, fontFamily: '"PretendardJP-Medium"', fontWeight: 400, }}>{isSpoiler ? '내용이 가려졌습니다.' : previewText}</div>)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', backgroundColor: textColor, borderRadius: '50%' }}>
                  <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5.13965V18.8604C8 19.56 8.66274 20.0168 9.30852 19.642L20.6915 12.7816C21.3373 12.4078 21.3373 11.5922 20.6915 11.2184L9.30852 4.35795C8.66274 3.98317 8 4.44004 8 5.13965Z" fill={playButtonColor}/></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630, fonts: [{ name: 'PretendardJP-Black', data: pretendardBold.buffer, style: 'normal', weight: 800 }, { name: 'PretendardJP-Medium', data: pretendardRegular.buffer, style: 'normal', weight: 400 }] },
    );

  } catch (e: unknown) {
    let errorMessage = 'An unknown error occurred';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    console.error(`OG 이미지 생성 실패: ${errorMessage}`);
    return new NextResponse(`Failed to generate the image: ${errorMessage}`, { status: 500 });
  }
}