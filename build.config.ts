import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: [
    {
      input: './src/nuxt/index',
      name: 'index'
    }
  ],
  outDir: 'dist/nuxt',
  declaration: true,
  clean: false,
  externals: ['nuxt', 'nuxt/kit'],
  rollup: {
    emitCJS: false
  },
  failOnWarn: false
});
