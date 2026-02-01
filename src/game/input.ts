
export const keys: Record<string, boolean> = {};

// Mobile gyroscope tilt values
export const tilt = {
  x: 0, // Left/Right tilt (-1 to 1)
  y: 0, // Forward/Backward tilt (-1 to 1)
  enabled: false
};

// Touch shooting
export let shootRequested = false;

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
  if (typeof DeviceOrientationEvent !== "undefined") {
    // Request permission for iOS 13+
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === "granted") {
            setupGyroscope();
          }
        })
        .catch((error: Error) => {
          console.error("Gyroscope permission denied:", error);
        });
    } else {
      // Non-iOS or older iOS
      setupGyroscope();
    }
  }
}

function setupGyroscope() {
  tilt.enabled = true;
  
  window.addEventListener("deviceorientation", (e: DeviceOrientationEvent) => {
    if (e.beta !== null && e.gamma !== null) {
      // Beta: front-back tilt (-180 to 180)
      // Gamma: left-right tilt (-90 to 90)
      
      // Normalize to -1 to 1 range
      // Gamma: negative = left, positive = right
      tilt.x = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
      
      // Beta: negative = forward, positive = backward
      // Adjust for device held upright (around 90 degrees)
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
