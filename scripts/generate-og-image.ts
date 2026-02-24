import { createCanvas } from "@napi-rs/canvas";

const WIDTH = 1200;
const HEIGHT = 630;

const canvas = createCanvas(WIDTH, HEIGHT);
const ctx = canvas.getContext("2d");

// Background — emerald gradient
const grad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
grad.addColorStop(0, "#047857");
grad.addColorStop(1, "#065f46");
ctx.fillStyle = grad;
ctx.fillRect(0, 0, WIDTH, HEIGHT);

// Subtle texture dots
ctx.fillStyle = "rgba(255,255,255,0.04)";
for (let x = 0; x < WIDTH; x += 24) {
  for (let y = 0; y < HEIGHT; y += 24) {
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Title
ctx.fillStyle = "#ffffff";
ctx.font = "bold 72px sans-serif";
ctx.fillText("ECCC 2026", 80, 260);

// Subtitle
ctx.font = "48px sans-serif";
ctx.fillStyle = "rgba(255,255,255,0.85)";
ctx.fillText("Schedule Viewer", 80, 330);

// Divider line
ctx.strokeStyle = "rgba(255,255,255,0.3)";
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(80, 370);
ctx.lineTo(500, 370);
ctx.stroke();

// Tagline
ctx.font = "28px sans-serif";
ctx.fillStyle = "rgba(255,255,255,0.7)";
ctx.fillText("Emerald City Comic Con — Panels, Guests & Events", 80, 420);

// Date badge
ctx.font = "24px sans-serif";
ctx.fillStyle = "rgba(255,255,255,0.5)";
ctx.fillText("March 2026 · Seattle, WA", 80, 470);

const png = canvas.toBuffer("image/png");
await Bun.write("public/og-image.png", png);
console.log(`Generated public/og-image.png (${png.byteLength} bytes)`);
