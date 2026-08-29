param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Bitmap]::FromFile((Resolve-Path -LiteralPath $InputPath))
$output = New-Object System.Drawing.Bitmap $source.Width, $source.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($output)
$graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$graphics.DrawImageUnscaled($source, 0, 0)
$graphics.Dispose()
$source.Dispose()

$rect = New-Object System.Drawing.Rectangle 0, 0, $output.Width, $output.Height
$data = $output.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bytes = New-Object byte[] ([Math]::Abs($data.Stride) * $output.Height)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)

for ($y = 0; $y -lt $output.Height; $y++) {
  $row = $y * $data.Stride
  for ($x = 0; $x -lt $output.Width; $x++) {
    $offset = $row + ($x * 4)
    $blue = [int]$bytes[$offset]
    $green = [int]$bytes[$offset + 1]
    $red = [int]$bytes[$offset + 2]

    # The generated source deliberately uses a pure #ff00ff matte. Preserve
    # genuine art colors and feather only the anti-aliased chroma fringe.
    $magentaDominance = [Math]::Min($red, $blue) - $green
    if ($red -gt 165 -and $blue -gt 165 -and $magentaDominance -gt 42) {
      $key = [Math]::Min(1.0, [Math]::Max(0.0, ($magentaDominance - 42.0) / 150.0))
      $bytes[$offset + 3] = [byte][Math]::Round(255.0 * (1.0 - $key))
      if ($key -lt 1.0) {
        # Neutralise the chroma spill left in partially transparent edge pixels.
        $neutralCeiling = [Math]::Min(255, $green + 18)
        $bytes[$offset] = [byte][Math]::Min($blue, $neutralCeiling)
        $bytes[$offset + 2] = [byte][Math]::Min($red, $neutralCeiling)
      }
    }
    if ($bytes[$offset + 3] -eq 0) {
      # PNG hidden RGB must remain empty: this prevents color fringes during
      # mipmapping and satisfies the runtime alpha contract.
      $bytes[$offset] = 0
      $bytes[$offset + 1] = 0
      $bytes[$offset + 2] = 0
    }
  }
}

[System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
$output.UnlockBits($data)

$destination = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $OutputPath))
$directory = [System.IO.Path]::GetDirectoryName($destination)
if (-not [System.IO.Directory]::Exists($directory)) {
  [System.IO.Directory]::CreateDirectory($directory) | Out-Null
}
$output.Save($destination, [System.Drawing.Imaging.ImageFormat]::Png)
$output.Dispose()

Write-Output $destination
