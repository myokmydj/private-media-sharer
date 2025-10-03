# merge-script.ps1 (Final, Corrected Version)

# --- Configuration ---
$ProjectRoot = $PSScriptRoot
$OutputFile = Join-Path $ProjectRoot "merged_code_context.txt"
$ExcludeDirs = @('node_modules', '.git', '.next', 'out', 'build', 'dist', '.generated')
$ExcludeExtensions = @('.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.ttf', '.otf', '.woff', '.woff2', '.eot', '.zip', '.gz', '.lock')
$ExcludeFiles = @('merged_code_context.txt', 'merge-script.ps1', 'package-lock.json')

# --- Script Execution ---
Write-Host "Starting project file merge..." -ForegroundColor Green

# Use -LiteralPath to handle special characters like '[]' in paths
if (Test-Path -LiteralPath $OutputFile) {
    Remove-Item -LiteralPath $OutputFile -Force
}

# --- Get All Files and Filter Them ---
# Use -LiteralPath to prevent wildcard expansion for paths containing '[]'
$filesToMerge = Get-ChildItem -LiteralPath $ProjectRoot -Recurse -File | Where-Object {
    $file = $_
    $isExcluded = $false

    # Exclusion Check 1: Directories
    foreach ($dir in $ExcludeDirs) {
        # This is a string comparison, so it's safe.
        $excludePath = (Join-Path $ProjectRoot $dir) + "\"
        if ($file.FullName.ToLower().StartsWith($excludePath.ToLower())) {
            $isExcluded = $true
            break
        }
    }
    if ($isExcluded) { return $false }

    # Exclusion Check 2: Extensions and Filenames
    if (($ExcludeExtensions -contains $file.Extension.ToLower()) -or ($ExcludeFiles -contains $file.Name.ToLower())) {
        return $false
    }
    
    return $true
}

# --- Merging Logic ---
foreach ($file in $filesToMerge) {
    $relativePath = $file.FullName.Substring($ProjectRoot.Length + 1).Replace('\', '/')
    $header = "============================================================`nFILE: $relativePath`n============================================================"
    Add-Content -LiteralPath $OutputFile -Value $header -Encoding Utf8

    try {
        Get-Content -LiteralPath $file.FullName -Encoding UTF8 -ErrorAction Stop | Add-Content -LiteralPath $OutputFile -Encoding UTF8
    }
    catch {
        Write-Warning "Could not read $($file.FullName) as UTF-8. Retrying with default encoding."
        Get-Content -LiteralPath $file.FullName | Add-Content -LiteralPath $OutputFile -Encoding UTF8
    }
    
    Add-Content -LiteralPath $OutputFile -Value "" -Encoding Utf8
}

$fileCount = $filesToMerge.Count
Write-Host "Successfully merged $fileCount files." -ForegroundColor Green
Write-Host "Result saved to '$OutputFile'"