# =============================================================================
# Project Code Merger for AI Context (v8 - Path Matching & Encoding Fixed)
# =============================================================================

# --- ⚠️ PowerShell 터미널 자체의 한글 깨짐 방지 설정 ---
[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# --- 설정 ---
$outputFile = "project_context.txt"
$projectRoot = Get-Location

# 병합할 파일 목록 (경로 포함)
$filesToInclude = @(
    "package.json",
    "next.config.ts",
    "tailwind.config.*",
    "postcss.config.js",
    "app/globals.css",
    "app/layout.tsx",
    "app/upload/page.tsx",
    "app/view/[id]/page.tsx",
    "app/api/upload/route.ts",
    "app/api/posts/route.ts",
    "app/api/og/route.tsx"
)

# --- 스크립트 시작 ---

# 1. 기존 출력 파일이 있다면 깨끗하게 삭제
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

Write-Host "🚀 프로젝트 코드 병합을 시작합니다..." -ForegroundColor Green

# 2. 모든 파일을 재귀적으로 찾되, node_modules 경로는 필터링하여 제외
$allFiles = Get-ChildItem -Path $projectRoot -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*\node_modules\*" }

# 3. 지정된 파일 목록과 "상대 경로"를 비교하여 병합
foreach ($file in $allFiles) {
    $relativePath = $file.FullName.Substring($projectRoot.Path.Length).TrimStart('\/')
    $relativePath = $relativePath.Replace('\', '/')

    # $filesToInclude 배열에 있는 패턴과 현재 파일의 상대 경로를 비교
    $isMatch = $false
    foreach ($pattern in $filesToInclude) {
        if ($relativePath -like $pattern) {
            $isMatch = $true
            break # 일치하는 패턴을 찾았으면 더 이상 비교할 필요 없음
        }
    }

    # 일치하는 경우에만 파일 내용 추가
    if ($isMatch) {
        $header = "`n============================================================`nFILE: $relativePath`n============================================================`n"
        Out-File -FilePath $outputFile -Append -InputObject $header -Encoding Utf8

        $content = Get-Content -Path $file.FullName -Raw -Encoding Utf8
        Out-File -FilePath $outputFile -Append -InputObject $content -Encoding Utf8
        
        Write-Host "  - 병합 완료: $relativePath"
    }
}

# 4. 데이터베이스 스키마 수동 추가
# ... (이하 내용은 이전과 동일)
$dbSchemaHeader = "`n============================================================`nFILE: database_schema.sql`n============================================================`n"
$dbSchemaContent = @"
-- posts 테이블 생성 쿼리 및 수정 쿼리
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_thumbnail_blurred BOOLEAN DEFAULT FALSE,
  is_content_spoiler BOOLEAN DEFAULT FALSE
);
"@
Out-File -FilePath $outputFile -Append -InputObject $dbSchemaHeader -Encoding Utf8
Out-File -FilePath $outputFile -Append -InputObject $dbSchemaContent -Encoding Utf8
Write-Host "  - 병합 완료: database_schema.sql"

# 5. .env.local 템플릿 수동 추가
$envHeader = "`n============================================================`nFILE: .env.local (템플릿 - 실제 값은 제외됨)`n============================================================`n"
$envContent = @"
# ⚠️ 중요: 실제 값은 절대 외부에 공유하면 안 됩니다.

# Vercel Postgres
POSTGRES_URL="postgres://..."

# Cloudflare R2
R2_BUCKET_NAME="YOUR_BUCKET_NAME"
R2_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="YOUR_R2_ACCESS_KEY_ID"
R2_SECRET_ACCESS_KEY="YOUR_R2_SECRET_ACCESS_KEY"
NEXT_PUBLIC_R2_PUBLIC_URL="https://pub-....r2.dev"

# Turbopack 비활성화 (만약 사용했다면)
NEXT_TURBOPACK=0
"@
Out-File -FilePath $outputFile -Append -InputObject $envHeader -Encoding Utf8
Out-File -FilePath $outputFile -Append -InputObject $envContent -Encoding Utf8
Write-Host "  - 병합 완료: .env.local (템플릿)"


Write-Host "✅ 모든 파일이 '$outputFile' 파일로 성공적으로 병합되었습니다. (UTF-8 인코딩)" -ForegroundColor Green