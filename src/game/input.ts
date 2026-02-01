
export const keys: Record<string, boolean> = {};

// Mobile accelerometer tilt values
export const tilt = {
  x: 0, // Left/Right tilt (-1 to 1)
  y: 0, // Forward/Backward tilt (-1 to 1)
  z: 0, // Z-axis
  enabled: false
};

// Debug info
export const debugInfo = {
  telegramSDK: false,
  platform: "Unknown",
  gyroscopeStatus: "Not Started",
  lastGyroUpdate: 0,
  rawGyro: { x: 0, y: 0, z: 0 }
};

// Touch shooting
export let shootRequested = false;

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        disableVerticalSwipes: () => void;
        platform: string;
        version: string;
        isVersionAtLeast: (version: string) => boolean;
        Gyroscope: {
          start: (params: { refresh_rate?: number }, callback?: (started: boolean) => void) => void;
          stop: (callback?: (stopped: boolean) => void) => void;
          isStarted: boolean;
          x: number | null;
          y: number | null;
          z: number | null;
        };
        Accelerometer: {
          start: (params: { refresh_rate?: number }, callback?: (started: boolean) => void) => void;
          stop: (callback?: (stopped: boolean) => void) => void;
          isStarted: boolean;
          x: number | null;
          y: number | null;
          z: number | null;
        };
        onEvent: (eventType: string, callback: () => void) => void;
        offEvent: (eventType: string, callback: () => void) => void;
      };
    };
  }
}

// Clear all keys on window blur/focus loss
window.addEventListener("blur", () => {
  Object.keys(keys).forEach(key => {
    keys[key] = false;
  });
});

window.addEventListener("keydown", (e: KeyboardEvent) => {
  // Prevent default for game controls
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
    e.preventDefault();
  }
  keys[e.key] = true;
});

window.addEventListener("keyup", (e: KeyboardEvent) => {
  keys[e.key] = false;
});

// Gyroscope support
export function enableGyroscope() {
  const tg = window.Telegram?.WebApp;
  
  if (tg) {
    debugInfo.telegramSDK = true;
    debugInfo.platform = tg.platform || "Unknown";
    
    console.log("Telegram WebApp detected:", {
      platform: tg.platform,
      version: tg.version,
      accelerometer: !!tg.Accelerometer
    });
    
    if (tg.Accelerometer) {
      // Telegram Mini App accelerometer
      tg.Accelerometer.start({ refresh_rate: 60 }, (started) => {
        if (started) {
          tilt.enabled = true;
          debugInfo.gyroscopeStatus = "Started (Telegram Accelerometer)";
          console.log("✅ Telegram Accelerometer started");
          startTelegramAccelerometerLoop();
        } else {
          debugInfo.gyroscopeStatus = "Failed (Telegram Accelerometer)";
          console.log("❌ Telegram Accelerometer failed");
          fallbackGyroscope();
        }
      });
    } else {
      debugInfo.gyroscopeStatus = "Not Available (Telegram)";
      console.log("⚠️ Telegram Accelerometer API not available");
      fallbackGyroscope();
    }
  } else {
    // Not in Telegram environment
    debugInfo.telegramSDK = false;
    debugInfo.platform = "Browser";
    debugInfo.gyroscopeStatus = "Fallback Mode";
    console.log("⚠️ Not in Telegram WebApp, using fallback");
    fallbackGyroscope();
  }
}

function startTelegramAccelerometerLoop() {
  const tg = window.Telegram?.WebApp;
  if (!tg || !tg.Accelerometer) return;
  
  setInterval(() => {
    const x = tg.Accelerometer.x;
    const y = tg.Accelerometer.y;
    const z = tg.Accelerometer.z;
    
    if (x !== null && y !== null && z !== null) {
      debugInfo.rawGyro = { x, y, z };
      debugInfo.lastGyroUpdate = Date.now();
      
      // Convert acceleration (m/s²) to tilt values
      // x: left/right tilt
      // y: forward/backward tilt
      // z: up/down (gravity ~9.8 m/s²)
      
      const maxTilt = 5; // m/s² threshold
      
      // X acceleration for left/right movement
      tilt.x = Math.max(-1, Math.min(1, x / maxTilt));
      
      // Y acceleration for up/down movement  
      tilt.y = Math.max(-1, Math.min(1, y / maxTilt));
      
      tilt.z = z;
    }
  }, 16); // ~60fps
}

function fallbackGyroscope() {
  if (typeof DeviceMotionEvent !== "undefined") {
    debugInfo.gyroscopeStatus = "Requesting Permission (Native Accelerometer)";
    
    // Request permission for iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      (DeviceMotionEvent as any).requestPermission()
        .then((response: string) => {
          if (response === "granted") {
            debugInfo.gyroscopeStatus = "Granted (Native Accelerometer)";
            setupNativeAccelerometer();
          } else {
            debugInfo.gyroscopeStatus = "Denied (Native)";
          }
        })
        .catch((error: Error) => {
          debugInfo.gyroscopeStatus = "Error (Native)";
          console.error("Accelerometer permission denied:", error);
        });
    } else {
      // Non-iOS or older iOS
      debugInfo.gyroscopeStatus = "Auto-granted (Native Accelerometer)";
      setupNativeAccelerometer();
    }
  } else {
    debugInfo.gyroscopeStatus = "Not Supported";
  }
}

function setupNativeAccelerometer() {
  tilt.enabled = true;
  
  window.addEventListener("devicemotion", (e: DeviceMotionEvent) => {
    const accel = e.accelerationIncludingGravity;
    
    if (accel && accel.x !== null && accel.y !== null && accel.z !== null) {
      debugInfo.rawGyro = { 
        x: accel.x, 
        y: accel.y, 
        z: accel.z 
      };
      debugInfo.lastGyroUpdate = Date.now();
      
      const maxTilt = 5; // m/s² threshold
      
      // X acceleration for left/right movement
      tilt.x = Math.max(-1, Math.min(1, accel.x / maxTilt));
      
      // Y acceleration for up/down movement
      tilt.y = Math.max(-1, Math.min(1, accel.y / maxTilt));
      
      tilt.z = accel.z;
    }
  });
}

// Touch controls - continuous shooting while holding
window.addEventListener("touchstart", (e: TouchEvent) => {
  e.preventDefault();
  shootRequested = true;
});

window.addEventListener("touchend", () => {
  shootRequested = false;
});

window.addEventListener("touchcancel", () => {
  shootRequested = false;
});

export function resetShootRequest() {
  // Don't reset if still touching
  // shootRequested = false;
}
