import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Dựa vào appsettings.json của bạn, Backend đang chạy ở port 5000 (http)
// Nếu bạn chạy https thì có thể là 5001 hoặc port khác trong launchSettings.json
const target = 'http://localhost:5000';

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
                target: target,
                secure: false
            }
        },
        // Sửa port Vite thành 52114 cho khớp với file .csproj
        port: 52114,
    }
});