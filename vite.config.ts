import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'openai-chatkit'
        }
      }
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ChatKitVue',
      fileName: (format) =>
        format === 'es' ? 'chatkit-vue.es.js' : 'chatkit-vue.umd.cjs',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue', '@openai/chatkit'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    },
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
