# TabsForge

A lightweight, portable Windows utility for launching multiple Windows Terminal tabs from a predefined list of directory paths.

## What it does

TabsForge lets you configure a list of directories and generate a `.bat` file that opens Windows Terminal with each directory as a separate tab. _Useful for developers who work across multiple project folders daily._

<img width="544" height="320" alt="Image" src="https://github.com/user-attachments/assets/55decf87-2ef3-4ee3-866c-ca2e9be78c49" />

## Download

You can download the portable executable from the [Releases](https://github.com/AbhijitNair/TabsForge/releases) page. No installation or build required — just download, extract, and run.

## Features

- Add directory paths via an inline text input
- Remove individual paths or clear all at once
- Reorder paths via drag-and-drop handles
- Insert paths at specific positions using the + button
- Generate a `.bat` file that launches Windows Terminal with all paths as tabs
- Persistent storage — your path list is saved between sessions
- Fully portable — no installation, no registry writes, no AppData usage
- Tiny footprint (~5 MB) thanks to Neutralinojs

## Usage

1. Type a directory path in the input field at the bottom of the list and press **Enter**
2. Use the **≡** drag handle to reorder entries
3. Use **+** to insert a path below a specific row
4. Use **−** to remove a path
5. Click **Create .bat** to save a batch file that launches Windows Terminal with your configured tabs
6. Run the generated `.bat` file to open all tabs at once

## Generated Bat File Format

For paths `C:\project-a`, `D:\project-b`, `E:\project-c`:

```bat
@echo off
wt --window new new-tab --startingDirectory "C:\project-a" ^; new-tab --startingDirectory "D:\project-b" ^; new-tab --startingDirectory "E:\project-c"
```

## Data Storage

Path configuration is saved in `paths.json` alongside the executable. No data is written to AppData, the registry, or any system directory.

## Development

For contributors who want to build from source:

### Prerequisites

- [Windows Terminal](https://aka.ms/terminal) installed on the target machine
- [neu CLI](https://neutralino.js.org/docs/cli/neu-cli) for development (`npm install -g @neutralinojs/neu`)

### Run in development mode

```bash
# Run the app in development mode
neu run
```

### Build Portable Executable

```bash
neu build
```

This creates `dist/TabsForge/` containing the portable application. Share the folder — no installation required.

## License

MIT
