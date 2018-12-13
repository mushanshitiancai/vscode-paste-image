param($imagePath)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [Console]::OutputEncoding

# Adapted from https://github.com/octan3/img-clipboard-dump/blob/master/dump-clipboard-png.ps1

Add-Type -Assembly PresentationCore

If([Windows.Clipboard]::ContainsText())
{
    $imagePath = [Windows.Clipboard]::GetText([System.Windows.TextDataFormat]::Text)
}
ElseIf([Windows.Clipboard]::ContainsImage())
{
    $img = [Windows.Clipboard]::GetImage()

    $fcb = new-object Windows.Media.Imaging.FormatConvertedBitmap($img, [Windows.Media.PixelFormats]::Rgb24, $null, 0)
    $stream = [IO.File]::Open($imagePath, "OpenOrCreate")
    $encoder = New-Object Windows.Media.Imaging.PngBitmapEncoder
    $encoder.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($fcb)) | out-null
    $encoder.Save($stream) | out-null
    $stream.Dispose() | out-null
} 
ElseIf([Windows.Clipboard]::ContainsFileDropList())
{
    $imagePath = [Windows.Clipboard]::GetFileDropList()[0]
} 
Else {
    "no image"
    Exit 1
}

$imagePath