import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!).render(<App />);

// PWA: manifest and icons (added via JS to avoid Bun's HTML bundler resolving them)
const manifest = document.createElement("link");
manifest.rel = "manifest";
manifest.href = "/manifest.json";
document.head.appendChild(manifest);

const appleIcon = document.createElement("link");
appleIcon.rel = "apple-touch-icon";
appleIcon.href = "/icons/icon-192.svg";
document.head.appendChild(appleIcon);

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
