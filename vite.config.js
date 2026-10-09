import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@components": path.resolve(__dirname, "./src/components"),
            "@pages": path.resolve(__dirname, "./src/pages"),
            "@hooks": path.resolve(__dirname, "./src/hooks"),
            "@context": path.resolve(__dirname, "./src/context"),
            "@styles": path.resolve(__dirname, "./src/styles"),
            "@utils": path.resolve(__dirname, "./src/utils"),
            "@constants": path.resolve(__dirname, "./src/constants"),
            "@services": path.resolve(__dirname, "./src/services"),
            "@lib": path.resolve(__dirname, "./src/lib"),
            "@data": path.resolve(__dirname, "./src/data"),
            "@routes": path.resolve(__dirname, "./src/routes"),
            "@layouts": path.resolve(__dirname, "./src/layouts"),
            "@types": path.resolve(__dirname, "./src/types"),
        },
    },
    server: {
        host: "0.0.0.0",
        port: 3000,
    },
});
