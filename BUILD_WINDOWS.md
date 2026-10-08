# Avron: Magician — Windows build

This repository builds the Phaser game as a standalone Windows application with Tauri.

## GitHub Actions

1. Upload this repository to `Veraldur/avron-magician`.
2. Open **Actions**.
3. Select **Build Avron: Magician for Windows**.
4. Click **Run workflow**.
5. When it finishes, open the run and download the `avron-magician-windows` artifact.

The artifact contains a Windows `.exe` installer (NSIS) and an `.msi` installer.

## Important

Do not put the old `.7z` archive in the repository. The game files should be normal repository files. GitHub's 25 MB limit applies to an individual file, not to the total repository size.
