import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
const targetAPI = 'http://localhost:5000';

export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            // Khi code gọi /api, nó sẽ tự chuyển hướng sang Backend
            '^/api': {
                target: targetAPI,
                secure: false
            }
        },
        // Sửa port Vite thành 52114 cho khớp với file .csproj
        port: 52114,
    }
});