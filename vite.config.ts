import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// vite.config 는 Node 에서 실행됩니다. @types/node 를 추가하지 않아도 되도록
// 이 파일에서만 process.env 타입을 선언해 씁니다.
declare const process: { env: Record<string, string | undefined> };

/*
 * 배포 경로
 *   GitHub Pages : https://ggungzzang2.github.io/byulgyeol/  → base '/byulgyeol/' (기본값)
 *   Cloudflare   : https://<project>.pages.dev/              → base '/'
 *   로컬 프리뷰   : 기본값 그대로 두고 http://127.0.0.1:4173/byulgyeol/ 로 확인
 *
 * Cloudflare Pages 빌드 명령: VITE_BASE_PATH=/ npm run build  (= npm run build:pages)
 */
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/byulgyeol/',
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
});
