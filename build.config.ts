import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./nuxt/index'],
  outDir: 'dist/nuxt',
  declaration: true,
  clean: false,
  externals: ['nuxt', 'nuxt/kit'],
  rollup: {
    emitCJS: false
  },
  failOnWarn: false
});
