# PC Macro AutoClicker ⚡

> A comprehensive PC automation tool with macro recording/playback, auto clicker, and auto hotkey functionality. Built with Electron and packaged as a standalone Windows executable.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)

## Features

### 📹 Macro Recorder
- **Record & Playback**: Record mouse clicks and keyboard inputs, then replay them
- **Customizable Speed**: Adjust playback speed from 0.25x to 5x
- **Repeat Options**: Play once, multiple times, or unlimited until stopped
- **Hotkey Control**: F1 to record, F2 to playback
- **Action Counter**: See how many actions were recorded

### 🖱️ Auto Clicker
- **Variable Speed**: 1-50 clicks per second (CPS)
- **Multiple Buttons**: Left, right, or middle mouse button
- **Hotkey Toggle**: F3 to start/stop clicking
- **Current Position**: Clicks at current mouse position
- **Status Display**: Real-time status updates

### ⌨️ Auto Hotkey
- **Key Selection**: Choose from common keys (F, Space, Enter, WASD, etc.)
- **Two Modes**: 
  - **Continuous Press**: Repeatedly press key at set speed
  - **Hold Down**: Hold key down until stopped
- **Speed Control**: 1-50 presses per second for continuous mode
- **Hotkey Toggle**: F4 to start/stop
- **Game-Friendly**: Perfect for gaming automation

## Screenshots

*Application interface with three main tabs for different automation tools*

## Quick Start

### Option 1: Download Pre-built Executable
1. Go to [Releases](https://github.com/ston1ee/pc-macro-autoclicker/releases)
2. Download `PC-Macro-AutoClicker-Setup.exe`
3. Install and run

### Option 2: Build from Source

#### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **Windows** (for building Windows executable)
- **Git** - [Download here](https://git-scm.com/)

#### Step-by-Step Build Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/ston1ee/pc-macro-autoclicker.git
   cd pc-macro-autoclicker
   ```

2. **Install dependencies and build**
   ```bash
   npm run build
   ```
   
   This single command will:
   - Install all Node.js dependencies
   - Install native modules (robotjs, iohook)
   - Build the Windows executable
   - Create installer and portable versions

3. **Find your executable**
   - **Installer**: `dist/PC Macro AutoClicker Setup 1.0.0.exe`
   - **Portable**: `dist/PC Macro AutoClicker 1.0.0.exe`

4. **Run the application**
   - Double-click the executable to launch
   - No additional dependencies required!

#### Alternative Build Commands

```bash
# Development mode (requires Node.js)
npm start

# Build for specific platforms
npm run build:win    # Windows only
npm run build:linux  # Linux AppImage
npm run build:mac    # macOS DMG
```

## Usage Guide

### Macro Recorder
1. Click **"Start Recording"** or press **F1**
2. Perform your mouse clicks and keyboard inputs
3. Click **"Stop Recording"** or press **F1** again
4. Adjust playback speed and repeat count
5. Click **"Play Macro"** or press **F2** to replay

### Auto Clicker
1. Position your mouse where you want to click
2. Select desired click speed (CPS)
3. Choose mouse button (left/right/middle)
4. Click **"Start Auto Clicker"** or press **F3**
5. Press **F3** again to stop

### Auto Hotkey
1. Select the key to automate
2. Choose mode:
   - **Continuous**: Repeatedly press key at set speed
   - **Hold Down**: Hold key down continuously
3. Adjust speed (for continuous mode)
4. Click **"Start Auto Hotkey"** or press **F4**
5. Press **F4** again to stop

## Hotkey Reference

| Function | Hotkey | Description |
|----------|--------|--------------|
| Macro Record | **F1** | Start/stop macro recording |
| Macro Play | **F2** | Start/stop macro playback |
| Auto Clicker | **F3** | Start/stop auto clicking |
| Auto Hotkey | **F4** | Start/stop auto hotkey |

## Technical Details

### Built With
- **Electron** - Cross-platform desktop framework
- **Node.js** - JavaScript runtime
- **robotjs** - Native automation library
- **iohook** - Global input capture
- **electron-builder** - Application packaging

### System Requirements
- **OS**: Windows 10/11 (64-bit)
- **RAM**: 100MB minimum
- **Disk**: 150MB free space
- **Permissions**: Administrator rights may be required for some games

### File Structure
```
pc-macro-autoclicker/
├── dist/                 # Built executables
├── assets/               # Application icons
├── main.js               # Electron main process
├── renderer.js           # UI logic
├── index.html            # Main interface
├── styles.css            # Application styling
├── package.json          # Project configuration
└── README.md             # This file
```

## Troubleshooting

### Common Issues

**Q: "Application won't start"**
- Ensure Windows Defender/antivirus isn't blocking the app
- Run as administrator if needed
- Check Windows compatibility mode

**Q: "Macro recording not working"**
- Grant administrator privileges
- Disable other macro software that might conflict
- Ensure target application allows input automation

**Q: "Auto clicker too slow/fast"**
- Adjust CPS setting in the interface
- Some applications may limit input speed
- Try different click intervals

**Q: "Build fails with native module errors"**
```bash
# Try rebuilding native modules
npm install --build-from-source
# Or use pre-built binaries
npm install --force
```

**Q: "Executable too large"**
```bash
# Build production version (smaller size)
set NODE_ENV=production
npm run build
```

### Performance Tips
- Close unnecessary applications when using high-speed automation
- Use "Hold Down" mode for games that require continuous input
- Lower CPS if experiencing system lag

### Antivirus False Positives
This application may trigger antivirus warnings because it:
- Uses global input hooks (iohook)
- Simulates mouse/keyboard input (robotjs)
- Is a packaged executable

**This is normal for automation tools**. Add the application to your antivirus whitelist if needed.

## Development

### Setting up Development Environment

```bash
# Clone repository
git clone https://github.com/ston1ee/pc-macro-autoclicker.git
cd pc-macro-autoclicker

# Install dependencies
npm install

# Start in development mode
npm start
```

### Project Scripts
```bash
npm start          # Run in development mode
npm run build      # Build production executable
npm run dist       # Same as build
npm test           # Run tests (if implemented)
```

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Security & Legal

### Responsible Use
This tool is intended for:
- **Productivity automation**
- **Repetitive task automation**
- **Testing and development**
- **Accessibility assistance**

**Do NOT use for**:
- Cheating in online games
- Automating against terms of service
- Malicious activities
- Spam or abuse

### Privacy
- **No data collection**: This app runs completely offline
- **No telemetry**: No usage data is sent anywhere
- **Local storage only**: All settings stored locally

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**ston1ee** - [GitHub Profile](https://github.com/ston1ee)

## Support

If you find this project helpful:
- ⭐ Star the repository
- 📝 Report issues
- 🚀 Submit feature requests
- 💰 Consider supporting development

---

**Built with ❤️ using Electron** | **Made for Windows PC automation**

*Last updated: October 2025*