$repoPath = "E:\CODING\SANGKIDAL WORKS"
$branch = "master"

Set-Location $repoPath

git config --global --add safe.directory $repoPath

Write-Host "Auto sync aktif untuk: $repoPath"
Write-Host "Branch target: $branch"

while ($true) {
    try {
        git -C $repoPath pull --rebase origin $branch

        $status = git -C $repoPath status --porcelain
        if ($status) {
            git -C $repoPath add .
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            git -C $repoPath commit -m "Auto update $timestamp"
            git -C $repoPath push origin $branch
            Write-Host "Berhasil push update pada $timestamp"
        }
        else {
            Write-Host "Tidak ada perubahan. Menunggu 30 detik..."
        }
    }
    catch {
        Write-Host "Terjadi error: $($_.Exception.Message)"
        Write-Host "Mencoba lagi dalam 30 detik..."
    }

    Start-Sleep -Seconds 30
}
