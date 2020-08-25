param($base64)
Add-Type -Assembly System.Windows.Forms
Add-Type -Assembly PresentationCore
$buff = [System.Convert]::FromBase64String($base64)
$stream = New-Object System.IO.MemoryStream($buff, $FALSE)
$img = [System.Drawing.Image]::FromStream($stream, $TRUE)
[System.Windows.Forms.Clipboard]::SetImage($img)
$stream.Dispose() | out-null
