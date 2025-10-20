const { ipcRenderer } = require('electron');

// Tab switching functionality
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// Status management
const statusText = document.getElementById('status-text');
const statusIndicator = document.getElementById('status-indicator');

function updateStatus(message, type = 'ready') {
    statusText.textContent = message;
    statusIndicator.className = 'status-indicator';
    
    switch(type) {
        case 'recording':
            statusIndicator.style.background = '#ef4444';
            statusIndicator.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.5)';
            break;
        case 'playing':
            statusIndicator.style.background = '#10b981';
            statusIndicator.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.5)';
            break;
        case 'active':
            statusIndicator.style.background = '#f59e0b';
            statusIndicator.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.5)';
            break;
        default:
            statusIndicator.style.background = '#4ade80';
            statusIndicator.style.boxShadow = '0 0 10px rgba(74, 222, 128, 0.5)';
    }
}

// Macro Recorder functionality
let isRecording = false;
let isPlayingMacro = false;
let recordedActionCount = 0;

const startRecordingBtn = document.getElementById('start-recording');
const stopRecordingBtn = document.getElementById('stop-recording');
const playMacroBtn = document.getElementById('play-macro');
const stopMacroBtn = document.getElementById('stop-macro');
const actionCountSpan = document.getElementById('action-count');

startRecordingBtn.addEventListener('click', async () => {
    try {
        const result = await ipcRenderer.invoke('start-macro-recording');
        if (result.success) {
            isRecording = true;
            startRecordingBtn.disabled = true;
            stopRecordingBtn.disabled = false;
            playMacroBtn.disabled = true;
            updateStatus('Recording macro...', 'recording');
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        alert(`Error starting recording: ${error.message}`);
    }
});

stopRecordingBtn.addEventListener('click', async () => {
    try {
        const result = await ipcRenderer.invoke('stop-macro-recording');
        if (result.success) {
            isRecording = false;
            startRecordingBtn.disabled = false;
            stopRecordingBtn.disabled = true;
            playMacroBtn.disabled = false;
            recordedActionCount = result.actionCount || 0;
            actionCountSpan.textContent = recordedActionCount;
            updateStatus(`Recording stopped. ${recordedActionCount} actions recorded`, 'ready');
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        alert(`Error stopping recording: ${error.message}`);
    }
});

playMacroBtn.addEventListener('click', async () => {
    const speed = parseFloat(document.getElementById('macro-speed').value);
    const times = parseInt(document.getElementById('macro-times').value);
    
    try {
        const result = await ipcRenderer.invoke('play-macro', { speed, times });
        if (result.success) {
            isPlayingMacro = true;
            playMacroBtn.disabled = true;
            stopMacroBtn.disabled = false;
            startRecordingBtn.disabled = true;
            updateStatus(`Playing macro ${times === -1 ? 'infinitely' : `${times} times`}`, 'playing');
            
            // Auto-enable buttons after playback (for finite playback)
            if (times !== -1) {
                setTimeout(() => {
                    if (isPlayingMacro) {
                        stopMacroPlayback();
                    }
                }, 5000); // Safety timeout
            }
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        alert(`Error playing macro: ${error.message}`);
    }
});

stopMacroBtn.addEventListener('click', stopMacroPlayback);

async function stopMacroPlayback() {
    try {
        const result = await ipcRenderer.invoke('stop-macro');
        if (result.success) {
            isPlayingMacro = false;
            playMacroBtn.disabled = false;
            stopMacroBtn.disabled = true;
            startRecordingBtn.disabled = false;
            updateStatus('Macro playback stopped', 'ready');
        }
    } catch (error) {
        alert(`Error stopping macro: ${error.message}`);
    }
}

// Auto Clicker functionality
let isAutoClickerRunning = false;

const startClickerBtn = document.getElementById('start-clicker');
const stopClickerBtn = document.getElementById('stop-clicker');
const clickerStatus = document.getElementById('clicker-status');

startClickerBtn.addEventListener('click', async () => {
    const cps = parseFloat(document.getElementById('click-speed').value);
    const button = document.getElementById('click-button').value;
    
    try {
        const result = await ipcRenderer.invoke('start-auto-clicker', { cps, button });
        if (result.success) {
            isAutoClickerRunning = true;
            startClickerBtn.disabled = true;
            stopClickerBtn.disabled = false;
            clickerStatus.textContent = 'Running';
            clickerStatus.className = 'running';
            updateStatus(`Auto clicker running at ${cps} CPS`, 'active');
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        alert(`Error starting auto clicker: ${error.message}`);
    }
});

stopClickerBtn.addEventListener('click', async () => {
    try {
        const result = await ipcRenderer.invoke('stop-auto-clicker');
        if (result.success) {
            isAutoClickerRunning = false;
            startClickerBtn.disabled = false;
            stopClickerBtn.disabled = true;
            clickerStatus.textContent = 'Stopped';
            clickerStatus.className = 'stopped';
            updateStatus('Auto clicker stopped', 'ready');
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        alert(`Error stopping auto clicker: ${error.message}`);
    }
});

// Auto Hotkey functionality
let isAutoHotkeyRunning = false;

const startHotkeyBtn = document.getElementById('start-hotkey');
const stopHotkeyBtn = document.getElementById('stop-hotkey');
const hotkeyStatus = document.getElementById('hotkey-status');
const hotkeyModeSelect = document.getElementById('hotkey-mode');
const hotkeySpeedGroup = document.getElementById('hotkey-speed-group');

// Toggle speed control visibility based on mode
hotkeyModeSelect.addEventListener('change', () => {
    const mode = hotkeyModeSelect.value;
    if (mode === 'hold') {
        hotkeySpeedGroup.classList.add('hidden');
    } else {
        hotkeySpeedGroup.classList.remove('hidden');
    }
});

startHotkeyBtn.addEventListener('click', async () => {
    const key = document.getElementById('hotkey-key').value;
    const mode = document.getElementById('hotkey-mode').value;
    const cps = parseInt(document.getElementById('hotkey-speed').value);
    
    try {
        const result = await ipcRenderer.invoke('start-auto-hotkey', { key, mode, cps });
        if (result.success) {
            isAutoHotkeyRunning = true;
            startHotkeyBtn.disabled = true;
            stopHotkeyBtn.disabled = false;
            hotkeyStatus.textContent = 'Running';
            hotkeyStatus.className = 'running';
            
            const statusMessage = mode === 'hold' 
                ? `Holding down ${key.toUpperCase()} key`
                : `Auto pressing ${key.toUpperCase()} at ${cps}/sec`;
            updateStatus(statusMessage, 'active');
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        alert(`Error starting auto hotkey: ${error.message}`);
    }
});

stopHotkeyBtn.addEventListener('click', async () => {
    const key = document.getElementById('hotkey-key').value;
    const mode = document.getElementById('hotkey-mode').value;
    
    try {
        const result = await ipcRenderer.invoke('stop-auto-hotkey', { key, mode });
        if (result.success) {
            isAutoHotkeyRunning = false;
            startHotkeyBtn.disabled = false;
            stopHotkeyBtn.disabled = true;
            hotkeyStatus.textContent = 'Stopped';
            hotkeyStatus.className = 'stopped';
            updateStatus('Auto hotkey stopped', 'ready');
        } else {
            alert(`Error: ${result.message}`);
        }
    } catch (error) {
        alert(`Error stopping auto hotkey: ${error.message}`);
    }
});

// Initialize status
updateStatus('Ready', 'ready');

// Handle app close cleanup
window.addEventListener('beforeunload', async () => {
    if (isRecording) {
        await ipcRenderer.invoke('stop-macro-recording');
    }
    if (isPlayingMacro) {
        await ipcRenderer.invoke('stop-macro');
    }
    if (isAutoClickerRunning) {
        await ipcRenderer.invoke('stop-auto-clicker');
    }
    if (isAutoHotkeyRunning) {
        const key = document.getElementById('hotkey-key').value;
        const mode = document.getElementById('hotkey-mode').value;
        await ipcRenderer.invoke('stop-auto-hotkey', { key, mode });
    }
});