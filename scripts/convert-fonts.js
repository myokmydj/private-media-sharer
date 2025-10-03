// scripts/convert-fonts.js

const fs = require('fs');
const path = require('path');

const fontsToConvert = [
  {
    input: path.join(process.cwd(), 'public/fonts/PretendardJP-Black.otf'),
    outputVar: 'pretendardBold',
  },
  {
    input: path.join(process.cwd(), 'public/fonts/PretendardJP-Medium.otf'),
    outputVar: 'pretendardRegular',
  },
];

// ▼▼▼ 출력 경로를 '.generated' 폴더로 변경 ▼▼▼
const outputDir = path.join(process.cwd(), '.generated');
const outputPath = path.join(outputDir, 'fonts.ts');

// .generated 디렉터리가 없으면 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

let tsContent = `// 이 파일은 scripts/convert-fonts.js에 의해 자동으로 생성되었습니다. 직접 수정하지 마세요.\n\n`;

fontsToConvert.forEach(({ input, outputVar }) => {
  try {
    const fontBuffer = fs.readFileSync(input);
    const uint8ArrayString = `new Uint8Array([${fontBuffer.join(',')}])`;
    tsContent += `export const ${outputVar} = ${uint8ArrayString};\n\n`;
  } catch (error) {
    console.error(`'${input}' 폰트 파일을 읽는 데 실패했습니다. 파일 경로를 확인하세요.`);
    process.exit(1);
  }
});

fs.writeFileSync(outputPath, tsContent);

console.log(`✅ 폰트가 성공적으로 .generated/fonts.ts 파일로 변환되었습니다.`);