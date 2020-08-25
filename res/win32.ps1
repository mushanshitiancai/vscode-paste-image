# Adapted from https://github.com/octan3/img-clipboard-dump/blob/master/dump-clipboard-png.ps1
Add-Type -Assembly System.Windows.Forms
Add-Type -Assembly PresentationCore
if(![System.Windows.Forms.Clipboard]::ContainsImage()) {
    "no image"
    Exit 0
}

$img = [Windows.Clipboard]::GetImage()

$fcb = new-object Windows.Media.Imaging.FormatConvertedBitmap($img, [Windows.Media.PixelFormats]::Rgb24, $null, 0)
$stream = New-Object System.IO.MemoryStream
$encoder = New-Object Windows.Media.Imaging.PngBitmapEncoder
$encoder.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($fcb)) | out-null
$encoder.Save($stream) | out-null
$buff = [System.Convert]::ToBase64String($stream.ToArray());
$stream.Dispose() | out-null

$buff
