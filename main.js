const { app, BrowserWindow, ipcMain, globalShortcut, Menu } = require('electron');
const path = require('path');
const robot = require('robotjs');
const ioHook = require('iohook');

let mainWindow;
let isRecording = false;
let recordedActions = [];
let isPlaying = false;
let playbackInterval;
let autoClickerInterval;
let autoHotkeyInterval;
let isAutoHotkeyActive = false;

// Disable security warnings for development
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    show: false
  });

  mainWindow.loadFile('index.html');
  
  // Remove menu bar
  Menu.setApplicationMenu(null);
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    // Clean up intervals and hooks
    stopAllActivities();
  });
}

function stopAllActivities() {
  if (playbackInterval) clearInterval(playbackInterval);
  if (autoClickerInterval) clearInterval(autoClickerInterval);
  if (autoHotkeyInterval) clearInterval(autoHotkeyInterval);
  isRecording = false;
  isPlaying = false;
  isAutoHotkeyActive = false;
  try {
    ioHook.stop();
  } catch (e) {
    // Ignore errors when stopping ioHook
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopAllActivities();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopAllActivities();
});

// IPC Handlers
ipcMain.handle('start-macro-recording', () => {
  if (isRecording) return { success: false, message: 'Already recording' };
  
  isRecording = true;
  recordedActions = [];
  
  try {
    ioHook.on('mouseclick', (event) => {
      if (isRecording) {
        recordedActions.push({
          type: 'click',
          x: event.x,
          y: event.y,
          button: event.button,
          timestamp: Date.now()
        });
      }
    });
    
    ioHook.on('keydown', (event) => {
      if (isRecording) {
        recordedActions.push({
          type: 'keydown',
          keycode: event.keycode,
          timestamp: Date.now()
        });
      }
    });
    
    ioHook.start();
    return { success: true, message: 'Macro recording started' };
  } catch (error) {
    isRecording = false;
    return { success: false, message: `Error starting recording: ${error.message}` };
  }
});

ipcMain.handle('stop-macro-recording', () => {
  if (!isRecording) return { success: false, message: 'Not recording' };
  
  isRecording = false;
  try {
    ioHook.stop();
  } catch (e) {
    // Ignore errors
  }
  
  return { 
    success: true, 
    message: `Macro recording stopped. Recorded ${recordedActions.length} actions`,
    actionCount: recordedActions.length
  };
});

ipcMain.handle('play-macro', (event, { speed = 1, times = 1 }) => {
  if (isPlaying) return { success: false, message: 'Macro already playing' };
  if (recordedActions.length === 0) return { success: false, message: 'No recorded actions to play' };
  
  isPlaying = true;
  let currentPlayback = 0;
  
  const playSequence = () => {
    if (!isPlaying || currentPlayback >= times) {
      isPlaying = false;
      return { success: true, message: 'Macro playback completed' };
    }
    
    let actionIndex = 0;
    const startTime = recordedActions[0].timestamp;
    
    const executeAction = () => {
      if (!isPlaying || actionIndex >= recordedActions.length) {
        currentPlayback++;
        if (currentPlayback < times && isPlaying) {
          setTimeout(playSequence, 100); // Small delay between repetitions
        } else {
          isPlaying = false;
        }
        return;
      }
      
      const action = recordedActions[actionIndex];
      
      try {
        if (action.type === 'click') {
          robot.moveMouse(action.x, action.y);
          robot.mouseClick(action.button === 1 ? 'left' : action.button === 2 ? 'right' : 'middle');
        } else if (action.type === 'keydown') {
          // Convert keycode to robot.js key name (simplified)
          const keyName = getKeyName(action.keycode);
          if (keyName) {
            robot.keyTap(keyName);
          }
        }
      } catch (error) {
        console.error('Error executing action:', error);
      }
      
      actionIndex++;
      
      if (actionIndex < recordedActions.length) {
        const nextAction = recordedActions[actionIndex];
        const delay = Math.max(1, (nextAction.timestamp - action.timestamp) / speed);
        setTimeout(executeAction, delay);
      } else {
        executeAction(); // Move to next repetition
      }
    };
    
    executeAction();
  };
  
  playSequence();
  return { success: true, message: 'Macro playback started' };
});

ipcMain.handle('stop-macro', () => {
  isPlaying = false;
  return { success: true, message: 'Macro playback stopped' };
});

ipcMain.handle('start-auto-clicker', (event, { cps = 1, button = 'left' }) => {
  if (autoClickerInterval) return { success: false, message: 'Auto clicker already running' };
  
  const intervalMs = 1000 / cps;
  
  autoClickerInterval = setInterval(() => {
    try {
      robot.mouseClick(button);
    } catch (error) {
      console.error('Auto clicker error:', error);
    }
  }, intervalMs);
  
  return { success: true, message: `Auto clicker started at ${cps} CPS` };
});

ipcMain.handle('stop-auto-clicker', () => {
  if (autoClickerInterval) {
    clearInterval(autoClickerInterval);
    autoClickerInterval = null;
    return { success: true, message: 'Auto clicker stopped' };
  }
  return { success: false, message: 'Auto clicker not running' };
});

ipcMain.handle('start-auto-hotkey', (event, { key = 'f', mode = 'continuous', cps = 10 }) => {
  if (isAutoHotkeyActive) return { success: false, message: 'Auto hotkey already active' };
  
  isAutoHotkeyActive = true;
  
  if (mode === 'hold') {
    try {
      robot.keyToggle(key, 'down');
      return { success: true, message: `Holding down key: ${key}` };
    } catch (error) {
      isAutoHotkeyActive = false;
      return { success: false, message: `Error holding key: ${error.message}` };
    }
  } else {
    const intervalMs = 1000 / cps;
    autoHotkeyInterval = setInterval(() => {
      if (!isAutoHotkeyActive) return;
      try {
        robot.keyTap(key);
      } catch (error) {
        console.error('Auto hotkey error:', error);
      }
    }, intervalMs);
    
    return { success: true, message: `Auto hotkey started: ${key} at ${cps} per second` };
  }
});

ipcMain.handle('stop-auto-hotkey', (event, { key = 'f', mode = 'continuous' }) => {
  if (!isAutoHotkeyActive) return { success: false, message: 'Auto hotkey not active' };
  
  isAutoHotkeyActive = false;
  
  if (mode === 'hold') {
    try {
      robot.keyToggle(key, 'up');
    } catch (error) {
      console.error('Error releasing key:', error);
    }
  }
  
  if (autoHotkeyInterval) {
    clearInterval(autoHotkeyInterval);
    autoHotkeyInterval = null;
  }
  
  return { success: true, message: 'Auto hotkey stopped' };
});

// Helper function to convert keycode to robot.js key name
function getKeyName(keycode) {
  const keyMap = {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    16: 'shift',
    17: 'control',
    18: 'alt',
    27: 'escape',
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'a', 66: 'b', 67: 'c', 68: 'd', 69: 'e', 70: 'f',
    71: 'g', 72: 'h', 73: 'i', 74: 'j', 75: 'k', 76: 'l',
    77: 'm', 78: 'n', 79: 'o', 80: 'p', 81: 'q', 82: 'r',
    83: 's', 84: 't', 85: 'u', 86: 'v', 87: 'w', 88: 'x',
    89: 'y', 90: 'z',
    48: '0', 49: '1', 50: '2', 51: '3', 52: '4',
    53: '5', 54: '6', 55: '7', 56: '8', 57: '9'
  };
  
  return keyMap[keycode] || null;
}