import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Reference: https://github.com/vercel/turbo/discussions/620#discussioncomment-2136195
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
    // alias: [
    //   {
    //     find: "@",
    //     replacement: path.resolve(__dirname, "./src"),
    //   },
    //
    //   {
    //     find: "@ui",
    //     replacement: path.resolve(__dirname, "../../packages/ui/src"),
    //   },
    // ],
  },
});
