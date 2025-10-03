# --- Configuration ---

# 1. The name of the output file.
$outputFile = "merged_code_context.txt"

# 2. List of directories to exclude from the merge.
$excludeDirs = @(
    'node_modules',
    '.next',
    '.vercel',
    '.git',
    '.generated',
    'dist',
    'out',
    'build',
    'coverage',
    'logs',
    'temp',
    'tmp',
    'vendor',
    'bin',
    'obj',
    'tests',
    'test',
    'spec',
    'test-results',
    'package-lock.json'
)

# 3. List of file extensions to exclude.
$excludeExtensions = @(
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico',
    '.woff', '.woff2', '.ttf', '.otf', '.eot',
    '.lock',
    '.ps1'
)

# --- Script Body ---

$scriptRoot = (Get-Location).Path

if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

$excludeDirPattern = ($excludeDirs | ForEach-Object { [regex]::Escape($_) }) -join '|'
$excludeExtPattern = ($excludeExtensions | ForEach-Object { [regex]::Escape($_) }) -join '$|'
$excludeExtPattern += '$'

Write-Host "Starting project file merge..."
Write-Host "Output file: $outputFile"
Write-Host "Excluding directories: $($excludeDirs -join ', ')"
Write-Host "Excluding extensions: $($excludeExtensions -join ', ')"
Write-Host "--------------------------------------------------"

$filesToMerge = Get-ChildItem -Path $scriptRoot -Recurse | Where-Object {
    !$_.PSIsContainer -and $_.FullName -notmatch $excludeDirPattern -and $_.Extension -notmatch $excludeExtPattern
}

# Use Out-File for initial creation with correct encoding. This is highly compatible.
"--- START OF FILE merged_code_context.txt ---`n" | Out-File -FilePath $outputFile -Encoding utf8

foreach ($file in $filesToMerge) {
    $relativePath = $file.FullName.Substring($scriptRoot.Length + 1)
    
    Write-Host "Merging: $relativePath"
    
    $header = @"

============================================================
FILE: $relativePath
============================================================

"@
    
    # Use the .NET Framework directly for maximum compatibility to read files in UTF-8.
    # This bypasses PowerShell version limitations for Get-Content.
    try {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    } catch {
        Write-Warning "Could not read file $($file.FullName) as UTF-8. Trying default encoding. Error: $_"
        # If UTF-8 fails (e.g., for binary-like files), try again with default encoding.
        $content = [System.IO.File]::ReadAllText($file.FullName)
    }
    
    # Use Out-File with -Append for stable file writing across all versions.
    ($header + $content) | Out-File -FilePath $outputFile -Append -Encoding utf8
}

"`n--- END OF FILE merged_code_context.txt ---" | Out-File -FilePath $outputFile -Append -Encoding utf8

Write-Host "--------------------------------------------------"
Write-Host "✅ Done! Merged $($filesToMerge.Count) files into '$outputFile'."