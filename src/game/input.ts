
export const keys: Record<string, boolean> = {};

// Mobile gyroscope tilt values
export const tilt = {
  x: 0, // Left/Right tilt (-1 to 1)
  y: 0, // Forward/Backward tilt (-1 to 1)
  enabled: false
};

// Touch shooting
export let shootRequested = false;

// Telegram WebApp instance
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        disableVerticalSwipes: () => void;
        DeviceOrientation: {
          start: (params: { refresh_rate?: number; need_absolute?: boolean }, callback?: (result: boolean) => void) => void;
          stop: (callback?: (result: boolean) => void) => void;
          isStarted: boolean;
          absolute: boolean;
          alpha: number | null;
          beta: number | null;
          gamma: number | null;
        };
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
  
  if (tg && tg.DeviceOrientation) {
    // Telegram Mini App gyroscope
    tg.DeviceOrientation.start({ refresh_rate: 60 }, (started) => {
      if (started) {
        tilt.enabled = true;
        console.log("Telegram gyroscope enabled");
        startGyroscopeLoop();
      } else {
        console.log("Telegram gyroscope failed to start");
        fallbackGyroscope();
      }
    });
  } else {
    // Fallback to native browser gyroscope
    console.log("Telegram SDK not available, using native gyroscope");
    fallbackGyroscope();
  }
}

function startGyroscopeLoop() {
  const tg = window.Telegram?.WebApp;
  if (!tg || !tg.DeviceOrientation) return;
  
  setInterval(() => {
    const gamma = tg.DeviceOrientation.gamma;
    const beta = tg.DeviceOrientation.beta;
    
    if (gamma !== null && beta !== null) {
      // Normalize to -1 to 1 range
      tilt.x = Math.max(-1, Math.min(1, gamma / 30));
      
      // Adjust for device held upright
      const adjustedBeta = beta - 90;
      tilt.y = Math.max(-1, Math.min(1, adjustedBeta / 30));
    }
  }, 16); // ~60fps
}

function fallbackGyroscope() {
  if (typeof DeviceOrientationEvent !== "undefined") {
    // Request permission for iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === "granted") {
            setupNativeGyroscope();
          }
        })
        .catch((error: Error) => {
          console.error("Gyroscope permission denied:", error);
        });
    } else {
      // Non-iOS or older iOS
      setupNativeGyroscope();
    }
  }
}

function setupNativeGyroscope() {
  tilt.enabled = true;
  
  window.addEventListener("deviceorientation", (e: DeviceOrientationEvent) => {
    if (e.beta !== null && e.gamma !== null) {
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
