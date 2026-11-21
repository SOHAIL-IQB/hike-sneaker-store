import { createRoot } from "react-dom/client";
import "@fontsource-variable/archivo/wdth.css";
import { MotionGlobalConfig } from "framer-motion";
import App from "./App.tsx";
import "./index.css";

// Dev-only: append ?static to any URL to skip animations (for screenshots/tests).
if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("static")) {
  MotionGlobalConfig.skipAnimations = true;
}

createRoot(document.getElementById("root")!).render(<App />);
