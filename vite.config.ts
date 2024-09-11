import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import { fileURLToPath } from 'url'

import { dirname, resolve } from "node:path";

/**
 * @description 根据可选的路径片段生成一个新的绝对路径
 * @param dir 路径片段，默认`build`
 * @param metaUrl 模块的完整`url`，如果在`build`目录外调用必传`import.meta.url`
 */
const pathResolve = (dir = ".", metaUrl = import.meta.url) => {
  // 当前文件目录的绝对路径
  const currentFileDir = dirname(fileURLToPath(metaUrl));
  // build 目录的绝对路径
  const buildDir = resolve(currentFileDir, "build");
  // 解析的绝对路径
  const resolvedPath = resolve(currentFileDir, dir);
  // 检查解析的绝对路径是否在 build 目录内
  if (resolvedPath.startsWith(buildDir)) {
    // 在 build 目录内，返回当前文件路径
    return fileURLToPath(metaUrl);
  }
  // 不在 build 目录内，返回解析后的绝对路径
  return resolvedPath;
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    unocss(),
    icons({
      compiler: 'vue3',
      customCollections: {
        custom: FileSystemIconLoader(
          fileURLToPath(new URL('./src/assets/svg', import.meta.url))
        ),
      },
    }),
    AutoImport({
      imports: ['vue'],
      dts: 'src/typings/auto-imports.d.ts',
    }),
    components({
      resolvers: [
        NaiveUiResolver(),
        IconsResolver({ customCollections: ['custom'] }),
      ],
      dts: 'src/typings/components.d.ts',
    }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  resolve: {
    alias: {
      '@': pathResolve('../src')
    }
  },
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    },
    strictPort: true,
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    chunkSizeWarningLimit: 2000,
  },
})
