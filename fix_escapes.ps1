$file = 'c:\SONARIX\src\app\App.tsx'
$content = [System.IO.File]::ReadAllText($file)

# Replace \n with actual newlines
$content = $content.Replace('\n', [System.Environment]::NewLine)

# Replace \" with "
$content = $content.Replace('\"', '"')

[System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
Write-Output "Fixed escape sequences in App.tsx"
