import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // This tells Vite to use the React plugin and the Path Shortcut plugin
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 5173,
    host: true, // This allows you to see it on your network
  }
});