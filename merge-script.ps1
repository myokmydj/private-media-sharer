# ===================================================================
# Next.js 프로젝트 소스 코드 병합 스크립트 (v2 - 특수 문자 경로 수정)
# - 지정된 파일들을 읽어 하나의 텍스트 파일로 합칩니다.
# - 한글 깨짐 방지를 위해 모든 파일을 UTF-8로 처리합니다.
# - AI에게 컨텍스트를 제공하는 용도로 사용하기 좋습니다.
# ===================================================================

# --- 설정 (이 부분을 수정하여 사용하세요) ---

# 1. 결과 파일 이름 설정
$outputFile = "merged_code_context.txt"

# 2. 프로젝트 루트 경로 설정 (보통 스크립트가 있는 위치이므로 변경할 필요 없음)
$projectRoot = $PSScriptRoot

# 3. 병합할 파일 목록 (프로젝트 루트로부터의 상대 경로)
#    AI에게 보여주고 싶은 파일들을 여기에 추가하거나 제거하세요.
$filesToMerge = @(
    "next.config.ts",
    "package.json",
    "tailwind.config.ts",
    "app/globals.css",
    "app/layout.tsx",
    "app/upload/page.tsx",
    "app/view/[id]/page.tsx",
    "app/view/[id]/PostContent.tsx",
    "app/view/[id]/PasswordProtect.tsx",
    "app/api/posts/route.ts",
    "app/api/upload/route.ts",
    "app/api/og/route.tsx",
    "app/api/verify-password/route.ts"
)

# --- 스크립트 실행 로직 (여기부터는 수정할 필요 없음) ---

# 이전 결과 파일이 있다면 삭제
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

# 결과 파일 상단에 헤더 추가
$header = "--- START OF PROJECT CONTEXT ---`nGenerated on: $(Get-Date)`n"
Add-Content -Path $outputFile -Value $header -Encoding Utf8

# 파일 목록을 순회하며 내용 병합
foreach ($file in $filesToMerge) {
    $fullPath = Join-Path -Path $projectRoot -ChildPath $file

    # 파일 존재 여부 확인 (*** 수정된 부분 ***)
    if (-not (Test-Path -LiteralPath $fullPath)) {
        Write-Warning "File not found, skipping: $fullPath"
        continue
    }

    # 각 파일의 헤더 생성 (AI가 파일 경로를 인식하도록)
    $fileHeader = "`n`n============================================================`nFILE: $file`n============================================================`n"
    Add-Content -Path $outputFile -Value $fileHeader -Encoding Utf8

    # 파일 내용을 UTF-8로 읽어서 결과 파일에 추가 (*** 수정된 부분 ***)
    # -Raw 옵션: 파일 전체를 하나의 문자열로 읽어와 줄바꿈을 그대로 유지
    $content = Get-Content -LiteralPath $fullPath -Raw -Encoding Utf8
    Add-Content -Path $outputFile -Value $content -Encoding Utf8
}

Write-Host "✅ Merge complete!" -ForegroundColor Green
Write-Host "Output file saved to: $outputFile"
Write-Host "You can now open the file, copy its content, and paste it to the AI."