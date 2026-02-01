
export const keys: Record<string, boolean> = {};

// Mobile gyroscope tilt values
export const tilt = {
  x: 0, // Left/Right tilt (-1 to 1)
  y: 0, // Forward/Backward tilt (-1 to 1)
  z: 0, // Z-axis rotation
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
      gyroscope: !!tg.Gyroscope
    });
    
    if (tg.Gyroscope) {
      // Telegram Mini App gyroscope
      tg.Gyroscope.start({ refresh_rate: 60 }, (started) => {
        if (started) {
          tilt.enabled = true;
          debugInfo.gyroscopeStatus = "Started (Telegram)";
          console.log("✅ Telegram Gyroscope started");
          startTelegramGyroscopeLoop();
        } else {
          debugInfo.gyroscopeStatus = "Failed (Telegram)";
          console.log("❌ Telegram Gyroscope failed");
          fallbackGyroscope();
        }
      });
    } else {
      debugInfo.gyroscopeStatus = "Not Available (Telegram)";
      console.log("⚠️ Telegram Gyroscope API not available");
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

function startTelegramGyroscopeLoop() {
  const tg = window.Telegram?.WebApp;
  if (!tg || !tg.Gyroscope) return;
  
  setInterval(() => {
    const x = tg.Gyroscope.x;
    const y = tg.Gyroscope.y;
    const z = tg.Gyroscope.z;
    
    if (x !== null && y !== null && z !== null) {
      debugInfo.rawGyro = { x, y, z };
      debugInfo.lastGyroUpdate = Date.now();
      
      // Convert rotation rate (rad/s) to tilt values
      // x: rotation around X-axis (pitch)
      // y: rotation around Y-axis (roll)
      // z: rotation around Z-axis (yaw)
      
      // Use Y-axis (roll) for left/right movement
      tilt.x = Math.max(-1, Math.min(1, y * 2));
      
      // Use X-axis (pitch) for up/down movement
      tilt.y = Math.max(-1, Math.min(1, x * 2));
      
      tilt.z = z;
    }
  }, 16); // ~60fps
}

function fallbackGyroscope() {
  if (typeof DeviceOrientationEvent !== "undefined") {
    debugInfo.gyroscopeStatus = "Requesting Permission (Native)";
    
    // Request permission for iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === "granted") {
            debugInfo.gyroscopeStatus = "Granted (Native)";
            setupNativeGyroscope();
          } else {
            debugInfo.gyroscopeStatus = "Denied (Native)";
          }
        })
        .catch((error: Error) => {
          debugInfo.gyroscopeStatus = "Error (Native)";
          console.error("Gyroscope permission denied:", error);
        });
    } else {
      // Non-iOS or older iOS
      debugInfo.gyroscopeStatus = "Auto-granted (Native)";
      setupNativeGyroscope();
    }
  } else {
    debugInfo.gyroscopeStatus = "Not Supported";
  }
}

function setupNativeGyroscope() {
  tilt.enabled = true;
  
  window.addEventListener("deviceorientation", (e: DeviceOrientationEvent) => {
    if (e.beta !== null && e.gamma !== null) {
      debugInfo.rawGyro = { 
        x: e.beta, 
        y: e.gamma, 
        z: e.alpha || 0 
      };
      debugInfo.lastGyroUpdate = Date.now();
      
      // Normalize to -1 to 1 range
      tilt.x = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
      
      const adjustedBeta = (e.beta || 0) - 90;
      tilt.y = Math.max(-1, Math.min(1, adjustedBeta / 30));
    }
  });
}

// Touch controls
window.addEventListener("touchstart", (e: TouchEvent) => {
  e.preventDefault();
  shootRequested = true;
});

window.addEventListener("touchend", () => {
  shootRequested = false;
});

export function resetShootRequest() {
  shootRequested = false;
}
