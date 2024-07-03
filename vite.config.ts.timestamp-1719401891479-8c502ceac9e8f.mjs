// vite.config.ts
import { defineConfig } from "file:///D:/Users/powersi/codes/tauri/tools-helper/node_modules/.pnpm/vite@4.5.3_@types+node@18.19.38/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/Users/powersi/codes/tauri/tools-helper/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vite@4.5.3_@types+node@18.19.38__vue@3.4.29_typescript@4.9.5_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import unocss from "file:///D:/Users/powersi/codes/tauri/tools-helper/node_modules/.pnpm/unocss@0.49.8_rollup@3.29.4_vite@4.5.3_@types+node@18.19.38_/node_modules/unocss/dist/vite.mjs";
import AutoImport from "file:///D:/Users/powersi/codes/tauri/tools-helper/node_modules/.pnpm/unplugin-auto-import@0.14.4_rollup@3.29.4/node_modules/unplugin-auto-import/dist/vite.js";
import components from "file:///D:/Users/powersi/codes/tauri/tools-helper/node_modules/.pnpm/unplugin-vue-components@0.23.0_@babel+parser@7.24.7_rollup@3.29.4_vue@3.4.29_typescript@4.9.5_/node_modules/unplugin-vue-components/dist/vite.mjs";
import { NaiveUiResolver } from "file:///D:/Users/powersi/codes/tauri/tools-helper/node_modules/.pnpm/unplugin-vue-components@0.23.0_@babel+parser@7.24.7_rollup@3.29.4_vue@3.4.29_typescript@4.9.5_/node_modules/unplugin-vue-components/dist/resolvers.mjs";
import icons from "file:///D:/Users/powersi/codes/tauri/tools-helper/node_modules/.pnpm/unplugin-icons@0.15.3_@vue+compiler-sfc@3.4.29_vue-template-compiler@2.7.16/node_modules/unplugin-icons/dist/vite.mjs";
import IconsResolver from "file:///D:/Users/powersi/codes/tauri/tools-helper/node_modules/.pnpm/unplugin-icons@0.15.3_@vue+compiler-sfc@3.4.29_vue-template-compiler@2.7.16/node_modules/unplugin-icons/dist/resolver.mjs";
import { FileSystemIconLoader } from "file:///D:/Users/powersi/codes/tauri/tools-helper/node_modules/.pnpm/unplugin-icons@0.15.3_@vue+compiler-sfc@3.4.29_vue-template-compiler@2.7.16/node_modules/unplugin-icons/dist/loaders.mjs";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///D:/Users/powersi/codes/tauri/tools-helper/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    unocss(),
    icons({
      compiler: "vue3",
      customCollections: {
        custom: FileSystemIconLoader(
          fileURLToPath(new URL("./src/assets/svg", __vite_injected_original_import_meta_url))
        )
      }
    }),
    AutoImport({
      imports: ["vue"],
      dts: "src/typings/auto-imports.d.ts"
    }),
    components({
      resolvers: [
        NaiveUiResolver(),
        IconsResolver({ customCollections: ["custom"] })
      ],
      dts: "src/typings/components.d.ts"
    })
  ],
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true
  },
  // to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxVc2Vyc1xcXFxwb3dlcnNpXFxcXGNvZGVzXFxcXHRhdXJpXFxcXHRvb2xzLWhlbHBlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcVXNlcnNcXFxccG93ZXJzaVxcXFxjb2Rlc1xcXFx0YXVyaVxcXFx0b29scy1oZWxwZXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L1VzZXJzL3Bvd2Vyc2kvY29kZXMvdGF1cmkvdG9vbHMtaGVscGVyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCB1bm9jc3MgZnJvbSAndW5vY3NzL3ZpdGUnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcbmltcG9ydCBjb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXHJcbmltcG9ydCB7IE5haXZlVWlSZXNvbHZlciB9IGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3Jlc29sdmVycydcclxuaW1wb3J0IGljb25zIGZyb20gJ3VucGx1Z2luLWljb25zL3ZpdGUnXHJcbmltcG9ydCBJY29uc1Jlc29sdmVyIGZyb20gJ3VucGx1Z2luLWljb25zL3Jlc29sdmVyJ1xyXG5pbXBvcnQgeyBGaWxlU3lzdGVtSWNvbkxvYWRlciB9IGZyb20gJ3VucGx1Z2luLWljb25zL2xvYWRlcnMnXHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSgpLFxyXG4gICAgdW5vY3NzKCksXHJcbiAgICBpY29ucyh7XHJcbiAgICAgIGNvbXBpbGVyOiAndnVlMycsXHJcbiAgICAgIGN1c3RvbUNvbGxlY3Rpb25zOiB7XHJcbiAgICAgICAgY3VzdG9tOiBGaWxlU3lzdGVtSWNvbkxvYWRlcihcclxuICAgICAgICAgIGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvYXNzZXRzL3N2ZycsIGltcG9ydC5tZXRhLnVybCkpXHJcbiAgICAgICAgKSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgIGltcG9ydHM6IFsndnVlJ10sXHJcbiAgICAgIGR0czogJ3NyYy90eXBpbmdzL2F1dG8taW1wb3J0cy5kLnRzJyxcclxuICAgIH0pLFxyXG4gICAgY29tcG9uZW50cyh7XHJcbiAgICAgIHJlc29sdmVyczogW1xyXG4gICAgICAgIE5haXZlVWlSZXNvbHZlcigpLFxyXG4gICAgICAgIEljb25zUmVzb2x2ZXIoeyBjdXN0b21Db2xsZWN0aW9uczogWydjdXN0b20nXSB9KSxcclxuICAgICAgXSxcclxuICAgICAgZHRzOiAnc3JjL3R5cGluZ3MvY29tcG9uZW50cy5kLnRzJyxcclxuICAgIH0pLFxyXG4gIF0sXHJcblxyXG4gIC8vIFZpdGUgb3B0aW9ucyB0YWlsb3JlZCBmb3IgVGF1cmkgZGV2ZWxvcG1lbnQgYW5kIG9ubHkgYXBwbGllZCBpbiBgdGF1cmkgZGV2YCBvciBgdGF1cmkgYnVpbGRgXHJcbiAgLy8gcHJldmVudCB2aXRlIGZyb20gb2JzY3VyaW5nIHJ1c3QgZXJyb3JzXHJcbiAgY2xlYXJTY3JlZW46IGZhbHNlLFxyXG4gIC8vIHRhdXJpIGV4cGVjdHMgYSBmaXhlZCBwb3J0LCBmYWlsIGlmIHRoYXQgcG9ydCBpcyBub3QgYXZhaWxhYmxlXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiAxNDIwLFxyXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcclxuICB9LFxyXG4gIC8vIHRvIG1ha2UgdXNlIG9mIGBUQVVSSV9ERUJVR2AgYW5kIG90aGVyIGVudiB2YXJpYWJsZXNcclxuICAvLyBodHRwczovL3RhdXJpLnN0dWRpby92MS9hcGkvY29uZmlnI2J1aWxkY29uZmlnLmJlZm9yZWRldmNvbW1hbmRcclxuICBlbnZQcmVmaXg6IFsnVklURV8nLCAnVEFVUklfJ10sXHJcbiAgYnVpbGQ6IHtcclxuICAgIC8vIFRhdXJpIHN1cHBvcnRzIGVzMjAyMVxyXG4gICAgdGFyZ2V0OiBwcm9jZXNzLmVudi5UQVVSSV9QTEFURk9STSA9PSAnd2luZG93cycgPyAnY2hyb21lMTA1JyA6ICdzYWZhcmkxMycsXHJcbiAgICAvLyBkb24ndCBtaW5pZnkgZm9yIGRlYnVnIGJ1aWxkc1xyXG4gICAgbWluaWZ5OiAhcHJvY2Vzcy5lbnYuVEFVUklfREVCVUcgPyAnZXNidWlsZCcgOiBmYWxzZSxcclxuICAgIC8vIHByb2R1Y2Ugc291cmNlbWFwcyBmb3IgZGVidWcgYnVpbGRzXHJcbiAgICBzb3VyY2VtYXA6ICEhcHJvY2Vzcy5lbnYuVEFVUklfREVCVUcsXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5VCxTQUFTLG9CQUFvQjtBQUN0VixPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sZ0JBQWdCO0FBQ3ZCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsdUJBQXVCO0FBQ2hDLE9BQU8sV0FBVztBQUNsQixPQUFPLG1CQUFtQjtBQUMxQixTQUFTLDRCQUE0QjtBQUNyQyxTQUFTLHFCQUFxQjtBQVR1SyxJQUFNLDJDQUEyQztBQVl0UCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxNQUFNO0FBQUEsTUFDSixVQUFVO0FBQUEsTUFDVixtQkFBbUI7QUFBQSxRQUNqQixRQUFRO0FBQUEsVUFDTixjQUFjLElBQUksSUFBSSxvQkFBb0Isd0NBQWUsQ0FBQztBQUFBLFFBQzVEO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLElBQ0QsV0FBVztBQUFBLE1BQ1QsU0FBUyxDQUFDLEtBQUs7QUFBQSxNQUNmLEtBQUs7QUFBQSxJQUNQLENBQUM7QUFBQSxJQUNELFdBQVc7QUFBQSxNQUNULFdBQVc7QUFBQSxRQUNULGdCQUFnQjtBQUFBLFFBQ2hCLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUFBLE1BQ2pEO0FBQUEsTUFDQSxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsRUFDSDtBQUFBO0FBQUE7QUFBQSxFQUlBLGFBQWE7QUFBQTtBQUFBLEVBRWIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFBQTtBQUFBO0FBQUEsRUFHQSxXQUFXLENBQUMsU0FBUyxRQUFRO0FBQUEsRUFDN0IsT0FBTztBQUFBO0FBQUEsSUFFTCxRQUFRLFFBQVEsSUFBSSxrQkFBa0IsWUFBWSxjQUFjO0FBQUE7QUFBQSxJQUVoRSxRQUFRLENBQUMsUUFBUSxJQUFJLGNBQWMsWUFBWTtBQUFBO0FBQUEsSUFFL0MsV0FBVyxDQUFDLENBQUMsUUFBUSxJQUFJO0FBQUEsRUFDM0I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
